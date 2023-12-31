import ws from "ws";

import {
  WEBSOCKET_URL,
  GATEWAY_OPCODES,
  GATEWAY_EVENTS,
  CLIENT_EVENTS,
  WEBSOCKET_CLOSE_CODES,
  WEBSOCKET_EVENTS,
} from "../utils/Constants";
import { Message } from "../structures/Message";
import { ButtonInteraction } from "../structures/ButtonInteraction";
import { EventEmitter } from "events";
import { GuildMember } from "../structures/GuildMember";
import { SlashCommandInteraction } from "../structures/slashCommands/SlashCommandInteraction";
import { SelectMenuInteraction } from "../structures/SelectMenuInteraction";
import { MessageReaction } from "../structures/MessageReaction";
import { Collection } from "../utils/Collection";

const wsProperties = {
  os: process ? process.platform : "discord.ts",
  device: "discord.ts",
  browser: "discord.ts",
  compress: true,
  largeThreshold: 250,
  reconnect: true,
  shards: 1,
};

const heartBeatProperties = {
  last: 0,
  lastReceived: Date.now(),
  lastSent: Infinity,
  interval: 0,
  lastPing: Infinity,
};

export class Websocket {
  public wsProperties = wsProperties;
  public intents?: number;
  public online = false;
  public AFK = false;
  public ping: number = 0;
  public shardsMap: Map<number, string> = new Map();

  private heartbeat = heartBeatProperties;
  private socket!: ws;
  private _token!: string;
  private clientEmitter!: EventEmitter;
  private _options!: any;
  private voiceReadyEventContent: Collection<string, string> = new Collection();

  constructor(emitter?: any) {
    this.clientEmitter = emitter;
  }

  public async initConnection(token: string, options?: any): Promise<void> {
    this._options = options;
    this._token = token;
    this.socket = new ws(WEBSOCKET_URL);
    this.socket.once(WEBSOCKET_EVENTS.OPEN, () => {
      this.online = true;
    });
    setInterval(() => {
      this.getPing();
    }, 2000);
    this.socket.on(
      WEBSOCKET_EVENTS.MESSAGE,
      async (message) => await this.onMessage(message, options)
    );
    this.socket.on(WEBSOCKET_EVENTS.CLOSE, async (code) => {
      const statusCodeString = this.getStatusCodeString(code);
      if (code !== 1000)
        this.clientEmitter.emit(
          CLIENT_EVENTS.WARN,
          "CLOSE_ERROR_CODE_" +
            code +
            "_STATUS_" +
            statusCodeString.toUpperCase()
        );
      if (this.wsProperties.reconnect === true) {
        try {
          this.clientEmitter.emit(CLIENT_EVENTS.RECONNECTING, statusCodeString);
          await this.initConnection(this._token, options);
        } catch (err) {
          throw new Error(
            "WEBSOCKET_FAILED_TO_RECONNECT_" + String(err).toUpperCase()
          );
        }
      } else return;
    });
    this.socket.once(WEBSOCKET_EVENTS.ERROR, async (error) => {
      this.clientEmitter.emit(CLIENT_EVENTS.ERROR, error);
      if (this.wsProperties.reconnect === true) {
        this.clientEmitter.emit(CLIENT_EVENTS.RECONNECTING);
        await this.initConnection(this._token, options);
      } else return;
    });
    this.socket.on(WEBSOCKET_EVENTS.PONG, async () => {
      this.ping = Date.now() - this.heartbeat.lastPing;
    });
  }

  public sendToWS(code: number, data: any): void {
    if (!this.socket || this.socket.readyState !== ws.OPEN) return;
    this.socket.send(JSON.stringify({ op: code, d: data }));
  }

  public async getVoiceConnectionEndpoint(guildID: string): Promise<any> {
    const guildCollectionContent = this.voiceReadyEventContent.get(guildID);
    return guildCollectionContent || undefined;
  }

  public getMetaData(code: number, options: any) {
    switch (code) {
      case GATEWAY_OPCODES.IDENTIFY:
        return {
          intents: this.intents,
          token: this._token,
          compress: this.wsProperties.compress,
          large_threshold: this.wsProperties.largeThreshold,
          properties: {
            $os: this.wsProperties.os,
            $browser: this.wsProperties.browser,
            $device: this.wsProperties.device,
          },
          presence: {
            activities: [
              {
                name: options.game.name,
                type: options.game.type,
                url: options.game.url,
              },
            ],
            status: options.status,
            afk: this.AFK,
          },
        };
      case GATEWAY_OPCODES.PRESENCE_UPDATE:
        return {
          since: 91879201,
          activities: [
            {
              name: options.game.name,
              type: options.game.type,
              url: options.game.url,
            },
          ],
          status: options.status,
          afk: this.AFK,
        };
    }
  }

  private async onMessage(message: any, options?: any) {
    let parsedMsg: any;
    try {
      parsedMsg = JSON.parse(message);
      this.heartbeat.lastReceived = Date.now();
    } catch (err) {
      return;
    }
    if (parsedMsg.s) this.heartbeat.last = parsedMsg.s;
    switch (parsedMsg.op) {
      case GATEWAY_OPCODES.HELLO:
        this.heartbeat.interval = parsedMsg.d.heartbeat_interval;
        this.sendToWS(
          GATEWAY_OPCODES.IDENTIFY,
          await this.getMetaData(GATEWAY_OPCODES.IDENTIFY, options)
        );
        setInterval(() => {
          this.initHeartBeat();
        }, this.heartbeat.interval);
        break;
      case GATEWAY_OPCODES.DISPATCH:
        await this.handleEvent(parsedMsg);
        break;
      case GATEWAY_OPCODES.RECONNECT:
        await this.initConnection(this._token, this._options);
        break;
    }
  }

  private async handleEvent(message: any): Promise<void> {
    switch (message.t) {
      case GATEWAY_EVENTS.VOICE_SERVER_UPDATE:
        if (message.op === 0)
          this.voiceReadyEventContent.set(
            await message.d.guild_id,
            await message.d.endpoint
          );
        break;
      case GATEWAY_EVENTS.MESSAGE_CREATE:
        this.clientEmitter.emit(
          CLIENT_EVENTS.MESSAGE,
          new Message(message.d, this._token, this)
        );
        break;
      case GATEWAY_EVENTS.INTERACTION_CREATE:
        switch (Number(message.d.type)) {
          case 2:
            this.clientEmitter.emit(
              CLIENT_EVENTS.SLASH_COMMAND_USED,
              new SlashCommandInteraction(message.d, this._token)
            );
            break;
          case 3:
            switch (Number(message.d.data.component_type)) {
              case 2:
                this.clientEmitter.emit(
                  CLIENT_EVENTS.BUTTON_CLICKED,
                  new ButtonInteraction(message.d, this._token, this)
                );
                break;
              case 3:
                this.clientEmitter.emit(
                  CLIENT_EVENTS.SELECT_MENU_CLICKED,
                  new SelectMenuInteraction(message.d, this._token, this)
                );
                break;
            }
        }
        break;
      case GATEWAY_EVENTS.GUILD_MEMBER_ADD:
        this.clientEmitter.emit(
          CLIENT_EVENTS.GUILD_MEMBER_ADD,
          new GuildMember(message.d)
        );
        break;
      case GATEWAY_EVENTS.MESSAGE_REACTION_ADD:
        this.clientEmitter.emit(
          CLIENT_EVENTS.MESSAGE_REACTION_ADD,
          new MessageReaction(message.d, this._token)
        );
        break;
    }
  }

  private async initHeartBeat(): Promise<void> {
    this.heartbeat.lastSent = Date.now();
    this.sendToWS(GATEWAY_OPCODES.HEARTBEAT, this.heartbeat.last);
  }

  private async getPing(): Promise<void> {
    this.heartbeat.lastPing = Date.now();
    this.socket.ping();
  }

  private getStatusCodeString(code: number): string {
    if (code >= 0 && code <= 999) {
      return "(Unused)";
    } else if (code >= 1016) {
      if (code <= 1999) {
        return "(For WebSocket standard)";
      } else if (code <= 2999) {
        return "(For WebSocket extensions)";
      } else if (code <= 3999) {
        return "(For libraries and frameworks)";
      } else if (code <= 4999) {
        return "(For applications)";
      }
    }
    if (typeof WEBSOCKET_CLOSE_CODES[code] !== "undefined") {
      return WEBSOCKET_CLOSE_CODES[code];
    }
    return "(Unknown)";
  }
}
