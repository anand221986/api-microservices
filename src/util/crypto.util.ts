import * as crypto from 'crypto';
const algorithm = 'aes-256-gcm';
const key = Buffer.from('3f8c1a9e7b2d4c6f8a0e1b9d7c5a3e2f', 'hex');
export function encrypt(text: string): string {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  const encrypted = Buffer.concat([
    cipher.update(text, 'utf8'),
    cipher.final(),
  ]);

  const tag = cipher.getAuthTag();

  return [
    iv.toString('hex'),
    tag.toString('hex'),
    encrypted.toString('hex'),
  ].join(':');
}

export function decrypt(payload: string): string {
  const [ivHex, tagHex, contentHex] = payload.split(':');

  const decipher = crypto.createDecipheriv(
    algorithm,
    key,
    Buffer.from(ivHex, 'hex'),
  );

  decipher.setAuthTag(Buffer.from(tagHex, 'hex'));

  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(contentHex, 'hex')),
    decipher.final(),
  ]);

  return decrypted.toString('utf8');
}