import {
    ModelContainer,
    MCArray
} from "./model_container"

class BTreeModelContainer extends ModelContainer {

    constructor(schema) {

        super(schema);

        this.root = null;
        this.min = 10;
        this.max = 20;
    }

    destructor() {

        this.root.destructor();

        super.destructor();
    }

    __defaultReturn__() {
        if (this.source) return new MCArray;

        let n = new BTreeModelContainer(this.schema);

        this.__link__(n);

        return n;
    }

    __insert__(model, add_list, identifier) {

        if (!this.root)
            this.root = new BtreeNode(true);

        this.root = this.root.insert(identifier, model, this.max, true).newnode;

        if (add_list) add_list.push(model);
    }

    __get__(terms, __return_data__, UNWRAPPED = false) {

        if (this.root && terms.length > 0) {
            if (terms.length == 1) {
                this.root.get(parseFloat(terms[0]), parseFloat(terms[0]), __return_data__, UNWRAPPED);
            } else if (terms.length < 3) {
                this.root.get(parseFloat(terms[0]), parseFloat(terms[1]), __return_data__, UNWRAPPED);
            } else {
                for (let i = 0, l = terms.length - 1; i > l; i += 2)
                    this.root.get(parseFloat(terms[i]), parseFloat(terms[i + 1]), __return_data__, UNWRAPPED);
            }
        }

        return __return_data__;
    }

    __remove__(terms) {
        let result = false;

        if (this.root && terms.length > 0) {
            if (terms.length == 1) {
                let o = this.root.remove(terms[0], terms[0], true, this.min);
                result = (o.out) ? true : result;
                this.root = o.out_node;
            } else if (terms.length < 3) {
                let o = this.root.remove(terms[0], terms[1], true, this.min);
                result = (o.out) ? true : result;
                this.root = o.out_node;
            } else {
                for (let i = 0, l = terms.length - 1; i > l; i += 2) {
                    let o = this.root.remove(terms[i], terms[i + 1], true, this.min);
                    result = (o.out) ? true : result;
                    this.root = o.out_node;
                }
            }
        }

        return result;
    }

    __getAll__(__return_data__, UNWRAPPED = false) {
        if (this.root)
            this.root.get(-Infinity, Infinity, __return_data__, UNWRAPPED);
        return __return_data__;
    }

    __removeAll__() {
        if (this.root)
            this.root.destructor();
        this.root = null;
    }


}

class BtreeNode {
    constructor(IS_LEAF = false) {
        this.LEAF = IS_LEAF;
        this.nodes = [];
        this.keys = [];
    }

    destructor() {

        this.nodes = null;
        this.keys = null;

        if (!this.LEAF) {
            for (let i = 0, l = this.nodes.length; i < l; i++)
                this.nodes[i].destructor();
        }

    }

    balanceInsert(max_size, IS_ROOT = false) {
        if (this.keys.length >= max_size) {
            //need to split this up!

            let newnode = new BtreeNode(this.LEAF);

            let split = (max_size >> 1) | 0;

            let key = this.keys[split];

            let left_keys = this.keys.slice(0, split);
            let left_nodes = this.nodes.slice(0, (this.LEAF) ? split : split + 1)

            let right_keys = this.keys.slice((this.LEAF) ? split : split + 1);
            let right_nodes = this.nodes.slice((this.LEAF) ? split : split + 1);

            newnode.keys = right_keys;
            newnode.nodes = right_nodes;

            this.keys = left_keys;
            this.nodes = left_nodes;

            if (IS_ROOT) {

                let root = new BtreeNode();

                root.keys.push(key);
                root.nodes.push(this, newnode);

                return {
                    newnode: root,
                    key: key
                };
            }

            return {
                newnode: newnode,
                key: key
            }
        }

        return {
            newnode: this,
            key: 0
        };
    }

    /**
        Inserts model into the tree, sorted by identifier. 
    */
    insert(identifier, model, max_size, IS_ROOT = false) {

        let l = this.keys.length;

        if (!this.LEAF) {

            for (var i = 0; i < l; i++) {

                let key = this.keys[i];

                if (identifier < key) {
                    let node = this.nodes[i];

                    let o = node.insert(identifier, model, max_size);
                    let keyr = o.key;
                    let newnode = o.newnode;

                    if (keyr == undefined) debugger

                    if (newnode != node) {
                        this.keys.splice(i, 0, keyr);
                        this.nodes.splice(i + 1, 0, newnode);
                    }

                    return this.balanceInsert(max_size, IS_ROOT);
                }
            }

            let node = this.nodes[i];

            let {
                newnode,
                key
            } = node.insert(identifier, model, max_size);

            if (key == undefined) debugger

            if (newnode != node) {
                this.keys.push(key);
                this.nodes.push(newnode);
            }

            return this.balanceInsert(max_size, IS_ROOT);

        } else {

            for (let i = 0, l = this.keys.length; i < l; i++) {
                let key = this.keys[i];

                if (identifier == key) {
                    this.nodes[i].add(key);
                    return {
                        newnode: this,
                        key: identifier
                    };
                } else if (identifier < key) {

                    this.keys.splice(i, 0, identifier);
                    this.nodes.splice(i, 0, model);

                    return this.balanceInsert(max_size, IS_ROOT);
                }
            }

            this.keys.push(identifier);
            this.nodes.push(model);

            return this.balanceInsert(max_size, IS_ROOT);
        }

        debugger

        return {
            newnode: this,
            key: identifier
        };
    }

    balanceRemove(index, min_size) {
        let left = this.nodes[index - 1];
        let right = this.nodes[index + 1];
        let node = this.nodes[index];

        //Left rotate
        if (left && left.keys.length > min_size) {

            let lk = left.keys.length;
            let ln = left.nodes.length;

            node.keys.unshift((node.LEAF) ? left.keys[lk - 1] : this.keys[index - 1]);
            node.nodes.unshift(left.nodes[ln - 1]);

            this.keys[index - 1] = left.keys[lk - 1];

            left.keys.length = lk - 1;
            left.nodes.length = ln - 1;

            return false;
        } else
        //Right rotate
        if (right && right.keys.length > min_size) {

            node.keys.push((node.LEAF) ? right.keys[0] : this.keys[index]);
            node.nodes.push(right.nodes[0]);

            right.keys.splice(0, 1);
            right.nodes.splice(0, 1);

            this.keys[index] = (node.LEAF) ? right.keys[1] : right.keys[0];
            
            return false;

        } else {

            //Left or Right Merge
            if (!left) {
                index++;
                left = node;
                node = right;
            }

            let key = this.keys[index - 1];
            this.keys.splice(index - 1, 1);
            this.nodes.splice(index, 1);

            left.nodes = left.nodes.concat(node.nodes);
            if (!left.LEAF) left.keys.push(key)
            left.keys = left.keys.concat(node.keys);


            if (left.LEAF)
                for (let i = 0; i < left.keys.length; i++)
                    if (left.keys[i] != left.nodes[i].id)
                        debugger;

            return true;
        }

    }

    remove(start, end, IS_ROOT = false, min_size) {
        let l = this.keys.length,
            out = false,
            out_node = this;

        if (!this.LEAF) {

            for (var i = 0; i < l; i++) {

                let key = this.keys[i];

                if (start <= key && this.nodes[i].remove(start, end, false, min_size).out)
                    out = true;
            }

            if (this.nodes[i].remove(start, end, false, min_size).out)
                out = true;

            for (var i = 0; i < this.nodes.length; i++) {
                if (this.nodes[i].keys.length < min_size) {
                    if (this.balanceRemove(i, min_size)) {
                        l--;
                        i--;
                    };
                };
            }

            if (this.nodes.length == 1)
                out_node = this.nodes[0];



        } else {

            for (let i = 0, l = this.keys.length; i < l; i++) {
                let key = this.keys[i];

                if (key <= end && key >= start) {
                    out = true;
                    this.keys.splice(i, 1)
                    this.nodes.splice(i, 1);
                    l--;
                    i--;
                }
            }
        }

        return {
            out_node,
            out
        };
    }

    get(start, end, out_container, UNWRAPPED) {

        if (!start || !end)
            return false;

        if (!this.LEAF) {

            for (var i = 0, l = this.keys.length; i < l; i++) {

                let key = this.keys[i];

                if (start <= key)
                    this.nodes[i].get(start, end, out_container, UNWRAPPED)
            }

            this.nodes[i].get(start, end, out_container, UNWRAPPED)

        } else {

            let out = false;

            for (let i = 0, l = this.keys.length; i < l; i++) {
                let key = this.keys[i];

                if (key <= end && key >= start) {

                    if (UNWRAPPED)
                        out_container.push(this.nodes[i]);
                    else
                        out_container.push(this.nodes[i].get());
                }

            }
        }
    }
}

export {
    BTreeModelContainer
}