export type Nothing = null | undefined;

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

export async function doAsync (callbackfn: () => void) {
    await timeOut(0, callbackfn);
}

export async function timeOut (time: number, callbackfn: () => void = noop) {
    await new Promise(resolve => setTimeout(() => {
        callbackfn();
        resolve();
    }, time));
}

export function undefinedToNull<T> (x: T | undefined): T | null {
    return x === undefined ? null : x;
}

export function ApplyMixins (derivedCtor: any, baseCtors: any[]) {
    baseCtors.forEach(baseCtor => {
        Object.getOwnPropertyNames(baseCtor.prototype).forEach(name => {
            derivedCtor.prototype[name] = baseCtor.prototype[name];
        });
    });
}

