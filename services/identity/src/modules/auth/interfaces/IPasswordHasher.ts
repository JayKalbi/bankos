export interface IPasswordHasher {
  hash(password: string): Promise<string>;
  verify(hash: string, plaintext: string): Promise<boolean>;
}
