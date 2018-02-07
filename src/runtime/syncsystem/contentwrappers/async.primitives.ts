import {Observable} from 'rxjs/Observable';
import {Observer} from 'rxjs/Observer';
import {ApplyMixins, Nothing} from '../../../util';
import {PromiseWrapper, Reject, Resolve} from '../../../util/promise.utils';
import {$observable, $observer, $promise, AsyncIndexedData, AsyncData, Catch, observable, promise, then, subscribe} from './async.abstract';
import {Subscription} from 'rxjs/Subscription';

export class AsyncString extends String implements AsyncData<string> {
    [Symbol.toStringTag]: any;
    [$promise]: PromiseWrapper<string> | null = null;
    [$observable]: Observable<string> | null = null;
    [$observer]: Observer<string> | null = null;
    readonly [promise]: Promise<string>;
    readonly [observable]: Observable<string>;
    readonly then!: <TResult1, TResult2> (onfulfilled?: Resolve<string, TResult1> | Nothing,
                                onrejected?: Reject<TResult2> | Nothing) => Promise<TResult1 | TResult2>;
    readonly catch!: <TResult> (onrejected?: Reject<TResult> | Nothing) => Promise<string | TResult>;
    readonly subscribe!: (next?: (value: string) => void,
                error?: (error: any) => void,
                complete?: () => void) => Subscription;
    readonly [then]!: <TResult1, TResult2> (onfulfilled?: Resolve<string, TResult1> | Nothing,
    onrejected?: Reject<TResult2> | Nothing) => Promise<TResult1 | TResult2>;
    readonly [Catch]!: <TResult> (onrejected?: Reject<TResult> | Nothing) => Promise<string | TResult>;
    readonly [subscribe]!: (next?: (value: string) => void,
    error?: (error: any) => void,
    complete?: () => void) => Subscription;

    constructor (str: string) {
        super(str);
    }
}

export class AsyncNumber extends Number implements Promise<number> {
    [Symbol.toStringTag]: any;
    [$promise]: PromiseWrapper<number> | null = null;
    [$observable]: Observable<number> | null = null;
    [$observer]: Observer<number> | null = null;
    readonly [promise]: Promise<number>;
    readonly [observable]: Observable<number>;
    readonly then!: <TResult1, TResult2> (onfulfilled?: Resolve<number, TResult1> | Nothing,
                                onrejected?: Reject<TResult2> | Nothing) => Promise<TResult1 | TResult2>;
    readonly catch!: <TResult> (onrejected?: Reject<TResult> | Nothing) => Promise<number | TResult>;
    readonly subscribe!: (next?: (value: number) => void,
                error?: (error: any) => void,
                complete?: () => void) => Subscription;
    readonly [then]!: <TResult1, TResult2> (onfulfilled?: Resolve<number, TResult1> | Nothing,
    onrejected?: Reject<TResult2> | Nothing) => Promise<TResult1 | TResult2>;
    readonly [Catch]!: <TResult> (onrejected?: Reject<TResult> | Nothing) => Promise<number | TResult>;
    readonly [subscribe]!: (next?: (value: number) => void,
    error?: (error: any) => void,
    complete?: () => void) => Subscription;

    constructor (num: number) {
        super(num);
    }
}

export class AsyncBoolean extends Boolean implements Promise<boolean> {
    [Symbol.toStringTag]: any;
    [$promise]: PromiseWrapper<boolean> | null = null;
    [$observable]: Observable<boolean> | null = null;
    [$observer]: Observer<boolean> | null = null;
    readonly [promise]: Promise<boolean>;
    readonly [observable]: Observable<boolean>;
    readonly then!: <TResult1, TResult2> (onfulfilled?: Resolve<boolean, TResult1> | Nothing,
                                onrejected?: Reject<TResult2> | Nothing) => Promise<TResult1 | TResult2>;
    readonly catch!: <TResult> (onrejected?: Reject<TResult> | Nothing) => Promise<boolean | TResult>;
    readonly subscribe!: (next?: (value: boolean) => void,
                error?: (error: any) => void,
                complete?: () => void) => Subscription;
    readonly [then]!: <TResult1, TResult2> (onfulfilled?: Resolve<boolean, TResult1> | Nothing,
    onrejected?: Reject<TResult2> | Nothing) => Promise<TResult1 | TResult2>;
    readonly [Catch]!: <TResult> (onrejected?: Reject<TResult> | Nothing) => Promise<boolean | TResult>;
    readonly [subscribe]!: (next?: (value: boolean) => void,
    error?: (error: any) => void,
    complete?: () => void) => Subscription;

    constructor (bool: boolean) {
        super(bool);
    }
}

export type AsyncPrimitive = AsyncString|AsyncNumber|AsyncBoolean;

ApplyMixins(AsyncString, [AsyncIndexedData, AsyncData]);
ApplyMixins(AsyncNumber, [AsyncIndexedData, AsyncData]);
ApplyMixins(AsyncBoolean, [AsyncIndexedData, AsyncData]);
