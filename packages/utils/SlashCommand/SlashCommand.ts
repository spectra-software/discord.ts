import { SlashCommandOptions } from "./SlashCommandOptions";

export interface SlashCommand {
  name: string;
  type: number;
  description: string;
  options: SlashCommandOptions | SlashCommandOptions[];
}
