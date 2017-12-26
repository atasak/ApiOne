import {TContentManager} from './contentmanager';
import {JSONValType, Map1} from './package';
import {PackageType} from './packagecollector';

export interface IContentPort {
    getObjectsByType<T> (type: string): Map<string, T> | undefined;

    getObjectById<T> (type: string, id: string): T | undefined;

    resolve<T> (type: string, id: string): Promise<T>;

    addObj (type: string, id: string, data: Map1<JSONValType>): void;

    addField (type: string, id: string, field: string, data: JSONValType): void;

    deleteKey (type: string, id: string, field: string): void;

    sendPackage (packageType: PackageType, receiver?: string): void;
}

export class TContentPort<TEntry> implements IContentPort {
    follow: string[] = [];

    constructor (private manager: TContentManager<TEntry>, private channel?: string) {
    }

    get entry (): TEntry {
        return this.manager.entry;
    }

    getObjectsByType<T> (type: string): Map<string, T> | undefined {
        return this.manager.getObjectsByType(type);
    }

    getObjectById<T> (type: string, id: string): T | undefined {
        return this.manager.getObjectById(type, id);
    }

    resolve<T> (type: string, id: string): Promise<T> {
        this.manager.resolve(type, id, this.channel, this.follow);
    }

    addObj (type: string, id: string, data: Map1<JSONValType>) {
        this.manager.addObj(type, id, data, this.channel);
    }

    addField (type: string, id: string, field: string, data: JSONValType) {
        this.manager.addField(type, id, field, data, this.channel);
    }

    deleteKey (type: string, id: string, field: string) {
        this.manager.deleteKey(type, id, field, this.channel);
    }

    sendPackage (packageType: PackageType, receiver?: string) {
        if (this.channel == null)
            throw new Error();
        this.manager.sendPackage(this.channel, packageType, receiver);
    }
}
