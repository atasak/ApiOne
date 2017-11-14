import {W} from './apimodeltypes';

export type ApiNodeType = 'server' | 'backend' | 'consumer';

export type ApiMethod = 'request' | 'response' | 'reject' | 'update' | 'delete';

export type ApiMethodCallback = (packet: ApiPacket) => Promise<any>;

export interface ApiHubInterface {
    transfer(apiPacket: ApiPacket)
}

export interface ApiNodeInterface {
    id: string;

    transfer(apiPacket: ApiPacket);
}

export interface ApiConsumerInterface<T> {
    read: T;
    write: W<T>;

    need(uri: string): ApiConsumerInterface<T>;

    map(uri: string): ApiConsumerInterface<T>;

    reset(): ApiConsumerInterface<T>;

    catch(callback: (any) => void): ApiConsumerInterface<T>;

    unsubscribe();
}

export interface ApiBackendInterface<T> {
    id: string;
    read: T;
    write: W<T>;

    provide(uri: string, target: any, rootGetter: (target, property: string) => any, rootSetter: (target, property: string, value) => boolean);

    method(uri: string, callback: any);
}

export class ApiPacket {
    constructor(public method: ApiMethod,
                public uri: string,
                public maps: string[],
                public has: string[],
                public requestId: string,
                public callerId: string,
                public data: any) {
    }
}

export class ApiError {
    constructor(public message: string, public data: ApiPacket) {
    }
}
