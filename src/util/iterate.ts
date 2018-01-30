import {undefinedToNull} from './utils';

export class Iterate<T> implements IterableIterator<T> {
    static from<TNew> (iterator: Iterable<TNew>): Iterate<TNew> {
        return new Iterate<TNew>(iterator);
    }

    static range (from: number, length?: number): Iterate<number> {
        return new Iterate<number>(RangeIterator(length ? from : 0, length || from));
    }

    static object<TNew> (object: { [key: string]: TNew }): Iterate<[string, TNew]> {
        return new Iterate<[string, TNew]>(ObjectIterate<TNew>(object));
    }

    private iterator: Iterator<T>;

    constructor (private iterable: Iterable<T>) {
        this.iterator = this.iterable[Symbol.iterator]();
    }

    get notNull (): Iterate<T> {
        return this.filter((x: T) => x != null);
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

    filter (filter: (value: T) => boolean): Iterate<T> {
        return new Iterate<T>(IteratorFilter<T>(this.iterable, filter));
    }

    zip$<B> (iterator: Iterable<B>): Iterate<[T, B]> {
        return new Iterate<[T, B]>(ZippedIterator$<T, B>(this.iterator, iterator[Symbol.iterator]()));
    }

    zip<B> (iterator: Iterable<B>): Iterate<[T | null, B | null]> {
        return new Iterate<[T | null, B | null]>(ZippedIterator<T, B>(this.iterator, iterator[Symbol.iterator]()));
    }

    concat (iterator: Iterable<T>): Iterate<T> {
        return new Iterate<T>(Concat(this.iterable, iterator));
    }

    limit (from: number, length: number): Iterate<T> {
        return new Iterate<T>(LimitIterator(this.iterator, from, length));
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

function* IteratorFilter<T> (iterator: Iterable<T>, filterfn: (value: T) => boolean): IterableIterator<T> {
    for (const x of iterator) {
        if (filterfn(x))
            yield x;
    }
}

function* ZippedIterator$<A, B> (a: Iterator<A>, b: Iterator<B>): IterableIterator<[A, B]> {
    while (true) {
        const nextA = a.next();
        const nextB = b.next();
        if (nextA.done || nextB.done)
            return;
        yield [nextA.value, nextB.value];
    }
}

function* ZippedIterator<A, B> (a: Iterator<A>, b: Iterator<B>): IterableIterator<[A | null, B | null]> {
    while (true) {
        const nextA = a.next();
        const nextB = b.next();
        if (nextA.done && nextB.done)
            return;
        yield [undefinedToNull(nextA.value), undefinedToNull(nextB.value)];
    }
}

function* Concat<T> (a: Iterable<T>, b: Iterable<T>): IterableIterator<T> {
    for (const x of a)
        yield x;
    for (const x of b)
        yield x;
}

function* RangeIterator (from: number, to: number): IterableIterator<number> {
    for (let i = from; i < to; i++)
        yield i;
}

function* LimitIterator<T> (iterator: Iterator<T>, from: number, length: number): IterableIterator<T> {
    for (let i = 0; true; i++) {
        const next = iterator.next();
        if (next.done)
            return;
        if (from <= i && i < from + length)
            yield next.value;
    }
}

function* ObjectIterate<T> (object: { [key: string]: T }): IterableIterator<[string, T]> {
    for (const key of Object.keys(object)) {
        if (object.hasOwnProperty(key))
            yield [key, object[key]];
    }
}
