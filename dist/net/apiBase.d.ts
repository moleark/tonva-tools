import { HttpChannel } from './httpChannel';
export declare function refetchApi(channel: HttpChannel, url: any, options: any, resolve: any, reject: any): Promise<void>;
export declare abstract class ApiBase {
    token: string;
    ws: string;
    protected path: string;
    protected showWaiting: boolean;
    constructor(path: string, ws: string, showWaiting: boolean);
    protected abstract getHttpChannel(): Promise<HttpChannel>;
    call(url: string, method: string, body: any): Promise<any>;
    get(path: string, params: any): Promise<any>;
    post(path: string, params: any): Promise<any>;
    put(path: string, params: any): Promise<any>;
    delete(path: string, params: any): Promise<any>;
}
