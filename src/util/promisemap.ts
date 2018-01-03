import {IteratorMap} from './iterator';
import {OneMap} from './onemap';
import {Printable} from './printable';
import {SyncPromise} from './syncpromise';

export class PromiseMap<K, V> implements Map<K, V> {
    [Symbol.iterator] = this.entries;
    private map: OneMap<K, PromiseWrapper<V>>;
    [Symbol.toStringTag] = this.map[Symbol.toStringTag];

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
        return new IteratorMap<[K, PromiseWrapper<V>], [K, V]>(
            this.map.entries(), (entry: [K, PromiseWrapper<V>]) => {
                const value = entry[1].value;
                if (value == null)
                    return null;
                return [entry[0], value];
            });
    }

    keys (): IterableIterator<K> {
        return this.map.keys();
    }

    values (): IterableIterator<V> {
        return new IteratorMap<PromiseWrapper<V>, V>(this.map.values(), v => v.value);
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
        for (const key of this.map.keys()) {
            if (this.map.getOrCreate(key).value === null)
                this.map.getOrCreate(key).reject('Key never resolved...');
        }
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
