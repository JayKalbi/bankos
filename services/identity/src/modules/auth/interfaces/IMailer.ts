export interface IMailer {
  sendPasswordReset(email: string, token: string): Promise<void>;
}
