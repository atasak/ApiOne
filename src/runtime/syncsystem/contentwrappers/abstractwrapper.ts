import {IContentManager} from '../contentmanager';

export enum Resolved {Unresolved, Pending, Resolved};

export class PartialParentInfo {
    readonly id: string;
    readonly field: string;
}

export class ParentInfo extends PartialParentInfo {
    readonly typeIndex: string;
}

export class InstanceInfo {
    readonly type: string;
    readonly id: string;
}

export abstract class AbstractWrapper<TModel> {
    private readonly _model: TModel;

    constructor (protected manager: IContentManager) {
        this._model = model || this.defaultModel;
    }

    get model (): TModel {
        return this._model;
    }

    protected abstract get defaultModel (): TModel;
}

export abstract class ResolvableWrapper<TModel, THandler extends TModel & { isHandler: boolean }> extends AbstractWrapper<TModel> {
    private resolved: Resolved = Resolved.Unresolved;
    private handler: THandler;
    private promise: Promise<THandler>;

    constructor (manager: IContentManager,
                 private instance: InstanceInfo) {
        super(manager);
    }

    get status (): Resolved {
        return this.resolved;
    }

    async $get (): Promise<THandler> {
        if (this.resolved !== Resolved.Unresolved)
            return this.promise;

        this.handler = this.createHandler();
        return await new Promise<THandler>(async resolve => {
            await this.resolve();
            resolve(this.handler);
        });
    }

    _get (): THandler {
        this.$get();
        return this.handler;
    }

    set (model: THandler | Partial<TModel>): THandler {
        if (this.resolved === Resolved.Unresolved)
            this.handler = this.createHandler();
        this.resolved = Resolved.Resolved;

        if (model.hasOwnProperty('isHandler'))
            this.setFromHandler(model);
        else
            this.setFromModel();
    }

    abstract createHandler (): THandler;

    async resolve (): Promise<THandler> {
        if (this.resolved === Resolved.Resolved)
            return this.handler;
        const data = await this.port.resolve<TModel>(this.instance.type, this.instance.id);
        for (const key in data) {
            if (data.hasOwnProperty(key))
                this.model[key] = data[key];
        }
        return this.handler;
    }
}

export abstract class ProxyWrapper<TModel, TChild> extends ResolvableWrapper<TModel> {

    constructor (port: IContentManager,
                 instance: InstanceInfo,
                 private childWrapperCreator: () => TChild) {
        super(port, parent, instance);
    }
}
