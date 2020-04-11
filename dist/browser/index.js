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
        var formattedText = '';
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
    };
    Hali.prototype.query = function (expression, options) {
        if (options === void 0) { options = {}; }
        this.options = Object.assign(this.options, options);
        var evaluate = this.evaluate(expression);
        if (this.options.queryFirst) {
            return this.getValue(evaluate.singleNodeValue);
        }
        else {
            var records = [];
            var node = null;
            while ((node = evaluate.iterateNext())) {
                var value = this.getValue(node);
                records.push(value);
            }
            return records;
        }
    };
    Hali.prototype.multiQuery = function (expression, options) {
        var _this = this;
        if (expression === void 0) { expression = {
            root: '/html',
            pagination: '',
            queries: {}
        }; }
        if (options === void 0) { options = {}; }
        this.options = Object.assign(this.options, options);
        var rootDom = this.evaluate(expression.root);
        var records = [];
        var nodeDom = null;
        var _loop_1 = function () {
            this_1.options.queryFirst = true;
            this_1.domContent = nodeDom;
            var record = {};
            Object.keys(expression.queries).forEach(function (key) {
                var result = (_this.evaluate(expression.queries[key])).singleNodeValue;
                record[key] = _this.getValue(result);
            });
            records.push(record);
        };
        var this_1 = this;
        while ((nodeDom = rootDom.iterateNext())) {
            _loop_1();
        }
        var paginated = '';
        if (expression.pagination) {
            paginated = this.query(expression.pagination, {
                queryFirst: true,
            });
        }
        return {
            page: paginated,
            data: records,
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
            if (_this.query(expression, {
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
    };
    return Hali;
}());
