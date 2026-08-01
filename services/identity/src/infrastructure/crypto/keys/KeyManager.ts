import { KeyLoader, KeyPair } from './KeyLoader';

export class KeyManager {
  private keys: Record<string, KeyPair> = {};
  
  constructor(
    private readonly keyLoader: KeyLoader,
    private readonly activeKeyId: string
  ) {
    this.reload();
  }

  public reload(): void {
    this.keys = this.keyLoader.loadKeys();
    
    if (!this.keys[this.activeKeyId]) {
      throw new Error(`Active key with kid '${this.activeKeyId}' not found in key configuration`);
    }
    
    if (!this.keys[this.activeKeyId].privateKey) {
      throw new Error(`Active key with kid '${this.activeKeyId}' must contain a privateKey for signing`);
    }
  }

  public getActiveKeyId(): string {
    return this.activeKeyId;
  }

  public getActiveKey(): KeyPair {
    return this.keys[this.activeKeyId];
  }

  public getKey(kid: string): KeyPair | undefined {
    return this.keys[kid];
  }

  public getAllPublicKeys(): Record<string, string> {
    const publicKeys: Record<string, string> = {};
    for (const [kid, keyPair] of Object.entries(this.keys)) {
      publicKeys[kid] = keyPair.publicKey;
    }
    return publicKeys;
  }
}
