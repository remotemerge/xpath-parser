interface Expression {
    root: string;
    pagination: string;
    queries: {
        [key: string]: string;
    };
}
export default class Hali {
    private options;
    private domContent;
    constructor(content: Node | string);
    evaluate(expression: string): XPathResult;
    getValue(node: Node | null): string;
    queryFirst(expression: string): string;
    queryList(expression: string): Array<string>;
    multiQuery(expressions: {
        [key: string]: string;
    }): {
        [key: string]: string;
    };
    subQuery(expression?: Expression): {
        paginationUrl: string;
        results: Array<{
            [key: string]: string;
        }>;
    };
    waitSelector(selector: string, maxSeconds?: number): boolean;
    waitXPath(expression: string, maxSeconds?: number): boolean;
}
export {};
