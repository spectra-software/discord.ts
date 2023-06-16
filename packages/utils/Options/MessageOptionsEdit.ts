import { DiscordButton } from "../../structures/DiscordButton";
import { DiscordSelectMenu } from "../../structures/DiscordSelectMenu";

export interface MessageOptionsEdit {
  button?: DiscordButton | DiscordButton[];
  selectMenu?: DiscordSelectMenu;
}
