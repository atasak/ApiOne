export type NativeType = 'string' | 'number' | 'boolean' | 'uuid';
export type Mutability = 'variable' | 'constant' | 'readonly';

export class Variable {
    constructor(public mubability: Mutability, public type: NativeType) {
    }
}

export class Call {
    constructor(public argstype: string[], public returntype: string) {
    }
}

export class Collection {
    constructor(public mutability: Mutability, public type: Scheme, public mapId = true) {
    }
}

export class List {
    constructor(public mutability: Mutability, public type: Scheme) {
    }
}

export class Reference {
    constructor(public mutability: Mutability, public uri: string) {
    }
}

// tslint:disable-next-line:interface-over-type-literal
export type Scheme = { [key: string]: Scheme } | Variable | Call | Collection | List | Reference ;

export const str = 'string';
export const num = 'number';
export const bool = 'boolean';
export const nothing = 'void';
export const variable = 'variable';
export const constant = 'constant';
export const readonly = 'readonly';

export const v = (mutability, type) => new Variable(mutability, type);
export const f = (argstype, returntype) => new Call(argstype, returntype);
export const c = (mutability, type, mapId = true) => new Collection(mutability, type, mapId);
export const l = (mutability, type) => new List(mutability, type);
export const r = (mutability, uri) => new Reference(mutability, uri);

export const cstr = v(constant, str);
export const rstr = v(readonly, str);
export const vstr = v(variable, str);
export const cnum = v(constant, num);
export const rnum = v(readonly, num);
export const vnum = v(variable, num);
export const cbool = v(constant, bool);
export const rbool = v(readonly, bool);
export const vbool = v(variable, bool);
export const uuid = v(constant, 'uuid');

export const trigger = new Call([], nothing);
