import { MinTreeNode } from "@candlefw/js";
import { CSSTreeNode } from "@candlefw/css";
import { WickASTNode, WickBindingNode, WickTextNode } from "./wick_ast_node_types.js";
import URL from "@candlefw/url";
import { Lexer } from "@candlefw/wind";
import Presets from "../presets.js";
import { DOMLiteral } from "./dom_literal.js";

export interface ComponentVariable {
    name: string,
    flags: number,
    type: number;
    nlui: number;
    usage_flags: number,
    external_name: string,
    local_name: string,
    class_name: number,
    ACCESSED: number,
    ASSIGNED: boolean,
    nodes?: MinTreeNode[];
}

export const enum VARIABLE_REFERENCE_TYPE {
    INTERNAL_VARIABLE = 1,
    MODEL_VARIABLE = 16,
    API_VARIABLE = 4,
    PARENT_VARIABLE = 8,
    METHOD_VARIABLE = 2,
    GLOBAL_VARIABLE = 32,
}

export interface BindingVariable {
    internal_name: string;
    external_name: string;
    type: VARIABLE_REFERENCE_TYPE;
    class_index: number;
}

export interface FunctionFrame {
    /**
     * Any binding variable that is referenced within the function.
     */
    declared_variables: Set<string>;

    /**
     * Identifiers that have no declaration and no presence in the 
     * the global object and thus must be a binding identifier reference.
     */
    binding_ref_identifiers: { node: MinTreeNode, parent: MinTreeNode, index: number; }[];

    /**
     * Binding variable names that are read by the method.
     */
    input_names: Set<string>;

    /**
     * Binding variable names that are written to by the method. 
     */
    output_names: Set<string>;

    /**
     * Extracted source AST for this function block
     */
    ast: MinTreeNode;
    type: string;
    prev?: FunctionFrame;

    /**
     * If this frame is the first one in the frame chain
     * then it is root.
     */
    IS_ROOT: boolean;

    IS_TEMP_CLOSURE: boolean;

    /**
     * Array of bindings types that have been declared in 
     * the root frame either through a var statement or
     * from an import/export statement. 
     */
    binding_type?: Map<string, BindingVariable>
}

export interface Component {

    /**
     * Maps @***** selector strings to nodes that should be replaced with 
     * a reference or an array of references that match the selector to a
     * local HTML element or elements. 
     */
    selector_map: Map<string, MinTreeNode[]>;

    /**
     * Count of number of container tags identified in HTML 
     */
    container_count: number;

    /**
     * Child id counter;
     */
    children: number[];

    /**
     * Add new PendingBinding entry to the component.
     * @param arg 
     */
    addBinding(arg: {
        attribute_name: string,
        binding_node: MinTreeNode | WickASTNode | CSSTreeNode,
        host_node: MinTreeNode | WickASTNode | CSSTreeNode,
        html_element_index: number;
    }): void;

    /**
     * Name of a model defined in presets that will be auto assigned to the 
     * component instance when it is created.
     */
    global_model: string;

    /**
     * Functions blocks that identify the input and output variables that are consumed
     * and produced by the function. 
     */
    frames: FunctionFrame[];

    /**
     * Globally unique string identifying this particular component. 
     */
    name: string,

    /**
     * Global string identifiers for this particular component
     */
    names: string[],

    /**
     * A linkage between a binding variable and any element that is 
     * modified by the binding variable, including HTML attributes, 
     * CSS attributes, and other binding variables. 
     */
    bindings: PendingBinding[],


    /**
     * Any variable within a component that is defined a GLOBAL value that
     * may be produced as the result of the following declaration/references:
     *  - a: Declared within the top most scope of component within a var statement. 
     *  - b: Declared within a components import or export statements. 
     *  - c: Declared within a components data flow statements describing flow between 
     *       a component and its relatives. 
     *  - d: Referenced within a binding expression.  
     */
    binding_variables: Map<string, ComponentVariable>;

    ///**
    // * The original syntax tree.
    // */
    //original_ast: MinTreeNode | WickASTNode;

    /**
     * The virtual DOM as described within a component with a .html extension or with a 
     */
    HTML: DOMLiteral;

    CSS: CSSTreeNode[];

    /**
     * URL of source file for this component
     */
    location: URL;

    /**
     * Mapping between import names and hash names of components that referenced in other components. 
     */
    local_component_names: Map<string, string>;

    /**
     * Original source string.
     */
    source: string;
}

export interface BindingInfoContainer {
    node_type: string;
    type: string;
    node: MinTreeNode | WickASTNode | WickTextNode;
    index: number;
    name: string;
    dependent_variables: Set<string>;
}

export const enum BindingType {
    READ = 1,
    WRITE = 2,
    READONLY = 1,
    WRITEONLY = 2,

    READWRITE = 3
}
export interface BindingObject {
    component_variables: Set<string>;
    read_ast?: MinTreeNode;
    write_ast?: MinTreeNode;
    cleanup_ast?: MinTreeNode;
    DEBUG: boolean;
    //TODO - Determine form of an
    annotate: string;
    type: BindingType;

    pos?: Lexer;

    name?: string;
}
export interface PendingBinding {
    html_element_index: number;
    attribute_name: string;
    host_node: WickASTNode;
    binding_node: WickBindingNode;
}
export interface BindingHandler {

    priority: number;
    canHandleBinding(attribute_name: string, node_type: string): boolean;

    prepareBindingObject(attribute_name: string, binding: WickBindingNode, host_node: WickASTNode, element_index: number, component: Component, presets?: Presets): BindingObject;
}
