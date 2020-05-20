import { MinTreeNodeType, exp, stmt } from "@candlefw/js";
import { BindingObject, Component, BindingType } from "../types/types.js";
import { getGenericMethodNode } from "./js_ast_tools.js";
import { binding_handlers } from "./default_binding_handlers.js";
import { WickASTNodeType } from "../types/wick_ast_node_types.js";
import { DATA_FLOW_FLAG } from "../runtime/component_class.js";
import Presets from "./presets.js";
import { VARIABLE_REFERENCE_TYPE } from "./set_component_variable.js";

function createBindingName(binding_index_pos: number) {
    return `b${binding_index_pos.toString(36)}`;
}

export async function processBindings(component: Component, presets: Presets) {

    const {
        class_methods,
        class_cleanup_statements: clean_stmts,
        class_initializer_statements: initialize_stmts,
        pending_bindings,
        nluf_arrays
    } = component,

        registered_elements: Set<number> = new Set,

        bindings: BindingObject[] = [],

        binding_inits = [];

    let
        binding_count = 0;


    for (const pending_binding of pending_bindings) {

        binding_count++;

        for (const handler of binding_handlers) {

            if (
                handler.canHandleBinding(
                    pending_binding.attribute_name,
                    WickASTNodeType[pending_binding.host_node.type]
                )
            ) {

                const
                    index = pending_binding.html_element_index,

                    binding = await handler.prepareBindingObject(
                        pending_binding.attribute_name,
                        pending_binding.binding_node,
                        pending_binding.host_node,
                        index,
                        component,
                        presets
                    );

                if (!binding) continue;

                const { read_ast, write_ast, cleanup_ast, init_ast, type, DEBUG, annotate, component_variables }
                    = binding;


                binding.pos = pending_binding.binding_node.pos;

                binding.name = createBindingName(binding_count);

                bindings.push(binding);

                const { name: binding_name } = binding;

                /**
                 * register this binding's element if it has not already been done.
                 */
                if (index > -1 && !registered_elements.has(index)) {
                    initialize_stmts.push(stmt(`c.e${index}=c.elu[${index}]`));
                    registered_elements.add(index);
                }


                if (type & BindingType.WRITE && write_ast) {

                    if (component_variables.size > 1) {
                        //Create binding update method.

                        const method = getGenericMethodNode(binding_name, "", "const c = this; let n;"),
                            [, , body] = method.nodes,
                            { nodes: [, let_stmt] } = body;

                        let_stmt.nodes.length = 0;

                        for (const name of component_variables.values()) {

                            if (!component.variables.has(name))
                                throw (binding.pos.errorMessage(`missing global variable for ${name}`));

                            const { class_name, nlui } = component.variables.get(name);

                            let_stmt.nodes.push(exp(`${name}=c[${class_name}]`));

                            if (nlui > -1) {
                                nluf_arrays[nlui].push(exp(`c.${binding_name}`));
                            }

                            body.nodes.push(stmt(`if(c[${class_name}]==undefined)return 0;`));
                        }

                        body.nodes.push(write_ast);

                        class_methods.push(method);
                    }
                }

                if (type & BindingType.READ && read_ast) {

                    //for (const { node, meta: { mutate } } of traverse(read_ast, "nodes").makeMutable()) {
                    //
                    //    if (node.type == MinTreeNodeType.IdentifierReference) {
                    //        node.value = setVariableName(node.value, component);
                    //    }
                    //}

                    binding_inits.push(read_ast);
                }

                if (cleanup_ast) {

                    // for (const { node, meta: { mutate } } of traverse(cleanup_ast, "nodes").makeMutable())
                    //     if (node.type == MinTreeNodeType.IdentifierReference)
                    //         node.value = setVariableName(node.value, component);

                    clean_stmts.push(cleanup_ast);
                }
                break;
            }

        }
    }

    initialize_stmts.push(...binding_inits);

    let id = 0;


    for (const v of component.variables.values()) {


        if (v.type & VARIABLE_REFERENCE_TYPE.API_VARIABLE) {
            //console.log({ v });
        } else {


        }

        const { local_name, class_name, ACCESSED, ASSIGNED } = v, output = [];

        if (ASSIGNED) {

            // In here, update any binding that rely on this and only this value. If there
            // are bindings that need a tuple of variables in order to activate,
            // create a binding update function and add a call to that method here. 
            const method = getGenericMethodNode("u" + class_name, "v,f = 0", `var c = this; c[${class_name}] = v;`),

                [, args, body] = method.nodes;

            //body.nodes.length = 0;

            for (const binding of bindings) {

                if (
                    (binding.type & BindingType.WRITE)
                    && binding.component_variables.has(local_name)
                )

                    if (binding.component_variables.size <= 1) {

                        //  for (const { node, meta: { mutate } } of traverse(binding.write_ast, "nodes").makeMutable())
                        //      if (node.type == MinTreeNodeType.IdentifierReference)
                        //          node.value = setVariableName(node.value, component);

                        body.nodes.push({
                            type: MinTreeNodeType.ExpressionStatement,
                            nodes: [binding.write_ast],
                            pos: binding.pos
                        });

                    } else {
                        // Need to update the binding method for a multi
                        // dependency binding.
                        body.nodes.push(stmt(`this.${binding.name}()`));
                    }
            }

            if (v.usage_flags & DATA_FLOW_FLAG.EXPORT_TO_CHILD) {
                // body.nodes.push(stmt(`c.uc({"${original_name}":c[${class_name}]});`));
            }

            if (v.usage_flags & DATA_FLOW_FLAG.EXPORT_TO_PARENT) {
                body.nodes.push(stmt(`/*if(!(f&${DATA_FLOW_FLAG.FROM_PARENT}))*/c.pup(${class_name}, v, f);`));
            }

            if (body.nodes.length == 2) {
                args.nodes.length = 1;
                body.nodes[1].nodes[0].nodes[0].nodes[0].value = "this";
                body.nodes[0] = body.nodes[1];
                body.nodes.length = 1;
            }

            class_methods.push(method);
        }
    }
}