import {IContentManager} from '../contentmanager';

export type FactoryMap = Map<string, (manager: IContentManager, value: string) => any>;
export type TypeReducer = (type: string) => string;

export interface IdMasks {
    system: string;
    temporary: string;
    object: string;
}

export interface SystemSpecs {
    typeFactories: FactoryMap;

    typeReducer: TypeReducer;

    masks: IdMasks;
}
