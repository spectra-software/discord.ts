import { RestManager } from "../rest/RestManager";
import { DISCORD_API } from "../utils/Constants";
import { User } from "./User";

export class Users {
  private _token: string;
  constructor(token: string) {
    this._token = token;
  }

  public async get(id: string | number): Promise<User> {
    if (!id) throw new SyntaxError("[USERS] No id provided");
    const res: any = await RestManager.prototype.request(
      `${DISCORD_API}users/${id}`,
      {
        method: "GET",
        token: this._token,
      }
    );
    return new User(res, this._token);
  }
}
