import {Primitive} from '../package';
import {AbstractWrapper} from './abstractwrapper';

export class VarWrapper<T extends Primitive> extends AbstractWrapper<T> {
    constructor() {
        super();
    }

    _get(): T {
        return this.model;
    }

    $get(): Promise<T> {
        return Promise.resolve(this.model);
    }

    set(t: T) {
        this.model = t;
    }
}
