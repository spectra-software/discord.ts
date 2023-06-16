import { RestManager } from "../rest/RestManager";
import { Sticker } from "./Sticker";
import { DISCORD_API } from "../utils/Constants";

export class GuildStickers {
  private guildID: string;
  private _token: string;

  constructor(guildID: string, token: string) {
    this.guildID = guildID;
    this._token = token;
  }

  public async get(id: string): Promise<Sticker> {
    if (!id || typeof id !== "string")
      throw new SyntaxError("[GUILD-STICKERS] No sticker id provided");
    const res = await RestManager.prototype.request(
      `${DISCORD_API}guilds/${this.guildID}/stickers/${id}`,
      {
        method: "get",
        token: this._token,
      }
    );
    return new Sticker(await res);
  }
}
