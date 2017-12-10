import {nav} from '../ui';
import {uid} from '../uid';
import {apiTokenApi, callCenterapi} from './centerApi';

const debugAppId = Number(process.env.REACT_APP_DEBUG_APPID);
const debugUnitId = Number(process.env.REACT_APP_DEBUG_UNITID);

export interface ApiToken {
    name: string;
    url: string;
    token: string;
}
interface ApiTokenAction extends ApiToken {
    resolve: (value?: ApiToken | PromiseLike<ApiToken>) => void;
    reject: (reason?: any) => void;
}
const apiTokens:{[apiName:string]: ApiTokenAction}  = {};

export interface AppInFrame {
    hash: string;
    unit: number;   // unit id
    app: number;    // app id
}
const appsInFrame:{[key:string]:AppInFrame} = {};

export let meInFrame:AppInFrame = {
    hash: undefined,
    unit: Number(process.env.REACT_APP_DEBUG_UNITID),
    app: Number(process.env.REACT_APP_DEBUG_APPID)
};

window.addEventListener('message', async function(evt) {
    let e:any = evt;
    var message = e.data;
    switch (message.type) {
        default: break;
        case 'hide-frame-back':
            hideFrameBack(message.hash);
            break;
        case 'pop-app':
            nav.back();
            break;
        case 'center-api':
            await callCenterApiFromMessage(e.source, message);
            break;
        case 'center-api-return':
            bridgeCenterApiReturn(message);
            break;
        case 'app-api':
            console.log("receive PostMessage: %s", JSON.stringify(message));
            let ret = await onReceiveAppApiMessage(message.hash, message.apiName);
            e.source.postMessage({
                type: 'app-api-return', 
                apiName: message.apiName, 
                url: ret.url, 
                token: ret.token}, "*");
            break;
        case 'app-api-return':
            console.log("app-api-return: %s", JSON.stringify(message));
            onAppApiReturn(message.apiName, message.url, message.token);
            break;
    }
});

function hideFrameBack(hash:string) {
    console.log('hideFrameBack %s', hash);
    let el = document.getElementById(hash);
    if (el !== undefined) el.hidden = true;
}

async function onReceiveAppApiMessage(hash: string, apiName: string): Promise<ApiToken> {
    let appInFrame = appsInFrame[hash];
    if (appInFrame === undefined) return {name:apiName, url:undefined, token:undefined};
    let {unit, app} = appInFrame;
    let ret = await apiTokenApi.api({unit: unit, app: app, apiName: apiName});
    return {name: apiName, url: ret.url, token: ret.token};
}

function onAppApiReturn(apiName: string, url: string, token: string) {
    let action = apiTokens[apiName];
    if (action === undefined) {
        action.reject('error app api return');
        return;
    }
    action.url = url;
    action.token = token;
    action.resolve(action);
}

export function setMeInFrame(appHash: string):AppInFrame {
    let p0 = 3;
    let p1 = appHash.indexOf('-', p0);
    if (p1<p0) return;
    let p2 = appHash.indexOf('-', p1+1);
    if (p2<p1) return;
    meInFrame.hash = appHash.substring(p0, p1);
    meInFrame.unit = Number(appHash.substring(p1+1, p2));
    meInFrame.app = Number(appHash.substring(p2+1));
    return meInFrame;
}

export function appUrl(url: string, unitId: number, appId: number):{url:string; hash:string} {
    let u:string;
    for (;;) {
        u = uid();
        let a = appsInFrame[u];
        if (a === undefined) {
            appsInFrame[u] = {hash:u, unit:unitId, app:appId};
            break;
        }
    }
    return {url: url + '#tv' + u + '-' + unitId + '-' + appId, hash: u};
}

export async function appApi(apiName: string): Promise<ApiToken> {
    let apiToken = apiTokens[apiName];
    if (apiToken !== undefined) return apiToken;
    if (window === window.parent) {
        apiToken = await apiTokenApi.api({unit: debugUnitId, app: debugAppId, apiName:apiName});
        apiTokens[apiName] = apiToken;
        if (apiToken === undefined) {
            let err = 'unauthorized call: apiTokenApi center return undefined!';
            //console.log(err);
            throw err;
        }
        return apiToken;
    }
    console.log("appApi parent send: %s", meInFrame.hash);
    apiToken = {
        name: apiName,
        url: undefined,
        token: undefined,
        resolve: undefined,
        reject: undefined,
    };
    apiTokens[apiName] = apiToken;
    return new Promise<ApiToken>((resolve, reject) => {
        apiToken.resolve = async (at) => {
            let a = await at;
            console.log('return from parent window: %s', JSON.stringify(a));
            apiToken.url = a.url;
            apiToken.token = a.token;
            resolve(apiToken);
        }
        apiToken.reject = reject;
        window.parent.postMessage({
            type: 'app-api',
            apiName: apiName,
            hash: meInFrame.hash,
        }, "*");
    });
    //apiToken = await apiTokenApi.api({dd: 'd'});
    //return apiToken;
}

interface BridgeCenterApi {
    id: string;
    resolve: (value?:any)=>any;
    reject: (reason?:any)=>void;
}
const brideCenterApis:{[id:string]: BridgeCenterApi} = {};
export function bridgeCenterApi(url:string, method:string, body:any):Promise<any> {
    return new Promise<any>(async (resolve, reject) => {
        let callId:string;
        for (;;) {
            callId = uid();
            let bca = brideCenterApis[callId];
            if (bca === undefined) {
                brideCenterApis[callId] = {
                    id: callId,
                    resolve: resolve,
                    reject: reject,
                }
                break;
            }
        }
        window.parent.postMessage({
            type: 'center-api',
            callId: callId,
            url: url,
            method: method,
            body: body
        }, '*');
    });
}

async function callCenterApiFromMessage(from:Window, message):Promise<void> {
    let {callId, url, method, body} = message;
    let result = await callCenterapi.directCall(url, method, body);
    from.postMessage({
        type: 'center-api-return',
        callId: callId,
        result: result,
    }, '*');
}

function bridgeCenterApiReturn(message:any) {
    let {callId, result} = message;
    let bca = brideCenterApis[callId];
    if (bca === undefined) return;
    brideCenterApis[callId] = undefined;
    bca.resolve(result);
}