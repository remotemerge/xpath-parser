export default class Hali {
    constructor(content) {
        this.options = {
            queryFirst: false,
            subQueryFirst: false,
        };
        if (content instanceof Node) {
            this.domContent = content;
        }
        else {
            const parser = new DOMParser();
            this.domContent = parser.parseFromString(content, 'text/html');
        }
    }
    evaluate(expression) {
        return document.evaluate(expression, this.domContent, null, this.options.queryFirst ? XPathResult.FIRST_ORDERED_NODE_TYPE : XPathResult.ORDERED_NODE_ITERATOR_TYPE, null);
    }
    getValue(node) {
        let formattedText = '';
        if (node instanceof Node) {
            switch (node.nodeType) {
                case 1:
                    formattedText = node.textContent || '';
                    break;
                case 2:
                case 3:
                    formattedText = node.nodeValue || '';
                    break;
                default:
                    formattedText = '';
            }
        }
        return formattedText.trim();
    }
    singleQuery(expression, options = {}) {
        this.options = Object.assign(this.options, options);
        const evaluate = this.evaluate(expression);
        if (this.options.queryFirst) {
            return this.getValue(evaluate.singleNodeValue);
        }
        else {
            const records = [];
            let node = null;
            while ((node = evaluate.iterateNext())) {
                const value = this.getValue(node);
                records.push(value);
            }
            return records;
        }
    }
    multiQuery(expression = {
        root: '/html',
        queries: {}
    }, options = {}) {
        this.options = Object.assign(this.options, options);
        const rootDom = this.evaluate(expression.root);
        const records = [];
        let nodeDom = null;
        while ((nodeDom = rootDom.iterateNext())) {
            this.options.queryFirst = true;
            this.domContent = nodeDom;
            const record = {};
            Object.keys(expression.queries).forEach((key) => {
                const result = (this.evaluate(expression.queries[key])).singleNodeValue;
                record[key] = this.getValue(result);
            });
            records.push(record);
        }
        return records;
    }
    waitSelector(selector, maxSeconds = 1) {
        let count = 0;
        let selectorMatch = false;
        const refreshId = setInterval(() => {
            if (document.querySelector(selector)) {
                selectorMatch = true;
                clearInterval(refreshId);
            }
            if (count++ >= maxSeconds) {
                clearInterval(refreshId);
            }
        }, 1000);
        return selectorMatch;
    }
    waitXPath(expression, maxSeconds = 1) {
        let count = 0;
        let expressionMatch = false;
        const refreshId = setInterval(() => {
            if (this.singleQuery(expression, {
                queryFirst: true,
            })) {
                expressionMatch = true;
                clearInterval(refreshId);
            }
            if (count++ >= maxSeconds) {
                clearInterval(refreshId);
            }
        }, 1000);
        return expressionMatch;
    }
}
