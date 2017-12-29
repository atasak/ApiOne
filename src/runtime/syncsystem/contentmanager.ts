import {TContentHub} from './contenthub';
import {TContentPort} from './contentport';
import {JSONValType, Map1} from './package';
import {PackageType} from './packagecollector';

export interface IContentManager {
    getObjectsByType<T> (type: string): Map<string, T> | undefined;

    getObjectById<T> (type: string, id: string): T | undefined;

    resolve (type: string, id: string, channel?: string, follow?: string[]): void;

    addObj (type: string, id: string, data: Map1<JSONValType>, channel?: string): void;

    addField (type: string, id: string, field: string, data: JSONValType, channel?: string): void;

    deleteKey (type: string, id: string, field: string, channel?: string): void;

    sendPackage (channel: string, packageType: PackageType, receiver?: string): void;
}

export class TContentManager<TEntry> implements IContentManager {
    private _content = new Map<string, Map<string, any>>();

    constructor(private hub: TContentHub<TEntry>, private _entry: TEntry) {
    }

    get entry(): TEntry {
        return this._entry;
    }

    getObjectsByType<T>(type: string): Map<string, T> | undefined {
        return this._content.get(type) as Map<string, T> | undefined;
    }

    getObjectById<T>(type: string, id: string): T | undefined {
        const objectsOfType = this.getObjectsByType<T>(type);
        if (objectsOfType === undefined)
            return undefined;
        else
            return objectsOfType.get(id);
    }

    getNewContentPort(): TContentPort<TEntry> {
        return new TContentPort(this);
    }

    resolve<T>(type: string, id: string, channel?: string, follow?: string[]): Promise<T> {
        this.hub.resolve(type, id, channel, follow);
    }

    addObj(type: string, id: string, data: Map1<JSONValType>, channel?: string) {
        this.hub.addObj(type, id, data, channel);
    }

    addField(type: string, id: string, field: string, data: JSONValType, channel?: string) {
        this.hub.addField(type, id, field, data, channel);
    }

    deleteKey(type: string, id: string, field: string, channel?: string) {
        this.hub.deleteKey(type, id, field, channel);
    }

    sendPackage(channel: string, packageType: PackageType, receiver?: string) {
        this.hub.sendPackage(channel, packageType, receiver);
    }
}
