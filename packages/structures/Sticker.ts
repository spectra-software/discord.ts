export class Sticker {
  public id!: string;
  public packID!: string;
  public name!: string;
  public description!: string;

  constructor(data: any) {
    this._patchData(JSON.parse(data));
  }

  private _patchData(data: any): void {
    this.id = data.id;
    this.packID = data.pack_id;
    this.name = data.name;
    this.description = data.description;
  }
}
