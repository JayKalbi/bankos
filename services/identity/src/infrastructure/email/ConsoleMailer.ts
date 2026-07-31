import { IMailer } from '../../modules/auth/interfaces/IMailer';

export class ConsoleMailer implements IMailer {
  public async sendPasswordReset(email: string, token: string): Promise<void> {
    console.log(`[MAILER] Sending Password Reset Email`);
    console.log(`[MAILER] To: ${email}`);
    console.log(`[MAILER] Subject: Reset Your Password`);
    console.log(`[MAILER] Body: Use the following token to reset your password: ${token}`);
  }
}
