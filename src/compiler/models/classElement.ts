import {
    ClassDeclaration, GetAccessorDeclarationStructure, MethodDeclarationStructure, PropertyDeclarationStructure,
    SetAccessorDeclarationStructure,
} from 'ts-simple-ast';

export abstract class ClassElement {
    abstract name: string;

    get oneName(): string {
        return `_one_${this.name}`;
    }

    get $name(): string {
        return `$${this.name}`;
    }

    get _name(): string {
        return `_${this.name}`;
    }
}

export enum ClassElementType {Var, Method, Get, Set};
export type ClassElementDeclaration =
    PropertyDeclarationStructure
    | MethodDeclarationStructure
    | GetAccessorDeclarationStructure
    | SetAccessorDeclarationStructure;

export class ClassElementStructure {
    constructor(private type: ClassElementType, private structure: ClassElementDeclaration) {
    }

    addToClass(classNode: ClassDeclaration) {
        if (this.type === ClassElementType.Var)
            classNode.addProperty(this.structure as PropertyDeclarationStructure);
        if (this.type === ClassElementType.Method)
            classNode.addMethod(this.structure as MethodDeclarationStructure);
        if (this.type === ClassElementType.Get)
            classNode.addGetAccessor(this.structure as GetAccessorDeclarationStructure);
        if (this.type === ClassElementType.Set)
            classNode.addSetAccessor(this.structure as SetAccessorDeclarationStructure);
    }
}
