export abstract class AbstractWrapper<T> {
    data: T;
    receive = this.sync;

    send(value: T) {
        this.sync(value);
    }

    abstract sync(value);
}
