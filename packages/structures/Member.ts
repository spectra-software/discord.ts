import { RestManager } from "../rest/RestManager";
import {
  DISCORD_API,
  DISCORD_CDN,
  imageFormat,
  imageSize,
} from "../utils/Constants";
import { AvatarURL } from "../utils/core/AvatarUrl";

export class Member {
  public roles!: string[];
  public id!: string;
  public username!: string;
  public discriminator!: string;
  public avatar!: string;
  public tag!: string;

  private _token: string;
  private guildID!: string;

  constructor(messageData: object | any, token: string, guildID: string) {
    this._token = token;
    this.guildID = guildID;
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

  public async addRole(roleID: string): Promise<void> {
    if (!roleID || typeof roleID !== "string")
      throw new SyntaxError("[MEMBER] No role id provided");
    await RestManager.prototype.request(
      `${DISCORD_API}guilds/${this.guildID}/members/${this.id}/roles/${roleID}`,
      {
        token: this._token,
        method: "put",
      }
    );
  }

  public stringifiedRoles(): string {
    return JSON.stringify(this.roles);
  }

  private _patchData(data: any): void {
    this.id = data.user.id;
    this.username = data.user.username;
    this.avatar = data.user.avatar;
    this.discriminator = data.user.discriminator;
    this.tag = `${this.username}#${this.discriminator}`;
    this.roles = data.roles;
  }
}
