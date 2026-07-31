import * as crypto from 'crypto';

export const ConstantTime = {
  isEqual(a: string, b: string): boolean {
    if (typeof a !== 'string' || typeof b !== 'string') {
      return false;
    }

    try {
      const bufferA = Buffer.from(a, 'utf8');
      const bufferB = Buffer.from(b, 'utf8');

      if (bufferA.length !== bufferB.length) {
        // Prevent timing attacks by still running timingSafeEqual on dummy buffers
        crypto.timingSafeEqual(bufferA, bufferA);
        return false;
      }

      return crypto.timingSafeEqual(bufferA, bufferB);
    } catch {
      return false;
    }
  }
};
