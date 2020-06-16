import URL from "@candlefw/url";
import Presets from "./presets.js";
import CompiledWickAST, { WickASTNode, WickASTNodeType } from "../types/wick_ast_node_types.js";
import { WickComponentErrorStore, WickComponentErrorCode } from "../types/errors.js";
import { Component, } from "../types/types";
import parser from "../parser/parser.js";
import { processWickJS_AST } from "./js.js";
import { processWickHTML_AST } from "./html.js";
import { MinTreeNode, MinTreeNodeType } from "@candlefw/js";
import { PendingBinding } from "../types/types";

export const component_cache = {};

function determineSourceType(ast: WickASTNode | MinTreeNode): boolean {
    if (ast.type == MinTreeNodeType.Script || ast.type == MinTreeNodeType.Module)
        return true;
    return false;
};

function createNameHash(string: string) {

    let number = BigInt(0);

    const seed = BigInt(0x2F41118294721DA1);

    for (let i = 0; i < string.length; i++) {

        const val = BigInt(string.charCodeAt(i));

        number = ((val << BigInt(i % 8) ^ seed) << BigInt(i % 64)) ^ (number >> BigInt(i % 4));
    }

    return "W" + number.toString(16);
}
export function parseStringAndCreateWickAST(wick_string: string) {

    let ast = null;
    /**
     * We are now assuming that the input has been converted to a string containing wick markup. 
     * We'll let the parser handle any syntax errors.
     */
    try {
        ast = parser(wick_string);
    } catch (e) {

        /** 
         * Since we were unable to process the input we'll create an error ast that can be used to generate
         * an error report component. 
         */
        ast = <WickASTNode>{
            type: WickASTNodeType.ERROR, nodes: [{
                message: `Failed to parse wick component`,
                ref: WickComponentErrorCode.SYNTAX_ERROR_DURING_PARSE,
                error_object: e instanceof Error ? e : null,
                URL: url,
            }]
        };
    }

    return ast;
}

export async function acquireComponentASTFromRemoteSource(url_source: URL | string, root_url?: URL) {

    const url = URL.resolveRelative(url_source + "", root_url || URL.GLOBAL);

    let string = "";

    if (!url)
        throw new Error("Could not load URL: " + url_source + "");

    //TODO: Can throw
    try {
        string = <string>await url.fetchText(false);
    } catch (e) {
        throw e;
    }

    return { ast: parseStringAndCreateWickAST(string), string, resolved_url: url.toString() };
}


/**
 * This functions is used to compile a Wick component, which can then be immediately
 * It will accept a string containing wick markup, or a URL that points to a wick component.
 * 
 * @param input {number}
 * @param presets {PresetOptions} - 
 * @param root_url 
 */
export default async function makeComponent(input: URL | string, presets?: Presets, root_url?: URL): Promise<Component> {

    //If this is a node.js environment, make sure URL is able to resolve local files system addresses.
    if (typeof (window) == "undefined") await URL.polyfill();

    const error_store = <WickComponentErrorStore>{ errors: [] };

    let wick_syntax_string = <string>input;

    /**
     * If a string has been passed the we need to determine if it is a wick component
     * or a URL. The naive way to do this is to check to see if the leading character
     * is [ < ], since an HTML wick component must begin with an HTML tag. This will
     * only work if the string does not have leading spaces, and does not allow for other
     * wick component syntax forms that may be implemented. The inverse of this would
     * be to check for the protocol portion of a URL at the beginning of the string; however,
     * if we allow relative URL paths then this would not catch such forms.
     * 
     * Another way to test for URLiness is to check for white spaces, since well formatted 
     * URLs do not have whitespace characters. This does require scanning the entire string
     * to ensure that there are no whitespace characters within. It also does not take into account
     * possible HTML syntax that does not yield whitespace characters, such as `<div>no-white-space</div>`.
     * 
     * For now, a brute force method will be to use the URL constructor parse the input string. We test for the 
     * presence of a hostname and/or path on the result, and if the string yields values for these, we
     * assume the string is a URL and proceed to fetch data from the URL. If a resource cannot be fetched,
     * we proceed with parsing the string as a wick component. 
     */

    let ast = null, url = input, input_string = input;

    try {

        const { string, ast: url_ast, resolved_url } = await acquireComponentASTFromRemoteSource(input, root_url);

        ast = url_ast;

        input_string = string;

        url = resolved_url;

    } catch (e) {
        try {
            url = "";
            ast = parseStringAndCreateWickAST(<string>input);
        } catch (e) {
            console.log(e);
            throw e;
        }
    }

    return await compileComponent(ast, input_string, url, presets);
};

export async function compileComponent(ast, source_string, url, presets): Promise<Component> {
    try {
        let out_ast: CompiledWickAST = null;

        /**
         * We need to first traverse the AST node structure, locating nodes that need the
         * following action taken:
         *      
         *      a.  Nodes containing a url attribute will need to have that url fetched and
         *          processed. These nodes will later be merged by the resulting AST
         *          created from the fetched resource
         * 
         *      b.  Global binding variables need to identified and hoisted to a reference
         *          table that will be used to resolve JS => HTML, JS => CSS, JS => JS
         *          bindings.
         * 
         *      c.  Nodes containing slot attributes will need to resolved.
         *      
         */

        const
            pending_bindings = [],

            binding_variables = new Map,

            component: Component = {

                location: url,

                binding_variables,

                bindings: pending_bindings,

                function_blocks: [],

                CSS: [],

                HTML: null,

                names: [],

                children: [],

                name: createNameHash(source_string),

                source: source_string,

                //OLD STUFFS

                addBinding: (pending_binding: PendingBinding) => pending_bindings.push(pending_binding)
            },

            IS_SCRIPT = determineSourceType(ast);

        if (presets.components.has(component.name))
            return presets.components.get(component.name);

        presets.components.set(component.name, component);

        if (IS_SCRIPT)
            await processWickJS_AST(<MinTreeNode>ast, component, presets);
        else
            await processWickHTML_AST(<WickASTNode>ast, component, presets);

        for (const name of component.names)
            presets.components.set(name.toUpperCase(), component);

        component.binding_variables = new Map();

        for (const [name, value] of binding_variables.entries()) {
            if (value.type !== 32)
                component.binding_variables.set(name, value);
        }

        return component;
    } catch (e) {
        throw e;
    }
}