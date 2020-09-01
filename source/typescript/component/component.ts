import URL from "@candlefw/url";
import { JSNode, JSNodeType } from "@candlefw/js";

import Presets from "../presets.js";
import parseStringReturnAST from "../parser/parse.js";

import { processWickJS_AST } from "./component_js.js";
import { processWickHTML_AST } from "./component_html.js";

import { ComponentData } from "../types/component_data";
import { HTMLNodeClass, HTMLNode } from "../types/wick_ast_node_types.js";
import { acquireComponentASTFromRemoteSource } from "./component_acquire_ast.js";
import { createComponent, createErrorComponent } from "./component_create_component.js";
import { createFrame } from "./component_create_frame.js";
import { Comment } from "../types/comment.js";
export const component_cache = {};

function getHTML_AST(ast: HTMLNode | JSNode): HTMLNode {

    while (ast && !(ast.type & HTMLNodeClass.HTML_ELEMENT))
        ast = ast.nodes[0];

    return <HTMLNode>ast;
}

function determineSourceType(ast: HTMLNode | JSNode): boolean {

    if (ast.type == JSNodeType.Script || ast.type == JSNodeType.Module) {
        if (ast.nodes.length > 1) return true;
        if (ast.nodes[0].type != JSNodeType.ExpressionStatement) return true;
        if (!(ast.nodes[0].nodes[0].type & HTMLNodeClass.HTML_ELEMENT)) return true;
    }

    return false;
};

const empty_obj = {};

/**
 * This functions is used to compile a Wick component, which can then be immediately
 * It will accept a string containing wick markup, or a URL that points to a wick component.
 * 
 * @param input {number}
 * @param presets {PresetOptions} - 
 * @param root_url 
 */
export default async function makeComponent(input: URL | string, presets?: Presets, root_url?: URL): Promise<ComponentData> {

    //If this is a node.js environment, make sure URL is able to resolve local files system addresses.
    if (typeof (window) == "undefined") await URL.polyfill();

    let data: any = empty_obj, errors = [];

    try {
        data = await acquireComponentASTFromRemoteSource(new URL(input), root_url);
    } catch (e) {
        //Illegal URL, try parsing string
        try {
            data = parseStringReturnAST(<string>input, "");
        } catch (e) {
            errors.push(e);
        }
    }

    const {
        string: input_string = input,
        ast = null,
        resolved_url: url = null,
        error: e = null,
        comments = []
    } = data;

    if (e) errors.push(...e);

    return await compileComponent(ast, <string>input_string, url, presets, errors, comments);
};

export async function compileComponent(
    ast: HTMLNode | JSNode,
    source_string: string,
    url: string,
    presets: Presets,
    errors: Error[] = [],
    comments: Comment[] = [],
): Promise<ComponentData> {

    const
        component: ComponentData = createComponent(source_string, url);

    component.root_frame = createFrame(null, false, component);

    component.comments = comments;

    try {

        const IS_SCRIPT = determineSourceType(ast);

        if (presets.components.has(component.name))
            return presets.components.get(component.name);

        presets.components.set(component.name, component);

        if (IS_SCRIPT)
            await processWickJS_AST(<JSNode>ast, component, presets);
        else
            await processWickHTML_AST(getHTML_AST(ast), component, presets);

        for (const name of component.names)
            presets.named_components.set(name.toUpperCase(), component);

    } catch (e) {
        errors.push(e);
    }

    if (errors.length > 0)
        return createErrorComponent(errors, source_string, url, component);

    return component;
}


