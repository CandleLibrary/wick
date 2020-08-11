import { WickNode } from "./wick_ast_node_types.js";
import { Component } from "./types.js";
import Presets from "../presets.js";
export interface HTMLHandler {
    priority: number;
    /**
     *
     * If return object is the node argument, the outgoing ast will not be modified in any way.
     *
     * If return object is undefined, the next handler will be selected to process the node. In
     * this event, the returning handler should not modify the node in any way.
     *
    * If return object is null, the node will be removed from the outgoing AST.
    *
     * @param node
     * @param host_node
     * @param host_element_node
     * @param element_index
     * @param skip
     * @param replace_element Available when parsing a nodes attributes. Allows the HTMLElement node to be replaced or removed.
     * @param component
     * 
     * @async May return a promise that resolves to the givin return types.
     * 
     * @return @type {WickNode} | @type {void} | @type {Promise}
     */
    prepareHTMLNode(
        node: WickNode,
        host_node: WickNode,
        host_element_node: WickNode,
        element_index: number,
        skip: () => void,
        replace_element: (arg: WickNode | null) => void,
        component: Component,
        presets: Presets
    ):
        WickNode
        | void
        | Promise<WickNode | void>;
}
