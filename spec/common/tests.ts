import {ClassWrapper, DictWrapper, ListWrapper, VarWrapper} from '../../src/runtime/contentwrappers';

export class A {
    str: string = 'Hello World';
    readonly num: number = 10;
    bool: boolean = false;

    method(x: string, y: number, b: B): boolean {
        return false;
    }
}

export class B extends A {
    x: { [key: string]: A } = {};
    y: string[];
    a: A;

    constructor(str: string) {
        super();
        this.y = [];
    }
}

const m: ClassWrapper<A> = null;
const n: DictWrapper<A> = null;
const o: ListWrapper<A> = null;
const p: VarWrapper<A> = null;
