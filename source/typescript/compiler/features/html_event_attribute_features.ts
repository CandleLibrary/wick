import { JSNode, JSNodeType, stmt } from '@candlelib/js';
import {
    HTMLAttribute, HTMLNodeType,
    IndirectHook
} from "../../types/all.js";
import { registerFeature } from './../build_system.js';
import { getListOfUnboundArgs } from './container_features.js';

registerFeature(

    "CandleLibrary WICK: HTML on<Event> Attributes",
    (build_system) => {

        const OnEventHook = build_system.registerHookType("on-event-hook", JSNodeType.StringLiteral);

        build_system.registerHTMLParserHandler<HTMLAttribute>(
            {
                priority: 10,

                async prepareHTMLNode(node, host_node, host_element, index, skip, component, presets) {



                    if (node.name.slice(0, 2) == "on") {

                        // Process the primary expression for Binding Refs and static
                        // data
                        const ast = await build_system.processBindingAsync(node.value, component, presets);

                        // Create an indirect hook for container data attribute

                        build_system.addIndirectHook(component, OnEventHook, { action: node.name.slice(2), nodes: [ast] }, index);

                        // Remove the attribute from the container element

                        return null;

                    }
                }
            }, HTMLNodeType.HTMLAttribute
        );


        build_system.registerHookHandler<IndirectHook<{ nodes: [JSNode], action: string; }>, JSNode | void>({

            name: "On Event Hook",

            types: [OnEventHook],

            verify: () => true,

            buildJS: (node, comp, presets, element_index, _1, addInit) => {
                // Replace the value with a 
                // Get the on* attribute name
                const
                    { action, nodes: [ast] } = node.value[0];

                let arrow_argument_match = new Array(1).fill(null), s = null;

                if (getListOfUnboundArgs(ast, comp, arrow_argument_match, build_system)) {
                    s = stmt(`this.attachListener(${element_index}, "${action}", ${arrow_argument_match[0].value}=>a)`);
                } else {
                    s = stmt(`this.attachListener(${element_index}, "${action}", _=>a)`);
                }

                s.nodes[0].nodes[1].nodes[2].nodes[1] = ast;

                addInit(s);
            },

            buildHTML: (node, comp, presets, model) => null
        });
    }
);