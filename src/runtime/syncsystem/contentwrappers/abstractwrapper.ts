import {ResolvingId} from '../../../util/id';
import {OneMap} from '../../../util/onemap';
import {PrimitiveType} from '../../typesystem/types';
import {IContentManager} from '../contentmanager';
import {Primitive} from '../package';

export enum Resolved {Unresolved, Pending, Resolved};

export abstract class ResolvableWrapper<T extends { [key: string]: any } | Primitive> {
    public static IsWrapper = Symbol();
    protected model: { [key: string]: ResolvingId | Primitive };
    private _status: Resolved = Resolved.Pending;
    private promise: Promise<ResolvableWrapper<T>>;

    constructor (protected manager: IContentManager, protected readonly type: string, protected readonly id: ResolvingId) {
        this.promise = this.manager.resolve<T>(type, id);
        this.promise.then(() => this._status = Resolved.Resolved);

        this.model = this.manager.resolveData(type, id, this.modelFactory);
    }

    get [ResolvableWrapper.IsWrapper] (): boolean {
        return true;
    }

    status (field?: string): Resolved {
        if (field == null)
            return this._status;
        if (this.getTypeOf(field) === PrimitiveType)
            return Resolved.Resolved;
        if (this.model[field] == null || this.manager.hasWrapper(this.getTypeOf(this.type), this.model[field] as ResolvingId))
            return Resolved.Unresolved;
        return this.getHanlderOf(field)._status;
    }

    protected $get<F> (field: string): Promise<F> {
        return this.getHanlderOf(field).promise as any as Promise<F>;
    }

    protected _get<F> (field: string): F {
        return this.getHanlderOf(field).getHandler('_') as any as F;
    }

    protected set<F> (field: string, model: Partial<F>): F {
        if (this.getTypeOf(field) === PrimitiveType)
            return (this.model[field] = model as any as Primitive) as any as F;
        if ((model as { [key: string]: any })[ResolvableWrapper.IsWrapper])
            this.model[field] = (model as any as ResolvableWrapper<any>).id;
        this.manager.transformData(this.getTypeOf(field), model);
        return this._get<F>(field);
    }

    protected abstract modelFactory (): any;

    // TODO: Implement specific optimizations for this in implementing classes
    protected getHanlderOf<W extends ResolvableWrapper<any>> (field: number | string): W {
        return this.manager.getWrapperById(
            this.getTypeOf(field as string),
            (this.model[field] as ResolvingId).id);
    }

    protected abstract getTypeOf (field: string): string;

    protected abstract getHandler (method: '_' | '$'): T;
}

interface IHandler<T> {
    _: ProxyWrapper<T>
    $: ProxyWrapper<T>
}

export abstract class ProxyWrapper<T> extends ResolvableWrapper<T> {
    private reducedType: string;
    private reducedTypeMap: OneMap<string, ResolvableWrapper<T>>;
    private handlers: IHandler<T>;

    constructor (manager: IContentManager, type: string, id: ResolvingId) {
        super(manager, type, id);
        this.reducedType = this.manager.reduceType(this.type);
        this.reducedTypeMap = this.manager.getWrappersByType<ResolvableWrapper<T>>(this.reducedType);

        this.createHandlers();
    }

    createHandlers () {
        const _handler: ProxyHandler<ProxyWrapper<T>> = {
            get: (target, name) => target._get(name as string),
            set: (target, name, value) => target.set(name as string, value),
        };
        this.handlers._ = new Proxy<ProxyWrapper<T>>(this, _handler);

        const $handler: ProxyHandler<ProxyWrapper<T>> = {
            get: (target, name) => target.$get(name as string),
            set: (target, name, value) => target.set(name as string, value),
        };
        this.handlers.$ = new Proxy<ProxyWrapper<T>>(this, $handler);
    }

    getHandler (method: '_' | '$'): T {
        return this.handlers[method] as any as T;
    }

    protected getTypeOf () {
        return this.reducedType;
    }

    protected getHanlderOf<W extends ResolvableWrapper<any>> (field: number | string): W {
        return this.reducedTypeMap.getOrCreate((this.model[field] as ResolvingId).id) as W;
    }
}
