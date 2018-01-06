import {Iterate} from './iterator';
import {PromiseMap} from './promisemap';
import {SyncPromise} from './syncpromise';

export function idMatchesMask (id: string, mask: string): boolean {
    if (id.length !== mask.length)
        return false;
    for (const [idc, maskc] of Iterate.from(id).combine$(mask)) {
        if (maskc === '$')
            continue;
        if (maskc === '+' && idc !== '0')
            continue;
        if (maskc === idc)
            continue;
        return false;
    }
    return true;
}

export class IdFactory {
    private characters: string[] = [];
    private ids: { [key: string]: boolean } = {
        '00000000': true,
        '00000001': true,
    };

    constructor (private mask: string, initial?: string[]) {
        this.fillCharArray();
        if (initial != null)
            this.registerIds(initial);
    }

    id (): string {
        while (true) {
            let id = '';
            for (const m of this.mask)
                id += this.getIdChar(m);

            if (this.ids[id])
                continue;

            this.ids[id] = true;
            return id;
        }
    }

    private registerIds (ids: string[]) {
        for (const id of ids)
            this.ids[id] = true;
    }

    private fillCharArray () {
        for (let i = 48; i < 58; i++)
            this.characters.push(String.fromCharCode(i));
        for (let i = 65; i < 91; i++)
            this.characters.push(String.fromCharCode(i));
        for (let i = 97; i < 123; i++)
            this.characters.push(String.fromCharCode(i));
        this.characters.push('-');
        this.characters.push('_');
    }

    private getIdChar (mask: string) {
        if (mask === '$')
            return this.characters[Math.floor(Math.random() * 64)];
        if (mask === '+')
            return this.characters[Math.floor(Math.random() * 63 + 1)];
        return mask;
    }
}

export class ResolvableIdFactory {
    private idFactory: IdFactory;
    private promises = new PromiseMap<string, [string, string]>();

    constructor (mask: string) {
        this.idFactory = new IdFactory(mask);
    }

    id (): ResolvableId {
        const tempId = this.idFactory.id();
        const promise = this.promises.promise(tempId);
        return new ResolvingId(tempId, promise);
    }

    resolveIds (ids: string[]) {
        const resolvedKeys: string[] = [];
        for (const [oldKey, newKey] of Iterate.from(this.promises.keys()).combine$(ids)) {
            resolvedKeys.push(oldKey);
            this.promises.set(oldKey, [oldKey, newKey]);
        }
        for (const key of resolvedKeys)
            this.promises.delete(key);
    }
}

export class ResolvingId implements ResolvableId {
    constructor (private _id: string,
                 public readonly promise: Promise<[string, string]> = SyncPromise.Resolve<[string, string]>([_id, _id])) {
        this.promise.then(ids => this._id = ids[1]);
    }

    get id () {
        return this._id;
    }
}

export interface ResolvableId {
    readonly id: string
    readonly promise: Promise<[string, string]>
}
