import {objToArray} from '../util/object';
import {ApiIds} from './apiid';
import {ApiSchemeLib} from './lib/apischemelib';
import {ApiBackend} from './nodes/apibackend';
import {ApiConsumer} from './nodes/apiconsumer';
import {ApiNoopNode} from './nodes/apinoopnode';
import {Scheme} from './types/apischemetypes';
import {ApiBackendInterface, ApiConsumerInterface, ApiError, ApiNodeInterface, ApiPacket} from './types/apitypes';

export class ApiMaster<T> implements ApiNodeInterface {
    readonly ids = new ApiIds();
    readonly id = this.ids.id();
    private readonly noop = new ApiNoopNode();

    private _backend: ApiNodeInterface = this.noop;
    private _server: ApiNodeInterface = this.noop;
    consumers: { [key: string]: ApiNodeInterface } = {};
    requestMap: { [key: string]: string } = {};

    constructor(public readonly scheme: Scheme, staticIds: string[]) {
        for (const id of staticIds)
            this.ids.registerAll(id);
    }

    setServer(server: ApiNodeInterface) {
        this._server = server;
        this._server.id = this.ids.id();
    }

    getBackend(): ApiBackendInterface<T> {
        this.checkBackendEmpty();
        const backend = new ApiBackend<T>(this);
        this._backend = backend;
        return backend;
    }

    setBackend(backend: ApiNodeInterface) {
        this.checkBackendEmpty();
        this._backend = backend;
        this._backend.id = this.ids.id();
    }

    subscribe(node?: ApiNodeInterface): ApiConsumerInterface<T> {
        if (node) {
            node.id = this.ids.id();
            this.consumers[node.id] = node;
            return null;
        }
        const consumer = new ApiConsumer<T>(this);
        this.consumers[consumer.id] = consumer;
        return consumer;
    }

    unsubscribe(node: ApiNodeInterface) {
        delete this.consumers[node.id];
    }

    checkBackendEmpty() {
        if (this._backend !== this.noop)
            throw Error('Only one backend supported!');
    }

    private getApiNode(id: string): ApiNodeInterface {
        if (this._server.id === id)
            return this._server;
        if (this._backend.id === id)
            return this._backend;
        return this.consumers[id];
    }

    private get apiNodes(): ApiNodeInterface[] {
        const nodes = objToArray(this.consumers);
        nodes.push(this._backend);
        nodes.push(this._server);
        return nodes;
    }

    transfer(packet: ApiPacket) {
        packet.uri = ApiSchemeLib.sanitizeUri(packet.uri);
        ApiSchemeLib.checkScheme(this.scheme, packet);
        console.log(`${packet.method} packet: `, packet);
        switch (packet.method) {
            case 'request':
                this.handleRequest(packet);
                break;
            case 'response':
            case 'reject':
                this.handleResponse(packet);
                break;
            case 'update':
            case 'delete':
                this.handleUpdate(packet);
                break;
        }
    }

    private handleRequest(packet: ApiPacket) {
        this.requestMap[packet.requestId] = packet.callerId;
        if (packet.callerId === this._backend.id)
            this._server.transfer(packet);
        else
            this._backend.transfer(packet);
    }

    private handleResponse(packet: ApiPacket) {
        const receiverId = this.requestMap[packet.requestId];
        if (!receiverId)
            throw new ApiError(`Response of non-existent request: ${packet.requestId}`, packet);

        const api = this.getApiNode(receiverId);
        if (!api)
            throw new ApiError(`Response of request from non-existent api node: ${receiverId}`, packet);

        api.transfer(packet);
    }

    private handleUpdate(packet: ApiPacket) {
        for (const node of this.apiNodes)
            if (node.id !== packet.callerId)
                node.transfer(packet);
    }
}
