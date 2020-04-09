interface Expression {
    root: string;
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
    singleQuery(expression: string, options?: object): string | string[];
    multiQuery(expression?: Expression, options?: object): object;
    waitSelector(selector: string, maxSeconds?: number): boolean;
    waitXPath(expression: string, maxSeconds?: number): boolean;
}
export {};
