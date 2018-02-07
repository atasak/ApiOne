export type Resolve<T, R> = (value: T) => (Promise<R> | R);
export type Reject<R> = (reason?: any) => (Promise<R> | R);

export type ResolvableCode<T, R1, R2> = (resolve: Resolve<T, R1>, reject: Reject<R2>) => void;

export class PromiseWrapper<T> {
    promise: Promise<T>;
    resolve!: (value: T) => void;
    reject!: (reason: any) => void;
    value: T | null = null;

    constructor (promiseFactory: (callbackfn: ResolvableCode<T, void, void>) => Promise<T>
                     = (callbackfn: ResolvableCode<T, void, void>) => new Promise(callbackfn)) {
        this.promise = promiseFactory((resolve, reject) => {
            this.resolve = resolve;
            this.reject = reject;
        });
        this.promise.then((val) =>
            this.value = val);
    }
}
