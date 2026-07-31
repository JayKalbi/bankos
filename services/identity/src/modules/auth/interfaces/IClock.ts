export interface IClock {
  now(): Date;
  unix(): number;
}
