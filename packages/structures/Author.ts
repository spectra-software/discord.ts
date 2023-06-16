import { Badges } from "./Badges";
import {
  DISCORD_API,
  DISCORD_CDN,
  imageFormat,
  imageSize,
  GATEWAY_OPCODES,
} from "../utils/Constants";
import { Websocket } from "../ws/Websocket";
import { VoiceConnection } from "../voice/VoiceConnection";
import { RestManager } from "../rest/RestManager";
import { AvatarURL } from "../utils/core/AvatarUrl";
import { VoiceOptions } from "../utils/Options/VoiceOptions";
import { BannerOptions } from "../utils/Options/BannerOptions";

export class Author {
  public username!: string;
  public id!: string;
  public discriminator!: string;
  public avatar!: string;
  public badges!: Badges;
  public voiceChannelID!: string;
  public bot!: boolean;
  public roles!: string[];

  private guildID!: string;
  private _token: string;
  private WS!: Websocket;

  constructor(messageData: object | any, token: string, WS: Websocket) {
    this._token = token;
    this.WS = WS;
    this._patchData(messageData);
  }

  public avatarURL(options?: AvatarURL): string | undefined {
    if (this.avatar === null) return undefined;
    if (!options) return `${DISCORD_CDN}avatars/${this.id}/${this.avatar}.png`;
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

  public async joinVoiceChannel(
    channelID: string,
    state?: VoiceOptions
  ): Promise<VoiceConnection> {
    if (!channelID || typeof channelID !== "string")
      throw new SyntaxError("[AUTHOR] No voice channel ID provided");
    await this.WS.sendToWS(GATEWAY_OPCODES.VOICE_STATE_UPDATE, {
      guild_id: this.guildID,
      channel_id: channelID,
      self_mute: state?.mute || false,
      self_deaf: state?.deaf || false,
    });
    const endpoint = await this.WS.getVoiceConnectionEndpoint(this.guildID);
    return new VoiceConnection(this.WS, this.guildID, await endpoint);
  }

  public async bannerURL(options?: BannerOptions): Promise<string> {
    const res = await RestManager.prototype.request(
      `${DISCORD_API}users/${this.id}`,
      {
        method: "get",
        token: this._token,
      }
    );
    return `${DISCORD_CDN}banners/${this.id}/${await JSON.parse(res).banner}.${
      options && options.type && typeof options.type === "string"
        ? options.type
        : "gif"
    }?size=${
      options && options.size && imageSize.indexOf(Number(options.size)) > -1
        ? String(options.size)
        : "4096"
    }`;
  }

  public async leaveVoiceChannel(): Promise<void> {
    this.WS.sendToWS(GATEWAY_OPCODES.VOICE_STATE_UPDATE, {
      guild_id: this.guildID,
      channel_id: null,
      self_mute: false,
      self_deaf: false,
    });
  }

  private _patchData(data: any): void {
    this.guildID = data.guild_id;
    this.username = data.author.username;
    this.bot = data.author.bot !== undefined;
    this.id = data.author.id;
    this.discriminator = data.author.discriminator;
    this.avatar = data.author.avatar;
    this.badges = new Badges(data.author.public_flags);
  }
}
