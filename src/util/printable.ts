export interface Printable {
    asString(): string;
}

export function enumerate<T>(t: T[] | { [key: string]: T } | { [key: number]: T },
                             toString: (t: T) => string): string {
    let str = '';
    for (const key in t)
        str += toString(t[key]);
    return str;
}
