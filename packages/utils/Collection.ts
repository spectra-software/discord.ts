export class Collection<TKey, TObject> extends Map<TKey, TObject> {
  public first(): TObject | undefined {
    if (this.isEmpty())
      throw new Error("[COLLECTION-FIRST] The collection is empty");
    return this.values().next().value;
  }

  public firstKey(): TKey | undefined {
    if (this.isEmpty())
      throw new Error("[COLLECTION-FIRSTKEY] The collection is empty");
    return this.keys().next().value;
  }

  public last(): TObject | undefined {
    if (this.isEmpty())
      throw new Error("[COLLECTION-LAST] The collection is empty");
    return Array.from(this.values()).pop();
  }

  public lastKey(): TKey | undefined {
    if (this.isEmpty())
      throw new Error("[COLLECTION-LASTKEY] The collection is empty");
    return Array.from(this.keys()).pop();
  }

  public exists(value: TKey): boolean {
    if (!value || typeof value !== "string")
      throw new SyntaxError("[COLLECTION-EXISTS] No value provided");
    if (this.isEmpty())
      throw new Error("[COLLECTION-EXISTS] The collection is empty");
    return Object.values(this).includes(value);
  }

  public randomKey(): TKey {
    if (this.isEmpty())
      throw new Error("[COLLECTION-RANDOMKEY] The collection is empty");
    return Array.from(this.keys())[
      Math.floor(Math.random() * Array.from(this.keys()).length)
    ];
  }

  public random(): TObject {
    if (this.isEmpty())
      throw new Error("[COLLECTION-RANDOM] The collection is empty");
    return Array.from(this.values())[
      Math.floor(Math.random() * Array.from(this.values()).length)
    ];
  }

  public isEmpty(): boolean {
    if (this.size === 0) return true;
    return false;
  }

  public find(value: TObject): [TKey, TObject] | undefined {
    if (this.isEmpty())
      throw new Error("[COLLECTION-FIND] The collection is empty");
    return Array.from(this.entries()).find(([_k, v]) => v === value);
  }

  public findAll(obj: TObject): (TKey | undefined)[] {
    if (this.isEmpty())
      throw new Error("T[COLLECTION-FINDALL] The collection is empty");
    return Array.from(this.keys())
      .map((k) => (this.get(k) === obj ? k : undefined))
      .filter((k) => !!k);
  }

  public sort(): Map<TKey, TObject> {
    if (this.isEmpty())
      throw new Error("[COLLECTION-SORT] The collection is empty");
    return new Map([...this.entries()].sort((a: any, b: any) => a[1] - b[1]));
  }

  public keyArray(): [TKey] | TKey[] {
    if (this.isEmpty())
      throw new Error("[COLLECTION-KEYARRAY] The collection is empty");
    return [...this.keys()];
  }

  public valueArray(): [TObject] | TObject[] {
    if (this.isEmpty())
      throw new Error("[COLLECTION-VALUEARRAY] The collection is empty");
    return [...this.values()];
  }
}
