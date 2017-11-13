import {ApiConsumerInterface, ApiPacket} from '../types/apitypes';
import {ApiNode} from './apinode.abstract';

export class ApiConsumer<T> extends ApiNode<T> implements ApiConsumerInterface<T> {
    private maps: string[] = [];
    rejectHandlers: ((ApiPacket) => void)[] = [];

    need(uri: string): ApiConsumerInterface<T> {
        this.apiMaster.transfer(new ApiPacket(
            'request', uri, this.maps, this.has(uri), this.apiMaster.ids.id(), this.id, null));
        return this;
    }

    private has(uri: string): string[] {
        return [];
    }

    map(uri: string | string[]): ApiConsumerInterface<T> {
        if (typeof uri === 'string')
            uri = [uri];
        for (const u of uri)
            this.maps.push(u);
        return this;
    }

    reset(): ApiConsumerInterface<T> {
        this.maps = [];
        this.rejectHandlers = [];
        return this;
    }

    catch(callback: (ApiPacket) => void): ApiConsumerInterface<T> {
        return this;
    }

    unsubscribe() {
        this.apiMaster.unsubscribe(this);
    }

    protected handleReject(packet: ApiPacket) {
        for (const handler of this.rejectHandlers)
            handler(packet);
    }
}
