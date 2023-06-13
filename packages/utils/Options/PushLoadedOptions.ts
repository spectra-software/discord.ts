import { SlashCommandOptionsManager } from "../SlashCommand/SlashCommandOptionsManager";

export interface PushLoadedOptions extends SlashCommandOptionsManager {
  commandName?: string;
  all?: boolean;
}
