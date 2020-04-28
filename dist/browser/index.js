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
        if (node instanceof Attr) {
            formattedText = node.value || '';
        }
        else if (node instanceof HTMLElement) {
            formattedText = node.textContent || '';
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
    Hali.prototype.waitXPath = function (expression, maxSeconds) {
        var _this = this;
        if (maxSeconds === void 0) { maxSeconds = 10; }
        var timer = 1;
        return new Promise(function (resolve, reject) {
            var refreshId = setInterval(function () {
                var firstMatch = _this.queryFirst(expression);
                if (firstMatch) {
                    clearInterval(refreshId);
                    return resolve({ found: true, message: firstMatch });
                }
                if (timer++ >= maxSeconds) {
                    clearInterval(refreshId);
                    return reject({
                        found: false,
                        message: "Timeout! Max " + maxSeconds + " seconds are allowed.",
                    });
                }
            }, 1000);
        });
    };
    return Hali;
}());
