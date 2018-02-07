import {ResolvingId} from '../../../util';
import {ReType} from '../../../util/types';
import {IContentManager} from '../contentmanager';
import {ProxyWrapper, ResolvableWrapper} from './wrapper.abstract';

export interface ClassHandler<T extends ClassHandler<T>> {
    _one_wrapper: ClassWrapper<T>
    _one_typeMap: ReType<T, string>
}

export class ClassWrapper<T extends ClassHandler<T>> extends ResolvableWrapper<T> {
    static readonly Wrapper = Symbol();
    static readonly TypeMap = Symbol();

    constructor (manager: IContentManager, type: string, id: ResolvingId, private handler: T) {
        super(manager, type, id);
        handler._one_wrapper = this;
    }

    protected modelFactory (): any {
        return {};
    }

    protected getTypeOf (field: keyof T): string {
        return this.handler._one_typeMap[field];
    }

    protected getHandler (): T {
        return this.handler;
    }
}

export class DictWrapper<T> extends ProxyWrapper<T> {
    protected modelFactory (): any {
        return {};
    }
}

export class ListWrapper<T> extends ProxyWrapper<T> {
    protected modelFactory (): any {
        [];
    }
}
