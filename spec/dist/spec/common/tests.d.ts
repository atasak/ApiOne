export declare class A {
    method(x: string, y: number, b: B): boolean;
    private _one_str;
    str: string;
    readonly _str: string;
    readonly $str: Promise<string>;
    private _one_num;
    num: number;
    readonly _num: number;
    readonly $num: Promise<number>;
    private _one_bool;
    bool: boolean;
    readonly _bool: boolean;
    readonly $bool: Promise<boolean>;
}
export declare class B extends A {
    constructor(str: string);
    private _one_x;
    x: {
        [key: string]: A;
    };
    readonly _x: {
        [key: string]: A;
    };
    readonly $x: Promise<{
        [key: string]: A;
    }>;
    private _one_y;
    y: string[];
    readonly _y: string[];
    readonly $y: Promise<string[]>;
    private _one_a;
    a: A;
    readonly _a: A;
    readonly $a: Promise<A>;
}
