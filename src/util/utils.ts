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

export async function timeOut (time: number, callbackfn: () => void) {
    await new Promise(resolve => setTimeout(() => {
        callbackfn();
        resolve();
    }, time));
}
