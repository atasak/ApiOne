export class ContentManager<T> {
    protected _entry: T;

    get entry (): T {
        return this._entry;
    }

    protected _content = new Map<string, Map<string, any>> ();

    get content (): Map<string, Map<string, any>> {
        return this._content;
    }
}
