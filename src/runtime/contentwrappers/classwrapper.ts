import {AbstractWrapper} from './abstractwrapper';

export class ClassWrapper<T> extends AbstractWrapper<T> {
    private constructor() {
        super();
    }

    static Construct<T>(): ClassWrapper<T> {
        return new ClassWrapper<T>();
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
