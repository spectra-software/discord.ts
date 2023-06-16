import { RestManager } from "../rest/RestManager";
import { DISCORD_API } from "../utils/Constants";
import { Channel } from "./Channel";

export class Channels {
  private _token: string;

  constructor(token: string) {
    this._token = token;
  }

  public async get(id: string | number): Promise<Channel> {
    if (!id) throw new SyntaxError("[CHANNELS] No id provided");
    const res: any = await RestManager.prototype.request(
      `${DISCORD_API}channels/${id}`,
      {
        method: "get",
        token: this._token,
      }
    );
    const parsedData = JSON.parse(res);
    return new Channel(parsedData.id, this._token);
  }
}
