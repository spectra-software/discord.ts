import moment from "moment";

import { RestManager } from "../../rest/RestManager";
import { DISCORD_CDN, imageFormat, imageSize } from "../../utils/Constants";
import { _testURL } from "../../utils/Utils";

type ImageSize = "128" | "256" | "512" | "1024";

type ImageFormat = "jpg" | "jpeg" | "gif" | "png" | "tiff" | "bmp";

interface Message {
  id: string | number;
  content: string;
  timestamp: string;
  formatedTimestamp: string | number;
}

interface AvatarURL {
  size?: ImageSize;
  format?: ImageFormat;
}

interface EditOptions {
  username?: string;
  avatarURL?: string;
  timeout?: number;
}

export class WebhookMessage {
  public url: string;
  public message!: Message;
  public channelID!: string | number;
  public isBot!: boolean;
  public id!: string | number;
  public username!: string;
  public avatar!: string;
  public discriminator!: string | number;
  public webhookID!: string | number;
  public type!: string | number;
  private restManager: RestManager;

  constructor(webhookURL: string, messageData: object | any) {
    this.url = webhookURL;
    this.restManager = new RestManager();
    this._patchData(JSON.parse(messageData));
  }

  async delete(timeout?: number): Promise<void> {
    if (timeout && typeof timeout === "number") {
      const deleteTimeout = Number(timeout) * 1000;
      setTimeout(() => {
        this.restManager.request(this.url, {
          method: "delete",
        });
      }, deleteTimeout);
      return;
    } else {
      this.restManager.request(this.url, {
        method: "delete",
      });
      return;
    }
  }

  public async edit(options?: EditOptions): Promise<WebhookMessage> {
    if (!options) throw new SyntaxError("NO_OPTIONS_PROVIDED");
    if (!options.username || options.username.toLowerCase() === "clyde")
      throw new SyntaxError("NO_USERNAME_PROVIDED_OR_INVALID_USERNAME");
    const payload = {
      username: options.username !== undefined ? options.username : null,
      avatar:
        options.avatarURL !== undefined && _testURL(options.avatarURL)
          ? options.avatarURL
          : null,
    };
    if (options.timeout && typeof options.timeout === "number") {
      const editTimeout = Number(options.timeout) * 1000;
      setTimeout(() => {
        this.restManager.request(this.url, {
          method: "patch",
          data: JSON.stringify(payload),
        });
      }, editTimeout);
      return this;
    }
    this.restManager.request(this.url, {
      method: "patch",
      data: JSON.stringify(payload),
    });
    return this;
  }

  public avatarURL(options?: AvatarURL): string | undefined {
    if (this.avatar === null) return undefined;
    if (!options) return `${DISCORD_CDN}avatars/${this.id}/${this.avatar}`;
    return `${DISCORD_CDN}avatars/${this.id}/${this.avatar}${
      options.format &&
      typeof options.format === "string" &&
      imageFormat.indexOf(options.format.toLowerCase()) > -1
        ? "." + options.format
        : ".png"
    }${
      options.size && imageSize.indexOf(Number(options.size)) > -1
        ? "?size=" + options.size
        : "?size=128"
    }`;
  }

  private async _patchData(data: object | any): Promise<void> {
    this.id = data.author.id;
    this.type = data.type;
    this.message = {
      id: data.id,
      content: data.content,
      timestamp: data.timestamp,
      formatedTimestamp: moment(data.timestamp).format("LLLL"),
    };
    this.avatar = data.author.avatar;
    this.isBot = data.author.bot;
    this.webhookID = data.webhook_id;
    this.channelID = data.channel_id;
    this.discriminator = data.author.discriminator;
    this.username = data.author.userusername;
  }
}
