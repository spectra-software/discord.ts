import { GuildWelcomeChannels } from "./GuildWelcomeChannels";

export interface GuildWelcomeScreen {
  description: string;
  channels: GuildWelcomeChannels[] | [];
}
