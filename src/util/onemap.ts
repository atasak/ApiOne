export class OneMap<I, T> extends Map<I, T> {
    constructor (private creator: () => T) {
        super ();
    }

    getOrCreate (index: I): T {
        let value = this.get (index);
        if (value == null) {
            value = this.creator ();
            this.set (index, value);
        }
        return value;
    }
}
