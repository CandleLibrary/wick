import html from "@candlefw/html";
import spark from "@candlefw/spark";

import { componentDataToTempAST, componentDataToHTML } from "../../build/library/component/compile/component_data_to_html.js";
import { hydrateComponentElements } from "../../build/library/runtime/runtime_html.js";

export function getInstanceHTML(comp, presets) {
    return componentDataToTempAST(comp, presets).html[0];
}

export function getRenderedHTML(comp, presets) {
    return componentDataToHTML(comp, presets).html;
}

export function createComponentInstance(comp, presets, model = null) {
    const ele = html(getRenderedHTML(comp, presets));

    const components = hydrateComponentElements([ele]);

    for (const r of components)
        r.hydrate();
    const runtime_component = components.pop();
    // spark.update();
    spark.update();

    return runtime_component;
}

function getAttribute(ele, k) {
    if (ele.getAttribute)
        return ele.getAttribute(k);

    if (ele.attributes) {
        if (ele.attributes instanceof Map)
            return ele.attributes.get(k);

        else if (Array.isArray(ele.attributes))
            for (const [key, v] of ele.attributes)
                if (k == key) return v;
    }
}

export function assertTree(tree, ele, prev_name = "") {
    let OPEN_TEST = false;
    try {


        if (tree.t) {
            if (prev_name)
                prev_name += "" + tree.t;
            else
                prev_name = tree.t;

            harness.pushTestResult();
            harness.pushName(`Expect ele tag [${ele?.tagName?.toLowerCase().trim()}] == [${prev_name}]`);
            harness.pushAndAssertValue(
                harness.shouldEqual(tree.t.toLowerCase().trim(), ele?.tagName?.toLowerCase().trim())
                && harness.shouldHaveProperty(ele, "tagName"));
            harness.popTestResult();
            harness.popName();
        } else if (prev_name)
            prev_name += "{}";
        else
            prev_name = "{}";

        if (tree.a)
            for (const [k, v] of tree.a)
                if (k) {
                    harness.pushTestResult();
                    harness.pushName(`Element attribute ${prev_name}::[${k}] is present`);
                    harness.pushAndAssertValue(harness.shouldNotEqual(getAttribute(ele, k), undefined));
                    harness.popTestResult();
                    harness.popName();
                    if (v) {
                        harness.pushTestResult();
                        harness.pushName(`Element attribute ${prev_name}::[${k}=${getAttribute(ele, k)}] == ${v} `);
                        harness.pushAndAssertValue(harness.shouldEqual(getAttribute(ele, k), v));
                        harness.popTestResult();
                        harness.popName();
                    }
                }

        if (tree.d || tree.d == "") {
            harness.pushTestResult();
            harness.pushName(`Expect [${prev_name}=="${ele.data.trim()}"] == "${tree.d.trim()}"`);
            harness.pushAndAssertValue(harness.shouldEqual(ele.data.trim(), tree.d.trim()));
            harness.popTestResult();
            harness.popName();
        }

        if (tree.c) {
            const children = ele.childNodes || ele.children;
            for (let i = 0; i < tree.c.length; i++) {
                if (tree.c[i])
                    assertTree(tree.c[i], children[i], prev_name + `>${1 + i}:`);
            }
        }

    } catch (e) {
        harness.pushTestResult();
        harness.pushName(`Error encountered when comparing ${JSON.stringify(tree)}`);
        harness.addException(e);
        harness.popTestResult();
        harness.popName();
    }

}