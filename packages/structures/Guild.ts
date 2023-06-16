import { RestManager } from "../rest/RestManager";
import { DISCORD_API } from "../utils/Constants";
import { GuildStickers } from "./GuildStickers";
import { GuildWelcomeScreen } from "../utils/core/GuildWelcomeScreen";
import { WidgetStyleOptions } from "../utils/Options/WidgetStyleOptions";

export class Guild {
  public id!: string;
  public stickers!: GuildStickers;

  private _token: string;

  constructor(id: string, token: string) {
    this.id = id;
    this._token = token;
    this.stickers = new GuildStickers(this.id, this._token);
  }

  public async welcomeScreen(): Promise<GuildWelcomeScreen> {
    const res = await RestManager.prototype.request(
      `${DISCORD_API}guilds/${this.id}/welcome-screen`,
      {
        method: "get",
        token: this._token,
      }
    );
    let formatRes = JSON.stringify(res);
    formatRes = formatRes.replace("welcome_channels", "channels");
    for (var i = 0; i < 6; i++) {
      formatRes = formatRes.replace("channel_id", "id");
    }
    formatRes = await JSON.parse(formatRes);
    return await JSON.parse(formatRes);
  }

  public widgetImage(options?: WidgetStyleOptions): string {
    return `${DISCORD_API}guilds/713699044811341895/widget.png?style=${
      options && options.style && typeof options.style === "string"
        ? options.style === "0"
          ? "shield"
          : `banner` + options.style
        : "banner1"
    }`;
  }
}
