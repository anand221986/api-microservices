import * as crypto from 'crypto';
const algorithm = 'aes-256-gcm';

const key = Buffer.from('f98ebd9d3a5021257a26f202913afe9a3b31bc9cc79013000ab525d4dce139b2', 'hex');
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