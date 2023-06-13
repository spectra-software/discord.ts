import { Member } from "../Member";
import { RestManager } from "../../rest/RestManager";
import { DiscordEmbed } from "../DiscordEmbed";
import { DISCORD_API } from "../../utils/Constants";
import { SendOptions } from "../../utils/Options/SendOptions";
export class SlashCommandInteraction {
  public id!: string;
  public guildID!: string;
  public name!: string;
  public dataID!: string;
  public channelID!: string;
  public applicationID!: string;
  public token!: string;
  public member!: Member;

  private _token: string;

  constructor(messageData: object | any, token: string) {
    this._token = token;
    this._patchData(messageData);
  }

  public async reply(
    message: string | number | DiscordEmbed,
    options?: SendOptions
  ): Promise<void> {
    if (!message)
      throw new SyntaxError("[SLASH-COMMAND-INTERACTION] No message provided");
    const payload = {
      content: "",
      embeds: [] as any,
      components: [] as any,
      flags: options?.ephemeral ? 64 : null,
    };
    switch (typeof message) {
      case "string":
        payload.content = message;
        break;
      case "number":
        payload.content = String(message);
        break;
      case "object":
        try {
          payload.embeds = [message.getJSON()];
        } catch (err) {
          throw new Error("[SLASH-COMMAND-INTERACTION] Invalid embed");
        }
        break;
      default:
        throw new Error("[SLASH-COMMAND-INTERACTION] Invalid content");
    }
    if (options?.button && options.selectMenu)
      throw new SyntaxError("[SLASH-COMMAND-INTERACTION] Too many components");
    if (options?.button) {
      payload.components = [
        {
          type: 1,
          components: Array.isArray(options.button)
            ? options.button.map((btn) => btn.getJSON())
            : [options.button.getJSON()],
        },
      ];
    }
    if (options?.selectMenu) {
      if (Array.isArray(options.selectMenu))
        throw new SyntaxError(
          "[SLASH-COMMAND-INTERACTION] Select menu is array"
        );
      payload.components = [
        {
          type: 1,
          components: [options.selectMenu.getJSON()],
        },
      ];
    }
    await RestManager.prototype.request(
      `${DISCORD_API}interactions/${this.id}/${this.token}/callback`,
      {
        token: this._token,
        data: JSON.stringify({ type: 4, data: payload }),
      }
    );
    return;
  }

  private _patchData(data: any): void {
    this.id = data.id;
    this.guildID = data.guild_id;
    this.name = data.data.name;
    this.dataID = data.data.id;
    this.channelID = data.channel_id;
    this.applicationID = data.application_id;
    this.token = data.token;
    this.member = new Member(data.member, this._token, this.guildID);
  }
}
