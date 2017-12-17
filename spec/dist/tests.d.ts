export declare class A {
    str: string;
    readonly _str: string;
    readonly $str: Promise<string>;
    num: number;
    readonly _num: number;
    readonly $num: Promise<number>;
    private _one_str;
    private _one_num;

    method(x: string, y: number, b: B): boolean;
}

export declare class B extends A {
    str: string;
    readonly _str: string;
    readonly $str: Promise<string>;
    x: {
        [key: string]: A;
    };
    readonly _x: {
        [key: string]: A;
    };
    readonly $x: Promise<{
        [key: string]: A;
    }>;
    y: string[];
    readonly _y: string[];
    readonly $y: Promise<string[]>;
    a: A;
    readonly _a: A;
    readonly $a: Promise<A>;
    private _one_str;
    private _one_x;
    private _one_y;
    private _one_a;

    constructor(str: string);
}
