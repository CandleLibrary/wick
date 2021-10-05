
import { CSSNode, CSSNodeType, CSSNodeTypeLU } from "@candlelib/css";
import { JSNode, JSNodeType, JSNodeTypeLU } from "@candlelib/js";
import URL from "@candlelib/uri";
import { createCompiledComponentClass } from "../compiler/ast-build/build.js";
import { parseSource } from "../compiler/ast-parse/source.js";
import { componentDataToCSS } from "../compiler/ast-render/css.js";
import { componentDataToHTML } from "../compiler/ast-render/html.js";
import {
    componentDataToJS,
    componentDataToJSCached,
} from "../compiler/ast-render/js.js";
import * as b_sys from "../compiler/build_system.js";
import { ComponentDataClass } from "../compiler/common/component.js";
import { css_selector_helpers } from "../compiler/common/css.js";
import { ComponentHash } from "../compiler/common/hash_name.js";

import { parse_component } from "../compiler/source-code-parse/parse.js";
import { renderWithFormatting } from "../compiler/source-code-render/render.js";
import { WickRTComponent } from "../runtime/component.js";
import { rt, WickRuntime } from "../runtime/global.js";
import { Observable } from "../runtime/observable/observable.js";
import { ObservableScheme } from "../runtime/observable/observable_prototyped.js";
import { init, WickTest as test } from "../test/wick.test.js";
import {
    BindingVariable,
    BINDING_FLAG,
    BINDING_VARIABLE_TYPE,
    ComponentData,
    DOMLiteral,
    ExtendedComponentData,
    FunctionFrame,
    HTMLNode,
    HTMLNodeClass,
    HTMLNodeTypeLU,
    IntermediateHook,
    ObservableModel,
    ObservableWatcher,
    PresetOptions
} from "../types/all.js";
// Load features. Only need side effects as the proper 
// systems will automatically register themselves through the
// build system
import { log } from './logger.js';
import { Presets } from "./wick-runtime.js";

export * from "../compiler/source-code-render/render.js";
export * from "../compiler/source-code-render/rules.js";
export {
    //Functions
    parse_component as parser,
    ComponentHash as createNameHash,
    componentDataToHTML,
    componentDataToCSS,
    componentDataToJS as componentDataToClass,
    createCompiledComponentClass as componentDataToClassString,

    //tools
    test,

    //Object Types
    PresetOptions as Presets,
    WickRTComponent as RuntimeComponent,
    WickRTComponent,
    HTMLNodeTypeLU as HTMLNodeType,
    JSNodeTypeLU,
    CSSNodeType,

    //Pure Types
    WickLibrary,
    ExtendedComponentData as ExtendedComponent,
    WickRuntime,
    ComponentData as Component,
    ComponentData,
    ObservableModel,
    ObservableWatcher,
    DOMLiteral,
    BindingVariable,
    JSNode,
    HTMLNode as HTMLNode,
    CSSNode,
    JSNodeType,
    HTMLNodeClass as HTMLNodeClass,
    FunctionFrame,
    IntermediateHook as IntermediateBinding,
    BINDING_VARIABLE_TYPE,
    BINDING_FLAG as DATA_FLOW_FLAG,

    /*Observables*/
    Observable,

};



log("\n\n----------- Initializing Wick ---------------");

log("Loading Wick build features");
/*** */
import "../compiler/features/container_features.js";
import "../compiler/features/expression_features.js";
import "../compiler/features/function_features.js";
import "../compiler/features/html_attribute_features.js";
import "../compiler/features/html_event_attribute_features.js";
import "../compiler/features/html_general_features.js";
import "../compiler/features/identifier_features.js";
import "../compiler/features/input_features.js";
import "../compiler/features/module_features.js";
import "../compiler/features/string_features.js";
import "../compiler/features/text_node_features.js";
import "../compiler/features/template_features.js";
import "../compiler/features/markdown_features.js";


await b_sys.loadFeatures();


log("Completed loading of build features");

log("------------ Wick Initialized ---------------\n\n");

/**
 * Exporting the wick compiler
 */
export interface WickCompiler {

    /**
     * Main runtime system. Accessible as a standalone module
     * wick_rt.
     */
    rt: WickRuntime,


    /**
     * Configure the global presets object with the given
     * preset options.
     */

    utils: {

        /**
         * Wrapper is a special sudo element that allows interception,
         * injection, and modification of existing components by wrapping
         * it in another component that has full access to the original 
         * component. This can be used to create adhoc component editors.
         */
        setWrapper: (url: URL | string) => Promise<void>;

        /**
         * Converts component data to a class string that can
         * be parsed by a JavaScript parser as a RuntimeComponent
         * constructor function.
         */
        componentToClassString: typeof createCompiledComponentClass;
        createNameHash: typeof ComponentHash;
        componentToClass: typeof componentDataToJS;
        /**
         * Renders a CSS stylesheet from the CSS data from a ComponentData
         * object.
         */
        componentDataToCSS: typeof componentDataToCSS;
        componentDataToClass: typeof componentDataToJS;
        componentDataToClassString: typeof createCompiledComponentClass;

        parse: {
            parser: typeof parse_component;
            render: typeof renderWithFormatting;
        };
    };

    objects: {

        /**
         * Main store of parsing and runtime objects and 
         * options.
         */
        Presets: typeof Presets;

        /**
         * Class type for runtime components
         */
        WickRTComponent: typeof WickRTComponent;

        Observable: typeof Observable;

        ObservableScheme: typeof ObservableScheme;
    };

    types: {
        DOMLiteral: DOMLiteral,
        BindingVariable: BindingVariable,
        JSNode: JSNode,
        HTMLNode: HTMLNode,
        CSSNode: CSSNode,
        CSSNodeType: typeof CSSNodeType;
        JSNodeType: typeof JSNodeTypeLU;
        HTMLNodeType: typeof HTMLNodeTypeLU;
        HTMLNodeClass: typeof HTMLNodeClass;
        VARIABLE_REFERENCE_TYPE: BINDING_VARIABLE_TYPE;
        PresetOptions: PresetOptions;
    };
}


/**
 * ==================================================================================================
 * ==================================================================================================
 * Creates an ExtendedComponentData object from a string or from data imported from a URL.
 * 
 * @param input - String with Wick source text or a URL to a file containing source text.
 * 
 * @param presets - An optional Presets object. If this is left undefined then the global 
 * presets object will be used, or a new global presets object will be created if not defined. This
 * argument is Presets object and the global presets object has not yet been set, then global presets
 * will be set to the value of this argument.
 * 
 * @returns {Promise<ComponentDataClass>}
 */
async function componentCreate(input: string | URL, presets: PresetOptions = rt.presets): Promise<ComponentDataClass> {

    // Ensure there is a presets object attached to this component.
    if (!presets)
        presets = new Presets();

    if (!rt.presets)
        rt.presets = presets;

    b_sys.enableParserFeatures();

    const { comp: comp_data } = await parseSource(input, presets);

    b_sys.disableParserFeatures();

    comp_data.presets = presets;

    return comp_data;
}

/**
 * Wick component parser and component library.
 */
type WickLibrary = typeof componentCreate & WickCompiler & WickRuntime;

/** README:USAGE
 * 
 * #### HTML - Client Side Component Rendering
 * ```ts
 * import wick from "@candlelib/wick";
 *
 * // Calls to Wick return an object that can then be used to 
 * // render components. The pending attribute allows wick to 
 * // Operate asynchronously as it gathers the resources 
 * // necessary to compile the givin component.
 * 
 * const comp_constructor: ExtendedComponentData = await wick("./local_directory/my_component.wick").pending;
 * 
 * // Runtime components can be mounted to the DOM and
 * // can update DOM content reactively based on data submitted
 * // to the component.
 * const comp: RTComponent = new comp_constructor.class();
 * 
 * comp.appendToDOM(document.body)
 * ```
 */
const wick: WickLibrary = Object.assign(componentCreate,
    <WickRuntime>rt,
    <WickCompiler>{

        css_selector_helpers,

        types: <WickCompiler["types"]><unknown>{
            CSSNodeType: CSSNodeTypeLU,
            JSNodeType: JSNodeTypeLU,
            HTMLNodeType: HTMLNodeTypeLU
        },

        rt: rt,

        root_components: [],

        get presets() { return rt.presets; },

        utils: {
            parse: {
                css_selector_helpers: css_selector_helpers,
                createNameHash: ComponentHash,
                parser: parse_component,
                render: renderWithFormatting,
            },

            server: async function (root_dir: string = "") {
                await URL.server(root_dir);
            },

            enableServer: async function (root_dir: string = "") {
                await URL.server(root_dir);
            },
            /**
             * Configure runtime components and component data objects 
             * with methods useful for testing behavior.
             */
            enableTest: init,

            setWrapper: async function (url) {
                //create new component

                if (!rt.presets)
                    rt.presets = new Presets();

                rt.presets.wrapper = await <any>wick(url);
            },

            componentToClass: componentDataToJS,

            componentToClassString: createCompiledComponentClass,

            componentDataToHTML,
            componentDataToCSS,
            componentDataToJSCached: componentDataToJSCached,
            componentDataToClass: componentDataToJS,
            componentDataToClassString: createCompiledComponentClass,
            createNameHash: ComponentHash
        },

        objects: {
            WickRTComponent,
            Presets: Presets,
            Observable,
            ObservableScheme
        },

    });


export default wick;




