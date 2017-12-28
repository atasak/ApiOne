import {ClassWrapper, ListWrapper, DictWrapper, VarWrapper} from "apiwrapper";

export class A {
    method (x: string, y: number, b: B): boolean {
        return false;
    }

    private _one_str: VarWrapper<string> = new VarWrapper<string>();

    get str(): string {
        return this._one_str._get()
    }

    get _str(): string {
        return this._one_str._get()
    }

    get $str(): Promise<string> {
        return this._one_str.$get()
    }

    set str(str: string) {
        this._one_str.set(str);
    }

    private _one_num: VarWrapper<number> = new VarWrapper<number>();

    get num(): number {
        return this._one_num._get()
    }

    get _num(): number {
        return this._one_num._get()
    }

    get $num(): Promise<number> {
        return this._one_num.$get()
    }

    set num(num: number) {
        this._one_num.set(num);
    }

    private _one_bool: VarWrapper<boolean> = new VarWrapper<boolean>();

    get bool(): boolean {
        return this._one_bool._get()
    }

    get _bool(): boolean {
        return this._one_bool._get()
    }

    get $bool(): Promise<boolean> {
        return this._one_bool.$get()
    }

    set bool(bool: boolean) {
        this._one_bool.set(bool);
    }
}

export class B extends A {
    constructor (str: string) {
        super ();
        this.y = [];
    }

    private _one_x: DictWrapper<{ [key: string]: A }> = new DictWrapper<{ [key: string]: A }>();

    get x(): { [key: string]: A } {
        return this._one_x._get()
    }

    get _x(): { [key: string]: A } {
        return this._one_x._get()
    }

    get $x(): Promise<{ [key: string]: A }> {
        return this._one_x.$get()
    }

    set x(x: { [key: string]: A }) {
        this._one_x.set(x);
    }

    private _one_y: ListWrapper<string[]> = new ListWrapper<string[]>();

    get y(): string[] {
        return this._one_y._get()
    }

    get _y(): string[] {
        return this._one_y._get()
    }

    get $y(): Promise<string[]> {
        return this._one_y.$get()
    }

    set y(y: string[]) {
        this._one_y.set(y);
    }

    private _one_a: ClassWrapper<A> = new ClassWrapper<A>();

    get a(): A {
        return this._one_a._get()
    }

    get _a(): A {
        return this._one_a._get()
    }

    get $a(): Promise<A> {
        return this._one_a.$get()
    }

    set a(a: A) {
        this._one_a.set(a);
    }
}
