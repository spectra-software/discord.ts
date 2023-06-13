import { EventEmitter } from "events";

import { Collection } from "../Collection";
import { COLLECTOR_EVENTS, CLIENT_EVENTS } from "../Constants";
import { Message } from "../../structures/Message";
import { Client } from "../../client/Client";
import { CreateCollectorOptions } from "../Options/CreateCollectorOptions";

export declare interface MessageCollector extends EventEmitter {
  on(
    event: "COLLECTED",
    listener: (message: Message) => void | Promise<void>
  ): this;
  on(event: "END", listener: () => any | Promise<any>): this;
}

export class MessageCollector extends EventEmitter {
  public collected: Collection<string, Message>;
  public filter: Function;
  public channelID: string;
  private client: Client;

  constructor(
    filter: Function,
    client: Client,
    options: CreateCollectorOptions
  ) {
    super();
    if (!filter || typeof filter !== "function")
      throw new SyntaxError("[MESSAGE-COLLECTOR] No filter provided");
    if (!client || client instanceof Client === false)
      throw new SyntaxError("[MESSAGE-COLLECTOR] No client provided");
    if (!options || !options.channelID || typeof options.channelID !== "string")
      throw new SyntaxError("[MESSAGE-COLLECTOR] No channel id provided");
    this.client = client;
    this.filter = filter;
    this.channelID = options.channelID;
    this.collected = new Collection();
    this.awaitMessages();
    setTimeout(
      () => {
        this.emit(COLLECTOR_EVENTS.END, this.collected);
        return;
      },
      options?.time && typeof options.time === "number"
        ? options.time * 1000
        : 30000
    );
    this.on(COLLECTOR_EVENTS.END, () => {
      return this.removeAllListeners();
    });
  }

  private async awaitMessages(): Promise<void> {
    this.client.on(CLIENT_EVENTS.MESSAGE, async (message) => {
      if (message.channel.id !== this.channelID) return;
      if (this.filter(message)) {
        this.collected.set(message.id, message);
        this.emit(COLLECTOR_EVENTS.COLLECTED, message);
      }
    });
  }
}
