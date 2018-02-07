import {Reject, ResolvableCode, Resolve} from './promise.utils';
import {noop} from './utils';


enum PromiseState {Pending, Resolved, Rejected};

export class SyncPromise<T> implements Promise<T> {
    [Symbol.toStringTag]: any;
    private resolvers: Resolve<T, any>[] = [];
    private rejectors: Reject<any>[] = [];
    private state: PromiseState = PromiseState.Pending;
    private resolveValue: T | null = null;
    private rejectReason: any = null;

    constructor (code: ResolvableCode<T, any, any>) {
        code(t => this.resolve(t), r => this.reject(r));
    }

    static resolve<T> (t: T): Promise<T> {
        return new SyncPromise<T>(resolve => resolve(t));
    }

    then<R1, R2> (onfulfilled?: Resolve<T, R1>, onrejected?: Reject<R2>): Promise<R1 | R2> {
        const catchPromise = this.catch<R2>(onrejected);

        if (!onfulfilled)
            return new SyncPromise<R1 | R2>(noop);

        if (this.state === PromiseState.Pending)
            return this.getResolvePromise<R1 | R2>(onfulfilled);
        else if (this.state === PromiseState.Resolved)
            return this.afterResponse<R1>(onfulfilled(this.resolveValue as T));
        else
            return catchPromise;
    }

    catch<R> (onrejected?: Reject<R>): Promise<R> {
        if (!onrejected)
            return new SyncPromise(noop);

        if (this.state === PromiseState.Pending)
            return this.getRejectPromise<R>(onrejected);
        else
            return this.afterResponse(<R>(onrejected(this.rejectReason)));
    }

    toString (): string {
        return '';
    }

    private getResolvePromise<R> (onfulfilled: Resolve<T, R>) {
        return new SyncPromise<R>((resolve, _) => {
            this.resolvers.push(t => {
                const passVal = onfulfilled(t);
                if (passVal instanceof SyncPromise)
                    passVal.then(value => resolve(value));
                else if (passVal instanceof Promise)
                    passVal.then(value => resolve(value));
                else
                    resolve(<R>passVal);
            });
        });
    }

    private getRejectPromise<R> (onrejected: Reject<R>) {
        return new SyncPromise<R>((resolve, _) => {
            this.rejectors.push(t => {
                const passVal = onrejected(t);
                if (passVal instanceof SyncPromise)
                    passVal.then(value => resolve(value));
                else if (passVal instanceof Promise)
                    passVal.then(value => resolve(value));
                else
                    resolve(<R>passVal);
            });
        });
    }

    private afterResponse<R> (next: any): Promise<R> {
        if (next instanceof Promise || next instanceof SyncPromise)
            return next;
        return SyncPromise.resolve(<R>next);
    }

    private checkState (newState: PromiseState) {
        if (this.state !== PromiseState.Pending)
            throw new PromiseResponseError('A promise can only be resolved or rejected once. ');

        this.state = newState;
    }

    private resolve (t: T) {
        this.checkState(PromiseState.Resolved);
        this.resolveValue = t;

        for (const resolve of this.resolvers)
            resolve(t);
    };

    private reject (reason: any) {
        this.checkState(PromiseState.Rejected);

        for (const reject of this.rejectors)
            reject(reason);
    };
}

export class PromiseResponseError extends Error {
    constructor (message: string) {
        super(message);
    }
}
