import { HttpChannel } from './httpChannel';
import { ApiBase } from './apiBase';
export declare function setCenterToken(t?: string): void;
export declare abstract class CenterApi extends ApiBase {
    private channel;
    constructor(path: string, showWaiting?: boolean);
    protected getHttpChannel(): Promise<HttpChannel>;
}
export declare class ApiTokenApi extends CenterApi {
    api(params: {
        unit: number;
        app: number;
        apiName: string;
    }): Promise<any>;
}
export declare const apiTokenApi: ApiTokenApi;
