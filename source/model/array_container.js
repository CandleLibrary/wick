import {
    ModelContainer,
} from "./model_container"

class ArrayModelContainer extends ModelContainer {
    constructor(schema) {
        super(schema);
        this.data = [];
    }

    destructor() {

        for (var i = 0; i < this.data.length; i++) {
            this.data[i].destructor();
        }

        this.data = null;

        super.destructor();
    }

    __insert__(item) {
        if (this.checkIdentifier(item)) {
            for (var i = 0, l = this.data.length; i < l; i++) {
                var obj = this.data[i];

                if (obj.identifier == this.getIdentifier(item)) {
                    obj.add(item);
                    return true;
                }
            }

            if (item instanceof this.schema.model) {
                this.data.push(item);
                return true;
            } else if (this.schema.model) {
                var temp = new this.schema.model();
                temp.add(item);
                this.data.push(temp);
                return true;
            } else {
                console.error(`Model has not been created yet for dataset ${this.getIdentifier(item)}`, item);
            }
        }

        if (this.checkRawID(item)) {
            //Item is not a model yet
            for (var i = 0, l = this.data.length; i < l; i++) {
                var obj = this.data[i];

                if (obj.identifier == item[this.schema.identifier]) {
                    obj.add(item);
                    return true;
                }
            }

            //create a new model and push into array. 

            var model = new this.schema.model();
            model.add(item);
            this.__insert__(model);
            return true;
        }
        return false;
    }

    __get__(item) {
        if (this.checkIdentifier(item)) {
            for (var i = 0, l = this.data.length; i < l; i++) {
                var obj = this.data[i];

                if (obj.identifier == this.getIdentifier(item)) {
                    return obj.get();
                }
            }
        }

        return [];
    }

    __getAll__(item) {
        return this.data.map((d) => d.get()) || [];
    }

    __remove__(item) {
        if (this.checkIdentifier(item)) {
            for (var i = 0, l = this.data.length; i < l; i++) {
                var obj = this.data[i];

                if (obj.identifier == this.getIdentifier(item)) {

                    this.data[i].splice(i, 1);

                    return true;
                }
            }
        }

        return false;
    }
}


export {
    ArrayModelContainer
}