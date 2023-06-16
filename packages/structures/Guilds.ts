import { RestManager } from "../rest/RestManager";
import { DISCORD_API } from "../utils/Constants";
import { Guild } from "./Guild";

export class Guilds {
  private _token: string;

  constructor(token: string) {
    this._token = token;
  }

  public async get(id: string | number): Promise<Guild> {
    if (!id) throw new SyntaxError("[GUILDS] No id provided");
    const res: any = await RestManager.prototype.request(
      `${DISCORD_API}guilds/${id}`,
      {
        method: "get",
        token: this._token,
      }
    );
    const parsedData = JSON.parse(res);
    return new Guild(parsedData.id, this._token);
  }
}
