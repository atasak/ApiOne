import {Iterate} from './iterator';
import {OneMap} from './onemap';
import {Printable} from './printable';
import {SyncPromise} from './syncpromise';

export class PromiseMap<K, V> implements Map<K, V> {
    [Symbol.iterator] = this.entries;
    [Symbol.toStringTag]: any;
    private map: OneMap<K, PromiseWrapper<V>>;

    constructor () {
        this.map = new OneMap<K, PromiseWrapper<V>>(() => new PromiseWrapper<V>());
    }

    get size () {
        return this.map.size;
    };

    clear (): void {
        this.map.clear();
    }

    delete (key: K): boolean {
        return this.map.delete(key);
    }

    forEach (callbackfn: (value: V, key: K, map: Map<K, V>) => void, thisArg?: any): void {
        this.map.forEach((value, key) => value.value == null || callbackfn(value.value, key, this), thisArg);
    }

    set (key: K, value: V): this {
        this.map.getOrCreate(key).resolve(value);
        return this;
    }

    entries (): IterableIterator<[K, V]> {
        return Iterate
            .from(this.map.entries())
            .map(([key, wrapper]) => wrapper.value == null ? null : [key, wrapper.value] as [K, V]);
    }

    keys (): IterableIterator<K> {
        return this.map.keys();
    }

    values (): IterableIterator<V> {
        return Iterate.from(this.map.values())
            .map(v => v.value);
    }

    get (key: K): V | undefined {
        return this.map.getOrCreate(key).value || undefined;
    }

    promise (key: K): Promise<V> {
        return this.map.getOrCreate(key).promise;
    }

    has (key: K): boolean {
        return this.map.has(key);
    }

    finalize () {
        this.map.forEach(wrapper => {
            if (wrapper.value === null)
                wrapper.reject('Key never resolved...');
        });
    }

    log () {
        for (const key of this.map.keys()) {
            console.log(`${key}: `);
            const value = this.map.getOrCreate(key).value;
            if ((value as { [key: string]: any })['asString'] != null)
                console.log((value as any as Printable).asString());
            else
                console.log(value);
        }
    }
}

class PromiseWrapper<T> {
    promise: Promise<T>;
    resolve: (value: T) => void;
    reject: (reason: any) => void;
    value: T | null = null;

    constructor () {
        this.promise = new SyncPromise<T>((resolve, reject) => {
            this.resolve = resolve;
            this.reject = reject;
        });
        this.promise.then((val) =>
            this.value = val);
    }
}
