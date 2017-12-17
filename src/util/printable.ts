export interface Printable {
    asString(): string;
}

export function enumerate<T>(t: T[] | Map<string, T> | Map<number, T>,
                             toString: (t: T) => string): string {
    let str = '';

    if (t instanceof Map) {
        for (const value of t.values())
            str += toString(value);
    } else {
        for (const key in t)
            str += toString(t[key]);
    }

    return str;
}
