import {AbstractWrapper} from './abstractwrapper';

export class ListWrapper<T> extends AbstractWrapper<T> {
    constructor () {
        super();
    }

    _get (): T {
        return this.model;
    }

    $get (): Promise<T> {
        return Promise.resolve(this.model);
    }

    set (t: T) {
        this.model = t;
    }
}
