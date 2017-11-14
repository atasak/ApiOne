import {noop} from 'rxjs/util/noop';
import {Deferer} from '../../util/deferer';
import {objToArray} from '../../util/object';
import {ApiMaster} from '../apimaster';
import {ApiDataLib} from '../lib/apidatalib';
import {ApiSchemeLib} from '../lib/apischemelib';
import {W} from '../types/apimodeltypes';
import {Call, Collection, List, Reference, Scheme, Variable} from '../types/apischemetypes';
import {ApiError, ApiNodeInterface, ApiPacket} from '../types/apitypes';

export type RefCallback = (uri: string, data: string) => void;

export abstract class ApiNode<T> implements ApiNodeInterface {
    id: string;

    dataDeferer = new Deferer();
    _data;

    get data() {
        return this._data;
    }

    set data(data) {
        this.proxyWrite(this, 'data', this.apiMaster.scheme, data);
    }

    get read(): T {
        return this.data as T;
    }

    get write(): W<T> {
        return this.data as W<T>;
    }

    promises: { [key: string]: (success: boolean, response) => void } = {};

    constructor(public apiMaster: ApiMaster<T>) {
        this.id = apiMaster.ids.id();
        this._data = this.proxy('', this.apiMaster.scheme, null);
        this.dataDeferer.resolve();
    }

    transfer(packet: ApiPacket) {
        switch (packet.method) {
            case 'request':
                this.handleRequest(packet);
                break;
            case 'response':
            case 'update' :
                this.handleInput(packet);
                break;
            case 'reject' :
                setTimeout(() => this.handleReject(packet), 0);
                break;
            case 'delete':
                this.handleDelete(packet);
                break;
        }
    }

    protected handleRequest(packet: ApiPacket) {
        throw new ApiError(`Cannot request from consumer: ${this.id}`, packet);
    }

    protected handleReject(packet: ApiPacket) {
        if (this.promises[packet.requestId])
            this.promises[packet.requestId](false, packet.data);
    }

    private handleInput(packet: ApiPacket) {
        if (this.promises[packet.requestId])
            return this.promises[packet.requestId](true, packet.data);
        this.data = ApiDataLib.uriToObj(packet.uri.split('/'), packet.data);
    }

    private handleDelete(packet: ApiPacket) {
    }

    private proxy(uri: string, scheme: Scheme, data: any): any {
        if (scheme instanceof Call)
            return this.proxyCall(uri, scheme, data);
        if (scheme instanceof Variable)
            return this.proxyVariable(uri, scheme, data);
        if (scheme instanceof Collection)
            return this.proxyCollection(uri, scheme, data);
        if (scheme instanceof List)
            return this.proxyList(uri, scheme, data);
        if (scheme instanceof Reference)
            return this.proxyReference(uri, scheme, data);
        return this.proxyScheme(uri, scheme, data);
    }

    protected proxyCall(uri: string, scheme: Call, data: any): any {
        return new Proxy(() => new Promise(noop), {
            apply: (target, thisArg, argumentList) => {
                const id = this.apiMaster.ids.id();
                const promise = new Promise((resolve, reject) => {
                    this.apiMaster.transfer(new ApiPacket(
                        'request', uri, [], [], id, this.id, argumentList));
                    this.promises[id] = (success, response) => (success ? resolve : reject)(response);
                });
                return promise;
            },
        });
    }

    private proxyVariable(uri: string, scheme: Variable, data: any): any {
        return data != null ? data : {
            'string': '',
            'number': 0,
            'boolean': false,
            'uuid': '00000000',
        }[scheme.type];
    }

    private handleProxyGet(construct: (data, target) => void, target, property, scheme: Scheme) {
        if (target[property] != null || typeof property === 'symbol')
            return target[property];
        if (property === '__set')
            return (data) => construct(data, target);
        if (property === '__proxy')
            return ({property: proxyProp, proxy: proxy}) => target[proxyProp] = proxy;
        if (!(scheme instanceof Collection || scheme instanceof List))
            return undefined;
        const obj = {};
        obj[property] = {id: property};
        construct(obj, target);
        return target[property];
    }

    private proxyCollection(uri: string, scheme: Collection, initData: any): any {
        const construct = (data, target) => {
            if (data == null)
                return;
            for (const item in data) {
                if (data.hasOwnProperty(item)) {
                    if (!target[item]) {
                        if (scheme.mapId)
                            data.id = item;
                        target[item] = this.proxy(`${uri}/${item}`, scheme.type, data[item]);
                    }
                    else
                        this.proxyWrite(target, item, scheme.type, data[item]);
                }
            }
        };

        const get = (target, property) => {
            if (property === 'toArray' && scheme instanceof Collection)
                return objToArray(target);
            if (property === 'insert' && scheme instanceof Collection)
                return (data) => {
                    data.id = data.id || this.apiMaster.ids.id();
                    set(target, data.id, data);
                };
            return this.handleProxyGet(construct, target, property, scheme);
        };

        const set = (target, property, value) => {
            const obj = {};
            obj[property] = value;
            construct(obj, target);
            this.proxyUpdate(`${uri}/${property}`, value);
            return true;
        };

        const initTarget = {};
        const proxy = new Proxy(initTarget, {
            get: get,
            set: set,
        });

        construct(initData, initTarget);
        return proxy;
    }

    private proxyList(uri: string, scheme: List, initData: any): any {
        const construct = (data, target) => {
            if (data == null)
                return;
            for (const item in data) {
                if (target[item] == null)
                    target[item] = this.proxy(`${uri}/${item}`, scheme.type, data[item]);
                else
                    this.proxyWrite(target, item, scheme.type, data[item]);
            }
        };

        const get = (target, property) => {
            return this.handleProxyGet(construct, target, property, scheme);
        };

        const set = (target, property, value) => {
            const obj = {};
            obj[property] = value;
            construct(obj, target);
            this.proxyUpdate(`${uri}/${property}`, value);
            return true;
        };

        const initTarget = [];
        const proxy = new Proxy(initTarget, {
            get: get,
            set: set,
        });

        construct(initData, initTarget);
        return proxy;
    }

    private proxyReference(uri: string, scheme: Reference, initData: any): any {
        const construct = (data, target) => {
            if (data == null)
                return;
            if (typeof data === 'string')
                target.uuid = data;
            else
                target.uuid = data.id;

            const initMapPointer = () => initTarget.mapPointer = ApiDataLib.dataFromUri(scheme.uri, this.data);
            if (this.data != null)
                initMapPointer();
            else
                this.dataDeferer.defer(initMapPointer);
        };

        const get = (target, property) => {
            if (property === '__set')
                return (data) => construct(data, target);
            if (property === '__proxy')
                return ({property: proxyProp, proxy: proxy}) => target[proxyProp] = proxy;
            if (property === '__sendable')
                return target.uuid;
            return target.mapPointer[property];
        };

        const set = (target, property, value) => {
            const obj = {};
            obj[property] = value;
            target.mapPointer.__set(obj);
            this.proxyUpdate(`${scheme.uri}/${property}`, value);
            return true;
        };

        const initTarget = {
            mapPointer: null,
            schemePointer: ApiSchemeLib.schemeFromUri(scheme.uri, this.apiMaster.scheme).type,
            uuid: '00000000',
        };
        const proxy = new Proxy(initTarget, {
            get: get,
            set: set,
        });

        construct(initData, initTarget);
        return proxy;
    }

    private proxyScheme(uri: string, scheme: Scheme, initData: any): any {
        const construct = (data, target) => {
            if (data == null)
                data = {};
            for (const item in scheme) {
                if (scheme.hasOwnProperty(item)) {
                    if (target[item] == null)
                        target[item] = this.proxy(`${uri}/${item}`, scheme[item], data[item]);
                    else if (data[item] != null)
                        this.proxyWrite(target, item, scheme[item], data[item]);
                }
            }
        };

        const get = (target, property) => {
            return this.handleProxyGet(construct, target, property, scheme);
        };

        const set = (target, property, value) => {
            const obj = {};
            obj[property] = value;
            target.mapPointer.__set(obj);
            this.proxyUpdate(`${uri}/${property}`, value);
            return true;
        };

        const initTarget = {};
        const proxy = new Proxy(initTarget, {
            get: get,
            set: set,
        });

        construct(initData, initTarget);
        return proxy;
    }

    private proxyWrite(target, property, propertyScheme, value) {
        if (propertyScheme instanceof Call)
            return;
        if (propertyScheme instanceof Variable)
            target[property] = value != null ? value : target[property];
        else
            target[property].__set(value);
    }

    private proxyUpdate(uri, data) {
        this.apiMaster.transfer(new ApiPacket(
            'update', uri, [], [], this.apiMaster.ids.id(), this.id, data));
    }

    protected copyData(refCallback: RefCallback, data, scheme: Scheme, uri: string) {
        if (scheme instanceof Call)
            return null;
        if (scheme instanceof Variable)
            return this.copyVariable(data, scheme);
        if (scheme instanceof Collection)
            return this.copyCollection(refCallback, data, scheme, uri);
        if (scheme instanceof List)
            return this.copyList(refCallback, data, scheme, uri);
        if (scheme instanceof Reference)
            return this.copyReference(refCallback, data, scheme, uri);
        return this.copyScheme(refCallback, data, scheme, uri);
    }

    private copyVariable(data, scheme: Variable) {
        if (ApiDataLib.checkType(scheme, data))
            return data;
        return null;
    }

    private copyCollection(refCallback: RefCallback, data, scheme: Collection, uri: string) {
        const response = {};
        for (const item in data) {
            if (data.hasOwnProperty(item)) {
                const subresponse = this.copyData(refCallback, data[item], scheme.type, `${uri}/${item}`);
                if (subresponse != null)
                    response[item] = subresponse;
            }
        }
        return response;
    }

    private copyList(refCallback: RefCallback, data, scheme: List, uri: string) {
        const response = [];
        for (const item of data) {
            const subresponse = this.copyData(refCallback, item, scheme.type, `${uri}/${item}`);
            if (subresponse != null)
                response.push(subresponse);
        }
        return response;
    }

    private copyReference(refCallback: RefCallback, data: any, scheme: Reference, uri: string) {
        refCallback(uri, data);
        return data['__sendable'];
    }

    private copyScheme(refCallback: RefCallback, data, scheme: Scheme, uri: string) {
        const response = {};
        for (const subscheme in scheme) {
            if (scheme.hasOwnProperty(subscheme)) {
                if (data[subscheme] == null)
                    return null;
                if (scheme[subscheme] instanceof Call)
                    continue;
                const subresponse = this.copyData(refCallback, data[subscheme], scheme[subscheme], `${uri}/${subscheme}`);
                if (subresponse == null)
                    return null;
                response[subscheme] = subresponse;
            }
        }
        return response;
    }
}
