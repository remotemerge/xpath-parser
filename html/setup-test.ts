/// <reference types="bun-types" />
import { JSDOM } from 'jsdom';

const dom = new JSDOM('<!DOCTYPE html><html lang="en"><body></body></html>', {
  url: 'http://localhost/',
  pretendToBeVisual: true,
});

global.window = dom.window as unknown as Window & typeof globalThis;
global.document = dom.window.document;
global.Node = dom.window.Node;
global.DOMParser = dom.window.DOMParser;
global.XPathResult = dom.window.XPathResult;
global.Attr = dom.window.Attr;
global.HTMLElement = dom.window.HTMLElement;
global.XPathExpression = dom.window.XPathExpression;
