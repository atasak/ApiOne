import {noop} from 'rxjs/util/noop';
import {ApiDataLib, UriTree} from '../lib/apidatalib';
import {ApiSchemeLib} from '../lib/apischemelib';
import {Call, Scheme} from '../types/apischemetypes';
import {ApiBackendInterface, ApiMethodCallback, ApiPacket} from '../types/apitypes';
import {ApiNode} from './apinode.abstract';

class PacketResolve {
    mapIds: { [key: string]: { [key: string]: string } } = {};
    toResolve: { [key: string]: string[] } = {};
    maps: { [key: string]: string } = {};

    data: { [key: string]: { [key: string]: any } } = {};

    schemes: { [key: string]: Scheme } = {};
    dataObjects: { [key: string]: any } = {};


    constructor(packet: ApiPacket, scheme: Scheme, data: any) {
        for (let map of packet.maps) {
            map = ApiSchemeLib.sanitizeUri(map);
            const mapTo = ApiSchemeLib.schemeFromUri(map, scheme).uri;
            this.mapIds[mapTo] = {};
            this.toResolve[mapTo] = [];
            this.maps[map] = mapTo;
            this.data[map] = {};
            this.schemes[mapTo] = ApiSchemeLib.schemeFromUri(mapTo + '/type', scheme);
            this.dataObjects[mapTo] = ApiDataLib.dataFromUri(mapTo, data);
        }
    }

    resolve(): { uri: string, ids: string[] } {
        for (const uri in this.toResolve) {
            if (this.toResolve.hasOwnProperty(uri) && this.toResolve[uri].length !== 0) {
                const toResolve = this.toResolve[uri];
                this.toResolve[uri] = [];
                return {uri: uri, ids: toResolve};
            }
        }
        return null;
    }

    add(uri: string, id: string) {
        if (!this.mapIds[uri])
            return;
        if (!this.mapIds[uri][id])
            this.toResolve[uri].push(id);
    }
}

export class ApiBackend<T> extends ApiNode<T> implements ApiBackendInterface<T> {
    methodTree = new UriTree<ApiMethodCallback>();

    provide(uri: string, target, rootGetter: (target, property) => any, rootSetter: (target, property, value) => boolean) {
        const splitUri = uri.split('/');
        const property = splitUri.pop();
        splitUri.push('__proxy');
        const proxy = new Proxy(target, {
            get: rootGetter,
            set: rootSetter,
        });
        const proxySetter = {
            property: property,
            proxy: proxy,
        };
        ApiDataLib.dataFromUri(splitUri, this.data)(proxySetter);
    }

    method(uri: string, callback: ApiMethodCallback) {
        this.methodTree.insert(uri, callback);
    }

    protected handleRequest(packet: ApiPacket) {
        if (ApiSchemeLib.schemeFromUri(packet.uri, this.apiMaster.scheme) instanceof Call)
            this.handleCallRequest(packet);
        else
            this.handleGetRequest(packet);
    }

    protected handleCallRequest(packet: ApiPacket) {
        const method = this.methodTree.lookup(packet.uri);
        if (!method)
            throw new Error(`Method not implemented: ${packet.uri}`);
        return method(packet).then(
            (response) => this.apiMaster.transfer(new ApiPacket(
                'response', packet.uri, [], [], packet.requestId, this.id, response,
            )));
    }

    protected handleGetRequest(packet: ApiPacket) {
        const resolve = new PacketResolve(packet, this.apiMaster.scheme, this.data);
        const data = ApiDataLib.dataFromUri(packet.uri, this.data);
        const scheme = ApiSchemeLib.schemeFromUri(packet.uri, this.apiMaster.scheme);
        const copy = this.copyData((u, d) => resolve.add(u, d), data, scheme, packet.uri);
        // this.resolveData(resolve);
        this.sendData(resolve, packet, copy);
    }

    private resolveData(resolve: PacketResolve) {
        while (true) {
            const res = resolve.resolve();
            if (res === null)
                return;
            for (const id of res.ids) {
                const copy = this.copyData((u, d) => resolve.add(u, d), resolve.dataObjects[res.uri][id],
                    resolve.schemes[res.uri]['type'], `${res.uri}/${id}`);
                resolve.data[res.uri][id] = copy;
            }
        }
    }

    private sendData(resolve: PacketResolve, packet: ApiPacket, copy: any) {
        /*for (const uri in resolve.data) {
            if (resolve.data.hasOwnProperty(uri)) {
                const data = {};
                for (const id in resolve.data[uri])
                    data[id] = resolve.data[uri][id];
                this.sendPackage(uri, data, packet.requestId);
            }
        }*/
        this.sendPackage(packet.uri, copy, packet.requestId);
    }

    private sendPackage(uri: string, data: any, requestId: string) {
        this.apiMaster.transfer(new ApiPacket('response', uri, [], [], requestId, this.id, data));
    }

    protected proxyCall(uri: string, scheme: Call, data: any): any {
        return new Proxy(() => new Promise(noop), {
            apply: (target, thisArg, argumentList) => {
                const packet = new ApiPacket('request', uri, [], [], '00000000', '00000000', argumentList);
                const method = this.methodTree.lookup(packet.uri);
                if (!method)
                    throw new Error(`Method not implemented: ${packet.uri}`);
                return method(packet);
            },
        });
    }
}
