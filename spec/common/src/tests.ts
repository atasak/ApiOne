import {A as _A} from '../gen/tests';

export class A extends _A {
    str: string = 'Hello World';
    readonly num: number = 10;
    bool: boolean = false;

    method (x: string, y: number, b: B): boolean {
        return this.num !== 10;
    }
}

export class B extends A {
    x: { [key: string]: A } = {};
    y: string[];
    a: A;

    constructor (str: string) {
        super();
        this.y = [];
    }
}
