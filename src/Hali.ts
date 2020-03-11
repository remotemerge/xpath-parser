// init DOM parser
const parser = new DOMParser();

class Hali {
    // init options
    private options = {
        queryFirst: false,
        subQueryFirst: false,
    };

    // init DOM node
    private domContent: Node;

    constructor(content: Node | string) {
        if (content instanceof Node) {
            this.domContent = content;
        } else {
            this.domContent = parser.parseFromString(content, 'text/html');
        }
    }

    evaluate(expression: string): XPathResult {
        return document.evaluate(expression, this.domContent, null, this.options.queryFirst ? XPathResult.FIRST_ORDERED_NODE_TYPE : XPathResult.ORDERED_NODE_ITERATOR_TYPE, null);
    }

    getValue(node: HTMLElement | null): string {
        let formattedText: string = '';
        if (node instanceof HTMLElement) {
            let nodeValue = node.nodeType === 1 ? node.innerText : ((node.nodeType === 2 || node.nodeType === 3) ? node.nodeValue : '');
            if (nodeValue) {
                formattedText = nodeValue.trim().replace(/\s{2,}/gm, ' ');
            }
        }
        return formattedText;
    }

    singleQuery(expression: string, options: object | undefined) {
        // override options
        this.options = Object.assign(this.options, options);

        let evaluate = this.evaluate(expression);
        if (this.options.queryFirst) {
            return this.getValue(evaluate.singleNodeValue);
        } else {
            let records = [];
            let node = null;
            while ((node = evaluate.iterateNext())) {
                let value = this.getValue(node);
                records.push(value);
            }
            return records;
        }
    }

    multiQuery(expression = {
        root: '/html',
        queries: {}
    }, options: object) {
        // override options
        this.options = Object.assign(this.options, options);
        // extract root DOM
        let rootDom = this.evaluate(expression.root);

        let records = [];
        let nodeDom = null;
        while ((nodeDom = rootDom.iterateNext())) {
            // runtime override
            this.options.queryFirst = true;
            this.domContent = nodeDom;

            let record: { [key: string]: string } = {};

            for (const [key, val] of Object.entries(expression.queries)) {
                record[key] = '';

                let result = (this.evaluate(val)).singleNodeValue;
                if (!result !== null) {
                    record[key] = this.getValue(result);
                }
            }
            Object.keys(expression.queries).forEach((key: string) => {
                record[key] = '';
                let result = (this.evaluate(expression.queries[key])).singleNodeValue;
                console.log(queries[key]);
            });
            records.push(record);
        }
        return records;
    }
}
