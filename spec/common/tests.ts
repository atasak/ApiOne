export class A {
    str: string = 'Hello World';
    readonly num: number = 10;

    method(x: string, y: number, b: B): boolean {
        return false;
    }
}

class B extends A {
    str: string = 'Nope';
    y: string[];
    a: A;
}
