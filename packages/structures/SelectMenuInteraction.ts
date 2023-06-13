import { RestManager } from "../rest/RestManager";
import { DISCORD_API } from "../utils/Constants";
import { Message } from "./Message";
import { Member } from "./Member";
import { DiscordEmbed } from "../structures/DiscordEmbed";
import { Websocket } from "../ws/Websocket";
import { SendOptions } from "../utils/Options/SendOptions";

export class SelectMenuInteraction {
  public guildID!: string;
  public id!: string;
  public customID!: string;
  public token!: string;
  public applicationID!: string;
  public values!: string[];
  public message!: Message;
  public member!: Member;

  private _token: string;
  private deferred!: boolean;
  private replied!: boolean;
  private WS!: Websocket;

  constructor(messageData: object | any, token: string, WS: any) {
    this._token = token;
    this.WS = WS;
    this._patchData(messageData);
  }

  public async edit(
    message: string | number | DiscordEmbed,
    options?: SendOptions
  ): Promise<void> {
    if (!message)
      throw new SyntaxError("[SELECT-MENU-INTERACTION] No message provided");
    const payload = {
      content: "",
      embeds: [] as any,
      components: [] as any,
    };
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
          throw new Error("[SELECT-MENU-INTERACTION] Invalid embed");
        }
        break;
      default:
        throw new Error("[SELECT-MENU-INTERACTION] Invalid content");
    }
    if (options?.button && options.selectMenu)
      throw new SyntaxError("[SELECT-MENU-INTERACTION] Too many components");
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
        throw new SyntaxError("[SELECT-MENU-INTERACTION] Select menu is array");
      payload.components = [
        {
          type: 1,
          components: [options.selectMenu.getJSON()],
        },
      ];
    }
    return await RestManager.prototype.request(
      `${DISCORD_API}interactions/${this.id}/${this.token}/callback`,
      {
        token: this._token,
        data: JSON.stringify({ type: 7, data: payload }),
      }
    );
  }

  public async reply(
    message: string | number | DiscordEmbed,
    options?: SendOptions
  ): Promise<void> {
    if (this.deferred === true || this.replied === true)
      throw new SyntaxError("[SELECT-MENU-INTERACTION] Already responded");
    if (!message)
      throw new SyntaxError("[SELECT-MENU-INTERACTION] No message provided");
    const payload = {
      content: "",
      embeds: [] as any,
      components: [] as any,
      flags: options?.ephemeral ? 64 : null,
    };
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
          throw new Error("[SELECT-MENU-INTERACTION] Invalid embed");
        }
        break;
      default:
        throw new Error("[SELECT-MENU-INTERACTION] Invalid content");
    }
    if (options?.button && options.selectMenu)
      throw new SyntaxError("[SELECT-MENU-INTERACTION] Too many components");
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
        throw new SyntaxError("[SELECT-MENU-INTERACTION] Select menu is array");
      payload.components = [
        {
          type: 1,
          components: [options.selectMenu.getJSON()],
        },
      ];
    }
    await RestManager.prototype.request(
      `${DISCORD_API}interactions/${this.id}/${this.token}/callback`,
      {
        token: this._token,
        data: JSON.stringify({ type: 4, data: payload }),
      }
    );
    this.replied = true;
    return;
  }

  public async defer(ephemeral?: boolean): Promise<void> {
    if (this.deferred === true || this.replied === true)
      throw new Error("[SELECT-MENU-INTERACTION] Already responded");
    await RestManager.prototype.request(
      `${DISCORD_API}interactions/${this.id}/${this.token}/callback`,
      {
        token: this._token,
        data: JSON.stringify({
          type: 6,
          data: { flags: ephemeral ? 64 : null },
        }),
      }
    );
    this.deferred = true;
    return;
  }

  public async think(ephemeral?: boolean): Promise<void> {
    if (this.deferred === true || this.replied === true)
      throw new Error("[SELECT-MENU-INTERACTION] Already responded");
    await RestManager.prototype.request(
      `${DISCORD_API}interactions/${this.id}/${this.token}/callback`,
      {
        token: this._token,
        data: JSON.stringify({
          type: 5,
          data: { flags: ephemeral ? 64 : null },
        }),
      }
    );
    this.deferred = true;
    return;
  }

  private _patchData(data: any): void {
    this.deferred = false;
    this.replied = false;
    this.guildID = data.guild_id;
    this.customID = data.data.custom_id;
    this.id = data.id;
    this.token = data.token;
    this.values = data.data.values;
    this.applicationID = data.application_id;
    this.member = new Member(data.member, this._token, this.guildID);
    this.message = new Message(data.message, this._token, this.WS);
  }
}
