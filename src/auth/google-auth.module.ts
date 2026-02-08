import { Module } from "@nestjs/common";
import { GoogleAuthService } from "./google-auth.service";

@Module({
  providers: [GoogleAuthService],
  exports: [GoogleAuthService], // 🔑 REQUIRED
})
export class GoogleAuthModule {}