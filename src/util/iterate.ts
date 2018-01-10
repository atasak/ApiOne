import {undefinedToNull} from './utils';

export class Iterate<T> implements IterableIterator<T> {
    static from<TNew> (iterator: Iterable<TNew>): Iterate<TNew> {
        return new Iterate<TNew>(iterator);
    }

    static range (_from: number, _to?: number): Iterate<number> {
        return new Iterate<number>(RangeIterator(_to ? _from : 0, _to || _from));
    }

    static object<TNew> (object: { [key: string]: TNew }): Iterate<[string, TNew]> {
        return new Iterate<[string, TNew]>(ObjectIterate<TNew>(object));
    }

    private iterator: Iterator<T>;

    constructor (private iterable: Iterable<T>) {
        this.iterator = this.iterable[Symbol.iterator]();
    }

    [Symbol.iterator] (): IterableIterator<T> {
        return this;
    }

    next (value?: any): IteratorResult<T> {
        return this.iterator.next(value);
    }

    map<TTo> (map: (value: T) => TTo | null): Iterate<TTo> {
        return new Iterate<TTo>(IteratorMap<T, TTo>(this.iterable, map));
    }

    combine$<B> (iterator: Iterable<B>): Iterate<[T, B]> {
        return new Iterate<[T, B]>(CombinedIterator$<T, B>(this.iterator, iterator[Symbol.iterator]()));
    }

    combine<B> (iterator: Iterable<B>): Iterate<[T | null, B | null]> {
        return new Iterate<[T | null, B | null]>(CombinedIterator<T, B>(this.iterator, iterator[Symbol.iterator]()));
    }

    forEach (callbackfn: (value: T) => void) {
        for (const value of this.iterable)
            callbackfn(value);

    }
}

function* IteratorMap<TFrom, TTo> (iterator: Iterable<TFrom>, mapfn: (value: TFrom) => TTo | null): IterableIterator<TTo> {
    for (const x of iterator) {
        const y = mapfn(x);
        if (y != null)
            yield y;
    }
}

function* CombinedIterator$<A, B> (a: Iterator<A>, b: Iterator<B>): IterableIterator<[A, B]> {
    while (true) {
        const nextA = a.next();
        const nextB = b.next();
        if (nextA.done || nextB.done)
            return;
        yield [nextA.value, nextB.value];
    }
}

function* CombinedIterator<A, B> (a: Iterator<A>, b: Iterator<B>): IterableIterator<[A | null, B | null]> {
    while (true) {
        const nextA = a.next();
        const nextB = b.next();
        if (nextA.done && nextB.done)
            return;
        yield [undefinedToNull(nextA.value), undefinedToNull(nextB.value)];
    }
}

function* RangeIterator (from: number, to: number): IterableIterator<number> {
    for (let i = from; i < to; i++)
        yield i;
}

function* ObjectIterate<T> (object: { [key: string]: T }): IterableIterator<[string, T]> {
    for (const key of Object.keys(object)) {
        if (object.hasOwnProperty(key))
            yield [key, object[key]];
    }
}
