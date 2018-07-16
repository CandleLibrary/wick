import { Source } from "./source"

import { Filter } from "./cassette/filter"

import { Term } from "./cassette/term"

import { MCArray, ModelContainerBase } from "../model/container/base"

import { MultiIndexedContainer } from "../model/container/multi"

import { Scheduler } from "../common/scheduler"

/**
 * Class for template.
 *
 * @class      Template (name)
 */
export class Template extends Source {

    /**
     * Constructs the object.
     *
     * @param      {Source}  parent   The Source parent object.
     * @param      {Object}  data     The data object hosting attribute properties from the HTML template. 
     * @param      {Object}  presets  The global presets object.
     * @param      {HTMLElement}  element  The element that the Source will bind to. 
     */
    constructor(parent = null, data, presets, element) {

        super(parent, data, presets, element);

        this.cases = [];
        this.activeSources = [];
        this.templates = [];
        this.filters = [];
        this.terms = [];
        this.range = null;
        this.prop_elements = [];
        this.____SCHEDULED____ = false;
    }

    /**
     * Called by Scheduler when a change is made to the Template HTML structure. 
     * 
     * @protected
     */
    scheduledUpdate() {
        for (var i = 0; i < this.activeSources.length; i++)
            this.activeSources[i].transitionIn(i);
    }

    /**
     * Filters stored Sources with search terms and outputs the matching Sources to the DOM.
     * 
     * @protected
     */
    filterUpdate() {

        let output = this.cases.slice();

        for (let l = this.filters.length, i = 0; i < l; i++) {
            //  output = this.filters[i].filter(output);
        }

        for (var i = 0; i < this.activeSources.length; i++) {
            this.ele.removeChild(this.activeSources[i].ele);
        }

        for (var i = 0; i < output.length; i++) {
            this.ele.appendChild(output[i].ele);
        }

        this.ele.style.position = this.ele.style.position;
        
        Scheduler.queueUpdate(this);

        this.activeSources = output;
    }

    /**
     * Removes stored Sources that do not match the ModelContainer contents. 
     *
     * @param      {Array}  new_items  Array of Models that are currently stored in the ModelContainer. 
     * 
     * @protected
     */
    cull(new_items) {

        if (new_items.length == 0) {

            for (let i = 0, l = this.cases.length; i < l; i++)
                this.cases[i].destroy();

            this.cases.length = 0;

        } else {

            let exists = new Map(new_items.map(e => [e, true]));

            var out = [];

            for (let i = 0, l = this.cases.length; i < l; i++)
                if (!exists.has(this.cases[i].model)) {
                    this.cases[i].destroy();
                    this.cases.splice(i, 1);
                    l--;
                    i--;
                } else
                    exists.set(this.cases[i].model, false);


            exists.forEach((v, k, m) => {
                if (v) out.push(k);
            });

            if (out.length > 0)
                this.added(out);
        }
    }

    /**
     * Called by the ModelContainer when Models have been removed from its set.
     *
     * @param      {Array}  items   An array of items no longer stored in the ModelContainer. 
     */
    removed(items) {
        for (let i = 0; i < items.length; i++) {
            let item = items[i];

            for (let j = 0; j < this.cases.length; j++) {
                let Source = this.cases[j];

                if (Source.model == item) {
                    this.cases.splice(j, 1);
                    Source.dissolve();
                    break;
                }
            }
        }

        this.filterUpdate();
    }

    /**
     * Called by the ModelContainer when Models have been added to its set.
     *
     * @param      {Array}  items   An array of new items now stored in the ModelContainer. 
     */
    added(items) {

        for (let i = 0; i < items.length; i++) {
            let Source = this.templates[0].flesh(items[i]);
            Source.parent = this;
            this.cases.push(Source);
        }

        this.filterUpdate();
    }

    revise() {
        if (this.cache)
            this.update(this.cache);
    }


    getTerms() {

        let out_terms = [];

        for (let i = 0, l = this.terms.length; i < l; i++) {
            let term = this.terms[i].term
            if (term) out_terms.push(term);

        }


        if (out_terms.length == 0)
            return null;

        return out_terms;
    }

    update(data, IMPORT = false) {

        let container = data[this.prop];

        if (container && (container instanceof ModelContainerBase || container.____self____)) {

            this.cache = data;

            let own_container = container.get(this.getTerms(), null);

            if (own_container instanceof ModelContainerBase) {
                own_container.pin();
                own_container.addView(this);
                this.cull(this.get())
            } else if (own_container instanceof MCArray) {
                this.cull(own_container)
            } else {
                own_container = data.____self____.data[this.prop]
                if (own_container instanceof ModelContainerBase) {
                    own_container.addView(this);
                    this.cull(this.get())
                }
            }
        }
    }

    get() {
        if (this.model instanceof MultiIndexedContainer) {
            if (this.data.index) {
                let index = this.data.index;

                let query = {};

                query[index] = this.getTerms();

                return this.model.get(query)[index];
            } else
                console.warn("No index value provided for MultiIndexedContainer!")
        } else {
            let source = this.model.source;
            let terms = this.getTerms();

            if (source) {
                this.model.destroy();

                let model = source.get(terms, null);

                model.pin();
                model.addView(this);
            }

            return this.model.get(terms);
        }
        return [];
    }

    transitionIn(elements, wurl) {

        let transition_time = 0;

        for (let i = 0, l = this.templates.length; i < l; i++)
            transition_time = Math.max(transition_time, this.templates[i].transitionIn(elements, wurl));

        Math.max(transition_time, super.transitionIn());

        return transition_time;
    }

    /**
        Takes as an input a list of transition objects that can be used
    */
    transitionOut(transition_time = 0, DESTROY = false) {

        for (let i = 0, l = this.templates.length; i < l; i++)
            transition_time = Math.max(transition_time, this.templates[i].transitionOut());

        Math.max(transition_time, super.transitionOut(transition_time, DESTROY));

        return transition_time;
    }

}