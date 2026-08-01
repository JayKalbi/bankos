export interface IRandomGenerator {
  generateToken(length?: number): string;
  generateUUID(): string;
  hashString(data: string, algorithm?: string): string;
}
