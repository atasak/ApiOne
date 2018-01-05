import {ResolvableId, ResolvableIdFactory} from '../../util/id';
import {stub} from '../../util/utils.dev';
import {IContentManager} from './contentmanager';

export class ContentTransformer {
    constructor (private manager: IContentManager, private idFactory: ResolvableIdFactory) {
    }

    transform (type: string, data: any): ResolvableId[] {
        stub (type, data, this.manager, this.idFactory);
        return [];
    }
}
