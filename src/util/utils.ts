export function noop () {
}

export function ID<T> (t: T): T {
    return t;
}

export function noNull<T, R> (t: T | null, map: (t: T) => R): R | null {
    if (t == null)
        return null;
    return map(t);
}
