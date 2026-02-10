import { Controller, Get, HttpStatus, Post, Req, Res, UseGuards, Body, BadRequestException, Param, Query } from "@nestjs/common";
import { Response } from "express";
import { AuthGuard } from "@nestjs/passport";
import { AuthService } from "./auth.service";
import { OAuth2Client } from 'google-auth-library';
import { UtilService } from 'src/util/util.service';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { SignUpDto, SignInDto } from './dto/signup.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { SendMailDto } from './dto/send-mail.dto';
import { GoogleAuthService } from './google-auth.service';
import { GmailService } from './gmail.service';
import { encrypt } from 'src/util/crypto.util';
@ApiTags('Auth')
@Controller("auth")
export class AuthController {
  private googleClient: OAuth2Client;
  private oAuth2Client: OAuth2Client;
  constructor(
    public authService: AuthService, private utilService: UtilService, private readonly googleAuthService: GoogleAuthService, private readonly gmailService: GmailService
  ) {
    this.googleClient = new OAuth2Client();
    this.oAuth2Client = new OAuth2Client(
      '1042994757383-ra2u6memdacvegf51krbg95fn5ret1ef.apps.googleusercontent.com',
      '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',
      // 'http://localhost:3002/auth/google/redirect' // must match Google Cloud redirect URI
       'http://api.amyntasmedia.com/auth/google/redirect' 
    );
  }
  @Post('signup')
  @ApiOperation({ summary: 'Register a new user in Cognito and sync to DB' })
  @ApiBody({ type: SignUpDto })
  @ApiResponse({ status: 201, description: 'User signed up successfully' })
  @ApiResponse({ status: 400, description: 'Signup failed or input error' })
  async signUp(@Body() signUpDto: SignUpDto) {
    return this.authService.signUp(signUpDto);
  }
  @Post('signin')
  @ApiOperation({ summary: 'Authenticate user and return JWT tokens from Cognito' })
  @ApiBody({ type: SignInDto })
  @ApiResponse({ status: 200, description: 'User signed in successfully' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async signIn(@Body() signInDto: SignInDto) {
    return this.authService.signIn(signInDto);
  }
  @Post('forgot-password')
  @ApiOperation({ summary: 'Initiate password reset process' })
  @ApiBody({ type: ForgotPasswordDto })
  @ApiResponse({ status: 200, description: 'Password reset code sent to email' })
  @ApiResponse({ status: 400, description: 'Failed to initiate password reset' })
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.authService.forgotPassword(forgotPasswordDto.email);
  }
  @Post('reset-password')
  @ApiOperation({ summary: 'Reset password using verification code' })
  @ApiBody({ type: ResetPasswordDto })
  @ApiResponse({ status: 200, description: 'Password reset successfully' })
  @ApiResponse({ status: 400, description: 'Failed to reset password' })
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(
      resetPasswordDto.email,
      resetPasswordDto.verificationCode,
      resetPasswordDto.newPassword
    );
  }
  @Get('generate-token')
  generateToken() {
    const userId = 'default-user-id';
    const email = 'default@example.com';
    const token = this.authService.getToken(userId, email);
    return { access_token: token };
  }
  @Get('google')
  async googleAuth(@Res() res: Response) {
    const authUrl = this.oAuth2Client.generateAuthUrl({
      access_type: 'offline', // ensures we get refresh_token
      // scope: ['https://mail.google.com/'],
      scope: [
        'openid',
        'email',
        'profile',
        'https://www.googleapis.com/auth/gmail.send',
      ],
      prompt: 'consent', // always show consent to get refresh_token
    });

    // Redirect user to Google's consent screen
    return res.redirect(authUrl);
  }

  @Get('google/redirect')
  async googleAuthRedirect(@Query('code') code: string, @Res() res: Response) {
    if (!code) {
      return res.status(400).json({ error: 'Missing code parameter' });
    }

    try {
      const { tokens } = await this.oAuth2Client.getToken(code);
       const {
      access_token,
      refresh_token,
      expiry_date,
      id_token,
    } = tokens;
     // ✅ Guard 1: id_token
    if (!id_token) {
      return res.status(400).json({
        error: 'Google ID token not received',
      });
    }
     // 1️⃣ Verify ID token to get user info
    const payload = await this.googleAuthService.verifyToken(id_token);
    
    // ✅ Guard 2: payload
    if (!payload || !payload.email) {
      return res.status(400).json({
        error: 'Invalid Google token payload',
      });
    }

    const email = payload.email;

    this.oAuth2Client.setCredentials(tokens);
 const user = await this.authService.findByEmail(email);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
     // 3️⃣ Encrypt refresh token (ONLY if exists)
    const encryptedRefreshToken = refresh_token
      ? encrypt(refresh_token)
      : user.google_refresh_token; // keep old one
      // Normally, you'd store these tokens securely in DB
       // 4️⃣ Save tokens
    await this.authService.updateUserGoogleTokens(user.id, {
      google_access_token: access_token,
      google_refresh_token: encryptedRefreshToken,
      google_token_expiry: expiry_date
        ? new Date(expiry_date)
        : null,
    });

    return res.redirect(
      // `http://34.31.149.20/ams-tools-cms/google-success`,
       `http://localhost:8080/ams-tools-cms/google-success`,
    );
      // return res.json({
      //   message: 'Google OAuth successful',
      //   access_token: tokens.access_token,
      //   refresh_token: tokens.refresh_token,
      //   expiry_date: tokens.expiry_date,
      // });
    } catch (error) {
      console.error('Error during Google OAuth:', error);
      return res.status(500).json({ error: 'OAuth2 token exchange failed' });
    }
  }

  @Post('google')
  @ApiOperation({ summary: 'Google SSO login' })
  @ApiBody({ schema: { example: { token: 'google-id-token' } } })
  @ApiResponse({ status: 200, description: 'Google login success' })
  async googleLogin(@Body('token') token: string) {
    if (!token) {
      throw new BadRequestException('Google token missing');
    }
    // 1️⃣ Verify Google ID token
    const payload = await this.googleAuthService.verifyToken(token);
    if (!payload?.email) {
      throw new BadRequestException('Invalid Google token');
    }
    const {
      email,
      name = '',
      picture,
      sub: googleId,
    } = payload;
    // 2️⃣ Split name safely
    const [firstName, ...lastNameParts] = name.split(' ');
    const lastName = lastNameParts.join(' ');
    // 3️⃣ Check if user already exists
    let user = await this.authService.findByEmail(email);
    if (!user) {
      // 4️⃣ Create new Google user
      const userCreatePayload = {
        first_name: firstName || '',
        last_name: lastName || '',
        email,
        phone: null,
        created_dt: new Date(),
        email_verified: 1, // Google email is already verified
        phone_verified: 0,
        password: null, // ❗ No password for Google SSO
        google_id: googleId,
        role: 'Testing',
        agency_id: 0,
      };
      user = await this.authService.createUser(userCreatePayload);
    }
    user = await this.authService.findByEmail(email);
    // 5️⃣ Generate JWT
    const accessToken = this.authService.generateJwt(user);
    // 6️⃣ Response for frontend
    return {
      accessToken,
      // googleAccessToken: token,
      user: {
        id: user.id,
        email: user.email,
        name: `${user.first_name} ${user.last_name}`.trim(),
        picture,
        role: user.role,
      },
    };
  }
  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleCallback(@Req() req, @Res() res) {
    const user = req.user;
    console.log(user, 'user details')
    const token = this.authService.generateTokens(user);
    return res.redirect(
     `http://localhost:8080/ams-tools-cms/google-success?token=${token}`
     // `http://34.31.149.20/ams-tools-cms/google-success?token=${token}`
    );
  }
  //METHOD TO SEND  TEST EMAIL 
  @Post('google/send-mail')
  @ApiOperation({ summary: 'Send email using Gmail API' })
  @ApiBody({
    schema: {
      example: {
        accessToken: 'ya29.a0AfH6S...',
        to: 'test@example.com',
        subject: 'Hello from NestJS',
        html: '<h1>This email is sent via Gmail API</h1>',
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Email sent successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  async sendMailViaGmail(@Body() body: SendMailDto) {
    const { accessToken, to, subject, html } = body;
    if (!accessToken) {
      throw new BadRequestException('Access token is required');
    }
    await this.gmailService.sendMail(
      accessToken,
      to,
      subject,
      html,
    );
    return {
      status: true,
      message: 'Email sent successfully',
    };
  }
}
