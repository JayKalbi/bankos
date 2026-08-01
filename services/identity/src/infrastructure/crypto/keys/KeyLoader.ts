export interface KeyPair {
  publicKey: string;
  privateKey?: string;
}

export class KeyLoader {
  constructor(private readonly keysConfig: Record<string, KeyPair>) {}

  public loadKeys(): Record<string, KeyPair> {
    return this.keysConfig;
  }
}
