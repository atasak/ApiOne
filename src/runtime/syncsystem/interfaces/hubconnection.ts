import {ResolvingId} from '../../../util';
import {DataObj, Package, Primitive} from '../package';
import {PackageType} from '../packagecollector';

export interface IHubNode {
    sync (pack: Package, packageType: PackageType, receiver: string): void;

    resolve (type: string, id: ResolvingId, follow?: string[]): Promise<void>;

    addObj (type: string, id: ResolvingId, data: DataObj): Promise<void>;

    addField (type: string, id: ResolvingId, field: string, data: ResolvingId | Primitive): Promise<void>;

    deleteKey (type: string, id: ResolvingId, field: string): Promise<void>;
}

export interface IHubConnection {
    sync (pack: Package): void;

    onsync (node: IHubNode): void;

    need (objects: { [key: string]: string[] }): void;
}
