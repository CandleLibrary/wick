export default class d {

    //Registers the component as a Web Component.
    //Herafter the Web Component API will be used to mount this component. 
    register(bound_data_object) {

        if (!this.name)
            throw new Error("This component has not been defined with a name. Unable to register it as a Web Component.");

        if (customElements.get(this.name))
            console.trace(`Web Component for name ${this.name} has already been defined. It is now being redefined.`);

        customElements.define(
            this.name,
            d.web_component_constructor(this, bound_data_object), {}
        );
    }

    //Mounts component data to new HTMLElement object.
    async mount(HTMLElement_, data_object, USE_SHADOW, parent_scope) {

        if (this.READY !== true) {
            if (!this.__pending)
                this.__pending = [];

            return new Promise(res => this.__pending.push([false, HTMLElement_, data_object, USE_SHADOW, parent_scope,  res]));
        }

        return this.nonAsyncMount(HTMLElement_, data_object, USE_SHADOW, parent_scope);
    }

    nonAsyncMount(HTMLElement_, data_object = null, USE_SHADOW, parent_scope = null) {
        let element = HTMLElement_;

        if (USE_SHADOW == undefined)
            USE_SHADOW = this.ast.presets.options.USE_SHADOW;

        if ((HTMLElement_ instanceof HTMLElement) && USE_SHADOW) {
            //throw new Error("HTMLElement_ argument is not an instance of HTMLElement. Cannot mount component");

            element = HTMLElement_.attachShadow({ mode: 'open' });
        }
        
        const scope = this.ast.mount(element, parent_scope);

        scope.load(data_object);

        return scope;
    }

    connect(h, b) { return this.mount(h, b) }
}

d.web_component_constructor = function(wick_component, bound_data) {
    return class extends HTMLElement {
        constructor() {
            super();
            wick_component.mount(this, bound_data);
        }
    };
};