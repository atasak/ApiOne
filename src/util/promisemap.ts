export class PromiseMap<T> {
    private map: { [type: string]: PromiseWrapper<T> } = {};

    insert(key: string, value: T) {
        this.getNullChecked(key).resolve(value);
    }

    get(key: string): Promise<T> {
        return this.getNullChecked(key).promise;
    }

    finalize() {
        for (const key in this.map) {
            if (this.map[key].value === null)
                this.map[key].reject();
        }
    }

    private getNullChecked(key: string): PromiseWrapper<T> {
        if (this.map[key] == null)
            this.map[key] = new PromiseWrapper<T>();
        return this.map[key];
    }
}

class PromiseWrapper<T> {
    promise: Promise<T>;
    resolve: (value: T) => void;
    reject: () => void;
    value: T = null;

    constructor() {
        this.promise = new Promise<T>((resolve, reject) => {
            this.resolve = resolve;
            this.reject = reject;
        }).then((value) =>
            this.value = value);
    }
}
