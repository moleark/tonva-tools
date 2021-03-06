var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { HttpChannelNavUI } from './httpChannelUI';
import { HttpChannel } from './httpChannel';
import { ApiBase } from './apiBase';
const centerHost = process.env.REACT_APP_CENTER_URL; //APIHOST_CENTER;
let centerToken = undefined;
export function setCenterToken(t) {
    centerToken = t;
    console.log('setCenterToken %s', t);
    centerChannel = undefined;
    centerChannelUI = undefined;
}
let centerChannelUI;
let centerChannel;
function getCenterChannelUI() {
    if (centerChannelUI !== undefined)
        return centerChannelUI;
    return centerChannelUI = new HttpChannel(true, centerHost, centerToken, new HttpChannelNavUI());
}
function getCenterChannel() {
    if (centerChannel !== undefined)
        return centerChannel;
    return centerChannel = new HttpChannel(true, centerHost, centerToken);
}
export class CenterApi extends ApiBase {
    //private channel: HttpChannel;
    constructor(path, ws, showWaiting) {
        super(path, ws, showWaiting);
    }
    getHttpChannel() {
        return __awaiter(this, void 0, void 0, function* () {
            return (this.showWaiting === true || this.showWaiting === undefined) ?
                getCenterChannelUI() :
                getCenterChannel();
        });
    }
}
export class ApiTokenApi extends CenterApi {
    api(params) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.get('app-api', params);
        });
    }
}
export const apiTokenApi = new ApiTokenApi('tv/tie/', undefined);
export class CallCenterApi extends CenterApi {
    directCall(url, method, body) {
        return this.call(url, method, body);
    }
}
export const callCenterapi = new CallCenterApi('', undefined);
console.log('CenterApi');
console.log(CenterApi);
export class CenterAppApi extends CenterApi {
    apis(unit, appOwner, appName) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.get('tie/app-apis', { unit: unit, appOwner: appOwner, appName: appName });
        });
    }
    chatApi(unit) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.get('tie/chat-api', { unit: unit });
        });
    }
}
//# sourceMappingURL=centerApi.js.map