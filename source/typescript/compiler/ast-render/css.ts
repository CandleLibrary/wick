import { traverse } from "@candlelib/conflagrate";
import { CSSNode, CSSNodeType } from "@candlelib/css";
import { CSSSelectorNode } from "@candlelib/css/build/types/types/node";
import { ComponentData, ComponentStyle } from "../../types/all.js";
import { getElementAtIndex } from "../common/html.js";
import { parse_css_selector } from "../source-code-parse/parse.js";
import { renderWithFormatting } from "../source-code-render/render.js";

export function UpdateSelector(node: CSSNode, name, class_selector: CSSSelectorNode) {

    node.selectors = node.selectors.map(s => {

        let HAS_ROOT = false;
        const ns = { ast: null };

        for (const { node, meta: { replace } } of traverse(s, "nodes")
            .makeReplaceable()
            .extract(ns)
        ) {

            switch (node.type) {
                case CSSNodeType.TypeSelector:
                    const val = (<any>node).nodes[0].val;
                    if (val == "root") {
                        const obj = Object.assign({}, class_selector, { pos: node.pos });
                        replace(obj);
                        HAS_ROOT = true;
                    } else if (val == "body") {
                        HAS_ROOT = true;
                    }
                default:
                    break;
            }
        }

        if (!HAS_ROOT) {
            const ns = parse_css_selector(`.${name} ${renderWithFormatting(s)}`);
            ns.pos = s.pos;
            return ns;
        }

        return ns.ast;
    });

}

export function componentToMutatedCSS(css: ComponentStyle, component?: ComponentData): CSSNode {

    const r = { ast: null };

    const host_ele = getElementAtIndex(component, css.container_element_index);

    let class_selector = null;

    const name = component.name;

    if (host_ele?.component_name && host_ele != component.HTML) {
        const expat_node = host_ele.attributes.find(([name]) => name == "expat");

        class_selector = parse_css_selector(`${host_ele.tag_name}[expat="${expat_node[1]}"]`);
    } else
        class_selector = parse_css_selector(`.${name}`);

    for (const { node, meta: { replace } } of traverse(css.data, "nodes")
        .filter("type", CSSNodeType.Rule)
        .makeReplaceable()
        .extract(r)
    ) {
        const copy = Object.assign({}, node);

        if (component)
            UpdateSelector(copy, name, class_selector);

        replace(copy);
    }

    return <CSSNode>r.ast;
}

export function getCSSStringFromComponentStyle(css: ComponentStyle, component?: ComponentData) {
    return css.data ? renderWithFormatting(componentToMutatedCSS(css, component)) : "";
}

export function componentDataToCSS(component: ComponentData): string {

    // Get all css data from component and it's children,
    // Include pure CSS components (components that only have CSS data),
    // in the main components context.

    return component.CSS.map(c => getCSSStringFromComponentStyle(c, component))
        .join("\n");
}
