import { SlashCommandOptionsManager } from "./SlashCommandOptionsManager";

export interface SlashCommandOptionsWithId extends SlashCommandOptionsManager {
  commandID: string;
}
