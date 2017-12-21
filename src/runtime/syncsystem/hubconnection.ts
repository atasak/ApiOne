import {Package} from './package';
import {PackageType} from './packagecollector';

export interface IHubNode {
    sync (pack: Package, packageType: PackageType, receiver: string);

    resolve(type: string, id: string);

    additiveBroadcast(type: string, id: string, json: string, channel?: string)

    substractiveBroadcast (type: string, id: string, channel?: string)

    sendPackage(channel: string, packageType: PackageType, receiver: string)
}

export interface IHubConnection {
    sync (pack: Package);

    onsync (node: IHubNode);

    need (objects: { [key: string]: string[] });
}
