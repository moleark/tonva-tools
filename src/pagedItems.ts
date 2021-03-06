import {observable, IObservableArray, computed} from 'mobx';

export abstract class PagedItems<T> {
    @observable private beforeLoad: boolean = true;
    @observable private loaded: boolean = false;
    private _items:IObservableArray<T> = observable.array<T>([], {deep:false});
    @observable allLoaded: boolean = false;
    @computed get items():IObservableArray<T> {
        if (this.beforeLoad === true) return null;
        if (this.loaded === false) return undefined;
        return this._items;
    }

    protected param: any;
    protected pageStart = undefined;
    protected pageSize = 30;
    protected appendPosition:'head'|'tail' = 'tail';

    protected abstract async load():Promise<T[]>;
    protected abstract setPageStart(item:T);

    append(item:T) {
        if (this.appendPosition === 'tail')
            this._items.push(item);
        else
            this._items.unshift(item);
    }

    async first(param:any):Promise<void> {
        this.beforeLoad = false;
        this.loaded = false;
        this.param = param;
        this._items.clear();
        this.allLoaded = false;
        this.setPageStart(undefined);
        await this.more();
    }

    async more():Promise<void> {
        if (this.allLoaded === true) return;
        let ret = await this.load();
        this.loaded = true;
        let len = ret.length;
        if (len > this.pageSize) {
            this.allLoaded = false;
            --len;
            ret.splice(len, 1);
        }
        else {
            this.allLoaded = true;
        }
        if (len === 0) {
            this._items.clear();
            return;
        }
        this.setPageStart(ret[len-1]);
        if (this.appendPosition === 'tail')
            this._items.push(...ret);
        else
            this._items.unshift(...ret.reverse());
    }
}
