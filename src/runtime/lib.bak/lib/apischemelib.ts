import {Collection, List, Scheme} from '../types/apischemetypes';
import {ApiPacket} from '../types/apitypes';

export class ApiSchemeLib {
    static checkScheme(scheme: Scheme, packet: ApiPacket) {

    }

    static schemeFromUri(uri: string | string[], scheme: Scheme) {
        if (typeof uri === 'string')
            return ApiSchemeLib.schemeFromUri(uri.split('/'), scheme);
        let head, tail;
        [head, ...tail] = uri;
        if (!head)
            return scheme;
        if (scheme instanceof List || scheme instanceof Collection)
            head = 'type';
        if (!scheme[head])
            return null;
        return ApiSchemeLib.schemeFromUri(tail, scheme[head]);
    };

    static sanitizeUri(uri: string): string {
        let splitUri = uri.split('/');
        splitUri = splitUri.filter(x => x !== '');
        return splitUri.join('/');
    }
}
