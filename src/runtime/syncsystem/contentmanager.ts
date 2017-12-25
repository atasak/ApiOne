import {TContentPort} from './contentport';

export class TContentManager<TEntry> {
    private _content = new Map<string, Map<string, any>>();

    private _entry: TEntry;

    get entry (): TEntry {
        return this._entry;
    }

    getObjectsByType<T> (type: string): Map<string, T> | undefined {
        return this._content.get(type) as Map<string, T> | undefined;
    }

    getObjectById<T> (type: string, id: string): T | undefined {
        const objectsOfType = this.getObjectsByType<T>(type);
        if (objectsOfType === undefined)
            return undefined;
        else
            return objectsOfType.get(id);
    }

    getNewContentPort (): TContentPort<TEntry> {
        return new TContentPort(this);
    }
}
