import { SlashCommand } from "../../utils/SlashCommand/SlashCommand";
import { SlashCommandOptions } from "../../utils/SlashCommand/SlashCommandOptions";

export class SlashCommandBuilder {
  public name?: string;
  public description?: string;
  public options?: object | any;

  private constructorBuilder?: object;

  constructor(command?: SlashCommand) {
    if (
      command &&
      typeof command === "object" &&
      command.name &&
      command.description &&
      typeof command.name === "string" &&
      typeof command.description === "string"
    ) {
      this.name = command.name;
      this.description = command.description;
      this.options = command.options;
      this.constructorBuilder = command;
    } else {
      this.name = undefined;
      this.description = undefined;
      this.options = undefined;
      this.constructorBuilder = undefined;
    }
  }

  public setName(name: string): SlashCommandBuilder {
    if (!name || typeof name !== "string")
      throw new SyntaxError("[SLASH-COMMAND-BUILDER] No name provided");
    if (name.indexOf(" ") >= 0)
      throw new SyntaxError("[SLASH-COMMAND-BUILDER] Name contains space");
    this.name = name;
    return this;
  }

  public setDescription(description: string): SlashCommandBuilder {
    if (!description || typeof description !== "string")
      throw new SyntaxError("[SLASH-COMMAND-BUILDER] No descroption provided");
    this.description = description;
    return this;
  }

  public setOptions(
    options: SlashCommandOptions | SlashCommandOptions[] | object | object[]
  ): SlashCommandBuilder {
    if (!options)
      throw new SyntaxError("[SLASH-COMMAND-BUILDER] No options provided");
    this.options = options;
    return this;
  }

  getJSON(): object {
    if (
      !this.name ||
      !this.description ||
      typeof this.name !== "string" ||
      typeof this.description !== "string"
    )
      throw new SyntaxError("[SLASH-COMMAND-BUILDER] Invalid slash command");
    if (this.constructorBuilder !== undefined) {
      return this.constructorBuilder;
    }
    return {
      name: this.name,
      type: 1,
      description: this.description,
      options: this.options === undefined ? [] : [this.options],
    };
  }
}
