import { rt, WickRuntime } from "./runtime_global.js";
import { WickContainer } from "./runtime_container.js";

import Presets from "../presets";
import { makeElement, integrateElement } from "./runtime_html.js";
type BindingUpdateFunction = () => void;

/**
 * Store for all known component configurations.
 */
export const css_cache = {};
export const class_strings = {};
export const enum DATA_FLOW_FLAG {
    FROM_PARENT = 1,

    FROM_PRESETS = 2,

    FROM_OUTSIDE = 4,

    EXPORT_TO_CHILD = 8,

    EXPORT_TO_PARENT = 16,

    ALLOW_FROM_CHILD = 32,

    FROM_CHILD = 64,

    FROM_MODEL = 128
}

interface ComponentData {
    /**
     * Hash name of component
     */
    name?: string,
    /**
     * Original source string of the component
     */
    source?: string,
    /**
     * Original URL string for the component data.
     */
    location?: string;
}

export class WickRTComponent {

    ele: HTMLElement;

    protected elu: HTMLElement[];

    protected CONNECTED: boolean;

    protected presets: Presets;

    protected nlu: object;

    protected nluf: BindingUpdateFunction[];

    protected u: any;

    //Children
    protected ch: WickRTComponent[];

    //Parent Component
    protected par: WickRTComponent;

    protected ct: WickContainer[];
    /**
     * Identifier of interval watcher for non-dynamic models.
     */
    protected polling_id?: number;

    protected model: any;

    name: string;

    protected wrapper?: WickRTComponent;

    TRANSITIONED_IN: boolean;
    DESTROY_ON_TRANSITION: boolean;

    out_trs: any;

    pui: any[];
    nui: any[];

    ie: typeof integrateElement;
    me: typeof makeElement;
    up: typeof updateParent;
    uc: typeof updateChildren;
    spm: typeof syncParentMethod;
    pup: typeof updateFromChild;
    ufp: typeof updateFromParent;

    constructor(model = null, existing_element = null, wrapper = null, parent = null, default_model_name = "") {

        const presets = rt.presets;

        this.name = this.constructor.name;

        this.CONNECTED = false;

        this.nlu = {};
        this.ch = [];
        this.elu = [];
        this.ct = [];
        this.nluf = [];
        this.pui = [];
        this.nui = [];
        this.model = null;

        this.u = this.update;
        this.me = makeElement;
        this.ie = integrateElement;
        this.up = updateParent;
        this.uc = updateChildren;
        this.spm = syncParentMethod;
        this.pup = updateFromChild;
        this.ufp = updateFromParent;

        this.polling_id = -1;
        this.presets = rt.presets;

        this.par = parent;


        if (existing_element)
            this.ele = <HTMLElement>this.ie(existing_element);
        else
            this.ele = this.ce();

        this.re();

        //Create or assign global model whose name matches the default_model_name;
        if (default_model_name && !model) {
            if (!presets.models[default_model_name])
                presets.models[default_model_name] = {};
            model = presets.models[default_model_name];
        }

        if (model) this.setModel(model);

        if (wrapper) {
            this.wrapper = wrapper;
            this.ele.appendChild(this.wrapper.ele);
            this.wrapper.setModel({ comp: this });
        } else if (presets.wrapper && this.name !== presets.wrapper.name /*Prevent recursion, which will be infinite */) {
            this.wrapper = new (presets.component_class.get(presets.wrapper.name))({ comp: this });
            this.ele.appendChild(this.wrapper.ele);
        }

        try {
            this.c();
        } catch (e) {
            console.error(e);
        }

        this.onLoad();

        rt.OVERRIDABLE_onComponentCreate(this);
    }

    destructor() {

        if (this.polling_id > -1)
            clearInterval(this.polling_id);

        if (this.model) {
            if (this.model.unsubscribe)
                this.model.unsubscribe(this);
            this.model = null;
        }

        if (this.wrapper)
            this.wrapper.destructor();
    }

    re() { }

    ce(): HTMLElement {
        const template: HTMLTemplateElement = <HTMLTemplateElement>document.getElementById(this.name);

        if (template) {
            const
                doc = template.content.cloneNode(true),
                ele = <HTMLElement>doc.firstChild;

            return <HTMLElement>this.ie(ele);
        } else {
            console.warn("NO template element for component: " + this.name);
        }
    }

    setCSS(style_string) {
        if (style_string) {

            if (!css_cache[this.name]) {
                const css_ele = document.createElement("style");

                css_ele.innerHTML = style_string;

                document.head.appendChild(css_ele);

                css_cache[this.name] = css_ele;
            }

            this.ele.classList.add(this.name);
        }
    }

    appendToDOM(element, before_element = null) {

        //Lifecycle Events: Connecting <======================================================================
        this.update({ connecting: true });

        this.CONNECTED = true;

        if (before_element)
            element.insertBefore(this.ele, before_element);
        else
            element.appendChild(this.ele);

        //Lifecycle Events: Connected <======================================================================
        this.update({ connected: true });
    }

    removeFromDOM() {
        //Prevent erroneous removal of scope.
        if (this.CONNECTED == true) return;

        //Lifecycle Events: Disconnecting <======================================================================
        this.update({ disconnecting: true });

        if (this.ele && this.ele.parentElement)
            this.ele.parentElement.removeChild(this.ele);

        //Lifecycle Events: Disconnected <======================================================================
        this.update({ disconnected: true });
    }
    /* Abstract Functions */
    c() { }
    onLoad() { }
    onMounted() { }
    transitionOut(transition, DESTROY_AFTER_TRANSITION = false, transition_name = "trs_out") {

        this.CONNECTED = false;

        this.DESTROY_ON_TRANSITION = DESTROY_AFTER_TRANSITION;

        this.TRANSITIONED_IN = false;

        let transition_time = 0;

        if (this.out_trs)
            this.out_trs.trs.removeEventListener("stopped", this.out_trs.fn);

        if (transition) {
            this.update({
                [transition_name]: transition
            }/*, null, false, { IMMEDIATE: true }*/);

            const trs = transition.trs || transition;

            this.out_trs = { trs, fn: this.outTransitionStop.bind(this) };

            transition_time = trs.out_duration;

            trs.addEventListener("stopped", this.out_trs.fn);

        } else {
            if (!this.out_trs)
                this.outTransitionStop();
        }

        transition_time = Math.max(transition_time, 0);

        return transition_time;
    }

    outTransitionStop() {

        if (!this.TRANSITIONED_IN) {
            this.removeFromDOM();
            if (this.DESTROY_ON_TRANSITION) this.destructor();
            this.DESTROY_ON_TRANSITION = false;
        }

        this.out_trs = null;

        return false;
    }

    transitionIn(transition, transition_name = "trs_in") {
        if (transition)
            this.update({
                [transition_name]: transition
            }/*, null, false, { IMMEDIATE: true }*/);

        this.TRANSITIONED_IN = true;
    }

    setModel(model) {

        if (this.model) {

            if (this.polling_id > 0) {
                clearInterval(this.polling_id);
                this.polling_id = 0;
            } else {
                if (this.model.unsubscribe)
                    this.model.unsubscribe(this);
            }
        }

        this.model = model;

        if (model.subscribe)
            model.subscribe(data => {
                this.update(data);
            });

        else {

            //Create a polling monitor
            if (this.polling_id <= 0)
                this.polling_id = <number><unknown>setInterval(updateModel.bind(this), 10);

            updateModel.call(this);
        }
    }

    update(data, flags: number = 0, IMMEDIATE: boolean = false) {

        const update_indices: Set<number> = new Set;

        for (const name in data) {

            if (typeof (data[name]) !== "undefined") {

                const val = this.nlu[name];

                if (((val >> 24) & flags)) {

                    const index = val & 0xFFFFFF;

                    this[index] = data[name];

                    update_indices.add(index);

                    let i = 0;
                }
            }
        }

        for (const index of update_indices.values())
            this.nluf[index].call(this, this[index], DATA_DIRECTION.DOWN);


    }
}


const enum DATA_DIRECTION {
    DOWN = 1,
    UP = 2
}

function updateChildren(data, flags) {

    for (const name in data) {

        if (typeof data[name] == "undefined") {

            let i = 0;

            for (const chup of this.chups) {

                if (chup[name])
                    this.ch[i].update({ [chup[name]]: data[name] }, flags | DATA_FLOW_FLAG.FROM_PARENT);
                i++;
            }
        }
    }
}

function updateParent(data) {
    if (this.par)
        updateFromChild.call(this.par, data);
}

function updateFromParent(local_index, v, flags) {

    if (flags >> 24 == this.ci + 1)
        return;

    this["u" + local_index](v, DATA_FLOW_FLAG.FROM_PARENT | flags);
}

function syncParentMethod(this_index, parent_method_index, child_index) {

    this.ci = child_index;

    this.pui[this_index] = this.par["u" + parent_method_index];
}


function updateFromChild(local_index, val, flags) {

    const method = this.pui[local_index];

    if (typeof method == "function")
        method.call(this.par, val, flags | DATA_FLOW_FLAG.FROM_CHILD | ((this.ci + 1) << 24));

};

function updateModel() {
    // Go through the model's props and test whether they are different then the 
    // currently cached variables
    const model = this.model;

    for (const name in this.nlu) {

        if ((this.nlu[name] >>> 24) & DATA_FLOW_FLAG.FROM_MODEL) {
            const index = this.nlu[name] & 0xFFFFFF;
            const v = this[index];

            if (model[name] !== undefined && model[name] !== v)
                this.update({ [name]: model[name] }, DATA_FLOW_FLAG.FROM_MODEL);
        }
    }
}