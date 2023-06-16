import { DiscordButton } from "../../structures/DiscordButton";
import { DiscordSelectMenu } from "../../structures/DiscordSelectMenu";

export interface SendOptions {
  button?: DiscordButton | DiscordButton[] | any;
  ephemeral?: boolean;
  selectMenu?: DiscordSelectMenu;
}
