export const EmailValidator = {
  normalize(email: string): string {
    return email.trim().toLowerCase();
  },

  isValid(email: string): boolean {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  }
}
