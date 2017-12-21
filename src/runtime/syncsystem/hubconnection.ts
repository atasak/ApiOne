import {Package} from './package';
import {PackageType} from './packagecollector';

export interface IHubNode {
    sync (pack: Package, packageType: PackageType, receiver: string): void;

    resolve(type: string, id: string): void;

    additiveBroadcast(type: string, id: string, json: string, channel?: string): void;

    substractiveBroadcast (type: string, id: string, channel?: string): void;

    sendPackage(channel: string, packageType: PackageType, receiver: string): void;
}

export interface IHubConnection {
    sync (pack: Package): void;

    onsync (node: IHubNode): void;

    need (objects: { [key: string]: string[] }): void;
}
