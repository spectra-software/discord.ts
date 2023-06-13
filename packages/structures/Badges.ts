import { PremiumNames } from "../utils/core/PremiumNames";

export class Badges {
  public nitro: PremiumNames | undefined;

  private number: number;

  constructor(flags: number, premium?: number) {
    if (premium && typeof premium === "number") {
      switch (premium) {
        case 1:
          this.nitro = "Nitro Classic";
          break;
        case 2:
          this.nitro = "Nitro";
          break;
        default:
          this.nitro = "none";
          break;
      }
    } else this.nitro = undefined;
    this.number = flags;
  }

  public get count(): number {
    return this.number;
  }
}
