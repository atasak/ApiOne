import {Observable} from 'rxjs/Observable';
import {Observer} from 'rxjs/Observer';
import {Subscription} from 'rxjs/Subscription';
import {Nothing} from '../../../util';
import {PromiseWrapper, Reject, Resolve} from '../../../util/promise.utils';

export const promise = Symbol();
export const observable = Symbol();
export const Catch = Symbol();
export const then = Symbol();
export const subscribe = Symbol();
export const $promise = Symbol();
export const $observable = Symbol();
export const $observer = Symbol();

export class AsyncIndexedData<T> {
    [$promise]: PromiseWrapper<T> | null = null;
    [$observable]: Observable<T> | null = null;
    [$observer]: Observer<T> | null = null;

    get [promise] (): Promise<T> {
        const wrapper = this[$promise] || new PromiseWrapper<T>();
        if (this[$promise] === null)
            this[$promise] = wrapper;
        return wrapper.promise;
    }

    get [observable] (): Observable<T> {
        const observableObj = this[$observable] ||
            Observable.create((observer: Observer<T>) => this[$observer] = observer);
        if (this[$observable] === null)
            this[$observable] = observableObj;
        return observableObj;
    }

    [then]<TResult1, TResult2> (onfulfilled?: Resolve<T, TResult1> | Nothing,
                                onrejected?: Reject<TResult2> | Nothing): Promise<TResult1 | TResult2> {
        return this[promise].then(onfulfilled, onrejected);
    }

    [Catch]<TResult> (onrejected?: Reject<TResult> | Nothing): Promise<T | TResult> {
        return this[promise].catch(onrejected);
    }

    [subscribe] (next?: (value: T) => void,
                 error?: (error: any) => void,
                 complete?: () => void): Subscription {
        return this[observable].subscribe(next, error, complete);
    }
}

export class AsyncData<T> extends AsyncIndexedData<T> implements Promise<T> {
    [Symbol.toStringTag]: any;

    then<TResult1, TResult2> (onfulfilled?: Resolve<T, TResult1> | Nothing,
                              onrejected?: Reject<TResult2> | Nothing): Promise<TResult1 | TResult2> {
        return this[promise].then(onfulfilled, onrejected);
    }

    catch<TResult> (onrejected?: Reject<TResult> | Nothing): Promise<T | TResult> {
        return this[promise].catch(onrejected);
    }

    subscribe (next?: (value: T) => void,
               error?: (error: any) => void,
               complete?: () => void): Subscription {
        return this[observable].subscribe(next, error, complete);
    }
}
