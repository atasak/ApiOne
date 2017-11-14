import {ApiNodeInterface, ApiPacket} from '../types/apitypes';

export class ApiNoopNode implements ApiNodeInterface {
    id: string;

    transfer(apiPacket: ApiPacket) {
    }
}
