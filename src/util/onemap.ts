export class OneMap<I, T> extends Map<I, T> {
    constructor (private factory: (index: I) => T) {
        super();
    }

    getOrCreate (index: I, factory?: (index: I) => T): T {
        let value = this.get(index);
        if (value == null) {
            value = (factory ? factory : this.factory)(index);
            this.set(index, value);
        }
        return value;
    }
}

export function flatten<TBefore, TAfter> (map: OneMap<string, TBefore> | Map<string, TBefore>,
                                          transform: (old: TBefore) => TAfter): TAfter[] {
    const array: TAfter[] = [];
    map.forEach((val) => array.push(transform(val)));
    return array;
}

export function unMap<TBefore, TAfter> (map: OneMap<string, TBefore> | Map<string, TBefore>,
                                        transform: (old: TBefore) => TAfter): { [key: string]: TAfter } {
    const object: { [key: string]: TAfter } = {};
    map.forEach((val, key) => object[key] = transform(val));
    return object;
}
