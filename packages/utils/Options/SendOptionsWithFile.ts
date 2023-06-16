import { DiscordButton } from "../../structures/DiscordButton";
import { DiscordSelectMenu } from "../../structures/DiscordSelectMenu";
export interface SendOptionsWithFile {
  files?: string | string[];
  button?: DiscordButton | DiscordButton[] | any;
  selectMenu?: DiscordSelectMenu;
}
