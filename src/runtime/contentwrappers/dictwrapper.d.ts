import { AbstractWrapper } from './abstractwrapper';
export declare class DictWrapper<T> extends AbstractWrapper<T> {
    constructor();
    _get(): T;
    $get(): Promise<T>;
    set(t: T): void;
}
