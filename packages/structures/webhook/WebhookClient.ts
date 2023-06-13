import { WebhookMessage } from "./WebhookMessage";
import { RestManager } from "../../rest/RestManager";
import { DiscordEmbed } from "../../structures/DiscordEmbed";
import { WebhookOptions } from "../../utils/Options/WebhookOptions";

export class WebhookClient {
  public retryOnLimit: boolean;
  private restManager: RestManager;

  constructor(options?: { retryOnLimit: boolean }) {
    this.retryOnLimit =
      options?.retryOnLimit && typeof options.retryOnLimit === "boolean"
        ? options.retryOnLimit
        : true;
    this.restManager = new RestManager();
  }

  public async send(
    message: string | DiscordEmbed | any,
    options: WebhookOptions
  ): Promise<WebhookMessage> {
    if (!message) throw new SyntaxError("ERRUR ICI");
    if (options.username.toLowerCase() === "clyde")
      throw new SyntaxError("NO_USERNAME_PROVIDED_OR_INVALID_USERNAME");
    if (
      !options.url ||
      typeof options.url !== "string" ||
      !/https:\/\/discord.com\/api\/webhooks\/(\w+)/.test(options.url)
    )
      throw new SyntaxError("NO_URL_PROVIDED_OR_INVALID_UR");
    const payload = {
      content: "",
      embeds: null,
      username: options.username,
      avatar_url:
        options.avatarURL && typeof options.avatarURL === "string"
          ? options.avatarURL
          : null,
    };
    switch (typeof message) {
      case "string": {
        payload.content = message;
        break;
      }
      case "object": {
        try {
          payload.embeds = message.getJSON();
        } catch (err) {
          throw new SyntaxError("INVALID_EMBED");
        }
      }
    }
    const res = await this.restManager.request(`${options.url}?wait=true`, {
      data: JSON.stringify(payload),
    });
    return new WebhookMessage(options.url, res);
  }

  public async file(
    filePath: string,
    options: WebhookOptions
  ): Promise<WebhookMessage> {
    if (!filePath) throw new SyntaxError("ERRUR ICI");
    if (!options.username || options.username.toLowerCase() === "clyde")
      throw new SyntaxError("NO_USERNAME_PROVIDED_OR_INVALID_USERNAME");
    if (
      !options.url ||
      typeof options.url !== "string" ||
      !/https:\/\/discord.com\/api\/webhooks\/(\w+)/.test(options.url)
    )
      throw new SyntaxError("NO_URL_PROVIDED_OR_INVALID_URL");
    const res = await this.restManager.postWebhookFile(options.url, filePath, {
      data: JSON.stringify({
        username: options.username,
        avatar_url:
          options.avatarURL && typeof options.avatarURL === "string"
            ? options.avatarURL
            : null,
      }),
    });
    return new WebhookMessage(options.url, res);
  }
}
