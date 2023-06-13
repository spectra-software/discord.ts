import { EventEmitter } from "events";

import { RestManager } from "../rest/RestManager";
import {
  DISCORD_API,
  DISCORD_CDN,
  imageFormat,
  imageSize,
  CLIENT_EVENTS,
} from "../utils/Constants";
import { Badges } from "../structures/Badges";
import { _testURL } from "../utils/Utils";
import { AvatarURL } from "../utils/core/AvatarUrl";
import { ListGuildOptions } from "../utils/Options/ListGuildOptions";

export class ClientUser {
  public id!: string;
  public username!: string;
  public discriminator!: string;
  public avatar!: string;
  public bot!: boolean;
  public mfaEnable!: boolean;
  public locale!: string;
  public verified!: string;
  public badges!: Badges;
  public tag!: string;
  public bio!: string;

  private _token: string;
  private emitter: EventEmitter;

  constructor(token: string, emitter: EventEmitter) {
    this._token = token;
    this.emitter = emitter;
    this._patchData();
  }

  public avatarURL(options?: AvatarURL): string | undefined {
    if (this.avatar === null || !this.avatar) return undefined;
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

  public async setUsername(username: string): Promise<void> {
    if (!username || typeof username !== "string")
      throw new SyntaxError("[CLIENT-USER] No username provided");
    return await RestManager.prototype.request(`${DISCORD_API}users/@me`, {
      method: "PATCH",
      token: this._token,
      data: JSON.stringify({ username: username }),
    });
  }

  public async setAvatar(avatarURL: string): Promise<void> {
    if (!avatarURL || typeof avatarURL !== "string")
      throw new SyntaxError("[CLIENT-USER] No avatar URL provided");
    if (!_testURL(avatarURL))
      throw new Error("[CLIENT-USER] Invalid avatar URL provided");
    return await RestManager.prototype.request(`${DISCORD_API}users/@me`, {
      method: "PATCH",
      token: this._token,
      data: JSON.stringify({ avatar: avatarURL }),
    });
  }

  public async getGuildsList(): Promise<ListGuildOptions[]> {
    const res = await RestManager.prototype.request(
      `${DISCORD_API}users/@me/guilds`,
      {
        method: "GET",
        token: this._token,
      }
    );
    return JSON.parse(await res);
  }

  public async getShardsCount(): Promise<number> {
    const res: any = await RestManager.prototype.request(
      `${DISCORD_API}gateway/bot`,
      {
        method: "GET",
        token: this._token,
      }
    );
    const parsedRes = await JSON.parse(res);
    return parsedRes.shards;
  }

  private async _patchData(): Promise<void> {
    const res: any = await RestManager.prototype.request(
      `${DISCORD_API}users/@me`,
      {
        token: this._token,
        method: "GET",
      }
    );
    const parsedRes = JSON.parse(res);
    this.id = parsedRes.id;
    this.username = parsedRes.username;
    this.discriminator = parsedRes.discriminator;
    this.avatar = parsedRes.avatar;
    this.bot = parsedRes.bot;
    this.verified = parsedRes.verified;
    this.locale = parsedRes.locale;
    this.mfaEnable = parsedRes.mfa_enable;
    this.badges = new Badges(parsedRes.public_flags);
    this.tag = `${this.username}#${this.discriminator}`;
    this.bio = parsedRes.bio;
    this.emitter.emit(CLIENT_EVENTS.READY);
  }
}
