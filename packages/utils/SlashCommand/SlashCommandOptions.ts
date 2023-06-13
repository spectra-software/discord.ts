import { SlashCommandChoices } from "./SlashCommandChoices";

export interface SlashCommandOptions {
  name: string;
  description: string;
  type: number;
  required: boolean;
  choices: SlashCommandChoices | SlashCommandChoices[];
}
