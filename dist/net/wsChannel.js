var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
let subAppWindow;
function postWsToSubApp(msg) {
    if (subAppWindow === undefined)
        return;
    subAppWindow.postMessage({
        type: 'ws',
        msg: msg
    }, '*');
}
export function setSubAppWindow(win) {
    subAppWindow = win;
}
export class WsBase {
    constructor() {
        this.handlerSeed = 1;
        this.anyHandlers = {};
        this.msgHandlers = {};
    }
    onWsReceiveAny(handler) {
        let seed = this.handlerSeed++;
        this.anyHandlers[seed] = handler;
        return seed;
    }
    onWsReceive(type, handler) {
        let seed = this.handlerSeed++;
        this.msgHandlers[seed] = { type: type, handler: handler };
        return seed;
    }
    endWsReceive(handlerId) {
        delete this.anyHandlers[handlerId];
        delete this.msgHandlers[handlerId];
    }
    receive(msg) {
        return __awaiter(this, void 0, void 0, function* () {
            let { $type } = msg;
            for (let i in this.anyHandlers) {
                yield this.anyHandlers[i](msg);
            }
            for (let i in this.msgHandlers) {
                let { type, handler } = this.msgHandlers[i];
                if (type !== $type)
                    continue;
                yield handler(msg);
            }
        });
    }
}
export class WsBridge extends WsBase {
}
export const wsBridge = new WsBridge();
export class WSChannel extends WsBase {
    constructor(wsHost, token) {
        super();
        this.wsHost = wsHost;
        this.token = token;
    }
    static setCenterToken(token) {
        WSChannel.centerToken = token;
    }
    connect() {
        //this.wsHost = wsHost;
        //this.token = token || WSChannel.centerToken;
        if (this.ws !== undefined)
            return;
        let that = this;
        return new Promise((resolve, reject) => {
            let ws = new WebSocket(this.wsHost, this.token || WSChannel.centerToken);
            console.log('connect webSocket %s', this.wsHost);
            ws.onopen = (ev) => {
                console.log('webSocket connected %s', this.wsHost);
                that.ws = ws;
                resolve();
            };
            ws.onerror = (ev) => {
                reject('webSocket can\'t open!');
            };
            ws.onmessage = (msg) => __awaiter(this, void 0, void 0, function* () { return yield that.wsMessage(msg); });
            ws.onclose = (ev) => {
                that.ws = undefined;
                console.log('webSocket closed!');
            };
        });
    }
    close() {
        if (this.ws !== undefined) {
            this.ws.close();
            this.ws = undefined;
        }
    }
    wsMessage(event) {
        return __awaiter(this, void 0, void 0, function* () {
            /*
            event dump:
            currentTarget:WebSocket {url: "ws://192.168.0.199:3000/tv", readyState: 1, bufferedAmount: 0, …}
            data:"{"type":"sheetAct","data":{"state":"备货"}}"
            defaultPrevented:false
            eventPhase:0
            isTrusted:true
            lastEventId:""
            origin:"ws://192.168.0.199:3000"
            path:Array(0) []
            ports:null
            returnValue:true
            source:null
            srcElement:WebSocket {url: "ws://192.168.0.199:3000/tv", readyState: 1, bufferedAmount: 0, …}
            target:WebSocket {url: "ws://192.168.0.199:3000/tv", readyState: 1, bufferedAmount: 0, …}
            timeStamp:34665.245
            type:"message"
            */
            //console.log('ws msg:', event);
            try {
                console.log('websocket message: %s', event.data);
                let msg = JSON.parse(event.data);
                postWsToSubApp(msg);
                yield this.receive(msg);
                /*
                let t = json.type;
                for (let i in this.anyHandlers) {
                    await this.anyHandlers[i](json);
                }
                for (let i in this.msgHandlers) {
                    let {type, handler} = this.msgHandlers[i];
                    if (type !== t) continue;
                    await handler(json);
                }
                */
            }
            catch (err) {
                console.log('ws msg error: ', err);
            }
        });
    }
    sendWs(msg) {
        let netThis = this;
        this.connect().then(() => {
            netThis.ws.send(msg);
        });
    }
}
//const wsChannel = new WSChannel();
//export default wsChannel;
//# sourceMappingURL=wsChannel.js.map