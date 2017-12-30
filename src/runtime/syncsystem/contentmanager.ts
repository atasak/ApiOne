import {OneMap} from '../../util/onemap';
import {TContentHub} from './contenthub';
import {TContentPort} from './contentport';
import {AbstractWrapper} from './contentwrappers/abstractwrapper';
import {Map1, Primitive} from './package';
import {PackageType} from './packagecollector';

export interface IContentManager {
    getObjectsByType<T> (type: string): Map<string, T> | undefined;

    getObjectById<T> (type: string, id: string): T | undefined;

    resolve (type: string, id: string, channel?: string, follow?: string[]): void;

    addObj (type: string, id: string, data: Map1<Primitive>, channel?: string): void;

    addField (type: string, id: string, field: string, data: Primitive, channel?: string): void;

    deleteKey (type: string, id: string, field: string, channel?: string): void;

    sendPackage (channel: string, packageType: PackageType, receiver?: string): void;
}

export interface ContentManager<TEntry> {
    getNewContentPort(): TContentPort<TEntry>;
}

export class TContentManager<TEntry> implements IContentManager, ContentManager<TEntry> {
    private content = new Map<string, Map<string, any>>();
    private wrappers: OneMap<string, OneMap<string, AbstractWrapper<any>>>;

    constructor (private hub: TContentHub<TEntry>, private _entry: TEntry, private typeFactories: Map<string, () => AbstractWrapper<any>>) {
        this.createWrapperOneMap();
    }

    entry (): TEntry {
        return this._entry;
    }

    getWrappersByType<T> (type: string): Map<string, T> | undefined {
        return this.content.get(type) as Map<string, T> | undefined;
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

    resolve<T> (type: string, id: string, channel?: string, follow?: string[]): Promise<T> {
        this.hub.resolve(type, id, channel, follow);
    }

    addObj (type: string, id: string, data: Map1<Primitive>, channel?: string) {
        this.hub.addObj(type, id, data, channel);
    }

    addField (type: string, id: string, field: string, data: Primitive, channel?: string) {
        this.hub.addField(type, id, field, data, channel);
    }

    deleteKey (type: string, id: string, field: string, channel?: string) {
        this.hub.deleteKey(type, id, field, channel);
    }

    sendPackage (channel: string, packageType: PackageType, receiver?: string) {
        this.hub.sendPackage(channel, packageType, receiver);
    }

    private createWrapperOneMap () {
        this.wrappers = new OneMap<string, OneMap<string, AbstractWrapper<any>>>(t =>
            new OneMap<string, AbstractWrapper<any>>(() => {
                const factory = this.typeFactories.get(t);
                if (factory != null)
                    return factory();
                // TODO: Create more specific error when used type does not exist
                throw new Error();
            }));
    }
}
