var null_token = {
    type: "",
    text: ""
};

class Lexer {
    constructor(tokenizer) {
        this.tk = tokenizer;

        this.token = tokenizer.next();

        this.hold = null;

        while (this.token && (this.token.type === "new_line" || this.token.type === "white_space" || this.token.type === "generic")) {
            this.token = this.tk.next();
        }
    }

    reset(){
        this.tk.reset();
        this.token = this.tk.next();
        this.hold = null;
    }

    next() {
        if (this.hold !== null) {
            this.token = this.hold;
            this.hold = null;
            return this.token;
        }

        if (!this.token) return null;
        do {
            this.token = this.tk.next();
        } while (this.token && (this.token.type === "new_line" || this.token.type === "white_space" || this.token.type === "generic"));

        if (this.token) {
            return this.token;
        }
        return null;
    }

    assert(text) {
        if (!this.token) throw new Error(`Expecting ${text} got null`);

        var bool = this.token.text == text;


        if (bool) {
            this.next();
        }else{
            throw new Error(`Expecting "${text}" got "${this.token.text}"`)
        }

        return bool;
    }

    peek() {
        if (this.hold) {
            return this.hold;
        }

        this.hold = this.tk.next();

        if (!this.hold) return null_token;

        while (this.hold && (this.hold.type === "new_line" || this.hold.type === "white_space" || this.hold.type === "generic")) {
            this.hold = this.tk.next();
        }

        if (this.hold) {
            return this.hold;
        }

        return null_token;
    }

    get text() {
        if (this.token)
            return this.token.text;
        return null;
    }

    get type() {
        if (this.token)
            return this.token.type;
        return "";
    }

    get pos(){
        if (this.token)
            return this.token.pos;
        return -1;
    }

    slice(start) {
        if (this.token)
            return this.tk.string.slice(start, this.token.pos)
        return this.tk.string.slice(start)
    }
}

export { Lexer }