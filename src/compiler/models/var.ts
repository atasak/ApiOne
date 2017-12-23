import {Type} from './type';

export type BaseType = 'String' | 'Number' | 'Boolean';

export class Var extends Type {
    readonly valueManagerName = 'VarWrapper';

    constructor(public type: BaseType) {
        super();
    }

    get typeAsString(): string {
        return this.type.toLowerCase();
    }

    asString(): string {
        return this.typeAsString;
    }
}
