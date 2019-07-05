import ElementNode from "./element.js";
import ScriptNode from "./script.js";
import ScopeNode from "./scope.js";
import LinkNode from "./link.js";
import ContainerNode from "./container.js";
import StyleNode from "./style.js";
import VoidNode from "./void.js";
import SVGNode from "./svg.js";
import SlotNode from "./slot.js";
import PreNode from "./pre.js";
import FilterNode from "./filter.js";
import ImportNode from "./import.js";
//import Plugin from "./../plugin.js";

function processWickupChildren(children, env, lex) {

    let PREVIOUS_NODE = null;

    if (children.length > 1) {
        for (let i = 0; i < children.length; i++) {
            let node = children[i];
            //If meta is true, then a wickup node was created. Use the tag name to determine the next course of action. 
            const tag = node.tag;
            const meta = node.wickup;

            if (meta) {
                switch (tag) {
                    case "blockquote":
                        node.wickup = false;
                        if (PREVIOUS_NODE && PREVIOUS_NODE.tag == "blockquote") {
                            let level = 1,
                                ul = PREVIOUS_NODE;
                            while (level < meta) {
                                let ul_child = ul.children[ul.children.length - 1];
                                if (ul_child && ul_child.tag == "blockquote") {
                                    ul = ul_child;
                                } else {
                                    ul_child = es("blockquote", null, [], env, lex);
                                    ul.children.push(ul_child);
                                    ul = ul_child;
                                }

                                level++;
                            }
                            ul.children.push(...node.children);
                            children.splice(i, 1);
                            i--;
                            node = PREVIOUS_NODE;
                        }
                        break;
                }
            } else {

                //This will roll new nodes into the previous node as children of the previous node if the following conditions are met:
                // 1. The previous node is a wickup node of type either UL or Blockquote
                // 2. The new node is anything other than a text node containing only white space. 
                if (PREVIOUS_NODE) {
                    if (node.tag !== "text" || (!node.IS_WHITESPACE)) {

                        if (PREVIOUS_NODE.wickup)
                            switch (PREVIOUS_NODE.tag) {
                                case "blockquote":

                                    let bq = PREVIOUS_NODE;
                                    //Insert into last li. if the last 
                                    while (1) {
                                        let bq_child = bq.children[bq.children.length - 1];
                                        if (!bq_child) throw "Messing up!";
                                        if (bq_child.tag == "blockquote") {
                                            bq = bq_child;
                                            break;
                                        } else {
                                            bq = bq_child;
                                        }
                                    }
                                    bq.children.push(node);
                                    children.splice(i, 1);
                                    i--;
                                    node = PREVIOUS_NODE;
                                    break;
                                    //return null;
                            }
                    } else {
                        let node2 = children[i + 1];
                        if (node2) {
                            if (node2.tag === "text" && node2.IS_WHITESPACE) {
                                continue;
                            }
                        }
                    }
                }
            }

            PREVIOUS_NODE = node;
        }
        PREVIOUS_NODE = null;
        for (let i = 0; i < children.length; i++) {
            let node = children[i];
            //If meta is true, then a wickup node was created. Use the tag name to determine the next course of action. 
            const tag = node.tag;
            const meta = node.wickup;

            if (meta) {
                switch (tag) {
                    case "li":
                        if (PREVIOUS_NODE && PREVIOUS_NODE.tag == "ul") {

                            let level = 1,
                                ul = PREVIOUS_NODE;
                            while (level < meta) {
                                let ul_child = ul.children[ul.children.length - 1];
                                if (ul_child && ul_child.tag == "ul") {
                                    ul = ul_child;
                                } else {
                                    ul_child = es("ul", null, [], env, lex);
                                    ul.children.push(ul_child);
                                    ul = ul_child;
                                }

                                level++;
                            }

                            ul.children.push(node);
                            children.splice(i, 1);
                            i--;
                            node = PREVIOUS_NODE;
                        } else {
                            children[i] = es("ul", null, [node], env, lex, true);
                            node = children[i]
                        }
                        break;
                }
            } else {

                //This will roll new nodes into the previous node as children of the previous node if the following conditions are met:
                // 1. The previous node is a wickup node of type either UL or Blockquote
                // 2. The new node is anything other than a text node containing only white space. 
                if (PREVIOUS_NODE) {
                    if ((node.tag !== "text") || (!node.IS_WHITESPACE)) {
      
                        if (PREVIOUS_NODE.wickup)
                            switch (PREVIOUS_NODE.tag) {
                                case "ul":

                                    let ul = PREVIOUS_NODE;
                                    //Insert into last li. if the last 
                                    while (1) {
                                        let ul_child = ul.children[ul.children.length - 1];
                                        if (!ul_child) throw "Messing up!";
                                        if (ul_child.tag == "li") {
                                            ul = ul_child;
                                            break;
                                        } else {
                                            ul = ul_child;
                                        }
                                    }
                                    ul.children.push(node);

                                    const node2 = children[i + 1];

                                    if (node2) {
                                        if (node2.tag == "text" && node2.IS_WHITESPACE) {
                                            children.splice(i + 1, 1);
                                            //i--;
                                        }

                                    }

                                    children.splice(i, 1);
                                    i--;

                                    node = PREVIOUS_NODE;
                                    break;
                            }
                    } else {
                        const node2 = children[i + 1];
                        if (node2) {
                            if (node2.tag !== "text" || !node2.IS_WHITESPACE) {
                                continue;
                            }
                        }
                    }
                }
            }
            PREVIOUS_NODE = node;
        }
    }
}

export default function es(tag, attribs, children, env, lex, meta = 0) {  
    env.off = lex.off;

    const
        FULL = !!children;

    attribs = attribs || [];
    children = (Array.isArray(children)) ? children : children ? [children] : [];

    if (children) processWickupChildren(children, env, lex);

    const presets = env.presets;

    let node = null,
        Constructor = null,
        USE_PENDING_LOAD = "";

    switch (tag) {
        case "text":
            break;
        case "filter":
        case "f":
            Constructor = FilterNode;
            break;
        case "a":
            Constructor = LinkNode;
            break;
            /** void elements **/
        case "template":
            Constructor = VoidNode;
            break;
        case "css":
        case "style":
            Constructor = StyleNode;
            break;
        case "script":
        case "js":
            Constructor = ScriptNode;
            break;
        case "svg":
        case "path":
            Constructor = SVGNode;
            break;
        case "container":
            Constructor = ContainerNode;
            break;
        case "scope":
            Constructor = ScopeNode;
            break;
        case "slot":
            Constructor = SlotNode;
            break;
        case "link":
        case "import":
            Constructor = ImportNode;
            break;
            //Elements that should not be parsed for binding points.
        case "pre":
            Constructor = PreNode;
            break;
        case "img":
            USE_PENDING_LOAD = "src";
            /* intentional */
        case "code":
        default:
            Constructor = ElementNode;
            break;
    }

    node = new Constructor(env, tag, children, attribs, presets, USE_PENDING_LOAD);

    node.wickup = meta || false;

    node.SINGLE = !FULL;


    return node;
}