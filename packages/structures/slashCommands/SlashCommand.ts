export class SlashCommand {
  public id: string;
  public applicationID: string;
  public name: string;
  public description: string;
  public version: string;
  public defaultPermission: boolean;
  public guildID: string | undefined;

  constructor(messageData: object | any) {
    const parsedData: any = JSON.parse(messageData);
    this.id = parsedData.id;
    this.applicationID = parsedData.application_id;
    this.name = parsedData.name;
    this.description = parsedData.description;
    this.version = parsedData.version;
    this.defaultPermission = parsedData.default_permission;
    this.guildID =
      parsedData.guild_id &&
      parsedData.guild_id !== undefined &&
      typeof parsedData.guild_id === "string"
        ? parsedData.guild_id
        : undefined;
  }
}
