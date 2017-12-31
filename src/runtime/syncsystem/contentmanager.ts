import {OneMap} from '../../util/onemap';
import {TContentHub} from './contenthub';
import {TContentPort} from './contentport';
import {AbstractWrapper} from './contentwrappers/abstractwrapper';
import {Map1, Primitive} from './package';
import {PackageType} from './packagecollector';

export interface IContentManager {
    getWrapperById<T extends AbstractWrapper<T>> (type: string, id: string): T;

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
    private data: OneMap<string, Map<string, any>>;
    private wrappers: OneMap<string, OneMap<string, AbstractWrapper<any>>>;

    constructor (private hub: TContentHub<TEntry>, private _entry: TEntry,
                 private typeFactories: Map<string, (manager: IContentManager, id: string) => AbstractWrapper<any>>) {
        this.createWrapperOneMap();
        this.createDataOneMap();
    }

    entry (): TEntry {
        return this._entry;
    }

    getWrappersByType<T extends AbstractWrapper<T>> (type: string): OneMap<string, T> {
        return this.data.getOrCreate(type) as OneMap<string, T>;
    }

    getWrapperById<T extends AbstractWrapper<T>> (type: string, id: string): T {
        return this.wrappers.getOrCreate(type).getOrCreate(id) as T;
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
        this.wrappers = new OneMap<string, OneMap<string, AbstractWrapper<any>>>(type =>
            new OneMap<string, AbstractWrapper<any>>(id => {
                const factory = this.typeFactories.get(type);
                if (factory == null)
                // TODO: Create more specific error when used type does not exist
                    throw new Error();
                return factory(this, id);
            }));
    }

    private createDataOneMap () {
        this.data = new OneMap<string, OneMap<string, any>>(() => new OneMap<string, any>(() => {
        }));
    }
}
