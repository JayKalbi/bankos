import { IClock } from '../../modules/auth/interfaces/IClock';

export class SystemClock implements IClock {
  public now(): Date {
    return new Date();
  }

  public unix(): number {
    return Math.floor(Date.now() / 1000);
  }
}
