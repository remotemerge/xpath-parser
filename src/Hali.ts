// interface for XPath expression
interface Expression {
    root: string;
    queries: {
        [key: string]: string
    };
}

class Hali {
    // init options
    private options = {
        queryFirst: false,
        subQueryFirst: false,
    };

    // init DOM node
    private domContent: Node;

    /**
     * --------------------------------------------------
     * Initialize Node from DOM Node or HTML string.
     * --------------------------------------------------
     * @param content
     * --------------------------------------------------
     */
    constructor(content: Node | string) {
        if (content instanceof Node) {
            this.domContent = content;
        } else {
            // init DOM parser
            const parser = new DOMParser();
            this.domContent = parser.parseFromString(content, 'text/html');
        }
    }

    /**
     * --------------------------------------------------
     * Evaluate an XPath expression in the specified Node
     * and return the result.
     * --------------------------------------------------
     * @param expression
     * --------------------------------------------------
     */
    evaluate(expression: string): XPathResult {
        return document.evaluate(expression, this.domContent, null, this.options.queryFirst ? XPathResult.FIRST_ORDERED_NODE_TYPE : XPathResult.ORDERED_NODE_ITERATOR_TYPE, null);
    }

    /**
     * --------------------------------------------------
     * Extract the text value from a given DOM Node.
     * --------------------------------------------------
     * @param node
     * --------------------------------------------------
     */
    getValue(node: Node | null): string {
        let formattedText: string = '';
        if (node instanceof HTMLElement) {
            let nodeValue = node.nodeType === 1 ? node.innerText : ((node.nodeType === 2 || node.nodeType === 3) ? node.nodeValue : '');
            if (nodeValue) {
                formattedText = nodeValue.trim().replace(/\s{2,}/gm, ' ');
            }
        }
        return formattedText;
    }

    /**
     * --------------------------------------------------
     * This method selects all matching nodes and extract
     * result in an array.
     * --------------------------------------------------
     * @param expression
     * @param options
     * --------------------------------------------------
     */
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

    /**
     * --------------------------------------------------
     * This method selects all matching parent nodes and
     * runs sub queries on child nodes and generate an
     * associative array result.
     * --------------------------------------------------
     * @param expression
     * @param options
     * --------------------------------------------------
     */
    multiQuery(expression: Expression = {
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

            Object.keys(expression.queries).forEach((key: string) => {
                let result = (this.evaluate(expression.queries[key])).singleNodeValue;
                record[key] = this.getValue(result);
            });
            records.push(record);
        }
        return records;
    }
}
