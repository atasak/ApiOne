export class OneMap<K, V> extends Map<K, V> {
    constructor (private factory: (index: K) => V) {
        super();
    }

    getOrCreate (index: K, factory?: (index: K) => V): V {
        let value = this.get(index);
        if (value == null) {
            value = (factory || this.factory)(index);
            this.set(index, value);
        }
        return value;
    }

    move (from: K, to: K): boolean {
        if (from === to)
            return this.has(from);
        if (!this.has(from) || this.has(to))
            return false;
        this.set(to, this.getOrCreate(from));
        this.delete(from);
        return true;
    }
}

export function flatten<TBefore, TAfter> (map: OneMap<string, TBefore> | Map<string, TBefore>,
                                          transform: (old: TBefore) => TAfter): TAfter[] {
    const array: TAfter[] = [];
    map.forEach((val) => array.push(transform(val)));
    return array;
}

export function mapToObj<TBefore, TAfter> (map: OneMap<string, TBefore> | Map<string, TBefore>,
                                           transform: (old: TBefore) => TAfter): { [key: string]: TAfter } {
    const object: { [key: string]: TAfter } = {};
    map.forEach((val, key) => object[key] = transform(val));
    return object;
}

export function objToMap<TBefore, TAfter> (object: { [key: string]: TBefore },
                                           transform: (old: TBefore) => TAfter): Map<string, TAfter> {
    const map = new Map<string, TAfter>();
    for (const key in object) {
        if (object.hasOwnProperty(key))
            map.set(key, transform(object[key]));
    }
    return map;
}

export function objToOneMap<TBefore, TAfter> (object: { [key: string]: TBefore },
                                              transform: (old: TBefore) => TAfter,
                                              factory: (key: string) => TAfter): OneMap<string, TAfter> {
    const map = new OneMap<string, TAfter>(factory);
    for (const key in object) {
        if (object.hasOwnProperty(key))
            map.set(key, transform(object[key]));
    }
    return map;
}
