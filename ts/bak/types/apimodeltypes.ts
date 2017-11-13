interface ProxySetter {
    property: string;
    proxy: any;
}

export type Insert<T> = (obj: T) => string;

export interface ApiMap<T> {
    [key: string]: T | T[] | Insert<W<T>>;

    insert: Insert<W<T>>;
    toArray: T[];
}

export type W<T> = { [P in keyof T]?: W<T[P]> };
