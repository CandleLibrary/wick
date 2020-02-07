import ElementNode from "./element.js";
import ScriptIO from "../component/io/script_io.js";
import FUNCTION_CACHE from "../js/function_cache.js";
import { GetOutGlobals, AddEmit as addEmitExpression, AsyncInClosure, copyAST } from "../js/script_functions.js";
import error from "../../utils/error.js";

const offset = "    ";
const AsyncFunction = Object.getPrototypeOf(async function(){}).constructor;

export default class ScriptNode extends ElementNode {

    constructor(env, presets, tag, ast, attribs) {
        super(env, presets, "script", null, attribs);
        this.function = null;
        this.args = null;
        this.original_ast = ast[0];
        this.ast = null;
        this.IS_ASYNC = false;
        this.READY = false;
        this.val = "";
        this.original_val = "";

        const on = this.getAttribObject("on").value;

        if (typeof on == "string")
            console.warn("No binding set for this script's [on] attribute. This script will have no effect.");
        else
            this.on = on;


        if (this.original_ast && on) {
            this.original_val = this.original_ast.render();
            this.processJSAST(presets);
        }
    }

    loadAST(ast) {
        if (ast && !this.ast) {
            this.ast = ast;
            this.original_val = this.ast.render();
            this.processJSAST(this.presets);
        }
    }

    processJSAST(presets = { custom: {} }) {

        this.ast = copyAST(this.original_ast);

        const { args, ids } = GetOutGlobals(this.ast, presets);

        this.IS_ASYNC = AsyncInClosure(this.ast);

        this.args = args;

        this.ids = ids;

        addEmitExpression(ids, presets, this.args.reduce((r, a) => ((a.IS_TAPPED) ? null : r.push(a.name), r), []));

        this.val = this.ast + "";
    }

    finalize() {

        if (!this.ast || !this.on) return this;


        if (true || !FUNCTION_CACHE.has(this.val)) {

            const
                args = this.args,
                names = args.map(a => a.name);


            // For the injected emit function
            names.push("emit");

            try {

                if(this.IS_ASYNC)
                   this.function = AsyncFunction.apply(AsyncFunction, names.concat([this.val]));
                else 
                    this.function = Function.apply(Function, names.concat([this.val]));

                this.READY = true;

                FUNCTION_CACHE.set(this.val, this.function);
            } catch (e) {
                throw error(error.SCRIPT_FUNCTION_CREATE_FAILURE, e, this);
            }

        } else {
            this.function = FUNCTION_CACHE.get(this.val);
            this.READY = true;
        }

        return this;
    }

    mount(element, scope, presets, slots, pinned) {

        if (this.READY) {
            const tap = this.on.bind(scope, null, null, this);
            scope.ios.push(new ScriptIO(scope, this, tap, this, {}, pinned));
        }
    }

    toString(off = 0) {

        var o = offset.repeat(off),
            str = `${o}<${this.tag}`;

        for (const attr of this.attribs.values()) {
            if (attr.name)
                str += ` ${attr.name}="${attr.value}"`;
        }

        str += ">\n";

        str += this.original_val;

        return str + `${o}</${this.tag}>\n`;
    }
}
