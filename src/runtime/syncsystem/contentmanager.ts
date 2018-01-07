import {SyncPromiseMap} from '../../util';
import {ResolvableIdFactory, ResolvingId} from '../../util/id';
import {OneMap} from '../../util/onemap';
import {TContentHub} from './contenthub';
import {TContentPort} from './contentport';
import {ContentTransformer} from './contenttransformer';
import {ResolvableWrapper} from './contentwrappers/abstractwrapper';
import {ContentManager, ContentPort, FactoryMap, TypeReducer} from './interfaces';
import {SystemSpecs} from './interfaces/systemspecs';
import {DataObj, Primitive} from './package';

export interface IContentManager {
    readonly reduceType: TypeReducer;

    getWrappersByType<T extends ResolvableWrapper<any>> (type: string): OneMap<string, T>;

    getWrapperById<T extends ResolvableWrapper<any>> (type: string, id: string): T;

    resolve<T> (type: string, id: ResolvingId, follow?: string[]): Promise<ResolvableWrapper<T>>;

    addObj (type: string, id: ResolvingId, data: DataObj): void;

    addField (type: string, id: ResolvingId, field: string, data: ResolvingId | Primitive): void;

    deleteKey (type: string, id: ResolvingId, field: string): void;

    hasWrapper (type: string, id: ResolvingId): boolean;

    resolveData(type: string, id: ResolvingId, factory: () => any): any;

    transformData (type: string, data: any): ResolvingId;
}

export class TContentManager<TEntry> implements IContentManager, ContentManager<TEntry> {
    private data: OneMap<string, OneMap<string, any>>;
    private wrappers: OneMap<string, OneMap<string, ResolvableWrapper<any>>>;
    private promises: OneMap<string, SyncPromiseMap<string, ResolvableWrapper<any>>>;

    private typeFactories: FactoryMap;
    private typeReducer: TypeReducer;
    private idFactory: ResolvableIdFactory;
    private contentTransformer: ContentTransformer;

    constructor (private hub: TContentHub<TEntry>, private _entry: TEntry,
                 specs: SystemSpecs) {
        this.createWrapperOneMap();
        this.createDataAndPromiseMaps();

        this.typeFactories = specs.typeFactories;
        this.typeReducer = specs.typeReducer;
        this.idFactory = new ResolvableIdFactory(specs.masks.temporary);
        this.contentTransformer = new ContentTransformer(this, this.idFactory);
    }

    get reduceType (): TypeReducer {
        return this.typeReducer;
    }

    get entry (): TEntry {
        return this._entry;
    }

    transformData (type: string, data: any): ResolvingId {
        const ids = this.contentTransformer.transform(type, data);
        this.hub.requestIds(ids.length);
        return ids[0];
    }

    resolveData (type: string, id: ResolvingId, factory: () => any): any {
        return this.data.getOrCreate(type).getOrCreate(id.id, factory);
    }

    getWrappersByType<T extends ResolvableWrapper<any>> (type: string): OneMap<string, T> {
        return this.data.getOrCreate(type) as OneMap<string, T>;
    }

    getWrapperById<T extends ResolvableWrapper<any>> (type: string, id: string): T {
        return this.wrappers.getOrCreate(type).getOrCreate(id) as T;
    }

    getNewContentPort (): ContentPort<TEntry> {
        return new TContentPort(this);
    }

    hasWrapper (type: string, id: ResolvingId): boolean {
        return this.wrappers.getOrCreate(type).has(id.id);
    }

    resolve<T> (type: string, id: ResolvingId, follow?: string[]): Promise<ResolvableWrapper<T>> {
        this.hub.resolve(type, id, follow);
        return this.promises.getOrCreate(type).promise(id.id);
    }

    addObj (type: string, id: ResolvingId, data: DataObj) {
        this.hub.addObj(type, id, data);
    }

    addField (type: string, id: ResolvingId, field: string, data: ResolvingId | Primitive) {
        this.hub.addField(type, id, field, data);
    }

    deleteKey (type: string, id: ResolvingId, field: string) {
        this.hub.deleteKey(type, id, field);
    }

    private createWrapperOneMap () {
        this.wrappers = new OneMap<string, OneMap<string, ResolvableWrapper<any>>>(type =>
            new OneMap<string, ResolvableWrapper<any>>(id => {
                const factory = this.typeFactories.get(type);
                if (factory == null)
                // TODO: Create more specific error when used type does not exist
                    throw new Error();
                return factory(this, id);
            }));
    }

    private createDataAndPromiseMaps () {
        this.data = new OneMap<string, OneMap<string, any>>(() => new OneMap<string, any>(() => null));
        this.promises = new OneMap<string, SyncPromiseMap<string, any>>(() => new SyncPromiseMap<string, any>());
    }
}
