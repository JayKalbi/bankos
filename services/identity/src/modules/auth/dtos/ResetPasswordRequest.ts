export interface ResetPasswordRequest {
  token: string;
  newPasswordRaw: string;
  ipAddress: string;
  userAgent: string;
}
