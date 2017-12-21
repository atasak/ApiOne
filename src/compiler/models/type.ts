export abstract class Type {
    abstract readonly valueManagerName: string;
    abstract readonly typeAsString: string;
    abstract asString(): string;

    constructor() {
    }
}
