export default class Hali {
    constructor(content) {
        this.options = {
            queryFirst: false,
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
        if (node instanceof Attr) {
            formattedText = node.value || '';
        }
        else if (node instanceof HTMLElement) {
            formattedText = node.textContent || '';
        }
        return formattedText.trim();
    }
    queryFirst(expression) {
        this.options.queryFirst = true;
        const evaluate = this.evaluate(expression);
        return this.getValue(evaluate.singleNodeValue);
    }
    queryList(expression) {
        const response = [], evaluate = this.evaluate(expression);
        let node;
        while ((node = evaluate.iterateNext())) {
            const value = this.getValue(node);
            response.push(value);
        }
        return response;
    }
    multiQuery(expressions) {
        const response = {};
        Object.keys(expressions).forEach((key) => {
            response[key] = this.queryFirst(expressions[key]);
        });
        return response;
    }
    subQuery(expression = {
        root: '/html',
        pagination: '',
        queries: {},
    }) {
        const rootDom = this.evaluate(expression.root);
        const results = [];
        let nodeDom = null;
        while ((nodeDom = rootDom.iterateNext())) {
            this.domContent = nodeDom;
            const record = {};
            Object.keys(expression.queries).forEach((key) => {
                record[key] = this.queryFirst(expression.queries[key]);
            });
            results.push(record);
        }
        let paginationUrl = '';
        if (expression.pagination) {
            paginationUrl = this.queryFirst(expression.pagination);
        }
        return {
            paginationUrl: paginationUrl,
            results: results,
        };
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
            if (this.queryFirst(expression)) {
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
