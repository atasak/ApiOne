export class Iterate<T> implements IterableIterator<T> {
    static from<TNew> (iterator: Iterable<TNew>): Iterate<TNew> {
        return new Iterate<TNew>(iterator[Symbol.iterator]());
    }

    static range (_from: number, _to?: number): Iterate<number> {
        function* rangeGenerator (from: number, to: number): Iterator<number> {
            for (let i = from; i < to; i++)
                yield i;
        }

        return new Iterate<number>(rangeGenerator(_to ? _from : 0, _to || _from));
    }

    static object<TNew> (object: { [key: string]: TNew }): ObjectIterate<TNew> {
        return new ObjectIterate<TNew>(object);
    }

    private thisiterator: Iterator<T>;

    constructor (thisiterator?: Iterator<T>) {
        this.thisiterator = thisiterator || this;
    }

    [Symbol.iterator] (): IterableIterator<T> {
        return this;
    }

    next (value?: any): IteratorResult<T> {
        return this.thisiterator.next(value);
    }

    map<TTo> (map: (value: T) => TTo | null): Iterate<TTo> {
        return new IteratorMap<T, TTo>(this.thisiterator, map);
    }

    combine$<B> (iterator: Iterable<B>): CombinedIterator$<T, B> {
        return new CombinedIterator$<T, B>(this.thisiterator, iterator[Symbol.iterator]());
    }

    combine<B> (iterator: Iterable<B>): CombinedIterator<T, B> {
        return new CombinedIterator<T, B>(this.thisiterator, iterator[Symbol.iterator]());
    }

    forEach (callbackfn: (value: T) => void) {
        for (const value of this)
            callbackfn(value);

    }
}

export class IteratorMap<TFrom, TTo> extends Iterate<TTo> {
    constructor (private iterator: Iterator<TFrom>, private mapfn: (value: TFrom) => TTo | null) {
        super();
    }

    next (): IteratorResult<TTo> {
        while (true) {
            const next = this.iterator.next();
            if (next.done)
                return {done: true} as IteratorResult<TTo>;
            const value = this.mapfn(next.value);
            if (value != null)
                return {
                    done: next.done,
                    value: value,
                };
        }
    }
}

export class CombinedIterator$<A, B> extends Iterate<[A, B]> {
    constructor (private a: Iterator<A>, private b: Iterator<B>) {
        super();
    }

    next (): IteratorResult<[A, B]> {
        const nextA = this.a.next();
        const nextB = this.b.next();
        if (nextA.done || nextB.done)
            return {done: true} as IteratorResult<[A, B]>;
        return {
            done: false,
            value: [nextA.value, nextB.value],
        };
    }
}

export class CombinedIterator<A, B> extends Iterate<[A | null, B | null]> {
    constructor (private a: Iterator<A>, private b: Iterator<B>) {
        super();
    }

    next (): IteratorResult<[A | null, B | null]> {
        const nextA = this.a.next();
        const nextB = this.b.next();
        if (nextA.done && nextB.done)
            return {done: true} as IteratorResult<[A, B]>;
        return {
            done: false,
            value: [nextA.value == null ? null : nextA.value,
                nextB.value == null ? null : nextB.value],
        };
    }
}

export class ObjectIterate<T> extends Iterate<[string, T]> {
    private keyIterator: Iterator<string>;

    constructor (private object: { [key: string]: T }) {
        super();
        this.keyIterator = Object.keys(object)[Symbol.iterator]();
    }

    next (): IteratorResult<[string, T]> {
        const key = this.keyIterator.next();
        if (key.done === true)
            return {done: true} as IteratorResult<[string, T]>;
        if (!this.object.hasOwnProperty(key.value))
            return this.next();
        return {
            done: false,
            value: [key.value, this.object[key.value]],
        };
    }
}
