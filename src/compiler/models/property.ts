import {
    ClassDeclaration, GetAccessorDeclarationStructure, PropertyDeclaration, PropertyDeclarationStructure, Scope,
    SetAccessorDeclarationStructure,
} from 'ts-simple-ast';
import {Schemer} from '../compiler/schemer';
import {ClassElement, ClassElementStructure, ClassElementType} from './classElement';
import {Type} from './type';
import {getTypeInfo} from './typeutils';

export class Property extends ClassElement {
    name: string;
    defaultValue = '';
    type: Type;

    constructor (protected schemer: Schemer, propertyNode: PropertyDeclaration) {
        super ();
        this.extractGenericInfo (propertyNode);
        this.extractTypeInfo (propertyNode);
        this.extractDefaultValue (propertyNode);
        propertyNode.remove ();
    }

    asString (): string {
        return `${this.name}: ${this.type.typeAsString} = ${this.defaultValue}`;
    }

    transform (classNode: ClassDeclaration) {
        this.insertableCode.forEach (
            struct => struct.addToClass (classNode),
        );
    }

    private get insertableCode (): ClassElementStructure[] {
        return [
            this.valueManager (),
            this.getAccessor ('', '_'),
            this.getAccessor ('_', '_'),
            this.getAccessor ('$', '$', true),
            this.setAccessor (),
        ];
    }

    private valueManager (): ClassElementStructure {
        const type = `${this.type.valueManagerName}<${this.type.typeAsString}>`;
        const propertyStructure: PropertyDeclarationStructure = {
            scope: Scope.Private,
            name: this.oneName,
            type: type,
            initializer: `new ${type}()`,
        };
        return new ClassElementStructure (ClassElementType.Var, propertyStructure);
    }

    private getAccessor (makeSign: string, useSign: string, promiseReturn = false): ClassElementStructure {
        let returnType = this.type.typeAsString;
        if (promiseReturn)
            returnType = `Promise<${returnType}>`;

        const getterStructure: GetAccessorDeclarationStructure = {
            scope: Scope.Public,
            name: makeSign + this.name,
            returnType: returnType,
            bodyText: `return this.${this.oneName}.${useSign}get()`,
        };
        return new ClassElementStructure (ClassElementType.Get, getterStructure);
    }

    private setAccessor (): ClassElementStructure {
        const setterStructure: SetAccessorDeclarationStructure = {
            scope: Scope.Public,
            name: this.name,
            parameters: [{
                name: this.name,
                type: this.type.typeAsString,
            }],
            bodyText: `this.${this.oneName}.set(${this.name});`,
        };
        return new ClassElementStructure (ClassElementType.Set, setterStructure);
    }

    private extractGenericInfo (propertyNode: PropertyDeclaration) {
        const symbol = propertyNode.getSymbol ();
        if (symbol == null)
            throw new Error ();
        this.name = symbol.getName ();
    }

    private extractTypeInfo (propertyNode: PropertyDeclaration) {
        this.type = getTypeInfo (this.schemer, propertyNode.getType ());
    }

    private extractDefaultValue (propertyNode: PropertyDeclaration) {
        const initializer = propertyNode.getInitializer ();
        if (initializer)
            this.defaultValue = initializer.getText ();
    }
}

