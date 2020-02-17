import { EXPORT, Tap } from "../tap/tap.js";
import { types } from "@candlefw/js";
export class IOBase {

    get type () { return "IOBase"}

    constructor(parent, element = null) {

        this.parent = null;
        this.ele = element;

        if(parent instanceof Tap || parent instanceof IOBase)
            parent.addIO(this);
    }

    discardElement(ele){
        if(this.parent)
            this.parent.discardElement(ele);
    }

    destroy() {
        if(this.parent)
            this.parent.removeIO(this);

        this.parent = null;
    }

    init(default_val){
        ((default_val = (this.parent.value || default_val))
            && this.down(default_val));
    }

    down() {}

    up(value, meta) { this.parent.up(value, meta); }

    //For IO composition.
    set data(data) { this.down(data) }

    addIO(child) {
        this.ele = child;
        child.parent = this;
    }

    removeIO() {
        this.ele = null;
    }

    toString(eles){
        return "";
    }

    getTapDependencies(dependencies = []){
        if(this.parent instanceof Tap)
            dependencies.push(this.parent.prop);
        if(this.ele instanceof IOBase)
            this.ele.getTapDependencies(dependencies);
        return dependencies;
    }
}

/**
 *   The IO is the last link in the Scope chain. It is responsible for putting date into the DOM through the element it binds to. Alternativly, in derived versions of `IO`, it is responsible for retriving values from user inputs from input elements and events.
 *   @param {Scope} tap - The tap {@link Scope}, used internally to build a hierarchy of Scopes.
 *   @param {Object} data - An object containing HTMLELement attribute values and any other values produced by the template parser.
 *   @param {Presets} presets - An instance of the {@link Presets} object.
 *   @param {HTMLElement} element - The HTMLElement that the IO will _bind_ to.
 *   @memberof module:wick.core.scope
 *   @alias IO
 *   @extends IOBase
 */
export class IO extends IOBase {

    get type () { return "IO"}

    static stamp(scope, binding, default_val){
        
    }

    constructor(scope, errors, tap, element = null, default_val = null) {

        super(tap, element);
        //Appending the value to a text node prevents abuse from insertion of malicious DOM markup. 

        this.argument = null;

       // if (default_val) this.down(default_val);
    }

    destroy() {
        this.ele = null;
        super.destroy();
    }

    down(value) {
        this.ele.data = value;
    }

    toString(eles){
        return `${eles.getElement(this.ele)}.data = ${this.parent.prop}`;
    }
}

class RedirectAttribIO extends IOBase {

    static stamp(scope, binding, default_val){
        
    }
    constructor(scope, down_tap, up_tap) {
        super(down_tap);
        this.up_tap = up_tap;
    }

    down(value) {
        this.up_tap.up(value);
    }

    toString(eles){
        return `${eles.getElement(this.ele)}.data = ${this.parent.prop}`;
    }
}

/**
    This IO object will update the attribute value of the watched element, using the "prop" property to select the attribute to update.
*/
export class AttribIO extends IOBase {

    get type () { return "AttribIO"}
    
    constructor(scope, binding, tap, attr, element, default_val) {
        /*
        if (element.io) {
            let down_tap = element.io.parent;
            let root = scope.parent;
            tap.modes |= EXPORT;
            return new RedirectAttribIO(scope, element.io.parent, tap);
        }
        */

        super(tap, element);


        this.binding = binding;
        this.attrib = attr;
        this.ele.io = this;

        this.init(default_val);
    }

    destroy() {
        this.ele = null;
        this.attrib = null;
        super.destroy();
    }

    /**
        Puts data into the watched element's attribute. The default action is to simply update the attribute with data._value_.  
    */
    down(value) {
        this.ele.setAttribute(this.attrib, value);
    }

    toString(eles){
        return `${eles.getElement(this.ele)}.setAttribute(${this.attrib}, ${this.parent.prop})`;
    }

    set data(v) {
        this.down(v);
    }

    get data() {

    }
}

export class DataNodeIO extends IOBase {

    get type () { return "DataNodeIO"}

    constructor(scope, tap, element, default_val) {
        if(!tap)  return {};

        super(tap, element);
    }

    destroy() {
        this.ele = null;
        this.attrib = null;
        super.destroy();
    }

    down(value) {
        
        this.ele.data = value;
    }
}

export class ContainerLinkIO extends DataNodeIO {
    get type () { return "ContainerLinkIO"}
}

/**
    This io updates the value of a TextNode or it replaces the TextNode with another element if it is passed an HTMLElement
*/
export class TextNodeIO extends DataNodeIO {

    get type () { return "TextNodeIO"}

    constructor(scope, tap, element, default_val) {
        if(!tap) return {};

        super(scope, tap, element, default_val);
        
        this.ELEMENT_IS_TEXT = element instanceof Text;

        this.init(default_val);
    }
    
    down(value) {

        const ele = this.ele;

        /* 
            This IO will append document nodes to the DOM if it receives an actual object, 
            which can only happen programatically. Strings containing markup will 
            be simply passed into the existing TextNode's data property and will display
            as text on client displays.
        */
        if (value instanceof Node) {
            if (value !== this.ele) {
                this.ELEMENT_IS_TEXT = false;
                this.ele = value;
                ele.parentElement.replaceChild(value, ele);
                /* 
                Need to make sure elements are properly removed from the DOM
                */
                this.discardElement(ele);  
            }
        } else {

            if (!this.ELEMENT_IS_TEXT) {
                this.ELEMENT_IS_TEXT = true;
                this.ele = new Text();
                ele.parentElement.replaceChild(this.ele, ele);
                this.discardElement(ele);
            }

            this.ele.data = value;
        }
    }

    toString(eles) {
        return `${eles.getElement(this.ele)}.setAttribute(${this.attrib}, ${this.parent.prop})`;
    }
}

export class EventIO extends IOBase {

    get type() { return "EventIO" }

    constructor(scope, binding, tap, attrib_name, element, default_val) {

        let down_tap = tap;

        /*  
            If there is a default, where ((up)(down = default_value)), then change the tap binding
            to either null if the default value is a literal of some type, or to a known
            tap if the default value is an identifier. If the element is an <input>,
            and the default value is an identifier with the value of "value", 
            then leave down tap blank, and let the Browser automatically assign 
            value to the element. 
        */
        if (default_val) {
            if (typeof default_val == "string")
                if (default_val == "value" && (element.tagName == "TEXTAREA" || element.tagName == "INPUT")) {
                    down_tap = null;
                } else {
                    down_tap = scope.getTap(default_val.name);
                }
            else down_tap = default_val;
        }


        super(down_tap);

        this.binding = binding;

        this.ele = element;

        this.up_tap = tap;

        this.val = null;

        const up_tap = this.up_tap;

        const PreventPropagation = (attrib_name.slice(-1) == "_");

        if (PreventPropagation)
            attrib_name = attrib_name.slice(0, -1);

        this.event = (e) => {

            if(down_tap && down_tap.down) //Prime the val property if possible
                down_tap.down(null, {IMMEDIATE:true});


            up_tap.up(this.val || e.target.value, { event: e });

            if (PreventPropagation) {
                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation();
                return false;
            }
        };

        this.event_name = attrib_name.replace("on", "");

        this.ele.addEventListener(this.event_name, this.event);
    }

    destroy() {
        this.ele.removeEventListener("input", this.event);
        this.ele = null;
        this.event = null;
        this.event_name = null;
        this.attrib = null;
        super.destroy();
    }

    down(value) {
        this.val = value;
    }

    getTapDependencies(dependencies = []) {
        if (this.parent instanceof Tap)
            dependencies.push(this.parent.prop);
        else {
            dependencies.push(this.up_tap.prop);
            return this.parent.getTapDependencies(dependencies);
        }
        return dependencies;
    }
}

export class InputIO extends IOBase {

    get type () { return "InputIO"}

    constructor(scope, errors, tap, attrib_name, element, default_val) {

        if(tap)
            super(tap);
        else if(default_val)
            super(scope);
        else
            return null;

        this.ele = element;
        this.event = null;

        this.up_tap = tap;

        let up_tap = tap;

        if(default_val){
            switch(default_val.type){
                case types.identifier:
                    up_tap = scope.getTap(default_val.name);
                break;
                case types.null_literal:
                    up_tap = null;
                break;
            }
        }

        if(up_tap){
            if (element.type == "checkbox")
                this.event = (e) => { up_tap.up(e.target.checked, { event: e }) };
            else
                this.event = (e) => { up_tap.up(e.target.value, { event: e }) };
            
            this.ele.addEventListener("input", this.event);
        }
    }

    destroy() {
        this.ele.removeEventListener("input", this.event);
        this.ele = null;
        this.event = null;
        this.attrib = null;
        super.destroy();
    }

    down(value) {
        this.ele.value = value;
    }
}
