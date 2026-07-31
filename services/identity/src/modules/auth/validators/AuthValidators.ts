import { z } from 'zod';

export const AuthValidators = {
  register: z.object({
    email: z.string().email(),
    passwordRaw: z.string().min(8),
  }).strict(),

  login: z.object({
    email: z.string().email(),
    passwordRaw: z.string().min(1),
  }).strict(),

  refresh: z.object({
    refreshToken: z.string().min(1),
  }).strict(),

  logout: z.object({
    refreshToken: z.string().min(1),
  }).strict(),

  forgotPassword: z.object({
    email: z.string().email(),
  }).strict(),

  resetPassword: z.object({
    token: z.string().min(1),
    newPasswordRaw: z.string().min(8),
  }).strict(),

  verifyEmail: z.object({
    token: z.string().min(1),
  }).strict(),

  sendVerificationEmail: z.object({
    email: z.string().email(),
  }).strict(),
};
