import * as React from 'react';
import { refetchApi } from '../net';
export default class FetchErrorView extends React.Component {
    click() {
        this.props.clearError();
        const { channel, url, options, resolve, reject } = this.props;
        refetchApi(channel, url, options, resolve, reject);
    }
    render() {
        let { error, url } = this.props;
        //let errMsg = fetchError.errorMsg;
        let errContent;
        if (typeof error === 'object') {
            let err = [];
            for (let i in error) {
                err.push(React.createElement("li", { key: i },
                    React.createElement("label", null, i),
                    React.createElement("div", null, error[i])));
            }
            errContent = React.createElement("ul", null, err);
        }
        else {
            errContent = React.createElement("div", null, error);
        }
        return React.createElement("li", { onClick: () => this.click() },
            React.createElement("article", { className: "page-container" },
                React.createElement("section", null,
                    React.createElement("div", { className: "va-error" },
                        React.createElement("div", null, "\u7F51\u7EDC\u51FA\u73B0\u95EE\u9898"),
                        React.createElement("div", null, "\u70B9\u51FB\u91CD\u65B0\u8BBF\u95EE"),
                        React.createElement("div", null,
                            "url: ",
                            url),
                        errContent))));
    }
}
//# sourceMappingURL=fetchErrorView.js.map