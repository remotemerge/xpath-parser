var Hali = (function () {
    function Hali(content) {
        this.options = {
            queryFirst: false,
        };
        if (content instanceof Node) {
            this.domContent = content;
        }
        else {
            var parser = new DOMParser();
            this.domContent = parser.parseFromString(content, 'text/html');
        }
    }
    Hali.prototype.evaluate = function (expression) {
        return document.evaluate(expression, this.domContent, null, this.options.queryFirst ? XPathResult.FIRST_ORDERED_NODE_TYPE : XPathResult.ORDERED_NODE_ITERATOR_TYPE, null);
    };
    Hali.prototype.getValue = function (node) {
        var formattedText;
        if (node instanceof Attr) {
            formattedText = node.value || '';
        }
        else {
            formattedText = (node === null || node === void 0 ? void 0 : node.textContent) || '';
        }
        return formattedText.trim();
    };
    Hali.prototype.queryFirst = function (expression) {
        this.options.queryFirst = true;
        var evaluate = this.evaluate(expression);
        return this.getValue(evaluate.singleNodeValue);
    };
    Hali.prototype.queryList = function (expression) {
        var response = [], evaluate = this.evaluate(expression);
        var node;
        while ((node = evaluate.iterateNext())) {
            var value = this.getValue(node);
            response.push(value);
        }
        return response;
    };
    Hali.prototype.multiQuery = function (expressions) {
        var _this = this;
        var response = {};
        Object.keys(expressions).forEach(function (key) {
            response[key] = _this.queryFirst(expressions[key]);
        });
        return response;
    };
    Hali.prototype.subQuery = function (expression) {
        var _this = this;
        if (expression === void 0) { expression = {
            root: '/html',
            pagination: '',
            queries: {},
        }; }
        var rootDom = this.evaluate(expression.root);
        var results = [];
        var nodeDom = null;
        var _loop_1 = function () {
            this_1.domContent = nodeDom;
            var record = {};
            Object.keys(expression.queries).forEach(function (key) {
                record[key] = _this.queryFirst(expression.queries[key]);
            });
            results.push(record);
        };
        var this_1 = this;
        while ((nodeDom = rootDom.iterateNext())) {
            _loop_1();
        }
        var paginationUrl = '';
        if (expression.pagination) {
            paginationUrl = this.queryFirst(expression.pagination);
        }
        return {
            paginationUrl: paginationUrl,
            results: results,
        };
    };
    Hali.prototype.waitSelector = function (selector, maxSeconds) {
        if (maxSeconds === void 0) { maxSeconds = 1; }
        var count = 0;
        var selectorMatch = false;
        var refreshId = setInterval(function () {
            if (document.querySelector(selector)) {
                selectorMatch = true;
                clearInterval(refreshId);
            }
            if (count++ >= maxSeconds) {
                clearInterval(refreshId);
            }
        }, 1000);
        return selectorMatch;
    };
    Hali.prototype.waitXPath = function (expression, maxSeconds) {
        var _this = this;
        if (maxSeconds === void 0) { maxSeconds = 1; }
        var count = 0;
        var expressionMatch = false;
        var refreshId = setInterval(function () {
            if (_this.queryFirst(expression)) {
                expressionMatch = true;
                clearInterval(refreshId);
            }
            if (count++ >= maxSeconds) {
                clearInterval(refreshId);
            }
        }, 1000);
        return expressionMatch;
    };
    return Hali;
}());
