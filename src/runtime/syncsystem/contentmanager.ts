import {ResolvableId, ResolvableIdFactory} from '../../util/id';
import {OneMap} from '../../util/onemap';
import {PromiseMap} from '../../util/promisemap';
import {TContentHub} from './contenthub';
import {TContentPort} from './contentport';
import {ContentTransformer} from './contenttransformer';
import {ResolvableWrapper} from './contentwrappers/abstractwrapper';
import {ContentManager, ContentPort, FactoryMap, TypeReducer} from './interfaces';
import {SystemSpecs} from './interfaces/systemspecs';
import {Map1, Primitive} from './package';

export interface IContentManager {
    getWrappersByType<T extends ResolvableWrapper<T>> (type: string): OneMap<string, T>;

    getWrapperById<T extends ResolvableWrapper<T>> (type: string, id: string): T;

    resolve<T> (type: string, id: string, follow?: string[]): Promise<ResolvableWrapper<T>>;

    addObj (type: string, id: string, data: Map1<Primitive>): void;

    addField (type: string, id: string, field: string, data: Primitive): void;

    deleteKey (type: string, id: string, field: string): void;

    hasWrapper (type: string, id: string): boolean;

    resolveData(type: string, id: string, factory: () => any): any;

    transformData (type: string, data: any): ResolvableId;
}

export class TContentManager<TEntry> implements IContentManager, ContentManager<TEntry> {
    private data: OneMap<string, OneMap<string, any>>;
    private wrappers: OneMap<string, OneMap<string, ResolvableWrapper<any>>>;
    private promises: OneMap<string, PromiseMap<string, ResolvableWrapper<any>>>;

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

    get reduceType (): (type: string) => string {
        return this.typeReducer;
    }

    get entry (): TEntry {
        return this._entry;
    }

    transformData (type: string, data: any): ResolvableId {
        const ids = this.contentTransformer.transform(type, data);
        this.hub.requestIds(ids.length);
        return ids[0];
    }

    resolveData (type: string, id: string, factory: () => any): any {
        return this.data.getOrCreate(type).getOrCreate(id, factory);
    }

    getWrappersByType<T extends ResolvableWrapper<T>> (type: string): OneMap<string, T> {
        return this.data.getOrCreate(type) as OneMap<string, T>;
    }

    getWrapperById<T extends ResolvableWrapper<T>> (type: string, id: string): T {
        return this.wrappers.getOrCreate(type).getOrCreate(id) as T;
    }

    getNewContentPort (): ContentPort<TEntry> {
        return new TContentPort(this);
    }

    hasWrapper (type: string, id: string): boolean {
        return this.wrappers.getOrCreate(type).has(id);
    }

    resolve<T> (type: string, id: string, follow?: string[]): Promise<ResolvableWrapper<T>> {
        this.hub.resolve(type, id, follow);
        return this.promises.getOrCreate(type).promise(id);
    }

    addObj (type: string, id: string, data: Map1<Primitive>) {
        this.hub.addObj(type, id, data);
    }

    addField (type: string, id: string, field: string, data: Primitive) {
        this.hub.addField(type, id, field, data);
    }

    deleteKey (type: string, id: string, field: string) {
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
        this.promises = new OneMap<string, PromiseMap<string, any>>(() => new PromiseMap<string, any>());
    }
}
