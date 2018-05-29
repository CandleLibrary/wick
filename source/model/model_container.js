class ModelContainer {
    /**
    	The type of object this container holds.
    */
    constructor(schema) {
        this.schema = schema || this.constructor.schema || {};
        this.id = "";

        if (this.schema.identifier && typeof(this.schema.identifier) == "string") {
            this.id = this.schema.identifier;
        } else {
            console.error(`Wrong schema identifier type given to ModelContainer. Expected type String, got: ${typeof(this.schema.identifier)}!`, this);
        }
    }

    destructor() {
        this.schema = null;
        this.identifier = null;
    }

    get identifier() {
        return this.id;
    }

    set identifier(a) {

    }

    insert(item) {
        if (item instanceof Array) {
            var out = false;
            for (var i = 0; i < item.length; i++) {

                var model = item[i];

                if (!(model instanceof this.schema.model)) {
                    model = new this.schema.model();
                    model.add(item[i]);
                }


                if (this.__insert__(model)) {
                    out = true;
                }
            }
            return out;
        } else {
            var model = item;
            if (!(model instanceof this.schema.model)) {
                model = new this.schema.model();
                model.add(item[i]);
            }
            return this.__insert__(model);
        }
    }

    get(item) {
        if (!item) {
            return this.__getAll__();
        } else if (item instanceof Array) {
            var out = [],
                temp = null;
            for (var i = 0; i < item.length; i++)
                if ((temp = this.getAll(item[i])))
                    out.push(temp);


            return (out.length > 0) ? out : null;
        } else {
            return this.getAll(item);
        }
    }

    remove(item) {
        if (item instanceof Array) {
            var out = false;
            for (var i = 0; i < item.length; i++) {
                if (this.removeAll(item[i]))
                    out = true;
            }

            return out;
        } else {
            return this.removeAll(item);
        }
    }

    __insert__(item) {
        return false;
    }

    __get__(item) {
        return null;
    }

    __getAll__() {
        return null;
    }

    __remove__(item) {
        return false;
    }


    addView(view) {}

    checkIdentifier(item) {
        return this.checkRawID(item);
    }

    checkRawID(item) {
        return !(!item.data[this.schema.identifier]);
    }

    getIdentifier(item) {
        return item.data[this.schema.identifier];
    }
}

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

        return null;
    }

    __getAll__(item) {
        return this.data.map((d) => d.get());
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

class BinaryTreeModelContainer extends ModelContainer {

    /*
        {start} : UTF time stamp 
    */

    constructor(schema, min, max) {
        super(schema);

        this.min = min;
        this.max = max || min;

        this.left = null;
        this.right = null;

        this.id = min;
    }

    getPrev() {
        return this.min - 1;
    }

    getNext() {
        return this.max + 1;
    }

    __insert__(item, numerical_id) {

        if (this.checkIdentifier(item)) {
            if (!numerical_id)
                numerical_id = this.getIdentifier(item);


            if (numerical_id < this.min) {
                if (this.left)
                    return this.left.insert(item, numerical_id);
                else
                if (item instanceof this.constructor)
                    return this.left = item;
                else {
                    this.left = new this.constructor(this.schema, this.getPrev(), null);
                    return this.left.insert(item, numerical_id);
                }
            }

            if (numerical_id > this.max) {
                if (this.right)
                    return this.right.insert(item, numerical_id);
                else
                if (item instanceof this.constructor)
                    return this.right = item;
                else {
                    this.right = new this.constructor(this.schema, this.getNext(), null);
                    return this.right.insert(item, numerical_id);
                }
            }

            return this.__insertItem__(item, numerical_id);
        }

        return false;
    }

    __get__(item, numerical_id) {
        if (this.checkIdentifier(item)) {
            if (!numerical_id)
                numerical_id = this.getIdentifier(item);


            if (numerical_id < this.min) {
                if (this.left)
                    return this.left.__get__(item, numerical_id);
            }

            if (numerical_id > this.max) {
                if (this.right)
                    return this.right.__get__(item, numerical_id);
            }

            return this.__getItem__(item, numerical_id);
        }
    }

    __getAll__(start = -Infinity, end = Infinity) {
        var items = [];

        var a_condition = (this.min >= start) | 0;
        var b_condition = (this.max <= end) | 0;

        var c_condition = (this.min <= end) | 0;
        var d_condition = (this.max >= start) | 0;

        if (a_condition && this.left) {
            var t = this.left.__getAll__(start, end)
            items = items.concat(t);
        }

        if (c_condition && d_condition) {
            var t = this.__getAllItems__(start, end);
            items = items.concat(t);
        }

        if (b_condition && this.right) {
            var t = this.right.__getAll__(start, end)
            items = items.concat(t);
        }

        return items;
    }

    get(item) {
        if (item instanceof Array) {

            if (typeof(item[0]) == "number") {
                var items = [];

                for (var i = 0; i < item.length; i += 2) {
                    var a_val = item[i];
                    var b_val = item[i + 1];

                    if (typeof(a_val) == "number" && typeof(b_val) == "number") {
                        items = items.concat(this.__getAll__(a_val, b_val));
                    }
                }

                return items.length > 0 ? items : null;
            }
        }

        return super.get(item);
    }


    __insertItem__(item, numerical_id) {
        return false;
    }

    __removeItem__(item, numerical_id) {
        return false;
    }

    __getItem__(item) {
        return false;
    }

    __getAllItems__(start, end) {
        return null;
    }
}

export {
    ModelContainer,
    ArrayModelContainer,
    BinaryTreeModelContainer
};