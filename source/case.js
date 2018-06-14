import {
    View
} from "./view"
import {
    Model
} from "./model/model"
import {
    Controller
} from "./controller"
import {
    Getter
} from "./getter"
import {
    Cassette,
    CloseCassette,
    ImportDataFromDataSet
} from "./cassette/cassette"
import {
    Form
} from "./cassette/form"
import {
    Input
} from "./cassette/input"
import {
    Filter
} from "./cassette/filter"
import {
    Exporter
} from "./cassette/exporter"
import {
    ImportQuery
} from "./cassette/import_query"
import {
    EpochToDateTime
} from "./cassette/epoch_to_dt"
import {
    Exists
} from "./cassette/exists"

let PresetCassettes = {
    raw: Cassette,
    cassette: Cassette,
    form: Form,
    input: Input,
    export: Exporter,
    iquery: ImportQuery,
    edt: EpochToDateTime,
    exists: Exists
}

class CaseParentView extends View {
    constructor(Case) {
        super();
        this.case = Case;
    }

    destructor() {
        if (this.case)
            this.case.destructor();
        super.destructor();
    }

    update(data) {
        if (this.case)
            this.case.updateFromParent(data);
    }

    updateDimensions() {
        if (this.case)
            this.case.updateDimensions();
    }
}

class Case extends View {
    /**
        Case constructor. Builds a Case object.
        @params [DOMElement] element - A DOM <template> element that contains a <case> element.
        @params [LinkerPresets] presets
        @params [Case] parent - The parent Case object, used internally to build Case's in a hierarchy
        @params [DOM]  WORKING_DOM - The DOM object that contains templates to be used to build the case objects. 
    */
    constructor(element, presets, parent = null, WORKING_DOM) {
        super();

        if (!element) {
            console.warn("No element has been supplied to this Case constructor!");
            return;
        }

        this.named_components = {};
        this.data = {};
        this.template = null;
        this.element = element;
        this.components = [];
        this.prop = null;
        this.url = null;
        this.parent_view = null;
        this.receiver = null;
        this.query = {};
        this.TEMPLATE_HANDLER = false;
        this.REQUESTING = false;
        this.cl = presets;
        this.exports = null;
        this.parent = parent;
        this.filter_list = [];

        var return_object = this;

        ImportDataFromDataSet(this.data, element.dataset);

        if (element.nodeName == "TEMPLATE") {
            this.element = document.importNode(element.content, true).children[0];
            ImportDataFromDataSet(this.data, this.element.dataset);
        }

        for (let prop in this.data) {
            if ((this.data[prop] == "" || !this.data[prop]) && parent) {
                this.data[prop] = parent.data[prop];
            }
        }

        if (this.element.tagName == "CASE") {

            var children = this.element.children;

            if (this.data.url) {
                //import query info from the wurl
                let str = this.data.url;
                let components = str.split(";");
                this.data.url = components[0];

                for (var i = 1; i < components.length; i++) {
                    let component = components[i];

                    switch (component[0]) {
                        case "p":
                            //TODO
                            this.url_parent_import = component.slice(1)
                            break;
                        case "q":
                            this.url_query = component.slice(1);
                            break;
                        case "<":
                            this.url_return = component.slice(1);
                    }
                }

            }


            if (this.data.prop)
                this.prop = this.data.prop;

            if (this.data.export)
                this.exports = this.data.export;

            if (this.data.model) {
                if (presets.models[this.data.model])
                    presets.models[this.data.model].addView(this);
            } else if (this.data.schema && presets.schemas[this.data.schema]) {

                var model = new presets.schemas[this.data.schema]();

                this.parent_view = new CaseParentView(this);

                model.addView(this);

                if (this.data.url) {
                    this.receiver = new Getter(this.data.url, this.url_return);
                    this.receiver.setModel(model);
                    this.request();
                }


                //return_object = this.parent_view;
            }

            for (var i = 0; i < children.length; i++) {
                var child = children[i];

                var component = ComponentConstructor(this, child, presets, this.named_components, this, WORKING_DOM);

                if (component)
                    this.components = this.components.concat(component);
            }

            this.setModel(this.model);

            return return_object;
        } else {
            console.warn(`Case may only be constructed out of <case></case> elements. Received a ${element} in the case constructor!`)
            return undefined;
        }
    }

    destructor() {
        this.parent = null;

        if(this.components){
            for (var i = 0; i < this.components.length; i++) {
                this.components[i].destructor();
            }
        }

        this.components = null;

        if (this.element.parentElement)
            this.element.parentElement.removeChild(this.element);

        this.element = null;

        if (this.receiver)
            this.receiver.destructor();
    }

    request(query) {
        //if (this.REQUESTING) return;


        this.receiver.get(query).then(() => {
            this.REQUESTING = false;
        });
        this.REQUESTING = true;
    }

    updateFromParent(data) {
        for (var i = 0; i < this.components.length; i++) {
            let comp = this.components[i];
            if (comp instanceof Case) {
                comp.updateFromParent(data);
            } else {
                if (comp.import_prop && data[comp.import_prop]) {
                    comp.update(data);
                }
            }
        }
    }

    update(data) {

        if (!data) {
            if (this.data_cache)
                data = this.data_cache
            else return;
        }
        this.data_cache = data;

        this.updateDimensions();

        for (var i = 0; i < this.components.length; i++) {
            let comp = this.components[i];
            if (comp instanceof Case)
                comp.updateFromParent(data);
            else
                this.components[i].update(data);
        }
        this.REQUESTING = false;

        if (this.TEMPLATE_HANDLER && this.template) {
            //components for each data element

            //This by default should be an array of Model objects
            var result = data[this.prop].get();


            for (var j = 0; j < this.filter_list.length; j++) {
                let filter = this.filter_list[j];

                result = result.filter((a) => {
                    return filter(a.get());
                });
            }


            //We should establish filtering mechanisms here to remove unneeded data.


            //Need to isolate new results from existing, and cull existing that do not match results.

            for (var j = 0; j < this.components.length; j++) {

                var component = this.components[j];

                component.destructor();
            }

            this.components.length = 0;


            for (var i = 0; i < result.length; i++) {
                //check for existing matche

                var temp_ele = document.importNode(this.template.content, true).children[0];

                var d = new Case(temp_ele, this.cl, this);

                result[i].addView(d);

                this.element.appendChild(temp_ele);

                this.components.push(d);
            }
        }
    }

    setModel(model) {

        if (this.prop && (model.schema[this.prop] instanceof Array)) {
            //This case will create sub templates from from each entry in the data array
            this.TEMPLATE_HANDLER = true;

            return;
        }

        if (this.prop && model.schema[this.prop] && model.schema[this.prop].prototype instanceof Model) {
            model = model.data[this.prop];
        }

        for (var i = 0; i < this.components.length; i++) {
            this.components[i].setModel(model);
        }


        super.setModel(model);
    }

    updateDimensions() {
        for (var i = 0; i < this.components.length; i++) {
            this.components[i].updateDimensions();
        }
    }

    close(named_components) {}

    hide() {
        this.close(this.named_components);
        this.display = this.element.style.display;
        this.element.style.display = "none";
    }

    show() {
        if (this.element.style.display == "none") {
            this.element.style.display = this.display;
        }
    }

    export (t = {}) {

        if (this.exports && this.model) {
            t[this.exports] = this.model.get()[this.exports];
        }

        if (this.parent)
            this.parent.import(t);
    }

    import (data) {

        if (this.model)
            this.model.add(data);

        this.export(data);
    }
}

function ComponentConstructor(parent, element, presets, named_list, parentCase, WORKING_DOM) {
    //Will only construct if there is a matching widget to handle the element

    var component = [];
    var cassettes = presets.cassettes;

    var class_ = element.dataset.class;
    var tag = element.tagName;

    if (element.dataset.name) {
        named_list[element.dataset.name] = element;
    }

    //Case of a Sub Case, hehe
    if (tag == "CASE") {
        var constructor = (class_ && cassettes[class_]) ?
            cassettes[class_] : Case;
        return [new constructor(element, presets, parentCase, WORKING_DOM)];
    }

    //Case of a template
    if (tag == "TEMPLATE") {
        //If the template is empty, Check the working DOM for another TEMPLATE element whose ID matches this elements first class name
        if (element.innerHTML == "") {
            let ele;

            if (ele = WORKING_DOM.getElementById(element.classList[0])) {
                ele = ele.cloneNode(true);

                for (let prop in element.dataset)
                    ele.dataset[prop] = element.dataset[prop];

                var c = new Case(ele, presets, parentCase, WORKING_DOM);
                //Import the element into the DOM tree, replacing the existing TEMPLATE element.
                var p = element.parentElement;

                p.replaceChild(c.element, element);

                return [c];
            }

        }

        if (!parent.template) parent.template = element;

        return [];
    } 

    //Case of input, if parent is form
    if (tag == "INPUT" && element.dataset.prop) {
        if (cassettes.input || PresetCassettes.input) {
            component = [new(cassettes.input || PresetCassettes.input)(parentCase, element)];
        } else {
            console.warn("Missing input constructor in presets, unable to process form data!");
        }
    } else

    //Case of form, a special case of Component
    if (tag == "FORM") {
        let form_class = PresetCassettes.form;
        if (class_ && (form_class = cassettes[class_]) && form_class.prototype instanceof Form) {
            component = [new form_class(parentCase, element)];
        } else if (cassettes.form || PresetCassettes.form) {
            component = [new(cassettes.form || PresetCassettes.form)(parentCase, element)];
        } else {
            console.warn("Missing form constructor in presets, unable to process form data!");
        }


    } else 

    //Case of Component
    if (class_ && (cassettes[class_] || PresetCassettes[class_])) {
        component = [new(cassettes[class_] || PresetCassettes[class_])(parentCase, element)];
    }
    //Continue parsing through the DOM tree.

    var children = element.children;

    for (var i = 0; i < children.length; i++) {

        var c_components = ComponentConstructor(component[0] || parent, children[i], presets, named_list, parentCase, WORKING_DOM);

        if (component) {
            component = component.concat(c_components);
        }
    }

    return component;
}

export {
    Case,
    Cassette,
    Filter,
    Form
}