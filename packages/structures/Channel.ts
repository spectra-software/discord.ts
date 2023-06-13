import { DiscordEmbed } from "./DiscordEmbed";
import { DISCORD_API } from "../utils/Constants";
import { RestManager } from "../rest/RestManager";
import { Guild } from "./Guild";
import { SentMessage } from "./SentMessage";
import { Client } from "../client/Client";
import { MessageCollector } from "../utils/collector/MessageCollector";
import { CollectorOptions } from "../utils/Options/CollectorOptions";
import { SendOptionsWithFile } from "../utils/Options/SendOptionsWithFile";

export class Channel {
  public id!: string;
  public guild!: Guild;

  private _token: string;

  constructor(id: string, token: string, guildID?: string) {
    this._token = token;
    this.id = id;
    if (guildID !== undefined) this.guild = new Guild(guildID, this._token);
  }

  public async send(
    message: string | number | DiscordEmbed,
    options?: SendOptionsWithFile
  ): Promise<SentMessage> {
    if (!message) throw new SyntaxError("[CHANNEL] No message provided");
    const payload = {
      content: "",
      embeds: [] as any,
      components: [] as any,
    };
    if (options?.files) {
      RestManager.prototype.postFile(
        `${DISCORD_API}channels/${this.id}/messages`,
        options.files,
        {
          token: this._token,
          method: "POST",
        }
      );
    }
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
          throw new Error("[CHANNEL] INVALID_EMBED");
        }
        break;
      default:
        throw new Error("[CHANNEL] INVALID_CONTENT");
    }
    if (options?.button && options.selectMenu)
      throw new SyntaxError("[CHANNEL] Too many components");
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
        throw new SyntaxError("[CHANNEL] Select menu is array");
      payload.components = [
        {
          type: 1,
          components: [options.selectMenu.getJSON()],
        },
      ];
    }
    const res: any = await RestManager.prototype.request(
      `${DISCORD_API}channels/${this.id}/messages`,
      {
        token: this._token,
        data: JSON.stringify(payload),
      }
    );
    return new SentMessage(await res, this._token);
  }

  public createMessageCollector(
    filter: Function,
    client: Client,
    options?: CollectorOptions
  ): MessageCollector {
    if (!filter || typeof filter !== "function")
      throw new SyntaxError("[CHANNEL] No filter provided");
    if (!client) throw new SyntaxError("[CHANNEL] No client provided");
    return new MessageCollector(filter, client, {
      time: options?.time || 30,
      channelID: this.id,
    });
  }
}
