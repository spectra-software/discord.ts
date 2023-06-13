import { LabelOptions } from "../utils/Options/LabelOptions";

export class DiscordSelectMenu {
  public customID!: string;
  public options!: any[];
  public placeHolder!: string;
  public maxValues!: number;
  public minValues!: number;

  constructor() {
    this.options = [];
  }

  public addLabel(Label: string, options: LabelOptions): DiscordSelectMenu {
    if (!Label || typeof Label !== "string")
      throw new SyntaxError("[DISCORD-SELECT-MENU] No label provided");
    if (!options || typeof options !== "object")
      throw new SyntaxError("[DISCORD-SELECT-MENU] Invalid label options");
    this.options.push({
      label: Label,
      value: options.value,
      description: options.description,
      emoji:
        options.emoji !== undefined
          ? { name: options.emoji.name, id: options.emoji.id }
          : undefined,
    });
    return this;
  }

  public setCustomID(id: string): DiscordSelectMenu {
    if (!id || typeof id !== "string" || id.indexOf(" ") >= 0)
      throw new SyntaxError("[DISCORD-SELECT-MENU] No custom id provided");
    this.customID = id;
    return this;
  }

  public setPlaceHolder(placeHolder: string): DiscordSelectMenu {
    if (!placeHolder || typeof placeHolder !== "string")
      throw new SyntaxError("[DISCORD-SELECT-MENU] No place holder provided");
    this.placeHolder = placeHolder;
    return this;
  }

  public setMinValues(value: number): DiscordSelectMenu {
    if (!value || typeof value !== "number")
      throw new SyntaxError("[DISCORD-SELECT-MENU] No min value provided");
    this.minValues = value;
    return this;
  }

  public setMaxValues(value: number): DiscordSelectMenu {
    if (!value || typeof value !== "number")
      throw new SyntaxError("[DISCORD-SELECT-MENU] No max value provided");
    this.maxValues = value;
    return this;
  }

  public getJSON(): object {
    if (
      this.customID &&
      typeof this.customID === "string" &&
      this.options !== undefined &&
      typeof this.options === "object"
    ) {
      return {
        type: 3,
        custom_id: this.customID,
        options: this.options,
        placeholder: this.placeHolder,
        min_values: this.minValues === undefined ? 1 : this.minValues,
        max_values:
          this.maxValues === undefined
            ? Object.keys(this.options).length
            : this.maxValues,
      };
    }
    throw new Error("INVALID_MENU");
  }
}
