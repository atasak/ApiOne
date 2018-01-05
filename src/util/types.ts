export type ReType<T, V> = {
    [P in keyof T]: V;
    };

