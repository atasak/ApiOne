import {Variable} from '../types/apischemetypes';

class NodeScore<T> {
    score: number;
    multiplier: number;
    t: T;
};

export class ApiDataLib {
    static dataFromUri(uri: string | string[], data: any): any {
        if (typeof uri === 'string')
            return this.dataFromUri(uri.split('/'), data);
        let head, tail;
        [head, ...tail] = uri;
        if (!head)
            return data;
        return this.dataFromUri(tail, data[head]);
    }

    static checkType(scheme: Variable, data: any) {
        if ((scheme.type === 'string' && typeof data === 'string') ||
            (scheme.type === 'number' && typeof data === 'number') ||
            (scheme.type === 'boolean' && typeof data === 'boolean') ||
            (scheme.type === 'uuid' && typeof data === 'string'))
            return true;
        return false;
    }

    static uriToObj([head, ...tail]: string[], data: any): any {
        if (head === undefined)
            return data;
        const obj = {};
        obj[head] = this.uriToObj(tail, data);
        return obj;
    }
}

export class UriTree<T> {
    private t: T = null;
    private tree: { [key: string]: UriTree<T> } = {};

    insert(uri: string | string[], t: T): UriTree<T> {
        if (typeof uri === 'string')
            return this.insert(uri.split('/'), t);
        let head, tail;
        [head, ...tail] = uri;
        if (!head) {
            this.t = t;
            return this;
        }
        if (!this.tree[head])
            this.tree[head] = new UriTree<T>();
        this.tree[head].insert(tail, t);
    }

    lookup(uri: string | string[]): T {
        const {score: score, t: t} = this._lookup(uri);
        return score ? t : null;
    }

    private _lookup(uri: string | string[]): NodeScore<T> {
        if (typeof uri === 'string')
            return this._lookup(uri.split('/'));

        let head, tail;
        [head, ...tail] = uri;

        if (!head)
            return {score: 1, multiplier: 2, t: this.t};
        if (!this.tree[head] && !this.tree['*'])
            return {score: 0, multiplier: 0, t: null};

        if (!this.tree[head])
            return this.tree['*']._lookup(tail);
        if (!this.tree['*'])
            return this.tree[head]._lookup(tail);

        const match = this.tree[head]._lookup(tail);
        const wild = this.tree['*']._lookup(tail);

        if (match.score === 0) return wild;
        if (wild.score === 0) return match;
        match.score += match.multiplier;
        const best = match.score > wild.score ? match : wild;
        best.multiplier *= 2;
        return best;
    }
}
