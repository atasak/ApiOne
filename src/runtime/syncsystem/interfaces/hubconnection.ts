import {Map1, Package, Primitive} from '../package';
import {PackageType} from '../packagecollector';

export interface IHubNode {
    sync (pack: Package, packageType: PackageType, receiver: string): void;

    resolve (type: string, id: string, follow?: string[]): void;

    addObj (type: string, id: string, data: Map1<Primitive>): void;

    addField (type: string, id: string, field: string, data: Primitive): void;

    deleteKey (type: string, id: string, field: string): void;
}

export interface IHubConnection {
    sync (pack: Package): void;

    onsync (node: IHubNode): void;

    need (objects: { [key: string]: string[] }): void;
}
