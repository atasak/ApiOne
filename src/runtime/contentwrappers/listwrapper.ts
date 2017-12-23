import {AbstractWrapper} from './abstractwrapper';

export class ListWrapper<T> extends AbstractWrapper<T> {
    constructor() {
        super();
    }

    _get(): T {
        return this.data;
    }

    $get(): Promise<T> {
        return Promise.resolve(this.data);
    }

    set(t: T) {
        this.data = t;
    }
}
