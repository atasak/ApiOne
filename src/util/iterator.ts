export class IteratorMap<TFrom, TTo> implements IterableIterator<TTo> {
    constructor (private iterator: IterableIterator<TFrom>, private map: (value: TFrom) => TTo | null) {
    }

    [Symbol.iterator] (): IterableIterator<TTo> {
        return this;
    }

    next (): IteratorResult<TTo> {
        while (true) {
            const next = this.iterator.next ();
            if (next.done)
                return {done: true} as IteratorResult<TTo>;
            const value = this.map (next.value);
            if (value != null)
                return {
                    done: next.done,
                    value: value,
                };
        }
    }
}

export class CombinedIterator$<A, B> implements IterableIterator<[A, B]> {
    private readonly a: Iterator<A>;
    private readonly b: Iterator<B>;

    constructor (a: Iterable<A>, b: Iterable<B>) {
        this.a = a[Symbol.iterator] ();
        this.b = b[Symbol.iterator] ();
    }

    [Symbol.iterator] (): IterableIterator<[A, B]> {
        return this;
    }

    next (): IteratorResult<[A, B]> {
        const nextA = this.a.next ();
        const nextB = this.b.next ();
        if (nextA.done || nextB.done)
            return {done: true} as IteratorResult<[A, B]>;
        return {
            done: false,
            value: [nextA.value, nextB.value],
        };
    }
}

export class CombinedIterator_<A, B> implements IterableIterator<[A | null, B | null]> {
    private readonly a: Iterator<A>;
    private readonly b: Iterator<B>;

    constructor (a: Iterable<A>, b: Iterable<B>) {
        this.a = a[Symbol.iterator] ();
        this.b = b[Symbol.iterator] ();
    }

    [Symbol.iterator] (): IterableIterator<[A | null, B | null]> {
        return this;
    }

    next (): IteratorResult<[A | null, B | null]> {
        const nextA = this.a.next ();
        const nextB = this.b.next ();
        if (nextA.done && nextB.done)
            return {done: true} as IteratorResult<[A, B]>;
        return {
            done: false,
            value: [nextA.value == null ? null : nextA.value,
                nextB.value == null ? null : nextB.value],
        };
    }
}
