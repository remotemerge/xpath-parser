module.exports = function (e) {
  var t = {};

  function n(r) {
    if (t[r]) return t[r].exports;
    var o = t[r] = {i: r, l: !1, exports: {}};
    return e[r].call(o.exports, o, o.exports, n), o.l = !0, o.exports
  }

  return n.m = e, n.c = t, n.d = function (e, t, r) {
    n.o(e, t) || Object.defineProperty(e, t, {enumerable: !0, get: r})
  }, n.r = function (e) {
    "undefined" != typeof Symbol && Symbol.toStringTag && Object.defineProperty(e, Symbol.toStringTag, {value: "Module"}), Object.defineProperty(e, "__esModule", {value: !0})
  }, n.t = function (e, t) {
    if (1 & t && (e = n(e)), 8 & t) return e;
    if (4 & t && "object" == typeof e && e && e.__esModule) return e;
    var r = Object.create(null);
    if (n.r(r), Object.defineProperty(r, "default", {
      enumerable: !0,
      value: e
    }), 2 & t && "string" != typeof e) for (var o in e) n.d(r, o, function (t) {
      return e[t]
    }.bind(null, o));
    return r
  }, n.n = function (e) {
    var t = e && e.__esModule ? function () {
      return e.default
    } : function () {
      return e
    };
    return n.d(t, "a", t), t
  }, n.o = function (e, t) {
    return Object.prototype.hasOwnProperty.call(e, t)
  }, n.p = "", n(n.s = 0)
}([function (e, t, n) {
  "use strict";
  Object.defineProperty(t, "__esModule", {value: !0});
  t.default = class {
    constructor(e) {
      if (this.options = {
        queryFirst: !1,
        subQueryFirst: !1
      }, e instanceof Node) this.domContent = e; else {
        const t = new DOMParser;
        this.domContent = t.parseFromString(e, "text/html")
      }
    }

    evaluate(e) {
      return document.evaluate(e, this.domContent, null, this.options.queryFirst ? XPathResult.FIRST_ORDERED_NODE_TYPE : XPathResult.ORDERED_NODE_ITERATOR_TYPE, null)
    }

    getValue(e) {
      let t = "";
      if (e instanceof Node) switch (e.nodeType) {
        case 1:
          t = e.textContent || "";
          break;
        case 2:
        case 3:
          t = e.nodeValue || "";
          break;
        default:
          t = ""
      }
      return t.trim()
    }

    singleQuery(e, t) {
      this.options = Object.assign(this.options, t);
      const n = this.evaluate(e);
      if (this.options.queryFirst) return this.getValue(n.singleNodeValue);
      {
        const e = [];
        let t = null;
        for (; t = n.iterateNext();) {
          const n = this.getValue(t);
          e.push(n)
        }
        return e
      }
    }

    multiQuery(e = {root: "/html", queries: {}}, t) {
      this.options = Object.assign(this.options, t);
      const n = this.evaluate(e.root), r = [];
      let o = null;
      for (; o = n.iterateNext();) {
        this.options.queryFirst = !0, this.domContent = o;
        const t = {};
        Object.keys(e.queries).forEach(n => {
          const r = this.evaluate(e.queries[n]).singleNodeValue;
          t[n] = this.getValue(r)
        }), r.push(t)
      }
      return r
    }
  }
}]);
