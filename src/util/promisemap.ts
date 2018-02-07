import {Iterate} from './iterate';
import {OneMap} from './onemap';
import {Printable} from './printable';
import {PromiseWrapper, ResolvableCode} from './promise.utils';
import {SyncPromise} from './syncpromise';

export abstract class AbstractPromiseMap<K, V> implements Map<K, V> {
    [Symbol.iterator] = this.entries;
    [Symbol.toStringTag]: any;
    private map: OneMap<K, PromiseWrapper<V>>;

    constructor () {
        this.map = new OneMap<K, PromiseWrapper<V>>(() => new PromiseWrapper<V>(this.constructPromise));
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

    move (from: K, to: K): boolean {
        return this.map.move(from, to);
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

    protected abstract constructPromise (callbackfn: ResolvableCode<V, void, void>): Promise<V>
}

export abstract class AbstractPromiseOneMap<K, V> extends AbstractPromiseMap<K, V> {
    constructor (private factory: (index: K) => V) {
        super();
    }

    getOrCreate (index: K, factory?: (index: K) => V): V {
        let value = this.get(index);
        if (value == null) {
            value = (factory || this.factory)(index);
            this.set(index, value);
        }
        return value;
    }
}

export class PromiseOneMap<K, V> extends AbstractPromiseOneMap<K, V> {
    protected constructPromise (callbackfn: ResolvableCode<V, void, void>): Promise<V> {
        return new Promise<V>(callbackfn);
    }
}

export class SyncPromiseOneMap<K, V> extends AbstractPromiseOneMap<K, V> {
    protected constructPromise (callbackfn: ResolvableCode<V, void, void>): Promise<V> {
        return new SyncPromise<V>(callbackfn);
    }
}

export class PromiseMap<K, V> extends AbstractPromiseMap<K, V> {
    protected constructPromise (callbackfn: ResolvableCode<V, void, void>): Promise<V> {
        return new Promise<V>(callbackfn);
    }
}

export class SyncPromiseMap<K, V> extends AbstractPromiseMap<K, V> {
    protected constructPromise (callbackfn: ResolvableCode<V, void, void>): Promise<V> {
        return new SyncPromise<V>(callbackfn);
    }
}

