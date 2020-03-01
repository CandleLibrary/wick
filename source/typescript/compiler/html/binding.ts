import { identifier } from "@candlefw/js";
import ExpressionIO from "../component/io/expression_io.js";
import ContainerIO from "../component/io/container_io.js";
import { processJSAST, processScriptObject } from "./script.js";

export const EXPRESSION = 5;
export const IDENTIFIER = 6;
export const CONTAINER = 7;
export const BOOL = 8;

export default class Binding {

    constructor(exprA, exprB, env, lex, DEBUG =false) {
        if(DEBUG)
            console.log(`DEBUGGING binding in ${env.url} at ${lex.line+1}:${lex.char+1}`);

        this.lex = lex.copy();
        this.lex.sl = lex.off - 3;
        this.lex.off = env.start;

        this.METHOD = IDENTIFIER;

        this.astA = {
            original: exprA,
            ast: null,
            IS_ASYNC: false,
            ids: null,
            args: null,
            function: null,
            val: exprA ? exprA.render() : ""

        };

        this.astB = {
            original: exprB,
            ast: null,
            IS_ASYNC: false,
            ids: null,
            args: null,
            function: null,
            val: exprB ? exprB.render() : ""
        };

        this.READY = false;
        this.origin_url = env.url;
        this.on = true;

        if (this.astA.original && !(this.astA.original instanceof identifier)) {
            processJSAST(this.astA, env, 1);
            this.READY = processScriptObject(this.astA, env);
            this.METHOD = EXPRESSION;
        }

        if (this.astB.original && !(this.astB.original instanceof identifier)) {
            processJSAST(this.astB, env, 1);
            processScriptObject(this.astB, env);
        }
    }

    toString(data) {
        if(this.METHOD == IDENTIFIER && data && data[this.astA.val])
            return data[this.astA.val].toString();
        return (this.astB.val)
            ? `((${this.astA.original + ""})(${this.astB.original + ""}))`
            : `((${this.astA.original + ""}))`;
    }

    setForContainer() {
        this.METHOD = CONTAINER;
    }

    bind(scope, element, pinned, node = this) {
        const out = { main: null, alt: null };

        if (this.astB.ast)
            out.alt = new ExpressionIO(element, scope, node, scope, this.astB, this.lex, pinned);
        else
            out.alt = this.astB.val;
        if (this.astA.ast) {
            if (this.METHOD == EXPRESSION)
                out.main = new ExpressionIO(element, scope, node, scope, this.astA, this.lex, pinned);
            else if (this.METHOD == CONTAINER)
                out.main = new ContainerIO(element, scope, node, scope, this.astA, this.lex, pinned);
        } else
            out.main = scope.getTap(this.astA.val);

        return out;
    }
}

Binding.type = {
    Attribute: 0,
    TextNode: 1,
    Style: 2
};