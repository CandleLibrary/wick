'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

function _interopNamespace(e) {
    if (e && e.__esModule) { return e; } else {
        var n = {};
        if (e) {
            Object.keys(e).forEach(function (k) {
                var d = Object.getOwnPropertyDescriptor(e, k);
                Object.defineProperty(n, k, d.get ? d : {
                    enumerable: true,
                    get: function () {
                        return e[k];
                    }
                });
            });
        }
        n['default'] = e;
        return n;
    }
}

var spark = _interopDefault(require('@candlefw/spark'));

const HORIZONTAL_TAB = 9;
const SPACE = 32;

/**
 * Lexer Jump table reference 
 * 0. NUMBER
 * 1. IDENTIFIER
 * 2. QUOTE STRING
 * 3. SPACE SET
 * 4. TAB SET
 * 5. CARIAGE RETURN
 * 6. LINEFEED
 * 7. SYMBOL
 * 8. OPERATOR
 * 9. OPEN BRACKET
 * 10. CLOSE BRACKET 
 * 11. DATA_LINK
 */ 
const jump_table = [
7, 	 	/* NULL */
7, 	 	/* START_OF_HEADER */
7, 	 	/* START_OF_TEXT */
7, 	 	/* END_OF_TXT */
7, 	 	/* END_OF_TRANSMISSION */
7, 	 	/* ENQUIRY */
7, 	 	/* ACKNOWLEDGE */
7, 	 	/* BELL */
7, 	 	/* BACKSPACE */
4, 	 	/* HORIZONTAL_TAB */
6, 	 	/* LINEFEED */
7, 	 	/* VERTICAL_TAB */
7, 	 	/* FORM_FEED */
5, 	 	/* CARRIAGE_RETURN */
7, 	 	/* SHIFT_OUT */
7, 		/* SHIFT_IN */
11,	 	/* DATA_LINK_ESCAPE */
7, 	 	/* DEVICE_CTRL_1 */
7, 	 	/* DEVICE_CTRL_2 */
7, 	 	/* DEVICE_CTRL_3 */
7, 	 	/* DEVICE_CTRL_4 */
7, 	 	/* NEGATIVE_ACKNOWLEDGE */
7, 	 	/* SYNCH_IDLE */
7, 	 	/* END_OF_TRANSMISSION_BLOCK */
7, 	 	/* CANCEL */
7, 	 	/* END_OF_MEDIUM */
7, 	 	/* SUBSTITUTE */
7, 	 	/* ESCAPE */
7, 	 	/* FILE_SEPERATOR */
7, 	 	/* GROUP_SEPERATOR */
7, 	 	/* RECORD_SEPERATOR */
7, 	 	/* UNIT_SEPERATOR */
3, 	 	/* SPACE */
8, 	 	/* EXCLAMATION */
2, 	 	/* DOUBLE_QUOTE */
7, 	 	/* HASH */
7, 	 	/* DOLLAR */
8, 	 	/* PERCENT */
8, 	 	/* AMPERSAND */
2, 	 	/* QUOTE */
9, 	 	/* OPEN_PARENTH */
10, 	 /* CLOSE_PARENTH */
8, 	 	/* ASTERISK */
8, 	 	/* PLUS */
7, 	 	/* COMMA */
7, 	 	/* HYPHEN */
7, 	 	/* PERIOD */
7, 	 	/* FORWARD_SLASH */
0, 	 	/* ZERO */
0, 	 	/* ONE */
0, 	 	/* TWO */
0, 	 	/* THREE */
0, 	 	/* FOUR */
0, 	 	/* FIVE */
0, 	 	/* SIX */
0, 	 	/* SEVEN */
0, 	 	/* EIGHT */
0, 	 	/* NINE */
8, 	 	/* COLON */
7, 	 	/* SEMICOLON */
8, 	 	/* LESS_THAN */
8, 	 	/* EQUAL */
8, 	 	/* GREATER_THAN */
7, 	 	/* QMARK */
7, 	 	/* AT */
1, 	 	/* A*/
1, 	 	/* B */
1, 	 	/* C */
1, 	 	/* D */
1, 	 	/* E */
1, 	 	/* F */
1, 	 	/* G */
1, 	 	/* H */
1, 	 	/* I */
1, 	 	/* J */
1, 	 	/* K */
1, 	 	/* L */
1, 	 	/* M */
1, 	 	/* N */
1, 	 	/* O */
1, 	 	/* P */
1, 	 	/* Q */
1, 	 	/* R */
1, 	 	/* S */
1, 	 	/* T */
1, 	 	/* U */
1, 	 	/* V */
1, 	 	/* W */
1, 	 	/* X */
1, 	 	/* Y */
1, 	 	/* Z */
9, 	 	/* OPEN_SQUARE */
7, 	 	/* TILDE */
10, 	/* CLOSE_SQUARE */
7, 	 	/* CARET */
7, 	 	/* UNDER_SCORE */
2, 	 	/* GRAVE */
1, 	 	/* a */
1, 	 	/* b */
1, 	 	/* c */
1, 	 	/* d */
1, 	 	/* e */
1, 	 	/* f */
1, 	 	/* g */
1, 	 	/* h */
1, 	 	/* i */
1, 	 	/* j */
1, 	 	/* k */
1, 	 	/* l */
1, 	 	/* m */
1, 	 	/* n */
1, 	 	/* o */
1, 	 	/* p */
1, 	 	/* q */
1, 	 	/* r */
1, 	 	/* s */
1, 	 	/* t */
1, 	 	/* u */
1, 	 	/* v */
1, 	 	/* w */
1, 	 	/* x */
1, 	 	/* y */
1, 	 	/* z */
9, 	 	/* OPEN_CURLY */
7, 	 	/* VERTICAL_BAR */
10,  	/* CLOSE_CURLY */
7,  	/* TILDE */
7 		/* DELETE */
];	

/**
 * LExer Number and Identifier jump table reference
 * Number are masked by 12(4|8) and Identifiers are masked by 10(2|8)
 * entries marked as `0` are not evaluated as either being in the number set or the identifier set.
 * entries marked as `2` are in the identifier set but not the number set
 * entries marked as `4` are in the number set but not the identifier set
 * entries marked as `8` are in both number and identifier sets
 */
const number_and_identifier_table = [
0, 		/* NULL */
0, 		/* START_OF_HEADER */
0, 		/* START_OF_TEXT */
0, 		/* END_OF_TXT */
0, 		/* END_OF_TRANSMISSION */
0, 		/* ENQUIRY */
0,		/* ACKNOWLEDGE */
0,		/* BELL */
0,		/* BACKSPACE */
0,		/* HORIZONTAL_TAB */
0,		/* LINEFEED */
0,		/* VERTICAL_TAB */
0,		/* FORM_FEED */
0,		/* CARRIAGE_RETURN */
0,		/* SHIFT_OUT */
0,		/* SHIFT_IN */
0,		/* DATA_LINK_ESCAPE */
0,		/* DEVICE_CTRL_1 */
0,		/* DEVICE_CTRL_2 */
0,		/* DEVICE_CTRL_3 */
0,		/* DEVICE_CTRL_4 */
0,		/* NEGATIVE_ACKNOWLEDGE */
0,		/* SYNCH_IDLE */
0,		/* END_OF_TRANSMISSION_BLOCK */
0,		/* CANCEL */
0,		/* END_OF_MEDIUM */
0,		/* SUBSTITUTE */
0,		/* ESCAPE */
0,		/* FILE_SEPERATOR */
0,		/* GROUP_SEPERATOR */
0,		/* RECORD_SEPERATOR */
0,		/* UNIT_SEPERATOR */
0,		/* SPACE */
0,		/* EXCLAMATION */
0,		/* DOUBLE_QUOTE */
0,		/* HASH */
0,		/* DOLLAR */
0,		/* PERCENT */
0,		/* AMPERSAND */
0,		/* QUOTE */
0,		/* OPEN_PARENTH */
0,		 /* CLOSE_PARENTH */
0,		/* ASTERISK */
0,		/* PLUS */
0,		/* COMMA */
0,		/* HYPHEN */
4,		/* PERIOD */
0,		/* FORWARD_SLASH */
8,		/* ZERO */
8,		/* ONE */
8,		/* TWO */
8,		/* THREE */
8,		/* FOUR */
8,		/* FIVE */
8,		/* SIX */
8,		/* SEVEN */
8,		/* EIGHT */
8,		/* NINE */
0,		/* COLON */
0,		/* SEMICOLON */
0,		/* LESS_THAN */
0,		/* EQUAL */
0,		/* GREATER_THAN */
0,		/* QMARK */
0,		/* AT */
2,		/* A*/
8,		/* B */
2,		/* C */
2,		/* D */
8,		/* E */
2,		/* F */
2,		/* G */
2,		/* H */
2,		/* I */
2,		/* J */
2,		/* K */
2,		/* L */
2,		/* M */
2,		/* N */
8,		/* O */
2,		/* P */
2,		/* Q */
2,		/* R */
2,		/* S */
2,		/* T */
2,		/* U */
2,		/* V */
2,		/* W */
8,		/* X */
2,		/* Y */
2,		/* Z */
0,		/* OPEN_SQUARE */
0,		/* TILDE */
0,		/* CLOSE_SQUARE */
0,		/* CARET */
0,		/* UNDER_SCORE */
0,		/* GRAVE */
2,		/* a */
8,		/* b */
2,		/* c */
2,		/* d */
2,		/* e */
2,		/* f */
2,		/* g */
2,		/* h */
2,		/* i */
2,		/* j */
2,		/* k */
2,		/* l */
2,		/* m */
2,		/* n */
8,		/* o */
2,		/* p */
2,		/* q */
2,		/* r */
2,		/* s */
2,		/* t */
2,		/* u */
2,		/* v */
2,		/* w */
8,		/* x */
2,		/* y */
2,		/* z */
0,		/* OPEN_CURLY */
0,		/* VERTICAL_BAR */
0,		/* CLOSE_CURLY */
0,		/* TILDE */
0		/* DELETE */
];

const extended_number_and_identifier_table = number_and_identifier_table.slice();
extended_number_and_identifier_table[45] = 2;
extended_number_and_identifier_table[95] = 2;

const
    number = 1,
    identifier = 2,
    string = 4,
    white_space = 8,
    open_bracket = 16,
    close_bracket = 32,
    operator = 64,
    symbol = 128,
    new_line = 256,
    data_link = 512,
    alpha_numeric = (identifier | number),
    white_space_new_line = (white_space | new_line),
    Types = {
        num: number,
        number,
        id: identifier,
        identifier,
        str: string,
        string,
        ws: white_space,
        white_space,
        ob: open_bracket,
        open_bracket,
        cb: close_bracket,
        close_bracket,
        op: operator,
        operator,
        sym: symbol,
        symbol,
        nl: new_line,
        new_line,
        dl: data_link,
        data_link,
        alpha_numeric,
        white_space_new_line,
    },

    /*** MASKS ***/

    TYPE_MASK = 0xF,
    PARSE_STRING_MASK = 0x10,
    IGNORE_WHITESPACE_MASK = 0x20,
    CHARACTERS_ONLY_MASK = 0x40,
    TOKEN_LENGTH_MASK = 0xFFFFFF80,

    //De Bruijn Sequence for finding index of right most bit set.
    //http://supertech.csail.mit.edu/papers/debruijn.pdf
    debruijnLUT = [
        0, 1, 28, 2, 29, 14, 24, 3, 30, 22, 20, 15, 25, 17, 4, 8,
        31, 27, 13, 23, 21, 19, 16, 7, 26, 12, 18, 6, 11, 5, 10, 9
    ];

const getNumbrOfTrailingZeroBitsFromPowerOf2 = (value) => debruijnLUT[(value * 0x077CB531) >>> 27];

class Lexer {

    constructor(string = "", INCLUDE_WHITE_SPACE_TOKENS = false, PEEKING = false) {

        if (typeof(string) !== "string") throw new Error(`String value must be passed to Lexer. A ${typeof(string)} was passed as the \`string\` argument.`);

        /**
         * The string that the Lexer tokenizes.
         */
        this.str = string;

        /**
         * Reference to the peeking Lexer.
         */
        this.p = null;

        /**
         * The type id of the current token.
         */
        this.type = 32768; //Default "non-value" for types is 1<<15;

        /**
         * The offset in the string of the start of the current token.
         */
        this.off = 0;

        this.masked_values = 0;

        /**
         * The character offset of the current token within a line.
         */
        this.char = 0;
        /**
         * The line position of the current token.
         */
        this.line = 0;
        /**
         * The length of the string being parsed
         */
        this.sl = string.length;
        /**
         * The length of the current token.
         */
        this.tl = 0;

        /**
         * Flag to ignore white spaced.
         */
        this.IWS = !INCLUDE_WHITE_SPACE_TOKENS;

        this.USE_EXTENDED_ID = false;

        /**
         * Flag to force the lexer to parse string contents
         */
        this.PARSE_STRING = false;

        this.id_lu = number_and_identifier_table;

        if (!PEEKING) this.next();
    }

    useExtendedId(){
        this.id_lu = extended_number_and_identifier_table;
        this.tl = 0;
        this.next();
        return this;
    }

    /**
     * Restricts max parse distance to the other Lexer's current position.
     * @param      {Lexer}  Lexer   The Lexer to limit parse distance by.
     */
    fence(marker = this) {
        if (marker.str !== this.str)
            return;
        this.sl = marker.off;
        return this;
    }

    /**
     * Copies the Lexer.
     * @return     {Lexer}  Returns a new Lexer instance with the same property values.
     */
    copy(destination = new Lexer(this.str, false, true)) {
        destination.off = this.off;
        destination.char = this.char;
        destination.line = this.line;
        destination.sl = this.sl;
        destination.masked_values = this.masked_values;
        destination.id_lu = this.id_lu;
        return destination;
    }

    /**
     * Given another Lexer with the same `str` property value, it will copy the state of that Lexer.
     * @param      {Lexer}  [marker=this.peek]  The Lexer to clone the state from. 
     * @throws     {Error} Throws an error if the Lexers reference different strings.
     * @public
     */
    sync(marker = this.p) {

        if (marker instanceof Lexer) {
            if (marker.str !== this.str) throw new Error("Cannot sync Lexers with different strings!");
            this.off = marker.off;
            this.char = marker.char;
            this.line = marker.line;
            this.masked_values = marker.masked_values;
        }

        return this;
    }

    /**
    Creates an error message with a diagram illustrating the location of the error. 
    */
    errorMessage(message = "") {
        const pk = this.copy();

        pk.IWS = false;

        while (!pk.END && pk.ty !== Types.nl) { pk.next(); }

        const end = (pk.END) ? this.str.length : pk.off,

            nls = (this.line > 0) ? 1 : 0,
            number_of_tabs = this.str
                .slice(this.off - this.char + nls + nls, this.off + nls)
                .split("")
                .reduce((r, v) => (r + ((v.charCodeAt(0) == HORIZONTAL_TAB) | 0)), 0),

            arrow = String.fromCharCode(0x2b89),

            line = String.fromCharCode(0x2500),

            thick_line = String.fromCharCode(0x2501),

            line_number = `    ${this.line+1}: `,

            line_fill = line_number.length + number_of_tabs,

            line_text = this.str.slice(this.off - this.char + nls + (nls), end).replace(/\t/g, "  "),

            error_border = thick_line.repeat(line_text.length + line_number.length + 2),

            is_iws = (!this.IWS) ? "\n The Lexer produced whitespace tokens" : "",

            msg =[ `${message} at ${this.line+1}:${this.char - nls}` ,
            `${error_border}` ,
            `${line_number+line_text}` ,
            `${line.repeat(this.char-nls+line_fill-(nls))+arrow}` ,
            `${error_border}` ,
            `${is_iws}`].join("\n");

        return msg;
    }

    /**
     * Will throw a new Error, appending the parsed string line and position information to the the error message passed into the function.
     * @instance
     * @public
     * @param {String} message - The error message.
     * @param {Bool} DEFER - if true, returns an Error object instead of throwing.
     */
    throw (message, DEFER = false) {
        const error = new Error(this.errorMessage(message));
        if (DEFER)
            return error;
        throw error;
    }

    /**
     * Proxy for Lexer.prototype.reset
     * @public
     */
    r() { return this.reset() }

    /**
     * Restore the Lexer back to it's initial state.
     * @public
     */
    reset() {
        this.p = null;
        this.type = 32768;
        this.off = 0;
        this.tl = 0;
        this.char = 0;
        this.line = 0;
        this.n;
        return this;
    }

    resetHead() {
        this.off = 0;
        this.tl = 0;
        this.char = 0;
        this.line = 0;
        this.p = null;
        this.type = 32768;
    }

    /**
     * Sets the internal state to point to the next token. Sets Lexer.prototype.END to `true` if the end of the string is hit.
     * @public
     * @param {Lexer} [marker=this] - If another Lexer is passed into this method, it will advance the token state of that Lexer.
     */
    next(marker = this, USE_CUSTOM_SYMBOLS = !!this.symbol_map) {

        if (marker.sl < 1) {
            marker.off = 0;
            marker.type = 32768;
            marker.tl = 0;
            marker.line = 0;
            marker.char = 0;
            return marker;
        }

        //Token builder
        const l = marker.sl,
            str = marker.str,
            number_and_identifier_table = this.id_lu,
            IWS = marker.IWS;

        let length = marker.tl,
            off = marker.off + length,
            type = symbol,
            line = marker.line,
            base = off,
            char = marker.char,
            root = marker.off;

        if (off >= l) {
            length = 0;
            base = l;
            //char -= base - off;
            marker.char = char + (base - marker.off);
            marker.type = type;
            marker.off = base;
            marker.tl = 0;
            marker.line = line;
            return marker;
        }

        let NORMAL_PARSE = true;

        if (USE_CUSTOM_SYMBOLS) {

            let code = str.charCodeAt(off);
            let off2 = off;
            let map = this.symbol_map,
                m;

            while (code == 32 && IWS)
                (code = str.charCodeAt(++off2), off++);

            while ((m = map.get(code))) {
                map = m;
                off2 += 1;
                code = str.charCodeAt(off2);
            }

            if (map.IS_SYM) {
                NORMAL_PARSE = false;
                base = off;
                length = off2 - off;
                //char += length;
            }
        }

        if (NORMAL_PARSE) {

            for (;;) {

                base = off;

                length = 1;

                const code = str.charCodeAt(off);

                if (code < 128) {

                    switch (jump_table[code]) {
                        case 0: //NUMBER
                            while (++off < l && (12 & number_and_identifier_table[str.charCodeAt(off)]));

                            if ((str[off] == "e" || str[off] == "E") && (12 & number_and_identifier_table[str.charCodeAt(off + 1)])) {
                                off++;
                                if (str[off] == "-") off++;
                                marker.off = off;
                                marker.tl = 0;
                                marker.next();
                                off = marker.off + marker.tl;
                                //Add e to the number string
                            }

                            type = number;
                            length = off - base;

                            break;
                        case 1: //IDENTIFIER
                            while (++off < l && ((10 & number_and_identifier_table[str.charCodeAt(off)])));
                            type = identifier;
                            length = off - base;
                            break;
                        case 2: //QUOTED STRING
                            if (this.PARSE_STRING) {
                                type = symbol;
                            } else {
                                while (++off < l && str.charCodeAt(off) !== code);
                                type = string;
                                length = off - base + 1;
                            }
                            break;
                        case 3: //SPACE SET
                            while (++off < l && str.charCodeAt(off) === SPACE);
                            type = white_space;
                            length = off - base;
                            break;
                        case 4: //TAB SET
                            while (++off < l && str[off] === HORIZONTAL_TAB);
                            type = white_space;
                            length = off - base;
                            break;
                        case 5: //CARIAGE RETURN
                            length = 2;
                            //intentional
                        case 6: //LINEFEED
                            type = new_line;
                            line++;
                            base = off;
                            root = off;
                            off += length;
                            char = 0;
                            break;
                        case 7: //SYMBOL
                            type = symbol;
                            break;
                        case 8: //OPERATOR
                            type = operator;
                            break;
                        case 9: //OPEN BRACKET
                            type = open_bracket;
                            break;
                        case 10: //CLOSE BRACKET
                            type = close_bracket;
                            break;
                        case 11: //Data Link Escape
                            type = data_link;
                            length = 4; //Stores two UTF16 values and a data link sentinel
                            break;
                    }
                } else {
                    break;
                }

                if (IWS && (type & white_space_new_line)) {
                    if (off < l) {
                        type = symbol;
                        //off += length;
                        continue;
                    }
                }
                break;
            }
        }

        marker.type = type;
        marker.off = base;
        marker.tl = (this.masked_values & CHARACTERS_ONLY_MASK) ? Math.min(1, length) : length;
        marker.char = char + base - root;
        marker.line = line;

        return marker;
    }


    /**
     * Proxy for Lexer.prototype.assert
     * @public
     */
    a(text) {
        return this.assert(text);
    }

    /**
     * Compares the string value of the current token to the value passed in. Advances to next token if the two are equal.
     * @public
     * @throws {Error} - `Expecting "${text}" got "${this.text}"`
     * @param {String} text - The string to compare.
     */
    assert(text) {

        if (this.off < 0) this.throw(`Expecting ${text} got null`);

        if (this.text == text)
            this.next();
        else
            this.throw(`Expecting "${text}" got "${this.text}"`);

        return this;
    }

    /**
     * Proxy for Lexer.prototype.assertCharacter
     * @public
     */
    aC(char) { return this.assertCharacter(char) }
    /**
     * Compares the character value of the current token to the value passed in. Advances to next token if the two are equal.
     * @public
     * @throws {Error} - `Expecting "${text}" got "${this.text}"`
     * @param {String} text - The string to compare.
     */
    assertCharacter(char) {

        if (this.off < 0) this.throw(`Expecting ${char[0]} got null`);

        if (this.ch == char[0])
            this.next();
        else
            this.throw(`Expecting "${char[0]}" got "${this.tx[this.off]}"`);

        return this;
    }

    /**
     * Returns the Lexer bound to Lexer.prototype.p, or creates and binds a new Lexer to Lexer.prototype.p. Advences the other Lexer to the token ahead of the calling Lexer.
     * @public
     * @type {Lexer}
     * @param {Lexer} [marker=this] - The marker to originate the peek from. 
     * @param {Lexer} [peek_marker=this.p] - The Lexer to set to the next token state.
     * @return {Lexer} - The Lexer that contains the peeked at token.
     */
    peek(marker = this, peek_marker = this.p) {

        if (!peek_marker) {
            if (!marker) return null;
            if (!this.p) {
                this.p = new Lexer(this.str, false, true);
                peek_marker = this.p;
            }
        }
        peek_marker.masked_values = marker.masked_values;
        peek_marker.type = marker.type;
        peek_marker.off = marker.off;
        peek_marker.tl = marker.tl;
        peek_marker.char = marker.char;
        peek_marker.line = marker.line;
        this.next(peek_marker);
        return peek_marker;
    }


    /**
     * Proxy for Lexer.prototype.slice
     * @public
     */
    s(start) { return this.slice(start) }

    /**
     * Returns a slice of the parsed string beginning at `start` and ending at the current token.
     * @param {Number | LexerBeta} start - The offset in this.str to begin the slice. If this value is a LexerBeta, sets the start point to the value of start.off.
     * @return {String} A substring of the parsed string.
     * @public
     */
    slice(start = this.off) {

        if (start instanceof Lexer) start = start.off;

        return this.str.slice(start, (this.off <= start) ? this.sl : this.off);
    }

    /**
     * Skips to the end of a comment section.
     * @param {boolean} ASSERT - If set to true, will through an error if there is not a comment line or block to skip.
     * @param {Lexer} [marker=this] - If another Lexer is passed into this method, it will advance the token state of that Lexer.
     */
    comment(ASSERT = false, marker = this) {

        if (!(marker instanceof Lexer)) return marker;

        if (marker.ch == "/") {
            if (marker.pk.ch == "*") {
                marker.sync();
                while (!marker.END && (marker.next().ch != "*" || marker.pk.ch != "/")) { /* NO OP */ }
                marker.sync().assert("/");
            } else if (marker.pk.ch == "/") {
                const IWS = marker.IWS;
                while (marker.next().ty != Types.new_line && !marker.END) { /* NO OP */ }
                marker.IWS = IWS;
                marker.next();
            } else
            if (ASSERT) marker.throw("Expecting the start of a comment");
        }

        return marker;
    }

    setString(string, RESET = true) {
        this.str = string;
        this.sl = string.length;
        if (RESET) this.resetHead();
    }

    toString() {
        return this.slice();
    }

    /**
     * Returns new Whind Lexer that has leading and trailing whitespace characters removed from input. 
     * leave_leading_amount - Maximum amount of leading space caracters to leave behind. Default is zero
     * leave_trailing_amount - Maximum amount of trailing space caracters to leave behind. Default is zero
     */
    trim(leave_leading_amount = 0, leave_trailing_amount = leave_leading_amount) {
        const lex = this.copy();

        let space_count = 0,
            off = lex.off;

        for (; lex.off < lex.sl; lex.off++) {
            const c = jump_table[lex.string.charCodeAt(lex.off)];

            if (c > 2 && c < 7) {

                if (space_count >= leave_leading_amount) {
                    off++;
                } else {
                    space_count++;
                }
                continue;
            }

            break;
        }

        lex.off = off;
        space_count = 0;
        off = lex.sl;

        for (; lex.sl > lex.off; lex.sl--) {
            const c = jump_table[lex.string.charCodeAt(lex.sl - 1)];

            if (c > 2 && c < 7) {
                if (space_count >= leave_trailing_amount) {
                    off--;
                } else {
                    space_count++;
                }
                continue;
            }

            break;
        }

        lex.sl = off;

        if (leave_leading_amount > 0)
            lex.IWS = false;

        lex.token_length = 0;

        lex.next();

        return lex;
    }

    /** Adds symbol to symbol_map. This allows custom symbols to be defined and tokenized by parser. **/
    addSymbol(sym) {
        if (!this.symbol_map)
            this.symbol_map = new Map;


        let map = this.symbol_map;

        for (let i = 0; i < sym.length; i++) {
            let code = sym.charCodeAt(i);
            let m = map.get(code);
            if (!m) {
                m = map.set(code, new Map).get(code);
            }
            map = m;
        }
        map.IS_SYM = true;
    }

    /*** Getters and Setters ***/
    get string() {
        return this.str;
    }

    get string_length() {
        return this.sl - this.off;
    }

    set string_length(s) {}

    /**
     * The current token in the form of a new Lexer with the current state.
     * Proxy property for Lexer.prototype.copy
     * @type {Lexer}
     * @public
     * @readonly
     */
    get token() {
        return this.copy();
    }


    get ch() {
        return this.str[this.off];
    }

    /**
     * Proxy for Lexer.prototype.text
     * @public
     * @type {String}
     * @readonly
     */
    get tx() { return this.text }

    /**
     * The string value of the current token.
     * @type {String}
     * @public
     * @readonly
     */
    get text() {
        return (this.off < 0) ? "" : this.str.slice(this.off, this.off + this.tl);
    }

    /**
     * The type id of the current token.
     * @type {Number}
     * @public
     * @readonly
     */
    get ty() { return this.type }

    /**
     * The current token's offset position from the start of the string.
     * @type {Number}
     * @public
     * @readonly
     */
    get pos() {
        return this.off;
    }

    /**
     * Proxy for Lexer.prototype.peek
     * @public
     * @readonly
     * @type {Lexer}
     */
    get pk() { return this.peek() }

    /**
     * Proxy for Lexer.prototype.next
     * @public
     */
    get n() { return this.next() }

    get END() { return this.off >= this.sl }
    set END(v) {}

    get type() {
        return 1 << (this.masked_values & TYPE_MASK);
    }

    set type(value) {
        //assuming power of 2 value.
        this.masked_values = (this.masked_values & ~TYPE_MASK) | ((getNumbrOfTrailingZeroBitsFromPowerOf2(value)) & TYPE_MASK);
    }

    get tl() {
        return this.token_length;
    }

    set tl(value) {
        this.token_length = value;
    }

    get token_length() {
        return ((this.masked_values & TOKEN_LENGTH_MASK) >> 7);
    }

    set token_length(value) {
        this.masked_values = (this.masked_values & ~TOKEN_LENGTH_MASK) | (((value << 7) | 0) & TOKEN_LENGTH_MASK);
    }

    get IGNORE_WHITE_SPACE() {
        return this.IWS;
    }

    set IGNORE_WHITE_SPACE(bool) {
        this.iws = !!bool;
    }

    get CHARACTERS_ONLY() {
        return !!(this.masked_values & CHARACTERS_ONLY_MASK);
    }

    set CHARACTERS_ONLY(boolean) {
        this.masked_values = (this.masked_values & ~CHARACTERS_ONLY_MASK) | ((boolean | 0) << 6);
    }

    get IWS() {
        return !!(this.masked_values & IGNORE_WHITESPACE_MASK);
    }

    set IWS(boolean) {
        this.masked_values = (this.masked_values & ~IGNORE_WHITESPACE_MASK) | ((boolean | 0) << 5);
    }

    get PARSE_STRING() {
        return !!(this.masked_values & PARSE_STRING_MASK);
    }

    set PARSE_STRING(boolean) {
        this.masked_values = (this.masked_values & ~PARSE_STRING_MASK) | ((boolean | 0) << 4);
    }

    /**
     * Reference to token id types.
     */
    get types() {
        return Types;
    }
}

Lexer.prototype.addCharacter = Lexer.prototype.addSymbol;

function whind$1(string, INCLUDE_WHITE_SPACE_TOKENS = false) { return new Lexer(string, INCLUDE_WHITE_SPACE_TOKENS) }

whind$1.constructor = Lexer;

Lexer.types = Types;
whind$1.types = Types;

const uri_reg_ex = /(?:([a-zA-Z][\dA-Za-z\+\.\-]*)(?:\:\/\/))?(?:([a-zA-Z][\dA-Za-z\+\.\-]*)(?:\:([^\<\>\:\?\[\]\@\/\#\b\s]*)?)?\@)?(?:(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})|((?:\[[0-9a-f]{1,4})+(?:\:[0-9a-f]{0,4}){2,7}\])|([^\<\>\:\?\[\]\@\/\#\b\s\.]{2,}(?:\.[^\<\>\:\?\[\]\@\/\#\b\s]*)*))?(?:\:(\d+))?((?:[^\?\[\]\#\s\b]*)+)?(?:\?([^\[\]\#\s\b]*))?(?:\#([^\#\s\b]*))?/i;

const STOCK_LOCATION = {
    protocol: "",
    host: "",
    port: "",
    path: "",
    hash: "",
    query: "",
    search: ""
};

function fetchLocalText(URL, m = "same-origin") {
    return new Promise((res, rej) => {
        fetch(URL, {
            mode: m, // CORs not allowed
            credentials: m,
            method: "GET"
        }).then(r => {

            if (r.status < 200 || r.status > 299)
                r.text().then(rej);
            else
                r.text().then(res);
        }).catch(e => rej(e));
    });
}

function fetchLocalJSON(URL, m = "same-origin") {
    return new Promise((res, rej) => {
        fetch(URL, {
            mode: m, // CORs not allowed
            credentials: m,
            method: "GET"
        }).then(r => {
            if (r.status < 200 || r.status > 299)
                r.json().then(rej);
            else
                r.json().then(res).catch(rej);
        }).catch(e => rej(e));
    });
}

function submitForm(URL, form_data, m = "same-origin") {
    return new Promise((res, rej) => {
        var form;

        if (form_data instanceof FormData)
            form = form_data;
        else {
            form = new FormData();
            for (let name in form_data)
                form.append(name, form_data[name] + "");
        }

        fetch(URL, {
            mode: m, // CORs not allowed
            credentials: m,
            method: "POST",
            body: form,
        }).then(r => {
            if (r.status < 200 || r.status > 299)
                r.text().then(rej);
            else
                r.json().then(res);
        }).catch(e => e.text().then(rej));
    });
}

function submitJSON(URL, json_data, m = "same-origin") {
    return new Promise((res, rej) => {
        fetch(URL, {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            mode: m, // CORs not allowed
            credentials: m,
            method: "POST",
            body: JSON.stringify(json_data),
        }).then(r => {
            if (r.status < 200 || r.status > 299)
                r.json().then(rej);
            else
                r.json().then(res);
        }).catch(e => e.text().then(rej));
    });
}



/**
 * Used for processing URLs, handling `document.location`, and fetching data.
 * @param      {string}   url           The URL string to wrap.
 * @param      {boolean}  USE_LOCATION  If `true` missing URL parts are filled in with data from `document.location`. 
 * @return     {URL}   If a falsy value is passed to `url`, and `USE_LOCATION` is `true` a Global URL is returned. This is directly linked to the page and will _update_ the actual page URL when its values are change. Use with caution. 
 * @alias URL
 * @memberof module:wick.core.network
 */
class URL {

    static resolveRelative(URL_or_url_new, URL_or_url_original = document.location.toString(), ) {

        let URL_old = (URL_or_url_original instanceof URL) ? URL_or_url_original : new URL(URL_or_url_original);
        let URL_new = (URL_or_url_new instanceof URL) ? URL_or_url_new : new URL(URL_or_url_new);

        if (!(URL_old + "") || !(URL_new + "")) return null;
        if (URL_new.path[0] != "/") {

            let a = URL_old.path.split("/");
            let b = URL_new.path.split("/");


            if (b[0] == "..") a.splice(a.length - 1, 1);
            for (let i = 0; i < b.length; i++) {
                switch (b[i]) {
                    case "..":
                    case ".":
                        a.splice(a.length - 1, 1);
                        break;
                    default:
                        a.push(b[i]);
                }
            }
            URL_new.path = a.join("/");
        }

        return URL_new;
    }

    constructor(url = "", USE_LOCATION = false) {

        let IS_STRING = true,
            IS_LOCATION = false;


        let location = (typeof(document) !== "undefined") ? document.location : STOCK_LOCATION;

        if (typeof(Location) !== "undefined" && url instanceof Location) {
            location = url;
            url = "";
            IS_LOCATION = true;
        }
        if (!url || typeof(url) != "string") {
            IS_STRING = false;
            IS_LOCATION = true;
            if (URL.GLOBAL && USE_LOCATION)
                return URL.GLOBAL;
        }

        /**
         * URL protocol
         */
        this.protocol = "";

        /**
         * Username string
         */
        this.user = "";

        /**
         * Password string
         */
        this.pwd = "";

        /**
         * URL hostname
         */
        this.host = "";

        /**
         * URL network port number.
         */
        this.port = 0;

        /**
         * URL resource path
         */
        this.path = "";

        /**
         * URL query string.
         */
        this.query = "";

        /**
         * Hashtag string
         */
        this.hash = "";

        /**
         * Map of the query data
         */
        this.map = null;

        if (IS_STRING) {
            if (url instanceof URL) {
                this.protocol = url.protocol;
                this.user = url.user;
                this.pwd = url.pwd;
                this.host = url.host;
                this.port = url.port;
                this.path = url.path;
                this.query = url.query;
                this.hash = url.hash;
            } else {
                let part = url.match(uri_reg_ex);

                //If the complete string is not matched than we are dealing with something other 
                //than a pure URL. Thus, no object is returned. 
                if (part[0] !== url) return null;

                this.protocol = part[1] || ((USE_LOCATION) ? location.protocol : "");
                this.user = part[2] || "";
                this.pwd = part[3] || "";
                this.host = part[4] || part[5] || part[6] || ((USE_LOCATION) ? location.hostname : "");
                this.port = parseInt(part[7] || ((USE_LOCATION) ? location.port : 0));
                this.path = part[8] || ((USE_LOCATION) ? location.pathname : "");
                this.query = part[9] || ((USE_LOCATION) ? location.search.slice(1) : "");
                this.hash = part[10] || ((USE_LOCATION) ? location.hash.slice(1) : "");

            }
        } else if (IS_LOCATION) {
            this.protocol = location.protocol.replace(/\:/g, "");
            this.host = location.hostname;
            this.port = location.port;
            this.path = location.pathname;
            this.hash = location.hash.slice(1);
            this.query = location.search.slice(1);
            this._getQuery_(this.query);

            if (USE_LOCATION) {
                URL.G = this;
                return URL.R;
            }
        }
        this._getQuery_(this.query);
    }


    /**
    URL Query Syntax

    root => [root_class] [& [class_list]]
         => [class_list]

    root_class = key_list

    class_list [class [& key_list] [& class_list]]

    class => name & key_list

    key_list => [key_val [& key_list]]

    key_val => name = val

    name => ALPHANUMERIC_ID

    val => NUMBER
        => ALPHANUMERIC_ID
    */

    /**
     * Pulls query string info into this.map
     * @private
     */
    _getQuery_() {
        let map = (this.map) ? this.map : (this.map = new Map());

        let lex = whind$1(this.query);


        const get_map = (k, m) => (m.has(k)) ? m.get(k) : m.set(k, new Map).get(k);

        let key = 0,
            key_val = "",
            class_map = get_map(key_val, map),
            lfv = 0;

        while (!lex.END) {
            switch (lex.tx) {
                case "&": //At new class or value
                    if (lfv > 0)
                        key = (class_map.set(key_val, lex.s(lfv)), lfv = 0, lex.n.pos);
                    else {
                        key_val = lex.s(key);
                        key = (class_map = get_map(key_val, map), lex.n.pos);
                    }
                    continue;
                case "=":
                    //looking for a value now
                    key_val = lex.s(key);
                    lfv = lex.n.pos;
                    continue;
            }
        }

        if (lfv > 0) class_map.set(key_val, lex.s(lfv));
    }

    setPath(path) {

        this.path = path;

        return new URL(this);
    }

    setLocation() {
        history.replaceState({}, "replaced state", `${this}`);
        window.onpopstate();
    }

    toString() {
        let str = [];

        if (this.host) {

            if (this.protocol)
                str.push(`${this.protocol}://`);

            str.push(`${this.host}`);
        }

        if (this.port)
            str.push(`:${this.port}`);

        if (this.path)
            str.push(`${this.path[0] == "/" ? "" : "/"}${this.path}`);

        if (this.query)
            str.push(((this.query[0] == "?" ? "" : "?") + this.query));

        if (this.hash)
            str.push("#" + this.hash);


        return str.join("");
    }

    /**
     * Pulls data stored in query string into an object an returns that.
     * @param      {string}  class_name  The class name
     * @return     {object}  The data.
     */
    getData(class_name = "") {
        if (this.map) {
            let out = {};
            let _c = this.map.get(class_name);
            if (_c) {
                for (let [key, val] of _c.entries())
                    out[key] = val;
                return out;
            }
        }
        return null;
    }

    /**
     * Sets the data in the query string. Wick data is added after a second `?` character in the query field, and appended to the end of any existing data.
     * @param      {string}  class_name  Class name to use in query string. Defaults to root, no class 
     * @param      {object | Model | AnyModel}  data        The data
     */
    setData(data = null, class_name = "") {

        if (data) {

            let map = this.map = new Map();

            let store = (map.has(class_name)) ? map.get(class_name) : (map.set(class_name, new Map()).get(class_name));

            //If the data is a falsy value, delete the association.

            for (let n in data) {
                if (data[n] !== undefined && typeof data[n] !== "object")
                    store.set(n, data[n]);
                else
                    store.delete(n);
            }

            //set query
            let null_class, str = "";

            if ((null_class = map.get(""))) {
                if (null_class.size > 0) {
                    for (let [key, val] of null_class.entries())
                        str += `&${key}=${val}`;

                }
            }

            for (let [key, class_] of map.entries()) {
                if (key === "")
                    continue;
                if (class_.size > 0) {
                    str += `&${key}`;
                    for (let [key, val] of class_.entries())
                        str += `&${key}=${val}`;
                }
            }
            
            str = str.slice(1);

            this.query = this.query.split("?")[0] + "?" + str;

            if (URL.G == this)
                this.goto();
        } else {
            this.query = "";
        }

        return this;

    }

    /**
     * Fetch a string value of the remote resource. 
     * Just uses path component of URL. Must be from the same origin.
     * @param      {boolean}  [ALLOW_CACHE=true]  If `true`, the return string will be cached. If it is already cached, that will be returned instead. If `false`, a network fetch will always occur , and the result will not be cached.
     * @return     {Promise}  A promise object that resolves to a string of the fetched value.
     */
    fetchText(ALLOW_CACHE = true) {

        if (ALLOW_CACHE) {

            let resource = URL.RC.get(this.path);

            if (resource)
                return new Promise((res) => {
                    res(resource);
                });
        }

        return fetchLocalText(this.path).then(res => (URL.RC.set(this.path, res), res));
    }

    /**
     * Fetch a JSON value of the remote resource. 
     * Just uses path component of URL. Must be from the same origin.
     * @param      {boolean}  [ALLOW_CACHE=true]  If `true`, the return string will be cached. If it is already cached, that will be returned instead. If `false`, a network fetch will always occur , and the result will not be cached.
     * @return     {Promise}  A promise object that resolves to a string of the fetched value.
     */
    fetchJSON(ALLOW_CACHE = true) {

        let string_url = this.toString();

        if (ALLOW_CACHE) {

            let resource = URL.RC.get(string_url);

            if (resource)
                return new Promise((res) => {
                    res(resource);
                });
        }

        return fetchLocalJSON(string_url).then(res => (URL.RC.set(this.path, res), res));
    }

    /**
     * Cache a local resource at the value 
     * @param    {object}  resource  The resource to store at this URL path value.
     * @returns {boolean} `true` if a resource was already cached for this URL, false otherwise.
     */
    cacheResource(resource) {

        let occupied = URL.RC.has(this.path);

        URL.RC.set(this.path, resource);

        return occupied;
    }

    submitForm(form_data) {
        return submitForm(this.toString(), form_data);
    }

    submitJSON(json_data, mode) {
        return submitJSON(this.toString(), json_data, mode);
    }
    /**
     * Goes to the current URL.
     */
    goto() {
        return;
        let url = this.toString();
        history.pushState({}, "ignored title", url);
        window.onpopstate();
        URL.G = this;
    }
    //Returns the last segment of the path
    get file() {
        return this.path.split("/").pop();
    }
    //returns the name of the file less the extension
    get filename() {
        return this.file.split(".").shift();
    }



    //Returns the all but the last segment of the path
    get dir() {
        return this.path.split("/").slice(0, -1).join("/") || "/";
    }

    get pathname() {
        return this.path;
    }

    get href() {
        return this.toString();
    }

    get ext() {
        const m = this.path.match(/\.([^\.]*)$/);
        return m ? m[1] : "";
    }

    get search() {
        return this.query;
    }
}

/**
 * The fetched resource cache.
 */
URL.RC = new Map();

/**
 * The Default Global URL object. 
 */
URL.G = null;

/**
 * The Global object Proxy.
 */
URL.R = {
    get protocol() {
        return URL.G.protocol;
    },
    set protocol(v) {
        return;
        URL.G.protocol = v;
    },
    get user() {
        return URL.G.user;
    },
    set user(v) {
        return;
        URL.G.user = v;
    },
    get pwd() {
        return URL.G.pwd;
    },
    set pwd(v) {
        return;
        URL.G.pwd = v;
    },
    get host() {
        return URL.G.host;
    },
    set host(v) {
        return;
        URL.G.host = v;
    },
    get port() {
        return URL.G.port;
    },
    set port(v) {
        return;
        URL.G.port = v;
    },
    get path() {
        return URL.G.path;
    },
    set path(v) {
        return;
        URL.G.path = v;
    },
    get query() {
        return URL.G.query;
    },
    set query(v) {
        return;
        URL.G.query = v;
    },
    get hash() {
        return URL.G.hash;
    },
    set hash(v) {
        return;
        URL.G.hash = v;
    },
    get map() {
        return URL.G.map;
    },
    set map(v) {
        return;
        URL.G.map = v;
    },
    setPath(path) {
        return URL.G.setPath(path);
    },
    setLocation() {
        return URL.G.setLocation();
    },
    toString() {
        return URL.G.toString();
    },
    getData(class_name = "") {
        return URL.G.getData(class_name = "");
    },
    setData(class_name = "", data = null) {
        return URL.G.setData(class_name, data);
    },
    fetchText(ALLOW_CACHE = true) {
        return URL.G.fetchText(ALLOW_CACHE);
    },
    cacheResource(resource) {
        return URL.G.cacheResource(resource);
    }
};





let SIMDATA = null;

/* Replaces the fetch actions with functions that simulate network fetches. Resources are added by the user to a Map object. */
URL.simulate = function() {
    SIMDATA = new Map;
    URL.prototype.fetchText = async d => ((d = this.toString()), SIMDATA.get(d)) ? SIMDATA.get(d) : "";
    URL.prototype.fetchJSON = async d => ((d = this.toString()), SIMDATA.get(d)) ? JSON.parse(SIMDATA.get(d).toString()) : {};
};

//Allows simulated resources to be added as a key value pair, were the key is a URI string and the value is string data.
URL.addResource = (n, v) => (n && v && (SIMDATA || (SIMDATA = new Map())) && SIMDATA.set(n.toString(), v.toString));

URL.polyfill = async function() {

    if (typeof(global) !== "undefined") {

        const 
            fs = (await new Promise(function (resolve) { resolve(_interopNamespace(require('fs'))); })).promises,
            path = (await new Promise(function (resolve) { resolve(_interopNamespace(require('path'))); }));


        global.Location = (class extends URL {});

        global.document = global.document || {};

        global.document.location = new URL(process.cwd() + "/");
        /**
         * Global `fetch` polyfill - basic support
         */
        global.fetch = async (url, data) => {
            let
                p = path.resolve(process.cwd(), "" + url),
                d = await fs.readFile(p, "utf8");

            try {
                return {
                    status: 200,
                    text: () => {
                        return {
                            then: (f) => f(d)
                        }
                    }
                };
            } catch (err) {
                throw err;
            }
        };
    }
};

Object.freeze(URL.R);
Object.freeze(URL.RC);
Object.seal(URL);

/**
 * Global Document instance short name
 * @property DOC
 * @package
 * @memberof module:wick~internals
 * @type 	{Document}
 */
const DOC = (typeof(document) !== "undefined") ? document : ()=>{};

/**
 * Global Object class short name
 * @property OB
 * @package
 * @memberof module:wick~internals
 * @type Object
 */
const OB = Object;

/***************** Functions ********************/

/**
 *  Global document.createElement short name function.
 * @method DOC
 * @package
 * @memberof module:wick~internals
 * @param 	{String}  		e   - tagname of element to create. 
 * @return  {HTMLElement}  		- HTMLElement instance generated by the document. 
 */
const createElement = (e) => document.createElement(e);

/**
 *  Element.prototype.appendChild short name wrapper.
 * @method appendChild
 * @package
 * @memberof module:wick~internals
 * @param 	{HTMLElement}  		el  	- parent HTMLElement.
 * @return  {HTMLElement | HTMLNode}  		ch_el 	- child HTMLElement or HTMLNode. 
 */
const appendChild = (el, ch_el) => el && el.appendChild(ch_el);

const _SealedProperty_ = (object, name, value) => OB.defineProperty(object, name, {value, configurable: false, enumerable: false, writable: true});
const _FrozenProperty_ = (object, name, value) => OB.defineProperty(object, name, {value, configurable: false, enumerable: false, writable: false});

/**
 * The base class which all Model classes extend.
 * @memberof module:wick~internal .model
 * @alias ModelBase
 */
class ModelBase {
    constructor(root = null, address = []) {
        _SealedProperty_(this, "_cv_", []);
        _SealedProperty_(this, "fv", null);
        _SealedProperty_(this, "par", null);
        _SealedProperty_(this, "MUTATION_ID", 0);
        _SealedProperty_(this, "address", address);
        _SealedProperty_(this, "root", root || this);
        _SealedProperty_(this, "prop_name", "");
    }


    /**
     *   Remove all references to any objects still held by this object.
     *   @protected
     *   @instance
     */
    destroy() {

        //inform observers of the models demise
        var observer = this.fv;

        while (observer) {
            let nx = observer.nx;
            observer.unsetModel();
            observer = nx;
        }

        this._cv_ = null;
    }

    setHook(prop_name, data) { return data; }

    getHook(prop_name, data) { return data; }


    /**
     * Called by a class that extends ModelBase when on of its property values changes.
     * @param      {string}  changed_value  The changed value
     * @private
     */
    scheduleUpdate(changed_value) {
        if (!this.fv)
            return;


        this._cv_.push(changed_value);

        spark.queueUpdate(this);
    }


    getChanged(prop_name) {


        for (let i = 0, l = this._cv_.length; i < l; i++)
            if (this._cv_[i] == prop_name)
                return this[prop_name];

        return null;
    }

    addListener(listener) {
        return this.addObserver(listener);
    }


    /**
     * Adds a observer to the linked list of observers on the model. argument observer MUST be an instance of View. 
     * @param {View} observer - The observer to _bind_ to the ModelBase
     * @throws {Error} throws an error if the value of `observer` is not an instance of {@link View}.
     */
    addObserver(observer) {
        if (observer.model)
            if (observer.model !== this) {
                observer.model.removeView(observer);
            } else return;

        if (this.fv) this.fv.pv = observer;
        observer.nx = this.fv;
        this.fv = observer;

        observer.pv = null;
        observer.model = this;
        observer.update(this);
    }

    /**
     * Removes observer from set of observers if the passed in observer is a member of model. 
     * @param {View} observer - The observer to unbind from ModelBase
     */
    removeView(observer) {
        

        if (observer.model == this) {
            if (observer == this.fv)
                this.fv = observer.nx;

            if (observer.nx)
                observer.nx.pv = observer.pv;
            if (observer.pv)
                observer.pv.nx = observer.nx;

            observer.nx = null;
            observer.pv = null;
        }
    }


    /**
        Should return the value of the property if it is in the model and has been updated since the last cycle. Null otherwise.
        This should be overridden by a more efficient version by inheriting objects
    */
    isUpdated(prop_name) {

        let changed_properties = this._cv_;

        for (var i = 0, l = changed_properties.length; i < l; i++)
            if (changed_properties[i] == prop_name)
                if (this[prop_name] !== undefined)
                    return this[prop_name];

        return null;
    }



    /**
     * Called by the {@link spark} when if the ModelBase is scheduled for an update
     * @param      {number}  step    The step
     */
    scheduledUpdate(step) { this.updateViews(); }



    /**
     * Calls View#update on every bound View, passing the current state of the ModelBase.
     */
    updateViews() {

        let o = {};

        for (let p = null, i = 0, l = this._cv_.length; i < l; i++)
            (p = this._cv_[i], o[p] = this[p]);

        this._cv_.length = 0;

        var observer = this.fv;

        while (observer) {

            observer.update(this, o);
            observer = observer.nx;
        }

        return;
    }



    /**
     * Updates observers with a list of models that have been removed. 
     * Primarily used in conjunction with container based observers, such as Templates.
     * @private
     */
    updateViewsRemoved(data) {

        var observer = this.fv;

        while (observer) {

            observer.removed(data);

            observer = observer.nx;
        }
    }



    /** MUTATION FUNCTIONS **************************************************************************************/



    _deferUpdateToRoot_(data, MUTATION_ID = this.MUTATION_ID) {
        
        if(!this.root)
            return this;

        return this.root._setThroughRoot_(data, this.address, 0, this.address.length, MUTATION_ID);
    }



    _setThroughRoot_(data, address, index, len, m_id) {

        if (index >= len) {

            if (m_id !== this.MUTATION_ID) {
                let clone = this.clone();
                clone.set(data, true);
                clone.MUTATION_ID = (this.par) ? this.par.MUTATION_ID : this.MUTATION_ID + 1;
                return clone;
            }

            this.set(data, true);
            return this;
        }

        let i = address[index++];

        let model_prop = this.prop_array[i];

        if (model_prop.MUTATION_ID !== this.MUTATION_ID) {

            model_prop = model_prop.clone();

            model_prop.MUTATION_ID = this.MUTATION_ID;
        }

        this.prop_array[i] = model_prop;

        return model_prop._setThroughRoot_(data, address, index, len, model_prop.MUTATION_ID);
    }

    seal() {

        let clone = this._deferUpdateToRoot_(null, this.MUTATION_ID + 1);

        return clone;
    }

    clone() {

        let clone = new this.constructor(this);

        clone.prop_name = this.prop_name;
        clone._cv_ = this._cv_;
        clone.fv = this.fv;
        clone.par = this.par;
        clone.MUTATION_ID = this.MUTATION_ID;
        clone.address = this.address;
        clone.prop_name = this.prop_name;

        clone.root = (this.root == this) ? clone : this.root;

        return clone;
    }

    /**
     * Updates observers with a list of models that have been added. 
     * Primarily used in conjunction with container based observers, such as Templates.
     * @private
     */
    updateViewsAdded(data) {

        var observer = this.fv;

        while (observer) {

            observer.added(data);

            observer = observer.nx;
        }
    }

    toJSON() { return JSON.stringify(this, null, '\t'); }


    /**
     * This will update the branch state of the data tree with a new branch if the MUTATION_ID is higher or lower than the current branch's parent level.
     * In this case, the new branch will stem from the root node, and all ancestor nodes from the originating child will be cloned.
     *
     * @param      {Object}         child_obj    The child object
     * @param      {(Object|number)}  MUTATION_ID  The mutation id
     * @return     {Object}         { description_of_the_return_value }
     */
    setMutation(child_obj, MUTATION_ID = child_obj.MUTATION_ID) {
        let clone = child_obj,
            result = this;

        if (MUTATION_ID == this.MUTATION_ID) return child_obj;

        if (this.par)
            result = this.par.setMutation(this, MUTATION_ID);

        if (MUTATION_ID > this.MUTATION_ID) {
            result = this.clone();
            result.MUTATION_ID = this.MUTATION_ID + 1;
        }

        clone = child_obj.clone();
        clone.MUTATION_ID = result.MUTATION_ID;
        result[clone.prop_name] = clone;

        return clone;
    }
}

/**
    Schema type. Handles the parsing, validation, and filtering of Model data properties. 
*/
class SchemeConstructor {

    constructor() {

        this.start_value = undefined;
    }

    /**
        Parses value returns an appropriate transformed value
    */
    parse(value) {

        return value;
    }

    /**

    */
    verify(value, result) {

        result.valid = true;
    }

    filter(id, filters) {
        for (let i = 0, l = filters.length; i < l; i++)
            if (id === filters[i]) return true;
        return false;
    }

    string(value) {

        return value + "";
    }
}

class MCArray extends Array {

    constructor() {
        super();
    }

    push(...item) {
        item.forEach(item => {
            if (item instanceof Array)
                item.forEach((i) => {
                    super.push(i);
                });
            else
                super.push(item);
        });
    }

    //For compatibility
    __setFilters__() {

    }

    getChanged() {

    }

    toJSON() { return this; }

    toJson() { return JSON.stringify(this, null, '\t'); }
}

// A no op function
let EmptyFunction = () => {};

class ModelContainerBase extends ModelBase {

    constructor(root = null, address = []) {

        super(root, address);

        _SealedProperty_(this, "scope", null);
        _SealedProperty_(this, "first_link", null);

        //For keeping the container from garbage collection.
        _SealedProperty_(this, "pin", EmptyFunction);

        //For Linking to original 
        _SealedProperty_(this, "next", null);
        _SealedProperty_(this, "prev", null);

        //Filters are a series of strings or number selectors used to determine if a model should be inserted into or retrieved from the container.
        _SealedProperty_(this, "_filters_", null);

        this.validator = new SchemeConstructor();

        return this;
    }

    setByIndex(index) { /* NO OP **/ }

    getByIndex(index, value) { /* NO OP **/ }

    destroy() {


        this._filters_ = null;

        if (this.scope) {
            this.scope.__unlink__(this);
        }

        super.destroy();
    }

    /**
        Get the number of Models held in this._mContainerBase

        @returns {Number}
    */
    get length() { return 0; }

    set length(e) { /* NO OP */ }

    /** 
        Returns a ModelContainerBase type to store the results of a get().
    */
    __defaultReturn__(USE_ARRAY) {
        if (USE_ARRAY) return new MCArray;

        let n = new this.constructor();

        n.key = this.key;
        n.validator = this.validator;
        n.model = this.model;

        this.__link__(n);

        return n;
    }

    /**
        Array emulating kludge

        @returns The result of calling this.insert
    */
    push(...item) {
        item.forEach(item => {
            if (this.scope) {
                if (item instanceof Array)
                    item.forEach((i) => {
                        this.insert(i, true, true);
                    });
                else
                    this.insert(item, true, true);

            } else {
                if (item instanceof Array)
                    item.forEach((i) => {
                        this.insert(i);
                    });
                else
                    this.insert(item);

            }
        });
    }

    /**
        Retrieves a list of items that match the term/terms. 

        @param {(Array|SearchTerm)} term - A single term or a set of terms to look for in the ModelContainerBase. 
        @param {Array} __return_data__ - Set to true by a scope Container if it is calling a SubContainer insert function. 

        @returns {(ModelContainerBase|Array)} Returns a Model container or an Array of Models matching the search terms. 
    */
    get(term, __return_data__) {

        let out = null;

        term = this.getHook("term", term);

        let USE_ARRAY = (__return_data__ === null) ? false : true;

        if (term) {

            if (__return_data__) {
                out = __return_data__;
            } else {

                if (!this.scope)
                    USE_ARRAY = false;

                out = this.__defaultReturn__(USE_ARRAY);
                out.__setFilters__(term);
            }
        } else
            out = (__return_data__) ? __return_data__ : this.__defaultReturn__(USE_ARRAY);

        if (!term)
            this.__getAll__(out);
        else {

            let terms = term;

            if (!Array.isArray(term))
                terms = [term];

            //Need to convert terms into a form that will work for the identifier type
            terms = terms.map(t => this.validator.parse(t));

            this.__get__(terms, out);
        }

        return out;
    }

    set(item, from_root = false) {
        if (!from_root)
            return this._deferUpdateToRoot_(item).insert(item, true);
        else
            this.insert(item, true);
    }

    /**
        Inserts an item into the container. If the item is not a {Model}, an attempt will be made to convert the data in the Object into a Model.
        If the item is an array of objects, each object in the array will be considered separately. 

        @param {Object} item - An Object to insert into the container. On of the properties of the object MUST have the same name as the ModelContainerBase's 
        @param {Array} item - An array of Objects to insert into the container.
        @param {Boolean} __FROM_SCOPE__ - Set to true by a scope Container if it is calling a SubContainer insert function. 

        @returns {Boolean} Returns true if an insertion into the ModelContainerBase occurred, false otherwise.
    */
    insert(item, from_root = false, __FROM_SCOPE__ = false) {


        item = this.setHook("", item);

        if (!from_root)
            return this._deferUpdateToRoot_(item).insert(item, true);

        let add_list = (this.fv) ? [] : null;

        let out_data = false;

        if (!__FROM_SCOPE__ && this.scope)
            return this.scope.insert(item);


        if (item instanceof Array) {
            for (var i = 0; i < item.length; i++)
                if (this.__insertSub__(item[i], out_data, add_list))
                    out_data = true;
        } else if (item)
            out_data = this.__insertSub__(item, out_data, add_list);


        if (out_data) {
            if (this.par)
                this.par.scheduleUpdate(this.prop_name);


            if (add_list && add_list.length > 0) {
                this.updateViewsAdded(add_list);
                this.scheduleUpdate();
            }
        }

        return out_data;
    }

    /**
        A subset of the insert function. Handles the testing of presence of an identifier value, the conversion of an Object into a Model, and the calling of the implementation specific __insert__ function.
    */
    __insertSub__(item, out, add_list) {

        let model = item;

        var identifier = this._gI_(item);

        if (identifier !== undefined) {

            if (!(model instanceof ModelBase)) {
                model = new this.model(item);
                model.MUTATION_ID = this.MUTATION_ID;
            }

            identifier = this._gI_(model, this._filters_);

            if (identifier !== undefined) {
                out = this.__insert__(model, add_list, identifier);
                this.__linksInsert__(model);
            }
        }

        return out;
    }

    delete(term, from_root = false) {
        if (!from_root)
            return this._deferUpdateToRoot_(term).remove(term);
        else
            this.remove(term);
    }

    /**
        Removes an item from the container. 
    */
    remove(term, from_root = false, __FROM_SCOPE__ = false) {

        if (!from_root)
            return this._deferUpdateToRoot_(term).remove(term, true);

        //term = this.getHook("term", term);

        if (!__FROM_SCOPE__ && this.scope) {

            if (!term)
                return this.scope.remove(this._filters_);
            else
                return this.scope.remove(term);
        }

        let out_container = [];

        if (!term)
            this.__removeAll__();

        else {

            let terms = (Array.isArray(term)) ? term : [term];

            //Need to convert terms into a form that will work for the identifier type
            terms = terms.map(t => (t instanceof ModelBase) ? t : this.validator.parse(t));

            this.__remove__(terms, out_container);
        }

        if (out_container.length > 0) {
            if (this.par)
                this.par.scheduleUpdate(this.prop_name);


            if (out_container && out_container.length > 0) {
                this.updateViewsRemoved(out_container);
                this.scheduleUpdate();
            }
        }

        return out_container;
    }

    /**
        Removes a ModelContainerBase from list of linked containers. 

        @param {ModelContainerBase} container - The ModelContainerBase instance to remove from the set of linked containers. Must be a member of the linked containers. 
    */
    __unlink__(container) {

        if (container instanceof ModelContainerBase && container.scope == this) {

            if (container == this.first_link)
                this.first_link = container.next;

            if (container.next)
                container.next.prev = container.prev;

            if (container.prev)
                container.prev.next = container.next;

            container.scope = null;
        }
    }

    /**
        Adds a container to the list of tracked containers. 

        @param {ModelContainerBase} container - The ModelContainerBase instance to add the set of linked containers.
    */
    __link__(container) {
        if (container instanceof ModelContainerBase && !container.scope) {

            container.scope = this;

            container.next = this.first_link;

            if (this.first_link)
                this.first_link.prev = container;

            this.first_link = container;

            container.pin = ((container) => {
                let id = setTimeout(() => {
                    container.__unlink__();
                }, 50);

                return () => {
                    clearTimeout(id);
                    if (!container.scope)
                        console.warn("failed to clear the destruction of container in time!");
                };
            })(container);
        }
    }

    /**
     * Remove items from linked ModelContainers according to the terms provided.
     * @param      {Array}  terms   Array of terms.
     * @private
     */
    __linksRemove__(item) {
        let a = this.first_link;
        while (a) {
            for (let i = 0; i < item.length; i++)
                if (a._gI_(item[i], a._filters_)) {
                    a.scheduleUpdate();
                    a.__linksRemove__(item);
                    break;
                }

            a = a.next;
        }
    }

    /**
     * Add items to linked ModelContainers.
     * @param      {Model}  item   Item to add.
     * @private
     */
    __linksInsert__(item) {
        let a = this.first_link;
        while (a) {
            if (a._gI_(item, a._filters_))
                a.scheduleUpdate();
            a = a.next;
        }
    }

    /**
        Removes any items in the ModelConatiner not included in the array "items", and adds any item in `items` not already in the ModelContainerBase.
        @param {Array} items - An array of identifiable Models or objects. 
    */
    cull(items) {
        let existing_items = __getAll__([], true);

        let loadHash = (item) => {
            if (item instanceof Array)
                return item.forEach((e) => loadHash(e));

            let identifier = this._gI_(item);

        };

        loadHash(items);

        for (let i = 0; i < existing_items.lenth; i++) {
            let e_item = existing_items[i];
            if (!existing_items[this._gI_(e_item)])
                this.__remove__(e_item);
        }

        this.insert(items);
    }

    __setFilters__(term) {

        if (!this._filters_) this._filters_ = [];

        if (Array.isArray(term))
            this._filters_ = this._filters_.concat(term.map(t => this.validator.parse(t)));
        else
            this._filters_.push(this.validator.parse(term));

    }

    /**
        Returns true if the identifier matches a predefined filter pattern, which is evaluated by this.parser. If a 
        parser was not present the ModelContainers schema, then the function will return true upon every evaluation.
    */
    __filterIdentifier__(identifier, filters) {
        if (filters.length > 0) {
            return this.validator.filter(identifier, filters);
        }
        return true;
    }

    _gIf_(item, term) {
        let t = this._gI_(item, this.filters);
    }

    /**
        Returns the Identifier property value if it exists in the item. If an array value for filters is passed, then undefined is returned if the identifier value does not pass filtering criteria.
        @param {(Object|Model)} item
        @param {Array} filters - An array of filter terms to test whether the identifier meets the criteria to be handled by the ModelContainerBase.
    */
    _gI_(item, filters = null) {

        let identifier;

        if (typeof(item) == "object" && this.key)
            identifier = item[this.key];
        else
            identifier = item;

        if (identifier && this.validator)
            identifier = this.validator.parse(identifier);

        if (filters && identifier)
            return (this.__filterIdentifier__(identifier, filters)) ? identifier : undefined;

        return identifier;
    }

    /** 
        OVERRIDE SECTION ********************************************************************
        
        All of these functions should be overridden by inheriting classes
    */

    __insert__() { return this; }

    __get__(item, __return_data__) { return __return_data__; }

    __getAll__(__return_data__) { return __return_data__; }

    __removeAll__() { return []; }

    __remove__() { return []; }

    clone() {
        let clone = super.clone();
        clone.key = this.key;
        clone.model = this.model;
        clone.validator = this.validator;
        clone.first_link = this.first_link;
        return clone;
    }

    // END OVERRIDE *************************************************************************
}

const proto = ModelContainerBase.prototype;
_SealedProperty_(proto, "model", null);
_SealedProperty_(proto, "key", "");
_SealedProperty_(proto, "validator", null);

class MultiIndexedContainer extends ModelContainerBase {

    constructor(data = [], root = null, address = []) {

        super(root, address);

        this.secondary_indexes = {};
        this.primary_index = null;
        this.primary_key = "";

        if (data[0] && data[0].key) {

            let key = data[0].key;

            if (data[0].model)
                this.model = data[0].model;

            if (Array.isArray(key))
                key.forEach((k) => (this.addKey(k)));

            data = data.slice(1);
        }

        if (Array.isArray(data) && data.length > 0)
            this.insert(data);
    }

    /**
        Returns the length of the first index in this container. 
    */
    get length() { return this.primary_index.length; }

    /**
        Insert a new ModelContainerBase into the index through the key.  
    */
    addKey(key) {
        let name = key.name;

        let container = new MultiIndexedContainer.array([{ key, model: this.model }]);

        if (this.primary_index) {
            this.secondary_indexes[name] = container;
            this.secondary_indexes[name].insert(this.primary_index.__getAll__());
        } else {
            this.primary_key = name;
            this.primary_index = container;
        }
    }

    get(item, __return_data__) {
        
        item = this.getHook("query", item);

        if (item) {
            for (let name in item) {
                if (name == this.primary_key)
                    return this.primary_index.get(item[name], __return_data__);

                else if (this.secondary_indexes[name])
                    return this.secondary_indexes[name].get(item[name], __return_data__);

            }
        } else
            return this.primary_index.get(null, __return_data__);
    }

    __insert__(model, add_list, identifier) {

        let out = false;

        model.par = this;

        if ((out = this.primary_index.insert(model))) {
            for (let name in this.secondary_indexes) {

                let index = this.secondary_indexes[name];

                index.insert(model);
            }
        }

        if (out)
            this.updateViews(this.primary_index.get());

        return out;
    }
    /**
        @private 
    */
    __remove__(term, out_container) {

        let out = false;

        if ((out = this.primary_index.__remove__(term, out_container))) {

            for (let name in this.secondary_indexes) {

                let index = this.secondary_indexes[name];

                index.__remove__(out_container);
            }
        }

        return out;
    }

    __removeAll__() {

        let out = false;

        out = this.primary_index.__removeAll__();

        for (let name in this.secondary_indexes) {

            let index = this.secondary_indexes[name];

            if (index.__removeAll__())
                out = true;
        }

        return out;
    }


    /**
        Overrides Model container default _gI_ to force item to pass.
        @private 
    */
    _gI_(item, filters = null) {
        return true;
    }

    toJSON() {
        return this.primary_index.toJSON();
    }

    clone() {
        let clone = super.clone();
        clone.secondary_indexes = this.secondary_indexes;
        clone.primary_index = this.primary_index;
        return clone;
    }
}

class NumberSchemeConstructor extends SchemeConstructor {

    constructor() {

        super();

        this.start_value = 0;
    }

    parse(value) {

        return parseFloat(value);
    }

    verify(value, result) {

        result.valid = true;

        if (value == NaN || value == undefined) {
            result.valid = false;
            result.reason = "Invalid number type.";
        }
    }

    filter(identifier, filters) {

        for (let i = 0, l = filters.length; i < l; i++)
            if (identifier == filters[i])
                return true;

        return false;
    }
}

let number$1 = new NumberSchemeConstructor();

let scape_date = new Date();
scape_date.setHours(0);
scape_date.setMilliseconds(0);
scape_date.setSeconds(0);
scape_date.setTime(0);

class DateSchemeConstructor extends NumberSchemeConstructor {

    parse(value) {

        if(!value)
            return undefined;

        if(value instanceof Date)
            return value.valueOf();

        if (!isNaN(value))
            return parseInt(value);

        let date = (new Date(value)).valueOf();

        if(date) return date;

        let lex = whind$1(value);

        let year = parseInt(lex.text);

        if (year) {

            scape_date.setHours(0);
            scape_date.setMilliseconds(0);
            scape_date.setSeconds(0);
            scape_date.setTime(0);

            lex.next();
            lex.next();
            let month = parseInt(lex.text) - 1;
            lex.next();
            lex.next();
            let day = parseInt(lex.text);
            scape_date.setFullYear(year);
            scape_date.setDate(day);
            scape_date.setMonth(month);

            lex.next();

            if (lex.pos > -1) {

                let hours = parseInt(lex.text);
                lex.next();
                lex.next();
                let minutes = parseInt(lex.text);

                scape_date.setHours(hours);
                scape_date.setMinutes(minutes);
            }



            return scape_date.valueOf();
        } 
    }

    /**
     
     */
    verify(value, result) {

        value = this.parse(value);

        super.verify(value, result);
    }

    filter(identifier, filters) {

        if (filters.length > 1) {

            for (let i = 0, l = filters.length - 1; i < l; i += 2) {
                let start = filters[i];
                let end = filters[i + 1];

                if (start <= identifier && identifier <= end) {
                    return true;
                }
            }
        }

        return false;
    }

    string(value) {
        
        return (new Date(value)) + "";
    }
}

let date = new DateSchemeConstructor();

class TimeSchemeConstructor extends NumberSchemeConstructor {

    parse(value) {
        if (!isNaN(value))
            return parseFloat(value);
        try {
            var hour = parseInt(value.split(":")[0]);
            var min = parseInt(value.split(":")[1].split(" ")[0]);
            if (value.split(":")[1].split(" ")[1])
                half = (value.split(":")[1].split(" ")[1].toLowerCase() == "pm");
            else
                half = 0;
        } catch (e) {
            var hour = 0;
            var min = 0;
            var half = 0;
        }
        
        return parseFloat((hour + ((half) ? 12 : 0) + (min / 60)));
    }

    verify(value, result) {
        this.parse(value);
        super.verify(value, result);
    }

    filter(identifier, filters) {
        return true
    }

    string(value) {
        return (new Date(value)) + "";
    }
}

let time = new TimeSchemeConstructor();

class StringSchemeConstructor extends SchemeConstructor {
    
    constructor() {

        super();

        this.start_value = "";
    }
    parse(value) {

        return value + "";
    }

    verify(value, result) {
        result.valid = true;

        if (value === undefined) {
            result.valid = false;
            result.reason = " value is undefined";
        } else if (!value instanceof String) {
            result.valid = false;
            result.reason = " value is not a string.";
        }
    }

    filter(identifier, filters) {

        for (let i = 0, l = filters.length; i < l; i++)
            if (identifier.match(filters[i] + ""))
                return true;

        return false;
    }
}

let string$1 = new StringSchemeConstructor();

class BoolSchemeConstructor extends SchemeConstructor {

    constructor() {

        super();

        this.start_value = false;
    }

    parse(value) {

        return (value) ? true : false;
    }

    verify(value, result) {

        result.valid = true;

        if (value === undefined) {
            result.valid = false;
            result.reason = " value is undefined";
        } else if (!value instanceof Boolean) {
            result.valid = false;
            result.reason = " value is not a Boolean.";
        }
    }

    filter(identifier, filters) {

        if (value instanceof Boolean)
            return true;

        return false;
    }
}

let bool = new BoolSchemeConstructor();

let schemes = { date, string: string$1, number: number$1, bool, time };

class BTreeModelContainer extends ModelContainerBase {

    constructor(data = [], root = null, address = []) {

        super(root, address);

        this.validator = schemes.number;

        if (data[0] && data[0].key) {

            let key = data[0].key;

            if (typeof key == "object") {

                if (key.type)
                    this.validator = (key.type instanceof NumberSchemeConstructor) ? key.type : this.validator;

                if (key.name)
                    this.key = key.name;

                if (key.unique_key)
                    this.unique_key = key.unique_key;
            } else
                this.key = key;

            if (data[0].model)
                this.model = data[0].model;

            data = data.slice(1);
        }

        this.min = 10;
        this.max = 20;
        this.size = 0;
        this.btree = null;

        if (Array.isArray(data) && data.length > 0)
            this.insert(data);
    }

    destroy() {
        if (this.btree)
            this.btree.destroy();

        super.destroy();
    }

    get length() {
        return this.size;
    }

    __insert__(model, add_list, identifier) {

        let result = {
            added: false
        };

        if (!this.btree)
            this.btree = new BtreeNode(true);

        this.btree = this.btree.insert(identifier, model, this.unique_key, this.max, true, result).newnode;

        if (add_list) add_list.push(model);

        if (result.added) {
            this.size++;
            this.__updateLinks__();
        }

        return result.added;
    }

    __get__(terms, __return_data__) {

        if(!this.btree) return __return_data__;

        if (__return_data__ instanceof BTreeModelContainer){
            __return_data__.btree = this.btree;
            return __return_data__;
        }

        let out = [];

        for (let i = 0, l = terms.length; i < l; i++) {
            let b, a = terms[i];

            if (a instanceof ModelBase)
                continue;

            if (i < l-1 && !(terms[i + 1] instanceof ModelBase)) {
                b = terms[++i];
            } else
                b = a;

            this.btree.get(a, b, out);
        }

        if (this._filters_) {
            for (let i = 0, l = out.length; i < l; i++) {
                let model = out[i];

                if (this._gI_(model, this._filters_))
                    __return_data__.push(model);
            }
        } else
            for (let i = 0, l = out.length; i < l; i++)
                __return_data__.push(out[i]);



        return __return_data__;
    }

    __remove__(terms, out_container = []) {

        if(!this.btree) return false;

        let result = 0;

        for (let i = 0, l = terms.length; i < l; i++) {
            let b, a = terms[i];

            if ((a instanceof ModelBase)) {
                let v = this._gI_(a);
                let o = this.btree.remove(v, v, this.unique_key, this.unique_key ? a[this.unique_key] : "", true, this.min, out_container);
                result += o.out;
                this.btree = o.out_node;
                continue;
            }

            if (i < l-1 && !(terms[i + 1] instanceof ModelBase)) {
                b = terms[++i];
            } else
                b = a;

            let o = this.btree.remove(a, b, "", "", true, this.min, out_container);
            result += o.out;
            this.btree = o.out_node;
        }

        if (result > 0) {
            this.size -= result;
            this.__updateLinks__();
            this.__linksRemove__(out_container);
        }


        return result !== 0;
    }

    __updateLinks__() {
        let a = this.first_link;
        while (a) {
            a.btree = this.btree;
            a = a.next;
        }
    }

    __getAll__(__return_data__) {

        if (this._filters_) {
            this.__get__(this._filters_, __return_data__);
        } else if (this.btree)
            this.btree.get(-Infinity, Infinity, __return_data__);

        return __return_data__;
    }

    __removeAll__() {
        if (this.btree)
            this.btree.destroy();
        this.btree = null;
    }

    toJSON() {
        let out_data = [];

        if (this.btree) {

            this.btree.get(this.min, this.max, out_data);
        }

        return out_data;
    }

    clone() {
        let clone = super.clone();
        clone.btree = this.btree;
        return clone;
    }
}

class BtreeNode {
    constructor(IS_LEAF = false) {
        this.LEAF = IS_LEAF;
        this.nodes = [];
        this.keys = [];
        this.items = 0;
    }

    destroy() {

        this.nodes = null;
        this.keys = null;

        if (!this.LEAF) {
            for (let i = 0, l = this.nodes.length; i < l; i++)
                this.nodes[i].destroy();
        }

    }

    balanceInsert(max_size, IS_ROOT = false) {
        if (this.keys.length >= max_size) {
            //need to split this up!

            let newnode = new BtreeNode(this.LEAF);

            let split = (max_size >> 1) | 0;

            let key = this.keys[split];

            let left_keys = this.keys.slice(0, split);
            let left_nodes = this.nodes.slice(0, (this.LEAF) ? split : split + 1);

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
            };
        }

        return {
            newnode: this,
            key: 0
        };
    }

    /**
        Inserts model into the tree, sorted by identifier. 
    */
    insert(identifier, model, unique_key, max_size, IS_ROOT = false, result) {

        let l = this.keys.length;

        if (!this.LEAF) {

            for (var i = 0; i < l; i++) {

                let key = this.keys[i];

                if (identifier < key) {
                    let node = this.nodes[i];

                    let o = node.insert(identifier, model, unique_key, max_size, false, result);
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
            } = node.insert(identifier, model, unique_key, max_size, false, result);

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

                    if (unique_key) {
                        if (this.nodes[i][unique_key] !== model[unique_key]) { continue; }
                    } else
                        this.nodes[i].set(model);
                    

                    result.added = false;

                    return {
                        newnode: this,
                        key: identifier
                    };
                } else if (identifier < key) {

                    this.keys.splice(i, 0, identifier);
                    this.nodes.splice(i, 0, model);

                    result.added = true;

                    return this.balanceInsert(max_size, IS_ROOT);
                }
            }

            this.keys.push(identifier);
            this.nodes.push(model);

            result.added = true;

            return this.balanceInsert(max_size, IS_ROOT);
        }

        return {
            newnode: this,
            key: identifier,
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
                if (!left.LEAF) left.keys.push(key);
                left.keys = left.keys.concat(node.keys);


                if (left.LEAF)
                    for (let i = 0; i < left.keys.length; i++)
                        if (left.keys[i] != left.nodes[i].id)
                            ;
                return true;
            }

    }

    remove(start, end, unique_key, unique_id, IS_ROOT = false, min_size, out_container) {
        let l = this.keys.length,
            out = 0,
            out_node = this;

        if (!this.LEAF) {

            for (var i = 0; i < l; i++) {

                let key = this.keys[i];

                if (start <= key)
                    out += this.nodes[i].remove(start, end, unique_key, unique_id, false, min_size, out_container).out;
            }

            out += this.nodes[i].remove(start, end, unique_key, unique_id, false, min_size, out_container).out;

            for (var i = 0; i < this.nodes.length; i++) {
                if (this.nodes[i].keys.length < min_size) {
                    if (this.balanceRemove(i, min_size)) {
                        l--;
                        i--;
                    }
                }
            }

            if (this.nodes.length == 1)
                out_node = this.nodes[0];

        } else {

            for (let i = 0, l = this.keys.length; i < l; i++) {
                let key = this.keys[i];

                if (key <= end && key >= start) {
                    if (unique_id && this.nodes[i][unique_key] !== unique_id) continue;
                    out_container.push(this.nodes[i]);
                    out++;
                    this.keys.splice(i, 1);
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

    get(start, end, out_container) {

        if (!start || !end)
            return false;

        if (!this.LEAF) {

            for (var i = 0, l = this.keys.length; i < l; i++) {

                let key = this.keys[i];

                if (start <= key)
                    this.nodes[i].get(start, end, out_container);
            }

            this.nodes[i].get(start, end, out_container);

        } else {

            for (let i = 0, l = this.keys.length; i < l; i++) {
                let key = this.keys[i];

                if (key <= end && key >= start)
                    out_container.push(this.nodes[i]);
            }
        }
    }
}

MultiIndexedContainer.btree = BTreeModelContainer;

const ArrayContainerProxySettings = {

    set: function(obj, prop, val) {

        if (prop in obj && obj[prop] == val)
            return true;

        let property = obj[prop];

        if (property && typeof(property) == "object")
            property.set(val);
        else
            obj[prop] = val;

        obj.scheduleUpdate(prop);

        return true;
    },

    get: function(obj, prop, val) {

        if (prop in obj)
            return obj[prop];

        if (!isNaN(prop))
            return obj.data[prop];

        let term = {};

        term[obj.key] = prop;

        return obj.get(prop, [])[0];
    }
};

/**
    Stores models in random order inside an internal array object. 
 */

class ArrayModelContainer extends ModelContainerBase {

    constructor(data = [], root = null, address = []) {

        super(root, address);

        if (data[0] && data[0].key) {

            let key = data[0].key;

            /* Custom selection of container types happens here. 
             * If there are multiple keys present, then a MultiIndexedContainer is used.
             * If the value of the key is a Numerical type, then a BtreeModelContainer is used.
             **/
            if (typeof(key) == "object") {

                if (Array.isArray(key))
                    return new MultiIndexedContainer(data, root, address);

                if (key.type) {
                    if (key.type instanceof NumberSchemeConstructor)
                        return new BTreeModelContainer(data, root, address);
                    this.validator = (key.type instanceof SchemeConstructor) ? key.type : this.validator;
                }

                if (key.name)
                    this.key = key.name;
            } else
                this.key = key;

            if (data[0].model)
                this.model = data[0].model;

            data = data.slice(1);
        }

        this.data = [];

        if (Array.isArray(data) && data.length > 0)
            this.insert(data, true);
    }

    destroy() {

        this.data = null;

        super.destroy();
    }

    get proxy() { return new Proxy(this, ArrayContainerProxySettings); }

    set proxy(v) {}

    get length() { return this.data.length; }

    __defaultReturn__(USE_ARRAY) {

        if (USE_ARRAY) return new MCArray();

        let n = this.clone();

        this.__link__(n);

        return n;
    }

    __insert__(model, add_list, identifier) {

        for (var i = 0, l = this.data.length; i < l; i++) {

            var obj = this.data[i];

            if (this._gI_(obj) == identifier) {

                if (obj.MUTATION_ID !== this.MUTATION_ID) {
                    obj = obj.clone();
                    obj.MUTATION_ID = this.MUTATION_ID;
                }

                obj.set(model, true);

                this.data[i] = obj;

                return false; //Model not added to Container. Model just updated.
            }
        }

        this.data.push(model);

        model.address = this.address.slice();
        model.address.push(this.data.length - 1);

        model.root = this.root;

        if (add_list) add_list.push(model);

        return true; // Model added to Container.
    }

    getByIndex(i) {
        return this.data[i];
    }

    setByIndex(i, m) {
        this.data[i] = m;
    }

    __get__(term, return_data) {

        let terms = null;

        if (term)
            if (term instanceof Array)
                terms = term;
            else
                terms = [term];

        for (let i = 0, l = this.data.length; i < l; i++) {
            let obj = this.data[i];
            if (this._gI_(obj, terms)) {
                return_data.push(obj);
            }
        }

        return return_data;
    }

    __getAll__(return_data) {

        this.data.forEach((m) => {
            return_data.push(m);
        });

        return return_data;
    }

    __removeAll__() {
        let items = this.data.map(d => d) || [];

        this.data.length = 0;

        return items;
    }

    _setThroughRoot_(data, address, index, len, m_id) {

        if (index >= len)
            return this;

        let i = address[index++];

        let model_prop = this.data[i];

        if (model_prop.MUTATION_ID !== this.MUTATION_ID) {
            model_prop = model_prop.clone();
            model_prop.MUTATION_ID = this.MUTATION_ID;
        }

        this.data[i] = model_prop;

        return model_prop._setThroughRoot_(data, address, index, len, model_prop.MUTATION_ID);
    }

    __remove__(term, out_container) {

        let result = false;

        term = term.map(t => (t instanceof ModelBase) ? this._gI_(t) : t);
        
        for (var i = 0, l = this.data.length; i < l; i++) {
            var obj = this.data[i];

            if (this._gI_(obj, term)) {

                result = true;

                this.data.splice(i, 1);

                l--;
                i--;

                out_container.push(obj);

                break;
            }
        }

        return result;
    }

    toJSON() { return this.data; }

    clone() {
        let clone = super.clone();
        clone.data = this.data.slice();
        return clone;
    }
}

MultiIndexedContainer.array = ArrayModelContainer;

Object.freeze(ArrayModelContainer);

class Model extends ModelBase {

    constructor(data, root = null, address = []) {

        super(root, address);

        _SealedProperty_(this, "prop_array", []);
        _SealedProperty_(this, "prop_offset", 0);
        _SealedProperty_(this, "look_up", {});

        if (data)
            for (let name in data)
                this.createProp(name, data[name]);

    }

    get proxy() { return this;}

    set(data, FROM_ROOT = false) {

        if (!FROM_ROOT)
            return this._deferUpdateToRoot_(data).set(data, true);

        if (!data)
            return false;

        let out = false;

        for (let prop_name in data) {

            let index = this.look_up[prop_name];

            if (index !== undefined) {

                let prop = this.prop_array[index];

                if (typeof(prop) == "object") {

                    if (prop.MUTATION_ID !== this.MUTATION_ID) {
                        prop = prop.clone();
                        prop.MUTATION_ID = this.MUTATION_ID;
                        this.prop_array[index] = prop;
                    }

                    if (prop.set(data[prop_name], true)){
                        this.scheduleUpdate(prop_name);
                        out = true;
                    }

                } else if (prop !== data[prop_name]) {
                    this.prop_array[index] = data[prop_name];
                     this.scheduleUpdate(prop_name);
                     out = true;
                }
            } else{
                this.createProp(prop_name, data[prop_name]);
                out = true;
            }
        }

        return out;
    }
    createProp(name, value) {

        let index = this.prop_offset++;

        this.look_up[name] = index;
        var address = this.address.slice();
        address.push(index);

        switch (typeof(value)) {

            case "object":
                if (Array.isArray(value))
                    this.prop_array.push(new ArrayModelContainer(value, this.root, address));
                else {
                    if (value instanceof ModelBase) {
                        value.address = address;
                        this.prop_array.push(value);
                    } else
                        this.prop_array.push(new Model(value, this.root, address));
                }

                this.prop_array[index].prop_name = name;
                this.prop_array[index].par = this;

                Object.defineProperty(this, name, {

                    configurable: false,

                    enumerable: true,

                    get: function() { return this.getHook(name, this.prop_array[index]); },

                    set: (v) => {}
                });

                break;

            case "function":

                let object = new value(null, this.root, address);

                object.par = this;
                object.prop_name = name;

                this.prop_array.push(object);

                Object.defineProperty(this, name, {

                    configurable: false,

                    enumerable: true,

                    get: function() { return this.getHook(name, this.prop_array[index]); },

                    set: (v) => {}
                });

                break;

            default:
                this.prop_array.push(value);

                Object.defineProperty(this, name, {

                    configurable: false,

                    enumerable: true,

                    get: function() { return this.getHook(name, this.prop_array[index]); },

                    set: function(value) {

                        let val = this.prop_array[index];

                        if (val !== value) {
                            this.prop_array[index] = this.setHook(name, value);
                            this.scheduleUpdate(name);
                        }
                    }
                });
        }

        this.scheduleUpdate(name);
    }

    toJSON(HOST = true){
        let data = {};

        for(let name in this.look_up){
            let index = this.look_up[name];
            let prop = this.prop_array[index];

            if(prop){
                if(prop instanceof ModelBase)
                    data[name] = prop.toJSON(false);
                else
                    data[name] = prop;
            }
        }

        return HOST ? JSON.stringify(data) : data;    
    }
}

ModelContainerBase.prototype.model = Model;

class Store {
    constructor(data) {

        this.history = [{ model: new Model(data, this), actions: [{ d: data, a: null }] }];
        this.MUTATION_ID = 0;
    }

    seal() { this.MUTATION_ID++; }

    getHistory(index) { return (this.history[index]) ? this.history[index].model : null; }

    get current() { return this.history[this.history.length - 1].model; }

    set current(v) {}

    get(data){
        return this.current.get(data);
    }

    set(data){
        return this.current.set(data);
    }

    _getParentMutationID_() { return this.MUTATION_ID; }

    _setThroughRoot_(data, address, index, len_minus_1, m_id) {

        let model_prop = this.current;

        if (m_id !== this.MUTATION_ID) {

            if (m_id > this.MUTATION_ID)
                this.MUTATION_ID = this.MUTATION_ID + 1;
            else
                this.MUTATION_ID = this.MUTATION_ID;

            model_prop = model_prop.clone();

            model_prop.MUTATION_ID = this.MUTATION_ID;

            this.history.push({ model: model_prop, actions: [] });
        }

        if (data)
            this.history[this.history.length - 1].actions.push({ d: data, a: address });

        return model_prop._setThroughRoot_(data, address, index, len_minus_1, this.MUTATION_ID);
    }
}

//import { CustomComponent } from "../page/component"

let CachedPresets = null;
/**
 // There are a number of configurable options and global objects that can be passed to wick to be used throughout the PWA. The instances of the Presets class are objects that hosts all these global properties. 
 * 
 // Presets are designed to be created once, upfront, and not changed once defined. This reinforces a holistic design for a PWA should have in terms of the types of Schemas, global Models, and overall form the PWA takes, e.g whether to use the ShadowDOM or not.
 * 
 // Note: *This object is made immutable once created. There may only be one instance of Presets*
 * 
 */
class Presets {
    constructor(preset_options) {

        if (!preset_options)
            preset_options = {};

        //if(Presets.global.v)
        //    return Presets.global.v;

        this.store = (preset_options.store instanceof Store) ? preset_options.store : null;

        /**
         * {Object} Store for optional parameters used in the app
         */
        this.options = {
            INJECT_ERROR_HANDLER_INTO_SUBFUNCTIONS: false,
        };

        //Declaring the properties upfront to give the VM a chance to build an appropriate virtual class.
        this.components = {};

        this.custom_components = {};

        /** 
         * Store of user defined CustomScopePackage factories that can be used in place of the components built by the Wick templating system. Accepts any class extending the CustomComponent class. Adds these classes from preset_options.custom_scopes or preset_options.components. 
         * 
         * In routing mode, a HTML `<component>` tag whose first classname matches a property name of a member of presets.custom_scopes will be assigned to an instance of that member.
         * 
         * ### Example
         * In HTML:
         * ```html
         * <component class="my_scope class_style">
         * 
         * ```
         * In JavaScript:
         * ```javascript
         * let MyScope = CustomScopePackage( ele =>{
         *      ele.append
         * }, {});
         * 
         * preset_options.custom_componets = {
         *      my_scope : MyScope
         * }
         * ```
         * @instance
         * @readonly
         */
        this.custom_scopes = {};

        /**
         * { Object } Store of user defined classes that extend the Model or Model classes. `<w-scope>` tags in templates that have a value set for the  `schema` attribute, e.g. `<w-s schema="my_favorite_model_type">...</w-s>`, will be bound to a new instance of the class in presets.schema whose property name matches the "schema" attribute.
         * 
         * Assign classes that extend Model or SchemedModel to preset_options.schemas to have them available to Wick.
         * 
         * In JavaScript:
         * ```javascript
         * class MyFavoriteModelType extends Model {};
         * preset_options.custom_componets = {
         *      my_favorite_model_type : MyFavoriteModelType
         * }
         * ```
         * note: presets.schema.any is always assigned to the Model class.
         * @instance
         * @readonly
         */
        this.schemas = { any: Model };

        /**
         * { Object } Store of user defined Model instances that serve as global models, which are available to the whole application. Multiple Scopes will be able to _bind_ to the Models. `<w-scope>` tags in templates that have a value set for the  `model` attribute, e.g. `<w-s model="my_global_model">...</w-s>`, will be bound to the model in presets .model whose property name matches the "model" attribute.
         * 
         * Assign instances of Model or Model or any class that extends these to preset_options.models to have them used by Wick.
         * 
         * In JavaScript:
         * ```javascript
         * const MyGlobalModel = new Model({global_data: "This is global!"});
         * preset_options.custom_componets = {
         *      my_global_model : MyGlobalModel
         * }
         * ```
         * @instance
         * @readonly
         */
        this.models = {};

        
        /**
         * { Object } Contains all user defined HTMLElement templates 
         */
        this.templates = {};

        /**
         * Custom objects that can be used throughout component scripts. User defined. 
         */
        this.custom = preset_options.custom || {};

        let c = preset_options.options;
        if (c)
            for (let cn in c)
                this.options[cn] = c[cn];


        c = preset_options.components;
        if (c)
            for (let cn in c)
                this.components[cn] = c[cn];

        c = preset_options.custom_scopes;
        if (c)
            for (let cn in c)
                if (cn instanceof CustomComponent)
                    this.custom_scopes[cn] = c[cn];

        c = preset_options.custom_components;
        if (c)
            for (let cn in c)
                this.custom_components[cn] = c[cn];

        c = preset_options.models;

        if (c)
            for (let cn in c)
                if (c[cn] instanceof ModelBase)
                    this.models[cn] = c[cn];

        c = preset_options.schemas;
        if (c)
            for (let cn in c)
                if (ModelBase.isPrototypeOf(c[cn]))
                    this.schemas[cn] = c[cn];
        /**
         * Configured by `preset_options.USE_SHADOW`. If set to true, and if the browser supports it, compiled and rendered template elements will be bound to a `<component>` shadow DOM, instead being appended as a child node.
         * @instance
         * @readonly
         */
        this.options.USE_SHADOW = (preset_options.USE_SHADOW) ? (DOC.head.createShadowRoot || DOC.head.attachShadow) : false;
        this.options.USE_SHADOWED_STYLE = ((preset_options.USE_SHADOWED_STYLE) && (this.options.USE_SHADOW));
        this.url = URL;

        Object.freeze(this.options);
        Object.freeze(this.custom_scopes);
        Object.freeze(this.schemas);
        Object.freeze(this.models);

        CachedPresets = this;
    }

    processLink(link) {}

    /**
        Copies values of the Presets object into a generic object. The new object is not frozen.
    */
    copy() {
        const obj = {};

        for (let a in this) {
            if (a == "components")
                obj.components = this.components;
            else if (typeof(this[a]) == "object")
                obj[a] = Object.assign({}, this[a]);
            else if (typeof(this[a]) == "array")
                obj[a] = this[a].slice();
            else
                obj[a] = this[a];
        }

        const presets = new Presets(obj);

        presets.processLink = this.processLink.bind(this);

        return presets;
    }
}

Presets.global = {get v(){return CachedPresets}, set v(e){}};

let fn = {}; const  
/************** Maps **************/

    /* Symbols To Inject into the Lexer */
    symbols = ["</","||","^=","$=","*=","<=",">=","...","<",">","==","!=","===","!==","**","++","--","<<",">>",">>>","&&","+=","-=","%=","/=","**=","<<=",">>=",">>>=","&=","|=","=>","//","/*","${"],

    /* Goto lookup maps */
    gt0 = [0,-1,1,7,5,-1,8,-110,3,11,12,15,14,13,16,17,-10,18,-9,19,22,23,131,30,24,38,28,25,29,-2,117,-2,31,32,33,35,34,118,-4,26,-2,36,-3,37,27,-2,132,136,-3,134,-7,45,111,-4,109,130,-8,42,41,40,46,70,72,75,76,107,71,108,-4,74,81,101,102,-2,104,-13,80,-3,43,-1,44,47,48,49,50,51,52,53,54,55,56,57,58,59,67,82,-11,79,-3,92,93,91,90,113,78,112,83,84,86,-3,85,2,4,6,10],
gt1 = [0,-2,140,-2,8,-291,139,141],
gt2 = [0,-299,144,-7,143,146,-3,145],
gt3 = [0,-119,166,-2,16,17,-10,18,-9,19,22,23,131,30,24,38,28,25,29,-2,117,-2,31,32,33,35,34,118,-4,26,-2,36,-3,37,27,-2,132,136,-3,134,-7,45,111,-4,109,130,-8,42,41,40,46,70,72,75,76,107,71,108,-4,74,81,101,102,-2,104,-13,80,-3,43,-1,44,47,48,49,50,51,52,53,54,55,56,57,58,59,67,82,-11,79,-3,92,93,91,90,113,78,112,83,84,86,-3,85,-3,167],
gt4 = [0,-124,169,171,172,-2,173,-2,170,174,-147,178,-6,175,84,86,-3,85],
gt5 = [0,-137,180,-8,182,131,-29,181,-2,132,136,-3,134,-14,130],
gt6 = [0,-141,187,186,185,188,22,23,131,30,24,38,28,25,29,-2,117,-2,31,32,33,35,34,118,-4,26,-2,36,-3,37,27,-2,132,136,-3,134,-7,45,111,-4,109,130,-8,42,41,40,46,70,72,75,76,107,71,108,-4,74,81,101,102,-2,104,-13,80,-3,43,-1,44,47,48,49,50,51,52,53,54,55,56,57,58,59,67,82,-11,79,-3,92,93,91,90,113,78,112,83,84,86,-3,85,-3,167],
gt7 = [0,-249,192],
gt8 = [0,-184,236,-14,109,-1,237,-10,234,70,72,75,76,107,71,108,-4,74,81,101,102,-2,104,-6,235,-6,80,-17,232,233,67,238,-11,79,-3,92,93,91,90,-1,78,-1,239,84,86,-3,85,-3,167],
gt9 = [0,-184,236,-14,109,-1,237,-10,234,70,72,75,76,107,71,108,-4,74,81,101,102,-2,104,-6,235,-6,80,-17,243,233,67,238,-11,79,-3,92,93,91,90,-1,78,-1,239,84,86,-3,85,-3,167],
gt10 = [0,-184,236,-14,109,-1,237,-10,234,70,72,75,76,107,71,108,-4,74,81,101,102,-2,104,-6,235,-6,80,-17,244,233,67,238,-11,79,-3,92,93,91,90,-1,78,-1,239,84,86,-3,85,-3,167],
gt11 = [0,-184,236,-14,109,-1,237,-10,234,70,72,75,76,107,71,108,-4,74,81,101,102,-2,104,-6,235,-6,80,-17,245,233,67,238,-11,79,-3,92,93,91,90,-1,78,-1,239,84,86,-3,85,-3,167],
gt12 = [0,-184,236,-14,109,-1,237,-10,234,70,72,75,76,107,71,108,-4,74,81,101,102,-2,104,-6,235,-6,80,-17,246,233,67,238,-11,79,-3,92,93,91,90,-1,78,-1,239,84,86,-3,85,-3,167],
gt13 = [0,-184,236,-14,109,-1,237,-10,234,70,72,75,76,107,71,108,-4,74,81,101,102,-2,104,-6,235,-6,80,-17,247,233,67,238,-11,79,-3,92,93,91,90,-1,78,-1,239,84,86,-3,85,-3,167],
gt14 = [0,-184,236,-14,109,-1,237,-10,234,70,72,75,76,107,71,108,-4,74,81,101,102,-2,104,-6,235,-6,80,-17,248,233,67,238,-11,79,-3,92,93,91,90,-1,78,-1,239,84,86,-3,85,-3,167],
gt15 = [0,-184,236,-14,109,-1,237,-10,234,70,72,75,76,107,71,108,-4,74,81,101,102,-2,104,-6,235,-6,80,-17,249,233,67,238,-11,79,-3,92,93,91,90,-1,78,-1,239,84,86,-3,85,-3,167],
gt16 = [0,-184,236,-14,109,-1,237,-10,234,70,72,75,76,107,71,108,-4,74,81,101,102,-2,104,-6,235,-6,80,-17,250,233,67,238,-11,79,-3,92,93,91,90,-1,78,-1,239,84,86,-3,85,-3,167],
gt17 = [0,-220,252,-4,254,101,102,-2,104],
gt18 = [0,-220,259,-4,258,101,102,-2,104],
gt19 = [0,-184,236,-16,237,-11,260,261,75,76,107,-6,74,81,101,102,-2,104,-6,235,-6,80,-20,238,-11,79,-3,92,93,91,90,-1,78,-1,239,84,86,-3,85,-3,167],
gt20 = [0,-291,266,264,265],
gt21 = [0,-278,277,-1,275],
gt22 = [0,-278,277,-1,285],
gt23 = [0,-184,236,-8,45,111,-4,109,-1,237,-10,46,70,72,75,76,107,71,108,-4,74,81,101,102,-2,104,-6,235,-6,80,287,288,291,290,-1,44,47,48,49,50,51,52,53,54,55,56,57,58,59,67,82,-11,79,-3,92,93,91,90,-1,78,112,292,84,86,-3,85,-3,167],
gt24 = [0,-233,299,298,295],
gt25 = [0,-184,236,-8,45,111,-4,109,-1,237,-7,42,41,311,46,70,72,75,76,107,71,108,-4,74,81,101,102,-2,104,-6,235,-6,80,-3,43,-1,44,47,48,49,50,51,52,53,54,55,56,57,58,59,67,82,-11,79,-3,92,93,91,90,-1,78,112,292,84,86,-3,85,-3,167],
gt26 = [0,-184,236,-8,45,111,-4,109,-1,237,-7,42,41,313,46,70,72,75,76,107,71,108,-4,74,81,101,102,-2,104,-6,235,-6,80,-3,43,-1,44,47,48,49,50,51,52,53,54,55,56,57,58,59,67,82,-11,79,-3,92,93,91,90,-1,78,112,292,84,86,-3,85,-3,167],
gt27 = [0,-220,317],
gt28 = [0,-184,236,-14,109,-1,237,-10,234,70,72,75,76,107,71,108,-4,74,81,101,102,-2,104,-6,235,-6,80,-17,318,233,67,238,-11,79,-3,92,93,91,90,-1,78,-1,239,84,86,-3,85,-3,167],
gt29 = [0,-170,320],
gt30 = [0,-178,322,323,-86,325,327,328,-18,324,326,84,86,-3,85],
gt31 = [0,-145,332,-2,30,24,38,28,25,29,-2,117,-2,31,32,33,35,34,118,-4,26,-2,36,-3,37,27,-15,45,111,-4,109,-9,42,41,40,46,70,72,75,76,107,71,108,-4,74,81,101,102,-2,104,-13,80,-3,43,-1,44,47,48,49,50,51,52,53,54,55,56,57,58,59,67,82,-11,79,-3,92,93,91,90,113,78,112,83,84,86,-3,85,-3,167],
gt32 = [0,-285,337,-2,339,84,86,-3,85],
gt33 = [0,-285,340,-2,339,84,86,-3,85],
gt34 = [0,-184,236,-8,45,111,-4,109,-1,237,-7,42,41,342,46,70,72,75,76,107,71,108,-4,74,81,101,102,-2,104,-6,235,-6,80,-3,43,-1,44,47,48,49,50,51,52,53,54,55,56,57,58,59,67,82,-11,79,-3,92,93,91,90,-1,78,112,292,84,86,-3,85,-3,167],
gt35 = [0,-184,236,-8,45,111,-4,109,-1,237,-7,42,41,345,46,70,72,75,76,107,71,108,-4,74,81,101,102,-2,104,-6,235,-6,80,-3,43,-1,44,47,48,49,50,51,52,53,54,55,56,57,58,59,67,82,-11,79,-3,92,93,91,90,-1,78,112,292,84,86,-3,85,-3,167],
gt36 = [0,-150,346],
gt37 = [0,-202,349,350,-83,348,326,84,86,-3,85],
gt38 = [0,-287,353,326,84,86,-3,85],
gt39 = [0,-182,355,356,-82,358,327,328,-18,357,326,84,86,-3,85],
gt40 = [0,-303,359,362,363,-2,146,-3,366],
gt41 = [0,-303,367,362,363,-2,146,-3,366],
gt42 = [0,-303,370,362,363,-2,146,-3,366],
gt43 = [0,-309,375,373,374],
gt44 = [0,-130,382],
gt45 = [0,-127,390,387,-2,391,-1,392,-154,393,84,86,-3,85],
gt46 = [0,-130,394],
gt47 = [0,-130,395],
gt48 = [0,-147,397,-37,134,-7,45,111,-4,109,398,-11,46,70,72,75,76,107,71,108,-4,74,81,101,102,-2,104,-6,235,-6,80,-3,399,-1,44,47,48,49,50,51,52,53,54,55,56,57,58,59,67,82,-11,79,-3,92,93,91,90,-1,78,112,292,84,86,-3,85,-3,167],
gt49 = [0,-135,403,400,-1,404,-149,405,84,86,-3,85],
gt50 = [0,-141,407,-2,188,22,23,131,30,24,38,28,25,29,-2,117,-2,31,32,33,35,34,118,-4,26,-2,36,-3,37,27,-2,132,136,-3,134,-7,45,111,-4,109,130,-8,42,41,40,46,70,72,75,76,107,71,108,-4,74,81,101,102,-2,104,-13,80,-3,43,-1,44,47,48,49,50,51,52,53,54,55,56,57,58,59,67,82,-11,79,-3,92,93,91,90,113,78,112,83,84,86,-3,85,-3,167],
gt51 = [0,-184,236,-8,45,111,-4,109,-1,237,-7,408,-2,46,70,72,75,76,107,71,108,-4,74,81,101,102,-2,104,-6,235,-6,80,-3,43,-1,44,47,48,49,50,51,52,53,54,55,56,57,58,59,67,82,-11,79,-3,92,93,91,90,-1,78,112,292,84,86,-3,85,-3,167],
gt52 = [0,-184,236,-8,45,111,-4,109,-1,237,-10,46,70,72,75,76,107,71,108,-4,74,81,101,102,-2,104,-6,235,-6,80,-3,409,-1,44,47,48,49,50,51,52,53,54,55,56,57,58,59,67,82,-11,79,-3,92,93,91,90,-1,78,112,292,84,86,-3,85,-3,167],
gt53 = [0,-184,236,-8,45,111,-4,109,-1,237,-10,46,70,72,75,76,107,71,108,-4,74,81,101,102,-2,104,-6,235,-6,80,-3,410,-1,44,47,48,49,50,51,52,53,54,55,56,57,58,59,67,82,-11,79,-3,92,93,91,90,-1,78,112,292,84,86,-3,85,-3,167],
gt54 = [0,-184,236,-8,45,111,-4,109,-1,237,-10,46,70,72,75,76,107,71,108,-4,74,81,101,102,-2,104,-6,235,-6,80,-3,411,-1,44,47,48,49,50,51,52,53,54,55,56,57,58,59,67,82,-11,79,-3,92,93,91,90,-1,78,112,292,84,86,-3,85,-3,167],
gt55 = [0,-184,236,-14,109,-1,237,-10,234,70,72,75,76,107,71,108,-4,74,81,101,102,-2,104,-6,235,-6,80,-7,412,49,50,51,52,53,54,55,56,57,58,59,67,238,-11,79,-3,92,93,91,90,-1,78,-1,239,84,86,-3,85,-3,167],
gt56 = [0,-184,236,-14,109,-1,237,-10,234,70,72,75,76,107,71,108,-4,74,81,101,102,-2,104,-6,235,-6,80,-8,413,50,51,52,53,54,55,56,57,58,59,67,238,-11,79,-3,92,93,91,90,-1,78,-1,239,84,86,-3,85,-3,167],
gt57 = [0,-184,236,-14,109,-1,237,-10,234,70,72,75,76,107,71,108,-4,74,81,101,102,-2,104,-6,235,-6,80,-9,414,51,52,53,54,55,56,57,58,59,67,238,-11,79,-3,92,93,91,90,-1,78,-1,239,84,86,-3,85,-3,167],
gt58 = [0,-184,236,-14,109,-1,237,-10,234,70,72,75,76,107,71,108,-4,74,81,101,102,-2,104,-6,235,-6,80,-10,415,52,53,54,55,56,57,58,59,67,238,-11,79,-3,92,93,91,90,-1,78,-1,239,84,86,-3,85,-3,167],
gt59 = [0,-184,236,-14,109,-1,237,-10,234,70,72,75,76,107,71,108,-4,74,81,101,102,-2,104,-6,235,-6,80,-11,416,53,54,55,56,57,58,59,67,238,-11,79,-3,92,93,91,90,-1,78,-1,239,84,86,-3,85,-3,167],
gt60 = [0,-184,236,-14,109,-1,237,-10,234,70,72,75,76,107,71,108,-4,74,81,101,102,-2,104,-6,235,-6,80,-12,417,54,55,56,57,58,59,67,238,-11,79,-3,92,93,91,90,-1,78,-1,239,84,86,-3,85,-3,167],
gt61 = [0,-184,236,-14,109,-1,237,-10,234,70,72,75,76,107,71,108,-4,74,81,101,102,-2,104,-6,235,-6,80,-12,418,54,55,56,57,58,59,67,238,-11,79,-3,92,93,91,90,-1,78,-1,239,84,86,-3,85,-3,167],
gt62 = [0,-184,236,-14,109,-1,237,-10,234,70,72,75,76,107,71,108,-4,74,81,101,102,-2,104,-6,235,-6,80,-12,419,54,55,56,57,58,59,67,238,-11,79,-3,92,93,91,90,-1,78,-1,239,84,86,-3,85,-3,167],
gt63 = [0,-184,236,-14,109,-1,237,-10,234,70,72,75,76,107,71,108,-4,74,81,101,102,-2,104,-6,235,-6,80,-12,420,54,55,56,57,58,59,67,238,-11,79,-3,92,93,91,90,-1,78,-1,239,84,86,-3,85,-3,167],
gt64 = [0,-184,236,-14,109,-1,237,-10,234,70,72,75,76,107,71,108,-4,74,81,101,102,-2,104,-6,235,-6,80,-13,421,55,56,57,58,59,67,238,-11,79,-3,92,93,91,90,-1,78,-1,239,84,86,-3,85,-3,167],
gt65 = [0,-184,236,-14,109,-1,237,-10,234,70,72,75,76,107,71,108,-4,74,81,101,102,-2,104,-6,235,-6,80,-13,422,55,56,57,58,59,67,238,-11,79,-3,92,93,91,90,-1,78,-1,239,84,86,-3,85,-3,167],
gt66 = [0,-184,236,-14,109,-1,237,-10,234,70,72,75,76,107,71,108,-4,74,81,101,102,-2,104,-6,235,-6,80,-13,423,55,56,57,58,59,67,238,-11,79,-3,92,93,91,90,-1,78,-1,239,84,86,-3,85,-3,167],
gt67 = [0,-184,236,-14,109,-1,237,-10,234,70,72,75,76,107,71,108,-4,74,81,101,102,-2,104,-6,235,-6,80,-13,424,55,56,57,58,59,67,238,-11,79,-3,92,93,91,90,-1,78,-1,239,84,86,-3,85,-3,167],
gt68 = [0,-184,236,-14,109,-1,237,-10,234,70,72,75,76,107,71,108,-4,74,81,101,102,-2,104,-6,235,-6,80,-13,425,55,56,57,58,59,67,238,-11,79,-3,92,93,91,90,-1,78,-1,239,84,86,-3,85,-3,167],
gt69 = [0,-184,236,-14,109,-1,237,-10,234,70,72,75,76,107,71,108,-4,74,81,101,102,-2,104,-6,235,-6,80,-13,426,55,56,57,58,59,67,238,-11,79,-3,92,93,91,90,-1,78,-1,239,84,86,-3,85,-3,167],
gt70 = [0,-184,236,-14,109,-1,237,-10,234,70,72,75,76,107,71,108,-4,74,81,101,102,-2,104,-6,235,-6,80,-14,427,56,57,58,59,67,238,-11,79,-3,92,93,91,90,-1,78,-1,239,84,86,-3,85,-3,167],
gt71 = [0,-184,236,-14,109,-1,237,-10,234,70,72,75,76,107,71,108,-4,74,81,101,102,-2,104,-6,235,-6,80,-14,428,56,57,58,59,67,238,-11,79,-3,92,93,91,90,-1,78,-1,239,84,86,-3,85,-3,167],
gt72 = [0,-184,236,-14,109,-1,237,-10,234,70,72,75,76,107,71,108,-4,74,81,101,102,-2,104,-6,235,-6,80,-14,429,56,57,58,59,67,238,-11,79,-3,92,93,91,90,-1,78,-1,239,84,86,-3,85,-3,167],
gt73 = [0,-184,236,-14,109,-1,237,-10,234,70,72,75,76,107,71,108,-4,74,81,101,102,-2,104,-6,235,-6,80,-15,430,57,58,59,67,238,-11,79,-3,92,93,91,90,-1,78,-1,239,84,86,-3,85,-3,167],
gt74 = [0,-184,236,-14,109,-1,237,-10,234,70,72,75,76,107,71,108,-4,74,81,101,102,-2,104,-6,235,-6,80,-15,431,57,58,59,67,238,-11,79,-3,92,93,91,90,-1,78,-1,239,84,86,-3,85,-3,167],
gt75 = [0,-184,236,-14,109,-1,237,-10,234,70,72,75,76,107,71,108,-4,74,81,101,102,-2,104,-6,235,-6,80,-16,432,58,59,67,238,-11,79,-3,92,93,91,90,-1,78,-1,239,84,86,-3,85,-3,167],
gt76 = [0,-184,236,-14,109,-1,237,-10,234,70,72,75,76,107,71,108,-4,74,81,101,102,-2,104,-6,235,-6,80,-16,433,58,59,67,238,-11,79,-3,92,93,91,90,-1,78,-1,239,84,86,-3,85,-3,167],
gt77 = [0,-184,236,-14,109,-1,237,-10,234,70,72,75,76,107,71,108,-4,74,81,101,102,-2,104,-6,235,-6,80,-16,434,58,59,67,238,-11,79,-3,92,93,91,90,-1,78,-1,239,84,86,-3,85,-3,167],
gt78 = [0,-184,236,-14,109,-1,237,-10,234,70,72,75,76,107,71,108,-4,74,81,101,102,-2,104,-6,235,-6,80,-16,435,58,59,67,238,-11,79,-3,92,93,91,90,-1,78,-1,239,84,86,-3,85,-3,167],
gt79 = [0,-207,442,-28,436,-1,439,444,448,449,440,-38,450,451,-3,441,-1,239,445,86,-3,85],
gt80 = [0,-287,453,326,84,86,-3,85],
gt81 = [0,-202,456,350,-83,455,326,84,86,-3,85],
gt82 = [0,-289,457,86,-3,85],
gt83 = [0,-184,236,-8,45,111,-4,109,-1,237,-7,42,41,458,46,70,72,75,76,107,71,108,-4,74,81,101,102,-2,104,-6,235,-6,80,-3,43,-1,44,47,48,49,50,51,52,53,54,55,56,57,58,59,67,82,-11,79,-3,92,93,91,90,-1,78,112,292,84,86,-3,85,-3,167],
gt84 = [0,-184,236,-8,45,111,-4,109,-1,237,-10,46,70,72,75,76,107,71,108,-1,463,462,459,74,81,101,102,-2,104,-6,235,-6,80,-3,464,-1,44,47,48,49,50,51,52,53,54,55,56,57,58,59,67,82,-11,79,-3,92,93,91,90,-1,78,112,292,84,86,-3,85,-3,167],
gt85 = [0,-184,236,-8,45,111,-4,109,-1,237,-7,42,41,466,46,70,72,75,76,107,71,108,-4,74,81,101,102,-2,104,-6,235,-6,80,-3,43,-1,44,47,48,49,50,51,52,53,54,55,56,57,58,59,67,82,-11,79,-3,92,93,91,90,-1,78,112,292,84,86,-3,85,-3,167],
gt86 = [0,-289,467,86,-3,85],
gt87 = [0,-220,468,-4,258,101,102,-2,104],
gt88 = [0,-291,471,-1,470],
gt89 = [0,-278,473],
gt90 = [0,-246,475],
gt91 = [0,-184,236,-8,45,111,-4,109,-1,237,-10,46,70,72,75,76,107,71,108,-4,74,81,101,102,-2,104,-6,235,-6,80,-2,480,479,-1,44,47,48,49,50,51,52,53,54,55,56,57,58,59,67,82,-11,79,-3,92,93,91,90,-1,78,112,292,84,86,-3,85,-3,167],
gt92 = [0,-184,236,-8,45,111,-4,109,-1,237,-10,46,70,72,75,76,107,71,108,-4,74,81,101,102,-2,104,-6,235,-6,80,-3,482,-1,44,47,48,49,50,51,52,53,54,55,56,57,58,59,67,82,-11,79,-3,92,93,91,90,-1,78,112,292,84,86,-3,85,-3,167],
gt93 = [0,-233,485],
gt94 = [0,-228,486,488,-1,490,487],
gt95 = [0,-266,494,327,328,-18,493,326,84,86,-3,85],
gt96 = [0,-289,495,86,-3,85],
gt97 = [0,-184,236,-8,45,111,-4,109,-1,237,-7,42,41,496,46,70,72,75,76,107,71,108,-4,74,81,101,102,-2,104,-6,235,-6,80,-3,43,-1,44,47,48,49,50,51,52,53,54,55,56,57,58,59,67,82,-11,79,-3,92,93,91,90,-1,78,112,292,84,86,-3,85,-3,167],
gt98 = [0,-184,236,-8,45,111,497,-3,109,-1,237,-10,46,70,72,75,76,107,71,108,-4,74,81,101,102,-2,104,-13,80,-3,498,-1,44,47,48,49,50,51,52,53,54,55,56,57,58,59,67,82,-11,79,-3,92,93,91,90,-1,78,112,292,84,86,-3,85,-3,167],
gt99 = [0,-145,501,-2,30,24,38,28,25,29,-2,117,-2,31,32,33,35,34,118,-4,26,-1,500,36,-3,37,27,-7,502,-7,45,111,-4,109,-9,42,41,40,46,70,72,75,76,107,71,108,-4,74,81,101,102,-2,104,-13,80,-3,43,-1,44,47,48,49,50,51,52,53,54,55,56,57,58,59,67,82,-11,79,-3,92,93,91,90,113,78,112,83,84,86,-3,85,-3,167],
gt100 = [0,-243,505],
gt101 = [0,-243,507],
gt102 = [0,-239,514,448,449,-27,509,510,-2,512,-1,513,-5,450,451,-4,515,326,445,86,-3,85],
gt103 = [0,-246,517,-19,524,327,328,-2,519,521,-1,522,523,518,-10,515,326,84,86,-3,85],
gt104 = [0,-184,236,-8,45,111,-4,109,-1,237,-7,42,41,525,46,70,72,75,76,107,71,108,-4,74,81,101,102,-2,104,-6,235,-6,80,-3,43,-1,44,47,48,49,50,51,52,53,54,55,56,57,58,59,67,82,-11,79,-3,92,93,91,90,-1,78,112,292,84,86,-3,85,-3,167],
gt105 = [0,-184,236,-8,45,111,-4,109,-1,237,-7,42,41,527,46,70,72,75,76,107,71,108,-4,74,81,101,102,-2,104,-6,235,-6,80,-3,43,-1,44,47,48,49,50,51,52,53,54,55,56,57,58,59,67,82,-11,79,-3,92,93,91,90,-1,78,112,292,84,86,-3,85,-3,167],
gt106 = [0,-154,528,530,-1,536,-22,529,535,-2,236,-8,45,111,-4,109,-1,237,-7,42,41,532,534,70,72,75,76,107,71,108,-4,74,81,101,102,-2,104,-6,235,-6,80,-3,43,-1,44,47,48,49,50,51,52,53,54,55,56,57,58,59,67,82,-11,79,-3,92,93,91,90,-1,78,112,292,84,86,-3,85,-3,167],
gt107 = [0,-184,236,-8,45,111,-4,109,-1,237,-7,42,41,538,46,70,72,75,76,107,71,108,-4,74,81,101,102,-2,104,-6,235,-6,80,-3,43,-1,44,47,48,49,50,51,52,53,54,55,56,57,58,59,67,82,-11,79,-3,92,93,91,90,-1,78,112,292,84,86,-3,85,-3,167],
gt108 = [0,-184,236,-8,45,111,-4,109,-1,237,-7,42,41,542,46,70,72,75,76,107,71,108,-4,74,81,101,102,-2,104,-6,235,-6,80,-3,43,-1,44,47,48,49,50,51,52,53,54,55,56,57,58,59,67,82,-11,79,-3,92,93,91,90,-1,78,112,292,84,86,-3,85,-3,167],
gt109 = [0,-173,544,545],
gt110 = [0,-202,548,350],
gt111 = [0,-204,550,552,553,554,-31,557,448,449,-39,450,451,-6,558,86,-3,85],
gt112 = [0,-184,236,-14,109,-1,237,-10,559,70,72,75,76,107,71,108,-4,74,81,101,102,-2,104,-6,235,-6,80,-20,238,-11,79,-3,92,93,91,90,-1,78,-1,239,84,86,-3,85,-3,167],
gt113 = [0,-187,561,564,563,566,-75,524,327,328,-5,567,523,565,-10,515,326,84,86,-3,85],
gt114 = [0,-243,570],
gt115 = [0,-243,571],
gt116 = [0,-304,574,363,-2,146,-3,366],
gt117 = [0,-4,576],
gt118 = [0,-308,146,-3,579],
gt119 = [0,-308,146,-3,581],
gt120 = [0,-6,592,595,594,-289,591,-1,587,585,588,-10,593,590,597],
gt121 = [0,-309,611,-1,610],
gt122 = [0,-132,613,-148,178],
gt123 = [0,-126,614,-2,615],
gt124 = [0,-133,616,-154,175,84,86,-3,85],
gt125 = [0,-243,631],
gt126 = [0,-184,236,-8,45,111,-4,109,-1,237,-10,46,70,72,75,76,107,71,108,-4,74,81,101,102,-2,104,-6,235,-6,80,-3,632,-1,44,47,48,49,50,51,52,53,54,55,56,57,58,59,67,82,-11,79,-3,92,93,91,90,-1,78,112,292,84,86,-3,85,-3,167],
gt127 = [0,-239,635,448,449,-39,450,451,-6,558,86,-3,85],
gt128 = [0,-239,636,448,449,-39,450,451,-6,558,86,-3,85],
gt129 = [0,-184,236,-8,45,111,-4,109,-1,237,-10,46,70,72,75,76,107,71,108,-4,74,81,101,102,-2,104,-6,235,-6,80,-3,637,-1,44,47,48,49,50,51,52,53,54,55,56,57,58,59,67,82,-11,79,-3,92,93,91,90,-1,78,112,292,84,86,-3,85,-3,167],
gt130 = [0,-187,639,564,563,566,-75,524,327,328,-5,567,523,565,-10,515,326,84,86,-3,85],
gt131 = [0,-202,641,350],
gt132 = [0,-184,236,-8,45,111,-4,109,-1,237,-10,46,70,72,75,76,107,71,108,-4,74,81,101,102,-2,104,-6,235,-6,80,-3,647,-1,44,47,48,49,50,51,52,53,54,55,56,57,58,59,67,82,-11,79,-3,92,93,91,90,-1,78,112,292,84,86,-3,85,-3,167],
gt133 = [0,-184,236,-8,45,111,-4,109,-1,237,-10,46,70,72,75,76,107,71,108,-4,74,81,101,102,-2,104,-6,235,-6,80,-1,652,651,650,-1,44,47,48,49,50,51,52,53,54,55,56,57,58,59,67,82,-11,79,-3,92,93,91,90,-1,78,112,292,84,86,-3,85,-3,167],
gt134 = [0,-231,654,653],
gt135 = [0,-233,299,298,655],
gt136 = [0,-184,236,-8,45,111,-4,109,-1,237,-7,42,41,658,46,70,72,75,76,107,71,108,-4,74,81,101,102,-2,104,-6,235,-6,80,-3,43,-1,44,47,48,49,50,51,52,53,54,55,56,57,58,59,67,82,-11,79,-3,92,93,91,90,-1,78,112,292,84,86,-3,85,-3,167],
gt137 = [0,-141,187,186,665,188,22,23,131,30,24,38,28,25,29,-2,117,-2,31,32,33,35,34,118,-4,26,-2,36,-3,37,27,-2,132,136,-3,134,-6,664,45,111,-4,109,130,-8,42,41,40,46,70,72,75,76,107,71,108,-4,74,81,101,102,-2,104,-13,80,-3,43,-1,44,47,48,49,50,51,52,53,54,55,56,57,58,59,67,82,-11,79,-3,92,93,91,90,113,78,112,83,84,86,-3,85,-3,167],
gt138 = [0,-179,666,-86,325,327,328,-18,324,326,84,86,-3,85],
gt139 = [0,-184,236,-8,45,111,-4,109,-1,237,-10,46,70,72,75,76,107,71,108,-4,74,81,101,102,-2,104,-6,235,-6,80,-3,667,-1,44,47,48,49,50,51,52,53,54,55,56,57,58,59,67,82,-11,79,-3,92,93,91,90,-1,78,112,292,84,86,-3,85,-3,167],
gt140 = [0,-287,671,326,84,86,-3,85],
gt141 = [0,-243,673],
gt142 = [0,-266,524,327,328,-5,676,523,674,-10,515,326,84,86,-3,85],
gt143 = [0,-266,681,327,328,-18,680,326,84,86,-3,85],
gt144 = [0,-243,682],
gt145 = [0,-184,236,-8,45,111,-4,109,-1,237,-7,42,41,687,46,70,72,75,76,107,71,108,-4,74,81,101,102,-2,104,-6,235,-6,80,-3,43,-1,44,47,48,49,50,51,52,53,54,55,56,57,58,59,67,82,-11,79,-3,92,93,91,90,-1,78,112,292,84,86,-3,85,-3,167],
gt146 = [0,-184,236,-8,45,111,-4,109,-1,237,-7,42,41,691,46,70,72,75,76,107,71,108,-4,74,81,101,102,-2,104,-6,235,-6,80,-3,43,-1,44,47,48,49,50,51,52,53,54,55,56,57,58,59,67,82,-11,79,-3,92,93,91,90,-1,78,112,292,84,86,-3,85,-3,167],
gt147 = [0,-158,694,-19,693,323,-86,696,327,328,-18,695,326,84,86,-3,85],
gt148 = [0,-158,697,-23,355,356,-82,699,327,328,-18,698,326,84,86,-3,85],
gt149 = [0,-155,700,-1,536,-23,703,-2,236,-14,109,-1,237,-10,701,70,72,75,76,107,71,108,-4,74,81,101,102,-2,104,-6,235,-6,80,-20,238,-11,79,-3,92,93,91,90,-1,78,-1,239,84,86,-3,85,-3,167],
gt150 = [0,-174,706],
gt151 = [0,-150,708],
gt152 = [0,-204,709,552,553,554,-31,557,448,449,-39,450,451,-6,558,86,-3,85],
gt153 = [0,-206,712,554,-31,557,448,449,-39,450,451,-6,558,86,-3,85],
gt154 = [0,-207,713,-31,557,448,449,-39,450,451,-6,558,86,-3,85],
gt155 = [0,-187,714,564,563,566,-75,524,327,328,-5,567,523,565,-10,515,326,84,86,-3,85],
gt156 = [0,-183,719,-82,358,327,328,-18,357,326,84,86,-3,85],
gt157 = [0,-4,721],
gt158 = [0,-4,722],
gt159 = [0,-6,725,595,594,-297,724,-1,146,-3,728,-3,727],
gt160 = [0,-6,592,595,594,-289,591,-1,587,733,588,-10,593,590,597],
gt161 = [0,-307,737,146,-3,145],
gt162 = [0,-6,592,595,594,-289,591,-3,738,-10,593,590,597],
gt163 = [0,-315,742],
gt164 = [0,-299,746],
gt165 = [0,-127,748,-3,391,-1,392,-154,393,84,86,-3,85],
gt166 = [0,-133,749,-154,175,84,86,-3,85],
gt167 = [0,-135,751,-2,404,-149,405,84,86,-3,85],
gt168 = [0,-288,752,84,86,-3,85],
gt169 = [0,-184,236,-8,45,111,-4,109,-1,237,-10,46,70,72,75,76,107,71,108,-4,74,81,101,102,-2,104,-6,235,-6,80,-3,753,-1,44,47,48,49,50,51,52,53,54,55,56,57,58,59,67,82,-11,79,-3,92,93,91,90,-1,78,112,292,84,86,-3,85,-3,167],
gt170 = [0,-207,442,-30,755,444,448,449,440,-38,450,451,-3,441,-1,239,445,86,-3,85],
gt171 = [0,-184,236,-8,45,111,-4,109,-1,237,-10,46,70,72,75,76,107,71,108,-4,74,81,101,102,-2,104,-6,235,-6,80,-3,756,-1,44,47,48,49,50,51,52,53,54,55,56,57,58,59,67,82,-11,79,-3,92,93,91,90,-1,78,112,292,84,86,-3,85,-3,167],
gt172 = [0,-186,757,759,564,563,566,-75,524,327,328,-5,567,523,565,-10,515,326,84,86,-3,85],
gt173 = [0,-187,763,564,563,566,-75,524,327,328,-5,567,523,565,-10,515,326,84,86,-3,85],
gt174 = [0,-184,236,-8,45,111,-4,109,-1,237,-10,46,70,72,75,76,107,71,108,-1,768,-2,74,81,101,102,-2,104,-6,235,-6,80,-3,464,-1,44,47,48,49,50,51,52,53,54,55,56,57,58,59,67,82,-11,79,-3,92,93,91,90,-1,78,112,292,84,86,-3,85,-3,167],
gt175 = [0,-184,236,-8,45,111,-4,109,-1,237,-10,46,70,72,75,76,107,71,108,-4,74,81,101,102,-2,104,-6,235,-6,80,-3,769,-1,44,47,48,49,50,51,52,53,54,55,56,57,58,59,67,82,-11,79,-3,92,93,91,90,-1,78,112,292,84,86,-3,85,-3,167],
gt176 = [0,-184,236,-8,45,111,-4,109,-1,237,-7,42,41,770,46,70,72,75,76,107,71,108,-4,74,81,101,102,-2,104,-6,235,-6,80,-3,43,-1,44,47,48,49,50,51,52,53,54,55,56,57,58,59,67,82,-11,79,-3,92,93,91,90,-1,78,112,292,84,86,-3,85,-3,167],
gt177 = [0,-266,774,327,328,-18,773,326,84,86,-3,85],
gt178 = [0,-239,514,448,449,-27,776,-3,778,-1,513,-5,450,451,-4,515,326,445,86,-3,85],
gt179 = [0,-266,524,327,328,-5,779,523,-11,515,326,84,86,-3,85],
gt180 = [0,-246,782,-19,524,327,328,-3,784,-1,522,523,783,-10,515,326,84,86,-3,85],
gt181 = [0,-145,785,-2,30,24,38,28,25,29,-2,117,-2,31,32,33,35,34,118,-4,26,-2,36,-3,37,27,-15,45,111,-4,109,-9,42,41,40,46,70,72,75,76,107,71,108,-4,74,81,101,102,-2,104,-13,80,-3,43,-1,44,47,48,49,50,51,52,53,54,55,56,57,58,59,67,82,-11,79,-3,92,93,91,90,113,78,112,83,84,86,-3,85,-3,167],
gt182 = [0,-184,236,-8,45,111,-4,109,-1,237,-7,42,41,786,46,70,72,75,76,107,71,108,-4,74,81,101,102,-2,104,-6,235,-6,80,-3,43,-1,44,47,48,49,50,51,52,53,54,55,56,57,58,59,67,82,-11,79,-3,92,93,91,90,-1,78,112,292,84,86,-3,85,-3,167],
gt183 = [0,-145,787,-2,30,24,38,28,25,29,-2,117,-2,31,32,33,35,34,118,-4,26,-2,36,-3,37,27,-15,45,111,-4,109,-9,42,41,40,46,70,72,75,76,107,71,108,-4,74,81,101,102,-2,104,-13,80,-3,43,-1,44,47,48,49,50,51,52,53,54,55,56,57,58,59,67,82,-11,79,-3,92,93,91,90,113,78,112,83,84,86,-3,85,-3,167],
gt184 = [0,-184,236,-8,45,111,-4,109,-1,237,-7,42,41,788,46,70,72,75,76,107,71,108,-4,74,81,101,102,-2,104,-6,235,-6,80,-3,43,-1,44,47,48,49,50,51,52,53,54,55,56,57,58,59,67,82,-11,79,-3,92,93,91,90,-1,78,112,292,84,86,-3,85,-3,167],
gt185 = [0,-184,236,-8,45,111,-4,109,-1,237,-7,42,41,791,46,70,72,75,76,107,71,108,-4,74,81,101,102,-2,104,-6,235,-6,80,-3,43,-1,44,47,48,49,50,51,52,53,54,55,56,57,58,59,67,82,-11,79,-3,92,93,91,90,-1,78,112,292,84,86,-3,85,-3,167],
gt186 = [0,-184,236,-8,45,111,-4,109,-1,237,-7,42,41,793,46,70,72,75,76,107,71,108,-4,74,81,101,102,-2,104,-6,235,-6,80,-3,43,-1,44,47,48,49,50,51,52,53,54,55,56,57,58,59,67,82,-11,79,-3,92,93,91,90,-1,78,112,292,84,86,-3,85,-3,167],
gt187 = [0,-184,236,-8,45,111,-4,109,-1,237,-7,42,41,794,46,70,72,75,76,107,71,108,-4,74,81,101,102,-2,104,-6,235,-6,80,-3,43,-1,44,47,48,49,50,51,52,53,54,55,56,57,58,59,67,82,-11,79,-3,92,93,91,90,-1,78,112,292,84,86,-3,85,-3,167],
gt188 = [0,-184,236,-8,45,111,-4,109,-1,237,-7,42,41,796,46,70,72,75,76,107,71,108,-4,74,81,101,102,-2,104,-6,235,-6,80,-3,43,-1,44,47,48,49,50,51,52,53,54,55,56,57,58,59,67,82,-11,79,-3,92,93,91,90,-1,78,112,292,84,86,-3,85,-3,167],
gt189 = [0,-158,694,-107,800,327,328,-18,799,326,84,86,-3,85],
gt190 = [0,-158,697,-107,800,327,328,-18,799,326,84,86,-3,85],
gt191 = [0,-165,801],
gt192 = [0,-145,803,-2,30,24,38,28,25,29,-2,117,-2,31,32,33,35,34,118,-4,26,-2,36,-3,37,27,-15,45,111,-4,109,-9,42,41,40,46,70,72,75,76,107,71,108,-4,74,81,101,102,-2,104,-13,80,-3,43,-1,44,47,48,49,50,51,52,53,54,55,56,57,58,59,67,82,-11,79,-3,92,93,91,90,113,78,112,83,84,86,-3,85,-3,167],
gt193 = [0,-175,804,-90,806,327,328,-18,805,326,84,86,-3,85],
gt194 = [0,-141,187,186,665,188,22,23,131,30,24,38,28,25,29,-2,117,-2,31,32,33,35,34,118,-4,26,-2,36,-3,37,27,-2,132,136,-3,134,-5,811,813,45,111,-4,109,130,-8,42,41,40,46,70,72,75,76,107,71,108,-4,74,81,101,102,-2,104,-13,80,-3,43,-1,44,47,48,49,50,51,52,53,54,55,56,57,58,59,67,82,-11,79,-3,92,93,91,90,113,78,112,83,84,86,-3,85,-3,167],
gt195 = [0,-189,814,815,-75,524,327,328,-5,567,523,565,-10,515,326,84,86,-3,85],
gt196 = [0,-4,816],
gt197 = [0,-6,818,595,594,-308,821,820,819,822],
gt198 = [0,-317,821,820,830,822],
gt199 = [0,-307,832,146,-3,145],
gt200 = [0,-307,833,146,-3,145],
gt201 = [0,-303,835,362,363,-2,146,-3,366],
gt202 = [0,-303,837,362,363,-2,146,-3,366],
gt203 = [0,-303,839,362,363,-2,146,-3,366],
gt204 = [0,-184,236,-8,45,111,-4,109,-1,237,-7,42,41,841,46,70,72,75,76,107,71,108,-4,74,81,101,102,-2,104,-6,235,-6,80,-3,43,-1,44,47,48,49,50,51,52,53,54,55,56,57,58,59,67,82,-11,79,-3,92,93,91,90,-1,78,112,292,84,86,-3,85,-3,167],
gt205 = [0,-299,843],
gt206 = [0,-190,849,-17,848,-57,524,327,328,-5,567,523,-11,515,326,84,86,-3,85],
gt207 = [0,-141,187,186,665,188,22,23,131,30,24,38,28,25,29,-2,117,-2,31,32,33,35,34,118,-4,26,-2,36,-3,37,27,-2,132,136,-3,134,-5,853,813,45,111,-4,109,130,-8,42,41,40,46,70,72,75,76,107,71,108,-4,74,81,101,102,-2,104,-13,80,-3,43,-1,44,47,48,49,50,51,52,53,54,55,56,57,58,59,67,82,-11,79,-3,92,93,91,90,113,78,112,83,84,86,-3,85,-3,167],
gt208 = [0,-266,524,327,328,-5,676,523,859,-10,515,326,84,86,-3,85],
gt209 = [0,-184,236,-8,45,111,-4,109,-1,237,-7,42,41,864,46,70,72,75,76,107,71,108,-4,74,81,101,102,-2,104,-6,235,-6,80,-3,43,-1,44,47,48,49,50,51,52,53,54,55,56,57,58,59,67,82,-11,79,-3,92,93,91,90,-1,78,112,292,84,86,-3,85,-3,167],
gt210 = [0,-184,236,-8,45,111,-4,109,-1,237,-7,42,41,866,46,70,72,75,76,107,71,108,-4,74,81,101,102,-2,104,-6,235,-6,80,-3,43,-1,44,47,48,49,50,51,52,53,54,55,56,57,58,59,67,82,-11,79,-3,92,93,91,90,-1,78,112,292,84,86,-3,85,-3,167],
gt211 = [0,-145,869,-2,30,24,38,28,25,29,-2,117,-2,31,32,33,35,34,118,-4,26,-2,36,-3,37,27,-15,45,111,-4,109,-9,42,41,40,46,70,72,75,76,107,71,108,-4,74,81,101,102,-2,104,-13,80,-3,43,-1,44,47,48,49,50,51,52,53,54,55,56,57,58,59,67,82,-11,79,-3,92,93,91,90,113,78,112,83,84,86,-3,85,-3,167],
gt212 = [0,-184,236,-8,45,111,-4,109,-1,237,-7,42,41,872,46,70,72,75,76,107,71,108,-4,74,81,101,102,-2,104,-6,235,-6,80,-3,43,-1,44,47,48,49,50,51,52,53,54,55,56,57,58,59,67,82,-11,79,-3,92,93,91,90,-1,78,112,292,84,86,-3,85,-3,167],
gt213 = [0,-145,875,-2,30,24,38,28,25,29,-2,117,-2,31,32,33,35,34,118,-4,26,-2,36,-3,37,27,-15,45,111,-4,109,-9,42,41,40,46,70,72,75,76,107,71,108,-4,74,81,101,102,-2,104,-13,80,-3,43,-1,44,47,48,49,50,51,52,53,54,55,56,57,58,59,67,82,-11,79,-3,92,93,91,90,113,78,112,83,84,86,-3,85,-3,167],
gt214 = [0,-184,236,-8,45,111,-4,109,-1,237,-7,42,41,876,46,70,72,75,76,107,71,108,-4,74,81,101,102,-2,104,-6,235,-6,80,-3,43,-1,44,47,48,49,50,51,52,53,54,55,56,57,58,59,67,82,-11,79,-3,92,93,91,90,-1,78,112,292,84,86,-3,85,-3,167],
gt215 = [0,-166,878,880,879],
gt216 = [0,-141,187,186,665,188,22,23,131,30,24,38,28,25,29,-2,117,-2,31,32,33,35,34,118,-4,26,-2,36,-3,37,27,-2,132,136,-3,134,-5,885,813,45,111,-4,109,130,-8,42,41,40,46,70,72,75,76,107,71,108,-4,74,81,101,102,-2,104,-13,80,-3,43,-1,44,47,48,49,50,51,52,53,54,55,56,57,58,59,67,82,-11,79,-3,92,93,91,90,113,78,112,83,84,86,-3,85,-3,167],
gt217 = [0,-141,187,186,665,188,22,23,131,30,24,38,28,25,29,-2,117,-2,31,32,33,35,34,118,-4,26,-2,36,-3,37,27,-2,132,136,-3,134,-5,887,813,45,111,-4,109,130,-8,42,41,40,46,70,72,75,76,107,71,108,-4,74,81,101,102,-2,104,-13,80,-3,43,-1,44,47,48,49,50,51,52,53,54,55,56,57,58,59,67,82,-11,79,-3,92,93,91,90,113,78,112,83,84,86,-3,85,-3,167],
gt218 = [0,-317,892,-2,822],
gt219 = [0,-307,894,146,-3,145],
gt220 = [0,-9,898,903,901,906,902,900,909,907,-2,908,-5,904,-1,936,-4,937,-9,935,-38,911,914,-1,933,915,912,-1,913,920,917,916,924,925,926,-1,927,-3,928,934,-9,922,-3,919],
gt221 = [0,-139,939,941,187,186,942,188,22,23,131,30,24,38,28,25,29,-2,117,-2,31,32,33,35,34,118,-4,26,-2,36,-3,37,27,-2,132,136,-3,134,-7,45,111,-4,109,130,-8,42,41,40,46,70,72,75,76,107,71,108,-4,74,81,101,102,-2,104,-13,80,-3,43,-1,44,47,48,49,50,51,52,53,54,55,56,57,58,59,67,82,-11,79,-3,92,93,91,90,113,78,112,83,84,86,-3,85,-3,167],
gt222 = [0,-139,944,941,187,186,942,188,22,23,131,30,24,38,28,25,29,-2,117,-2,31,32,33,35,34,118,-4,26,-2,36,-3,37,27,-2,132,136,-3,134,-7,45,111,-4,109,130,-8,42,41,40,46,70,72,75,76,107,71,108,-4,74,81,101,102,-2,104,-13,80,-3,43,-1,44,47,48,49,50,51,52,53,54,55,56,57,58,59,67,82,-11,79,-3,92,93,91,90,113,78,112,83,84,86,-3,85,-3,167],
gt223 = [0,-141,187,186,665,188,22,23,131,30,24,38,28,25,29,-2,117,-2,31,32,33,35,34,118,-4,26,-2,36,-3,37,27,-2,132,136,-3,134,-5,951,813,45,111,-4,109,130,-8,42,41,40,46,70,72,75,76,107,71,108,-4,74,81,101,102,-2,104,-13,80,-3,43,-1,44,47,48,49,50,51,52,53,54,55,56,57,58,59,67,82,-11,79,-3,92,93,91,90,113,78,112,83,84,86,-3,85,-3,167],
gt224 = [0,-141,187,186,665,188,22,23,131,30,24,38,28,25,29,-2,117,-2,31,32,33,35,34,118,-4,26,-2,36,-3,37,27,-2,132,136,-3,134,-5,956,813,45,111,-4,109,130,-8,42,41,40,46,70,72,75,76,107,71,108,-4,74,81,101,102,-2,104,-13,80,-3,43,-1,44,47,48,49,50,51,52,53,54,55,56,57,58,59,67,82,-11,79,-3,92,93,91,90,113,78,112,83,84,86,-3,85,-3,167],
gt225 = [0,-141,187,186,665,188,22,23,131,30,24,38,28,25,29,-2,117,-2,31,32,33,35,34,118,-4,26,-2,36,-3,37,27,-2,132,136,-3,134,-5,958,813,45,111,-4,109,130,-8,42,41,40,46,70,72,75,76,107,71,108,-4,74,81,101,102,-2,104,-13,80,-3,43,-1,44,47,48,49,50,51,52,53,54,55,56,57,58,59,67,82,-11,79,-3,92,93,91,90,113,78,112,83,84,86,-3,85,-3,167],
gt226 = [0,-145,962,-2,30,24,38,28,25,29,-2,117,-2,31,32,33,35,34,118,-4,26,-2,36,-3,37,27,-15,45,111,-4,109,-9,42,41,40,46,70,72,75,76,107,71,108,-4,74,81,101,102,-2,104,-13,80,-3,43,-1,44,47,48,49,50,51,52,53,54,55,56,57,58,59,67,82,-11,79,-3,92,93,91,90,113,78,112,83,84,86,-3,85,-3,167],
gt227 = [0,-184,236,-8,45,111,-4,109,-1,237,-7,42,41,964,46,70,72,75,76,107,71,108,-4,74,81,101,102,-2,104,-6,235,-6,80,-3,43,-1,44,47,48,49,50,51,52,53,54,55,56,57,58,59,67,82,-11,79,-3,92,93,91,90,-1,78,112,292,84,86,-3,85,-3,167],
gt228 = [0,-145,967,-2,30,24,38,28,25,29,-2,117,-2,31,32,33,35,34,118,-4,26,-2,36,-3,37,27,-15,45,111,-4,109,-9,42,41,40,46,70,72,75,76,107,71,108,-4,74,81,101,102,-2,104,-13,80,-3,43,-1,44,47,48,49,50,51,52,53,54,55,56,57,58,59,67,82,-11,79,-3,92,93,91,90,113,78,112,83,84,86,-3,85,-3,167],
gt229 = [0,-145,969,-2,30,24,38,28,25,29,-2,117,-2,31,32,33,35,34,118,-4,26,-2,36,-3,37,27,-15,45,111,-4,109,-9,42,41,40,46,70,72,75,76,107,71,108,-4,74,81,101,102,-2,104,-13,80,-3,43,-1,44,47,48,49,50,51,52,53,54,55,56,57,58,59,67,82,-11,79,-3,92,93,91,90,113,78,112,83,84,86,-3,85,-3,167],
gt230 = [0,-145,970,-2,30,24,38,28,25,29,-2,117,-2,31,32,33,35,34,118,-4,26,-2,36,-3,37,27,-15,45,111,-4,109,-9,42,41,40,46,70,72,75,76,107,71,108,-4,74,81,101,102,-2,104,-13,80,-3,43,-1,44,47,48,49,50,51,52,53,54,55,56,57,58,59,67,82,-11,79,-3,92,93,91,90,113,78,112,83,84,86,-3,85,-3,167],
gt231 = [0,-145,971,-2,30,24,38,28,25,29,-2,117,-2,31,32,33,35,34,118,-4,26,-2,36,-3,37,27,-15,45,111,-4,109,-9,42,41,40,46,70,72,75,76,107,71,108,-4,74,81,101,102,-2,104,-13,80,-3,43,-1,44,47,48,49,50,51,52,53,54,55,56,57,58,59,67,82,-11,79,-3,92,93,91,90,113,78,112,83,84,86,-3,85,-3,167],
gt232 = [0,-145,972,-2,30,24,38,28,25,29,-2,117,-2,31,32,33,35,34,118,-4,26,-2,36,-3,37,27,-15,45,111,-4,109,-9,42,41,40,46,70,72,75,76,107,71,108,-4,74,81,101,102,-2,104,-13,80,-3,43,-1,44,47,48,49,50,51,52,53,54,55,56,57,58,59,67,82,-11,79,-3,92,93,91,90,113,78,112,83,84,86,-3,85,-3,167],
gt233 = [0,-145,974,-2,30,24,38,28,25,29,-2,117,-2,31,32,33,35,34,118,-4,26,-2,36,-3,37,27,-15,45,111,-4,109,-9,42,41,40,46,70,72,75,76,107,71,108,-4,74,81,101,102,-2,104,-13,80,-3,43,-1,44,47,48,49,50,51,52,53,54,55,56,57,58,59,67,82,-11,79,-3,92,93,91,90,113,78,112,83,84,86,-3,85,-3,167],
gt234 = [0,-145,975,-2,30,24,38,28,25,29,-2,117,-2,31,32,33,35,34,118,-4,26,-2,36,-3,37,27,-15,45,111,-4,109,-9,42,41,40,46,70,72,75,76,107,71,108,-4,74,81,101,102,-2,104,-13,80,-3,43,-1,44,47,48,49,50,51,52,53,54,55,56,57,58,59,67,82,-11,79,-3,92,93,91,90,113,78,112,83,84,86,-3,85,-3,167],
gt235 = [0,-167,979,977],
gt236 = [0,-166,980,880],
gt237 = [0,-184,236,-8,45,111,-4,109,-1,237,-7,42,41,982,46,70,72,75,76,107,71,108,-4,74,81,101,102,-2,104,-6,235,-6,80,-3,43,-1,44,47,48,49,50,51,52,53,54,55,56,57,58,59,67,82,-11,79,-3,92,93,91,90,-1,78,112,292,84,86,-3,85,-3,167],
gt238 = [0,-150,984],
gt239 = [0,-141,187,186,665,188,22,23,131,30,24,38,28,25,29,-2,117,-2,31,32,33,35,34,118,-4,26,-2,36,-3,37,27,-2,132,136,-3,134,-5,985,813,45,111,-4,109,130,-8,42,41,40,46,70,72,75,76,107,71,108,-4,74,81,101,102,-2,104,-13,80,-3,43,-1,44,47,48,49,50,51,52,53,54,55,56,57,58,59,67,82,-11,79,-3,92,93,91,90,113,78,112,83,84,86,-3,85,-3,167],
gt240 = [0,-9,990,903,901,906,902,900,909,907,-2,908,-5,904,-1,936,-4,937,-9,935,-38,911,914,-1,933,915,912,-1,913,920,917,916,924,925,926,-1,927,-3,928,934,-9,922,-3,919],
gt241 = [0,-10,995,-1,906,994,-1,909,907,-2,908,-5,904,-1,936,-4,937,-9,935,-38,911,914,-1,933,915,912,-1,913,920,917,916,924,925,926,-1,927,-3,928,934,-9,922,-3,919],
gt242 = [0,-12,996,-2,909,907,-2,908,-5,997,-1,936,-4,937,-9,935,-38,911,914,-1,933,915,912,-1,913,920,917,916,924,925,926,-1,927,-3,928,934,-9,922,-3,919],
gt243 = [0,-19,1007,-5,997,-1,936,-4,937,-9,935,-59,1008,-1,1006,1005,-1,1009,-3,922,-3,1010],
gt244 = [0,-79,1012,1011,-1,914,-1,933,915,1014,1013,913,920,917,916,924,925,926,-1,927,-3,928,934,-9,922,-3,919],
gt245 = [0,-82,1019,-1,933,1020,-6,924,925,926,-1,927,-3,928,934],
gt246 = [0,-84,933,1021,-6,1022,925,926,-1,927,-3,928,934],
gt247 = [0,-84,1023,-16,934],
gt248 = [0,-111,922,-3,1026],
gt249 = [0,-112,1030,1028,1029],
gt250 = [0,-111,922,-3,1036],
gt251 = [0,-111,922,-3,1037],
gt252 = [0,-89,920,1039,1038,-19,922,-3,919],
gt253 = [0,-100,1042,-10,922,-3,1041],
gt254 = [0,-83,1044,-16,1045],
gt255 = [0,-139,1049,941,187,186,942,188,22,23,131,30,24,38,28,25,29,-2,117,-2,31,32,33,35,34,118,-4,26,-2,36,-3,37,27,-2,132,136,-3,134,-7,45,111,-4,109,130,-8,42,41,40,46,70,72,75,76,107,71,108,-4,74,81,101,102,-2,104,-13,80,-3,43,-1,44,47,48,49,50,51,52,53,54,55,56,57,58,59,67,82,-11,79,-3,92,93,91,90,113,78,112,83,84,86,-3,85,-3,167],
gt256 = [0,-139,1053,941,187,186,942,188,22,23,131,30,24,38,28,25,29,-2,117,-2,31,32,33,35,34,118,-4,26,-2,36,-3,37,27,-2,132,136,-3,134,-7,45,111,-4,109,130,-8,42,41,40,46,70,72,75,76,107,71,108,-4,74,81,101,102,-2,104,-13,80,-3,43,-1,44,47,48,49,50,51,52,53,54,55,56,57,58,59,67,82,-11,79,-3,92,93,91,90,113,78,112,83,84,86,-3,85,-3,167],
gt257 = [0,-184,236,-8,45,111,-4,109,-1,237,-7,42,41,1059,46,70,72,75,76,107,71,108,-4,74,81,101,102,-2,104,-6,235,-6,80,-3,43,-1,44,47,48,49,50,51,52,53,54,55,56,57,58,59,67,82,-11,79,-3,92,93,91,90,-1,78,112,292,84,86,-3,85,-3,167],
gt258 = [0,-141,187,186,665,188,22,23,131,30,24,38,28,25,29,-2,117,-2,31,32,33,35,34,118,-4,26,-2,36,-3,37,27,-2,132,136,-3,134,-5,1061,813,45,111,-4,109,130,-8,42,41,40,46,70,72,75,76,107,71,108,-4,74,81,101,102,-2,104,-13,80,-3,43,-1,44,47,48,49,50,51,52,53,54,55,56,57,58,59,67,82,-11,79,-3,92,93,91,90,113,78,112,83,84,86,-3,85,-3,167],
gt259 = [0,-141,187,186,665,188,22,23,131,30,24,38,28,25,29,-2,117,-2,31,32,33,35,34,118,-4,26,-2,36,-3,37,27,-2,132,136,-3,134,-5,1064,813,45,111,-4,109,130,-8,42,41,40,46,70,72,75,76,107,71,108,-4,74,81,101,102,-2,104,-13,80,-3,43,-1,44,47,48,49,50,51,52,53,54,55,56,57,58,59,67,82,-11,79,-3,92,93,91,90,113,78,112,83,84,86,-3,85,-3,167],
gt260 = [0,-141,187,186,665,188,22,23,131,30,24,38,28,25,29,-2,117,-2,31,32,33,35,34,118,-4,26,-2,36,-3,37,27,-2,132,136,-3,134,-5,1067,813,45,111,-4,109,130,-8,42,41,40,46,70,72,75,76,107,71,108,-4,74,81,101,102,-2,104,-13,80,-3,43,-1,44,47,48,49,50,51,52,53,54,55,56,57,58,59,67,82,-11,79,-3,92,93,91,90,113,78,112,83,84,86,-3,85,-3,167],
gt261 = [0,-145,1072,-2,30,24,38,28,25,29,-2,117,-2,31,32,33,35,34,118,-4,26,-2,36,-3,37,27,-15,45,111,-4,109,-9,42,41,40,46,70,72,75,76,107,71,108,-4,74,81,101,102,-2,104,-13,80,-3,43,-1,44,47,48,49,50,51,52,53,54,55,56,57,58,59,67,82,-11,79,-3,92,93,91,90,113,78,112,83,84,86,-3,85,-3,167],
gt262 = [0,-145,1073,-2,30,24,38,28,25,29,-2,117,-2,31,32,33,35,34,118,-4,26,-2,36,-3,37,27,-15,45,111,-4,109,-9,42,41,40,46,70,72,75,76,107,71,108,-4,74,81,101,102,-2,104,-13,80,-3,43,-1,44,47,48,49,50,51,52,53,54,55,56,57,58,59,67,82,-11,79,-3,92,93,91,90,113,78,112,83,84,86,-3,85,-3,167],
gt263 = [0,-145,1074,-2,30,24,38,28,25,29,-2,117,-2,31,32,33,35,34,118,-4,26,-2,36,-3,37,27,-15,45,111,-4,109,-9,42,41,40,46,70,72,75,76,107,71,108,-4,74,81,101,102,-2,104,-13,80,-3,43,-1,44,47,48,49,50,51,52,53,54,55,56,57,58,59,67,82,-11,79,-3,92,93,91,90,113,78,112,83,84,86,-3,85,-3,167],
gt264 = [0,-145,1075,-2,30,24,38,28,25,29,-2,117,-2,31,32,33,35,34,118,-4,26,-2,36,-3,37,27,-15,45,111,-4,109,-9,42,41,40,46,70,72,75,76,107,71,108,-4,74,81,101,102,-2,104,-13,80,-3,43,-1,44,47,48,49,50,51,52,53,54,55,56,57,58,59,67,82,-11,79,-3,92,93,91,90,113,78,112,83,84,86,-3,85,-3,167],
gt265 = [0,-145,1076,-2,30,24,38,28,25,29,-2,117,-2,31,32,33,35,34,118,-4,26,-2,36,-3,37,27,-15,45,111,-4,109,-9,42,41,40,46,70,72,75,76,107,71,108,-4,74,81,101,102,-2,104,-13,80,-3,43,-1,44,47,48,49,50,51,52,53,54,55,56,57,58,59,67,82,-11,79,-3,92,93,91,90,113,78,112,83,84,86,-3,85,-3,167],
gt266 = [0,-167,1077],
gt267 = [0,-167,979],
gt268 = [0,-141,187,186,1081,188,22,23,131,30,24,38,28,25,29,-2,117,-2,31,32,33,35,34,118,-4,26,-2,36,-3,37,27,-2,132,136,-3,134,-7,45,111,-4,109,130,-8,42,41,40,46,70,72,75,76,107,71,108,-4,74,81,101,102,-2,104,-13,80,-3,43,-1,44,47,48,49,50,51,52,53,54,55,56,57,58,59,67,82,-11,79,-3,92,93,91,90,113,78,112,83,84,86,-3,85,-3,167],
gt269 = [0,-21,1088,-53,1091,-1,1087,1090],
gt270 = [0,-41,1095,-1,1098,-1,1096,1100,1097,1102,-2,1103,-2,1101,1104,-1,1107,-3,1108,-8,1099,-40,922,-3,1109],
gt271 = [0,-28,1111,-49,1113],
gt272 = [0,-36,1114,1116,1118,1121,1120,-20,1119,-49,922,-3,1123],
gt273 = [0,-19,1007,-5,997,-1,936,-4,937,-9,935,-59,1008,-1,1006,1124,-1,1009,-3,922,-3,1010],
gt274 = [0,-81,1125,914,-1,933,915,912,-1,913,920,917,916,924,925,926,-1,927,-3,928,934,-9,922,-3,919],
gt275 = [0,-19,1128,-5,997,-1,936,-4,937,-9,935,-59,1008,-1,1129,-2,1009,-3,922,-3,1010],
gt276 = [0,-79,1132,-2,914,-1,933,915,1014,1013,913,920,917,916,924,925,926,-1,927,-3,928,934,-9,922,-3,919],
gt277 = [0,-82,914,-1,933,915,1133,-1,913,920,917,916,924,925,926,-1,927,-3,928,934,-9,922,-3,919],
gt278 = [0,-84,933,1134,-6,1022,925,926,-1,927,-3,928,934],
gt279 = [0,-100,1042],
gt280 = [0,-112,1136,-1,1135],
gt281 = [0,-97,1138],
gt282 = [0,-99,1144],
gt283 = [0,-111,922,-3,1041],
gt284 = [0,-100,1146],
gt285 = [0,-184,236,-8,45,111,-4,109,-1,237,-7,42,41,1155,46,70,72,75,76,107,71,108,-4,74,81,101,102,-2,104,-6,235,-6,80,-3,43,-1,44,47,48,49,50,51,52,53,54,55,56,57,58,59,67,82,-11,79,-3,92,93,91,90,-1,78,112,292,84,86,-3,85,-3,167],
gt286 = [0,-141,187,186,665,188,22,23,131,30,24,38,28,25,29,-2,117,-2,31,32,33,35,34,118,-4,26,-2,36,-3,37,27,-2,132,136,-3,134,-5,1161,813,45,111,-4,109,130,-8,42,41,40,46,70,72,75,76,107,71,108,-4,74,81,101,102,-2,104,-13,80,-3,43,-1,44,47,48,49,50,51,52,53,54,55,56,57,58,59,67,82,-11,79,-3,92,93,91,90,113,78,112,83,84,86,-3,85,-3,167],
gt287 = [0,-145,1164,-2,30,24,38,28,25,29,-2,117,-2,31,32,33,35,34,118,-4,26,-2,36,-3,37,27,-15,45,111,-4,109,-9,42,41,40,46,70,72,75,76,107,71,108,-4,74,81,101,102,-2,104,-13,80,-3,43,-1,44,47,48,49,50,51,52,53,54,55,56,57,58,59,67,82,-11,79,-3,92,93,91,90,113,78,112,83,84,86,-3,85,-3,167],
gt288 = [0,-141,187,186,1166,188,22,23,131,30,24,38,28,25,29,-2,117,-2,31,32,33,35,34,118,-4,26,-2,36,-3,37,27,-2,132,136,-3,134,-7,45,111,-4,109,130,-8,42,41,40,46,70,72,75,76,107,71,108,-4,74,81,101,102,-2,104,-13,80,-3,43,-1,44,47,48,49,50,51,52,53,54,55,56,57,58,59,67,82,-11,79,-3,92,93,91,90,113,78,112,83,84,86,-3,85,-3,167],
gt289 = [0,-21,1170,-53,1091,-2,1090],
gt290 = [0,-23,1172,-17,1173,-1,1098,-1,1096,1100,1097,1102,-2,1103,-2,1101,1104,-1,1107,-3,1108,-8,1099,-40,922,-3,1109],
gt291 = [0,-77,1175],
gt292 = [0,-77,1176],
gt293 = [0,-70,1180,-40,922,-3,1181],
gt294 = [0,-44,1182],
gt295 = [0,-49,1186,1184,-1,1188,1185],
gt296 = [0,-55,1190,-1,1107,-3,1108,-49,922,-3,1123],
gt297 = [0,-46,1100,1191,1102,-2,1103,-2,1101,1104,1192,1107,-3,1108,1195,-3,1197,1199,1196,1198,-1,1202,-2,1201,-36,922,-3,1193],
gt298 = [0,-37,1206,1118,1121,1120,-20,1119,-49,922,-3,1123],
gt299 = [0,-33,1209,1208,1207],
gt300 = [0,-36,1212,1116,1118,1121,1120,-20,1119,-45,1213,-3,922,-3,1214],
gt301 = [0,-102,1220,-4,1009,-3,922,-3,1010],
gt302 = [0,-108,1224,1222,1221],
gt303 = [0,-95,1228,-15,922,-3,1229],
gt304 = [0,-81,1232,914,-1,933,915,912,-1,913,920,917,916,924,925,926,-1,927,-3,928,934,-9,922,-3,919],
gt305 = [0,-23,1244,-17,1245,-1,1098,-1,1096,1100,1097,1102,-2,1103,-2,1101,1104,-1,1107,-3,1108,-8,1099,-40,922,-3,1109],
gt306 = [0,-41,1246,-1,1098,-1,1096,1100,1097,1102,-2,1103,-2,1101,1104,-1,1107,-3,1108,-8,1099,-40,922,-3,1109],
gt307 = [0,-78,1250],
gt308 = [0,-15,909,1253,1252,1251,-62,911,914,-1,933,915,912,-1,913,920,917,916,924,925,926,-1,927,-3,928,934,-9,922,-3,919],
gt309 = [0,-43,1098,-1,1254,1100,1097,1102,-2,1103,-2,1101,1104,-1,1107,-3,1108,-8,1099,-40,922,-3,1109],
gt310 = [0,-44,1255],
gt311 = [0,-46,1256,-1,1102,-2,1103,-3,1257,-1,1107,-3,1108,-49,922,-3,1123],
gt312 = [0,-49,1258],
gt313 = [0,-52,1259],
gt314 = [0,-55,1260,-1,1107,-3,1108,-49,922,-3,1123],
gt315 = [0,-55,1261,-1,1107,-3,1108,-49,922,-3,1123],
gt316 = [0,-58,1266,-1,1264],
gt317 = [0,-63,1271,1272,1270],
gt318 = [0,-63,1280,1279,1278],
gt319 = [0,-73,1281],
gt320 = [0,-58,1266,-1,1286],
gt321 = [0,-26,1288,-2,1290,1289,1291,-40,1294],
gt322 = [0,-15,909,1253,1252,1296,-62,911,914,-1,933,915,912,-1,913,920,917,916,924,925,926,-1,927,-3,928,934,-9,922,-3,919],
gt323 = [0,-33,1209,1297],
gt324 = [0,-37,1298,1118,1121,1120,-20,1119,-49,922,-3,1123],
gt325 = [0,-81,1301,914,-1,933,915,912,-1,913,920,917,916,924,925,926,-1,927,-3,928,934,-9,922,-3,919],
gt326 = [0,-106,1303,-1,1224,1222,1304],
gt327 = [0,-108,1306],
gt328 = [0,-108,1224,1222,1307],
gt329 = [0,-98,1308],
gt330 = [0,-41,1316,-1,1098,-1,1096,1100,1097,1102,-2,1103,-2,1101,1104,-1,1107,-3,1108,-8,1099,-40,922,-3,1109],
gt331 = [0,-22,1317,-13,1318,1116,1118,1121,1120,-20,1119,-45,1319,-3,922,-3,1320],
gt332 = [0,-15,909,1323,-64,911,914,-1,933,915,912,-1,913,920,917,916,924,925,926,-1,927,-3,928,934,-9,922,-3,919],
gt333 = [0,-49,1186,1184],
gt334 = [0,-58,1325],
gt335 = [0,-67,1326,-1,1327,-1,1202,-2,1201,-36,922,-3,1328],
gt336 = [0,-67,1329,-1,1327,-1,1202,-2,1201,-36,922,-3,1328],
gt337 = [0,-69,1330,-41,922,-3,1328],
gt338 = [0,-111,922,-3,1331],
gt339 = [0,-111,922,-3,1332],
gt340 = [0,-29,1290,1336,1291,-40,1294],
gt341 = [0,-108,1224,1222,1304],
gt342 = [0,-64,1346],
gt343 = [0,-63,1347],
gt344 = [0,-19,1007,-5,997,-1,936,-4,937,-9,935,-59,1008,-1,1006,1348,-1,1009,-3,922,-3,1010],
gt345 = [0,-31,1349,-40,1294],
gt346 = [0,-67,1350,-1,1327,-1,1202,-2,1201,-36,922,-3,1328],
gt347 = [0,-67,1351,-1,1327,-1,1202,-2,1201,-36,922,-3,1328],

    // State action lookup maps
    sm0=[0,-1,1,2,-1,0,-4,0,-6,3,-1,4,-1,5,-3,6,-27,7,8,-7,9,-6,10,-5,11,-2,12,-2,13,-1,14,15,16,17,18,-1,19,20,21,22,23,24,-1,25,-2,26,27,28,29,-2,30,-4,31,32,-2,33,34,-29,35,-1,36,37,38,39,40,41,42,43,44,45,46,47],
sm1=[0,48,-3,0,-4,0],
sm2=[0,49,-3,0,-4,0],
sm3=[0,50,-3,0,-1,-1,-2,0],
sm4=[0,-4,0,-4,0,-8,4],
sm5=[0,51,-3,0,-1,-1,-2,0],
sm6=[0,-4,0,-4,0,-8,52],
sm7=[0,-4,0,-4,0,-8,53],
sm8=[0,-2,54,-1,0,-4,0,-6,55,-141,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71,72,73],
sm9=[0,74,-3,0,-1,-1,-2,0,-7,75,75,75,75,-2,75,-17,75,75,75,-1,75,-1,75,-4,75,-1,75,-1,75,75,-1,75,-1,75,-1,75,-1,75,-2,75,-45,75,-7,75,75,75,75,75,75,75,75,75,75,75,75,75,75,75,75,75,75,75,75,75,75,75,75,-4,75,75],
sm10=[0,76,-3,0,-1,-1,-2,0],
sm11=[0,77,-3,0,-1,-1,-2,0],
sm12=[0,78,-3,0,-1,-1,-2,0],
sm13=[0,79,1,2,-1,0,-1,-1,-2,0,-6,3,-1,80,-1,5,-3,6,-27,7,8,-7,9,-6,10,-5,11,-2,12,-2,13,-1,14,15,16,17,18,-1,19,20,21,22,23,24,-1,25,-2,26,27,28,29,-2,30,-4,31,32,-2,33,34,-29,35,-1,36,37,38,39,40,41,42,43,44,45,46,47],
sm14=[0,81,81,81,-1,0,-1,-1,-2,0,-6,81,-1,81,-1,81,-3,81,-27,81,81,-7,81,-6,81,-5,81,-2,81,-2,81,-1,81,81,81,81,81,-1,81,81,81,81,81,81,-1,81,-2,81,81,81,81,-2,81,-4,81,81,-2,81,81,-29,81,-1,81,81,81,81,81,81,81,81,81,81,81,81],
sm15=[0,82,82,82,-1,0,-1,-1,-2,0,-6,82,-1,82,-1,82,-3,82,-27,82,82,-7,82,-6,82,-5,82,-2,82,-2,82,-1,82,82,82,82,82,-1,82,82,82,82,82,82,-1,82,-2,82,82,82,82,-2,82,-4,82,82,-2,82,82,-29,82,-1,82,82,82,82,82,82,82,82,82,82,82,82],
sm16=[0,83,83,83,-1,0,-1,-1,-2,0,-6,83,-1,83,-1,83,-3,83,-27,83,83,-7,83,-6,83,-5,83,-2,83,-2,83,-1,83,83,83,83,83,-1,83,83,83,83,83,83,-1,83,-2,83,83,83,83,-2,83,-4,83,83,-2,83,83,-29,83,-1,83,83,83,83,83,83,83,83,83,83,83,83],
sm17=[0,84,84,84,-1,0,-1,-1,-2,0,-6,84,-1,84,-1,84,-3,84,-27,84,84,-7,84,-6,84,-5,84,-2,84,-2,84,-1,84,84,84,84,84,-1,84,84,84,84,84,84,-1,84,-2,84,84,84,84,-2,84,-4,84,84,-2,84,84,-29,84,-1,84,84,84,84,84,84,84,84,84,84,84,84],
sm18=[0,-2,2,-1,0,-1,-1,-2,0,-14,85,-31,86,-17,11,-77,42,43,-3,47],
sm19=[0,-4,0,-1,-1,-2,0,-14,87,-31,88,-21,89,-3,14,-16,27,28,29,-2,30],
sm20=[0,90,90,90,-1,0,-1,-1,-2,0,-5,90,90,-1,90,-1,90,-3,90,-27,90,90,-7,90,-6,90,-5,90,-2,90,90,-1,90,-1,90,90,90,90,90,-1,90,90,90,90,90,90,90,90,-2,90,90,90,90,-2,90,-4,90,90,-2,90,90,-1,90,-27,90,-1,90,90,90,90,90,90,90,90,90,90,90,90],
sm21=[0,91,91,91,-1,0,-1,-1,-2,0,-5,91,91,-1,91,-1,91,-3,91,-27,91,91,-7,91,-6,91,-5,91,-2,91,91,-1,91,91,91,91,91,91,91,-1,91,91,91,91,91,91,91,91,-2,91,91,91,91,-2,91,-4,91,91,-2,91,91,-1,91,-27,91,-1,91,91,91,91,91,91,91,91,91,91,91,91],
sm22=[0,92,92,92,-1,0,-1,-1,-2,0,-5,92,92,-1,92,-1,92,-3,92,-27,92,92,-7,92,-6,92,-5,92,-2,92,92,-1,92,92,92,92,92,92,92,-1,92,92,92,92,92,92,92,92,-2,92,92,92,92,-2,92,-4,92,92,-2,92,92,-1,92,-27,92,-1,92,92,92,92,92,92,92,92,92,92,92,92],
sm23=[0,-1,1,2,-1,0,-1,-1,-2,0,-8,80,-1,5,-3,6,-27,7,8,-7,9,-6,10,-5,11,-5,13,-1,14,15,16,17,18,-1,19,20,21,22,23,24,-1,25,-2,26,27,28,29,-2,30,-4,31,32,-2,33,34,-29,35,-1,36,37,38,39,40,41,42,43,44,45,46,47],
sm24=[0,-4,0,-1,-1,-2,0,-58,93],
sm25=[0,-4,0,-1,-1,-2,0,-11,94,-1,95,-38,94,-5,94,-2,94,-44,94],
sm26=[0,-4,0,-1,-1,-2,0,-11,96,-1,96,-38,96,-5,96,-2,96,-44,96],
sm27=[0,-4,0,-1,-1,-2,0,-11,97,-1,97,-38,97,-5,97,-2,97,-44,97],
sm28=[0,98,98,98,-1,0,-1,-1,-2,0,-6,98,-1,98,-1,98,98,-1,98,98,-27,98,98,-7,98,98,-5,98,-2,98,-2,98,-2,98,-2,98,-1,98,98,98,98,98,-1,98,98,98,98,98,98,-1,98,-2,98,98,98,98,-2,98,-4,98,98,-2,98,98,-1,98,-27,98,-1,98,98,98,98,98,98,98,98,98,98,98,98],
sm29=[0,99,99,99,-1,0,-1,-1,-2,0,-6,99,99,99,99,99,99,-1,99,99,-16,99,99,100,-1,99,-1,99,-4,99,99,99,-1,99,99,-3,99,99,101,-1,102,-2,99,-2,99,-2,99,-2,99,-2,99,-1,99,99,99,99,99,-1,99,99,99,99,99,99,-1,99,-2,99,99,99,99,-2,99,-4,99,99,-2,99,99,-1,99,-5,103,104,105,106,107,108,109,110,111,112,99,99,99,99,99,99,99,99,99,99,99,99,99,99,99,99,99,99,113,114,99,99,99,99,99,99],
sm30=[0,115,115,115,-1,0,-1,-1,-2,0,-6,115,-1,115,-1,115,115,-1,115,115,-27,115,115,116,-6,115,115,-5,115,-2,115,-2,115,-2,115,-2,115,-1,115,115,115,115,115,-1,115,115,115,115,115,115,-1,115,-2,115,115,115,115,-2,115,-4,115,115,-2,115,115,-1,115,-15,117,-11,115,-1,115,115,115,115,115,115,115,115,115,115,115,115],
sm31=[0,118,118,118,-1,0,-1,-1,-2,0,-6,118,-1,118,-1,118,118,-1,118,118,-27,118,118,118,-6,118,118,-5,118,-2,118,-2,118,-2,118,-2,118,-1,118,118,118,118,118,-1,118,118,118,118,118,118,-1,118,-2,118,118,118,118,-2,118,-4,118,118,-2,118,118,-1,118,-15,118,119,-10,118,-1,118,118,118,118,118,118,118,118,118,118,118,118],
sm32=[0,120,120,120,-1,0,-1,-1,-2,0,-6,120,-1,120,-1,120,120,-1,120,120,-27,120,120,120,-2,121,-3,120,120,-5,120,-2,120,-2,120,-2,120,-2,120,-1,120,120,120,120,120,-1,120,120,120,120,120,120,-1,120,-2,120,120,120,120,-2,120,-4,120,120,-2,120,120,-1,120,-15,120,120,-10,120,-1,120,120,120,120,120,120,120,120,120,120,120,120],
sm33=[0,122,122,122,-1,0,-1,-1,-2,0,-6,122,-1,122,-1,122,122,-1,122,122,-27,122,122,122,-2,122,-3,122,122,-5,122,-2,122,-2,122,-2,122,-2,122,-1,122,122,122,122,122,-1,122,122,122,122,122,122,-1,122,-2,122,122,122,122,-2,122,-4,122,122,-2,122,122,-1,122,-15,122,122,123,-9,122,-1,122,122,122,122,122,122,122,122,122,122,122,122],
sm34=[0,124,124,124,-1,0,-1,-1,-2,0,-6,124,-1,124,-1,124,124,-1,124,124,-27,124,124,124,-2,124,-3,124,124,-5,124,-2,124,-2,124,-2,124,-2,124,-1,124,124,124,124,124,-1,124,124,124,124,124,124,-1,124,-2,124,124,124,124,-2,124,-4,124,124,-2,124,124,-1,124,-15,124,124,124,125,-8,124,-1,124,124,124,124,124,124,124,124,124,124,124,124],
sm35=[0,126,126,126,-1,0,-1,-1,-2,0,-6,126,-1,126,-1,126,126,-1,126,126,-27,126,126,126,-2,126,-3,126,126,-5,126,-2,126,-2,126,-2,126,-2,126,-1,126,126,126,126,126,-1,126,126,126,126,126,126,-1,126,-2,126,126,126,126,-2,126,-4,126,126,-2,126,126,-1,126,-15,126,126,126,126,127,128,129,130,-4,126,-1,126,126,126,126,126,126,126,126,126,126,126,126],
sm36=[0,131,131,131,-1,0,-1,-1,-2,0,-6,131,132,133,-1,131,131,-1,131,131,-16,134,135,-4,136,-4,131,131,131,-2,131,-3,131,131,-5,131,-2,131,-2,131,-2,131,-2,131,-1,131,131,131,131,131,-1,131,131,131,131,131,131,-1,131,-2,131,131,131,131,-2,131,-4,131,131,-2,131,131,-1,131,-15,131,131,131,131,131,131,131,131,137,-3,131,-1,131,131,131,131,131,131,131,131,131,131,131,131],
sm37=[0,138,138,138,-1,0,-1,-1,-2,0,-6,138,138,138,-1,138,138,-1,138,138,-16,138,138,-4,138,-4,138,138,138,-2,138,-3,138,138,-5,138,-2,138,-2,138,-2,138,-2,138,-1,138,138,138,138,138,-1,138,138,138,138,138,138,-1,138,-2,138,138,138,138,-2,138,-4,138,138,-2,138,138,-1,138,-15,138,138,138,138,138,138,138,138,138,139,140,141,138,-1,138,138,138,138,138,138,138,138,138,138,138,138],
sm38=[0,142,142,142,-1,0,-1,-1,-2,0,-6,142,142,142,-1,142,142,-1,142,142,-16,142,142,-4,142,-4,143,142,142,-2,142,-3,142,142,-5,142,-2,142,-2,142,-2,142,-2,142,-1,142,142,142,142,142,-1,142,142,142,142,142,142,-1,142,-2,142,142,142,142,-2,142,-4,142,142,-2,142,142,-1,142,-15,142,142,142,142,142,142,142,142,142,142,142,142,144,-1,142,142,142,142,142,142,142,142,142,142,142,142],
sm39=[0,145,145,145,-1,0,-1,-1,-2,0,-6,145,145,145,146,145,145,-1,145,145,-16,145,145,-2,147,-1,145,-4,145,145,145,-1,148,145,-3,145,145,-5,145,-2,145,-2,145,-2,145,-2,145,-1,145,145,145,145,145,-1,145,145,145,145,145,145,-1,145,-2,145,145,145,145,-2,145,-4,145,145,-2,145,145,-1,145,-15,145,145,145,145,145,145,145,145,145,145,145,145,145,-1,145,145,145,145,145,145,145,145,145,145,145,145],
sm40=[0,149,149,149,-1,0,-1,-1,-2,0,-6,149,149,149,149,149,149,-1,149,149,-16,149,149,-2,149,-1,149,-4,149,149,149,-1,149,149,-3,149,149,-5,149,-2,149,-2,149,-2,149,-2,149,-1,149,149,149,149,149,-1,149,149,149,149,149,149,-1,149,-2,149,149,149,149,-2,149,-4,149,149,-2,149,149,-1,149,-15,149,149,149,149,149,149,149,149,149,149,149,149,149,-1,149,149,149,149,149,149,149,149,149,149,149,149],
sm41=[0,150,150,150,-1,0,-1,-1,-2,0,-6,150,150,150,150,150,150,-1,150,150,-16,150,150,-2,150,-1,150,-4,150,150,150,-1,150,150,-3,150,150,-5,150,-2,150,-2,150,-2,150,-2,150,-1,150,150,150,150,150,-1,150,150,150,150,150,150,-1,150,-2,150,150,150,150,-2,150,-4,150,150,-2,150,150,-1,150,-15,150,150,150,150,150,150,150,150,150,150,150,150,150,-1,150,150,150,150,150,150,150,150,150,150,150,150],
sm42=[0,151,151,151,-1,0,-1,-1,-2,0,-6,151,151,151,151,151,151,-1,151,151,-16,151,151,-2,151,-1,151,-4,151,151,151,-1,151,151,-3,151,151,-5,151,-2,151,-2,151,-2,151,-2,151,-1,151,151,151,151,151,-1,151,151,151,151,151,151,-1,151,-2,151,151,151,151,-2,151,-4,151,151,-2,151,151,-1,151,-15,151,151,151,151,151,151,151,151,151,151,151,151,151,152,151,151,151,151,151,151,151,151,151,151,151,151],
sm43=[0,-1,1,2,-1,0,-1,-1,-2,0,-8,80,-1,5,-3,153,-27,7,8,-7,9,-12,11,-11,18,-14,154,-2,155,-4,31,32,-2,33,34,-29,35,-1,36,37,38,39,40,41,42,43,44,45,46,47],
sm44=[0,151,151,151,-1,0,-1,-1,-2,0,-6,151,151,151,151,151,151,-1,151,151,-16,151,151,-2,151,-1,151,-4,151,151,151,-1,151,151,-3,151,151,-5,151,-2,151,-2,151,-2,151,-2,151,-1,151,151,151,151,151,-1,151,151,151,151,151,151,-1,151,-2,151,151,151,151,-2,151,-4,151,151,-2,151,151,-1,151,-15,151,151,151,151,151,151,151,151,151,151,151,151,151,151,151,151,151,151,151,151,151,151,151,151,151,151],
sm45=[0,156,156,156,-1,0,-1,-1,-2,0,-6,156,156,156,156,156,156,-1,156,156,-16,156,156,156,-1,156,-1,156,-4,156,156,156,-1,156,156,-3,156,156,156,-1,156,-2,156,-2,156,-2,156,-2,156,-2,156,-1,156,156,156,156,156,156,156,156,156,156,156,156,-1,156,-2,156,156,156,156,-2,156,-4,156,156,-2,156,156,-1,156,-5,156,156,156,156,156,156,156,156,156,156,156,156,156,156,156,156,156,156,156,156,156,156,156,156,156,156,156,156,156,156,156,156,156,156,156,156],
sm46=[0,156,156,156,-1,0,-1,-1,-2,0,-6,156,156,156,156,157,156,-1,156,156,-16,156,156,156,-1,156,-1,156,-4,156,156,156,-1,156,156,-1,158,-1,159,156,156,-1,156,-2,156,-2,156,-2,156,-2,156,-2,156,-1,156,156,156,156,156,156,156,156,156,156,156,156,-1,156,-2,156,156,156,156,-2,156,-4,156,156,-2,156,34,-1,156,-5,156,156,156,156,156,156,156,156,156,156,156,156,156,156,156,156,156,156,156,156,156,156,156,156,156,156,156,156,156,156,156,156,156,156,156,156],
sm47=[0,160,160,160,-1,0,-1,-1,-2,0,-6,160,160,160,160,157,160,-1,160,160,-16,160,160,160,-1,160,-1,160,-4,160,160,160,-1,160,160,-1,161,-1,162,160,160,-1,160,-2,160,-2,160,-2,160,-2,160,-2,160,-1,160,160,160,160,160,160,160,160,160,160,160,160,-1,160,-2,160,160,160,160,-2,160,-4,160,160,-2,160,34,-1,160,-5,160,160,160,160,160,160,160,160,160,160,160,160,160,160,160,160,160,160,160,160,160,160,160,160,160,160,160,160,160,160,160,160,160,160,160,160],
sm48=[0,-1,1,2,-1,0,-1,-1,-2,0,-8,80,-1,5,-3,153,-34,163,-1,9,-12,11,-26,154,-2,155,-4,31,164,-2,33,34,-37,42,43,44,45,46,47],
sm49=[0,165,165,165,-1,0,-1,-1,-2,0,-6,165,165,165,165,165,165,-1,165,165,-16,165,165,165,-1,165,-1,165,-4,165,165,165,-1,165,165,-1,165,-1,165,165,165,-1,165,-2,165,-2,165,-2,165,-2,165,-2,165,-1,165,165,165,165,165,165,165,165,165,165,165,165,-1,165,-2,165,165,165,165,-2,165,-4,165,165,-2,165,165,-1,165,-5,165,165,165,165,165,165,165,165,165,165,165,165,165,165,165,165,165,165,165,165,165,165,165,165,165,165,165,165,165,165,165,165,165,165,165,165],
sm50=[0,166,166,166,-1,0,-1,-1,-2,0,-6,166,166,166,166,166,166,-1,166,166,-16,166,166,166,-1,166,-1,166,-4,166,166,166,-1,166,166,-1,166,-1,166,166,166,-1,166,-2,166,-2,166,-2,166,-2,166,-2,166,-1,166,166,166,166,166,166,166,166,166,166,166,166,-1,166,-2,166,166,166,166,-2,166,-4,166,166,-2,166,166,-1,166,-5,166,166,166,166,166,166,166,166,166,166,166,166,166,166,166,166,166,166,166,166,166,166,166,166,166,166,166,166,166,166,166,166,166,166,166,166],
sm51=[0,167,167,167,-1,0,-1,-1,-2,0,-6,167,167,167,167,167,167,-1,167,167,-16,167,167,167,-1,167,-1,167,-4,167,167,167,-1,167,167,-1,167,-1,167,167,167,-1,167,-2,167,-2,167,-2,167,-2,167,-2,167,-1,167,167,167,167,167,167,167,167,167,167,167,167,-1,167,-2,167,167,167,167,-2,167,-4,167,167,-2,167,167,-1,167,-5,167,167,167,167,167,167,167,167,167,167,167,167,167,167,167,167,167,167,167,167,167,167,167,167,167,167,167,167,167,167,167,167,167,167,167,167],
sm52=[0,167,167,167,-1,0,-1,-1,-2,0,-6,167,167,167,167,167,167,-1,167,167,-16,167,167,167,-1,167,-1,167,-4,167,167,167,-1,167,167,-1,167,-1,167,167,167,-1,167,-2,167,-2,167,-2,167,-2,167,-2,167,-1,167,167,167,167,167,167,167,167,167,167,167,167,-1,167,-2,167,167,167,167,168,-1,167,-4,167,167,-2,167,167,-1,167,-5,167,167,167,167,167,167,167,167,167,167,167,167,167,167,167,167,167,167,167,167,167,167,167,167,167,167,167,167,167,167,167,167,167,167,167,167],
sm53=[0,-4,0,-1,-1,-2,0,-7,169,169,169,169,-2,169,-17,169,169,169,-1,169,-1,169,-4,169,-1,169,-1,169,169,-1,169,-1,169,-1,169,-1,169,-2,169,-2,170,-30,171,-11,169,-7,169,169,169,169,169,169,169,169,169,169,169,169,169,169,169,169,169,169,169,169,169,169,169,169,-4,169,169],
sm54=[0,172,172,172,-1,0,-1,-1,-2,0,-6,172,172,172,172,172,172,-1,172,172,-6,172,-9,172,172,172,-1,172,-1,172,-4,172,172,172,-1,172,172,-1,172,-1,172,172,172,-1,172,-2,172,-2,172,-2,172,-1,172,172,-2,172,-1,172,172,172,172,172,172,172,172,172,172,172,172,-1,172,-2,172,172,172,172,172,-1,172,172,-3,172,172,-2,172,172,-1,172,-5,172,172,172,172,172,172,172,172,172,172,172,172,172,172,172,172,172,172,172,172,172,172,172,172,172,172,172,172,172,172,172,172,172,172,172,172],
sm55=[0,173,173,173,-1,0,-1,-1,-2,0,-6,173,173,173,173,173,173,-1,173,173,-6,173,-9,173,173,173,-1,173,-1,173,-4,173,173,173,-1,173,173,-1,173,-1,173,173,173,-1,173,-2,173,-2,173,-2,173,-1,173,173,-2,173,-1,173,173,173,173,173,173,173,173,173,173,173,173,-1,173,-2,173,173,173,173,173,-1,173,173,-3,173,173,-2,173,173,-1,173,-5,173,173,173,173,173,173,173,173,173,173,173,173,173,173,173,173,173,173,173,173,173,173,173,173,173,173,173,173,173,173,173,173,173,173,173,173],
sm56=[0,174,175,176,-1,177,-1,-1,-2,178,-4,179,-1,174,174,174,174,174,174,-1,174,174,-6,174,-9,174,174,174,-1,174,-1,174,-4,174,174,174,-1,174,174,180,174,-1,174,174,174,-1,174,-2,174,-2,174,-2,181,-1,174,174,-2,174,-1,174,174,174,174,174,174,174,174,174,174,174,174,-1,174,-2,174,174,174,174,174,-1,174,174,-3,174,174,-2,174,174,-1,174,-5,174,174,174,174,174,174,174,174,174,174,174,174,174,174,174,174,174,174,174,174,174,174,174,174,174,174,174,174,174,174,174,174,174,174,174,182],
sm57=[0,183,183,183,-1,183,-1,-1,-2,183,-4,183,-1,183,183,183,183,183,183,-1,183,183,-6,183,-9,183,183,183,-1,183,-1,183,-4,183,183,183,-1,183,183,183,183,-1,183,183,183,-1,183,-2,183,-2,183,-2,183,-1,183,183,-2,183,-1,183,183,183,183,183,183,183,183,183,183,183,183,-1,183,-2,183,183,183,183,183,-1,183,183,-3,183,183,-2,183,183,-1,183,-5,183,183,183,183,183,183,183,183,183,183,183,183,183,183,183,183,183,183,183,183,183,183,183,183,183,183,183,183,183,183,183,183,183,183,183,183],
sm58=[0,184,184,184,-1,0,-1,-1,-2,0,-6,184,184,184,184,184,184,-1,184,184,-16,184,184,184,-1,184,-1,184,-4,184,184,184,-1,184,184,-1,184,-1,184,184,184,-1,184,-2,184,-2,184,-2,184,-2,184,-2,184,-1,184,184,184,184,184,184,184,184,184,184,184,184,-1,184,-2,184,184,184,184,-2,184,-4,184,184,-2,184,184,-1,184,-5,184,184,184,184,184,184,184,184,184,184,184,184,184,184,184,184,184,184,184,184,184,184,184,184,184,184,184,184,184,184,184,184,184,184,184,184],
sm59=[0,185,185,185,-1,0,-1,-1,-2,0,-6,185,185,185,185,185,185,-1,185,185,-16,185,185,185,-1,185,-1,185,-4,185,185,185,-1,185,185,-1,185,-1,185,185,185,-1,185,-2,185,-2,185,-2,185,-2,185,-2,185,-1,185,185,185,185,185,185,185,185,185,185,185,185,-1,185,-2,185,185,185,185,-2,185,-4,185,185,-2,185,185,-1,185,-5,185,185,185,185,185,185,185,185,185,185,185,185,185,185,185,185,185,185,185,185,185,185,185,185,185,185,185,185,185,185,185,185,185,185,185,185],
sm60=[0,186,186,186,-1,0,-1,-1,-2,0,-6,186,186,186,186,186,186,-1,186,186,-16,186,186,186,-1,186,-1,186,-4,186,186,186,-1,186,186,-1,186,-1,186,186,186,-1,186,-2,186,-2,186,-2,186,-2,186,-2,186,-1,186,186,186,186,186,186,186,186,186,186,186,186,-1,186,-2,186,186,186,186,-2,186,-4,186,186,-2,186,186,-1,186,-5,186,186,186,186,186,186,186,186,186,186,186,186,186,186,186,186,186,186,186,186,186,186,186,186,186,186,186,186,186,186,186,186,186,186,186,186],
sm61=[0,-1,187,188,-1,189,190,191,192,193,0,-142,194],
sm62=[0,-1,187,188,-1,189,190,191,192,193,0,-143,195],
sm63=[0,196,196,196,-1,0,-1,-1,-2,0,-6,196,196,196,196,196,196,-1,196,196,-16,196,196,196,-1,196,-1,196,-4,196,196,196,-1,196,196,-1,196,-1,196,196,196,-1,196,-2,196,-2,196,-2,196,-2,196,-2,196,-1,196,196,196,196,196,196,196,196,196,196,196,196,-1,196,-2,196,196,196,196,-2,196,-4,196,196,-2,196,196,-1,196,-5,196,196,196,196,196,196,196,196,196,196,196,196,196,196,196,196,196,196,196,196,196,196,196,196,196,196,196,196,196,196,196,196,196,196,196,196],
sm64=[0,-1,1,2,-1,0,-1,-1,-2,0,-8,80,-1,5,-2,197,153,-27,7,8,-7,9,198,-11,11,-11,18,-14,154,-2,155,-4,31,32,-1,199,33,34,-29,35,-1,36,37,38,39,40,41,42,43,44,45,46,47],
sm65=[0,200,200,200,-1,0,-1,-1,-2,0,-6,200,200,200,200,200,200,-1,200,200,-16,200,200,200,-1,200,-1,200,-4,200,200,200,-1,200,200,-1,200,-1,200,200,200,-1,200,-2,200,-2,200,-2,200,-2,200,-2,200,-1,200,200,200,200,200,200,200,200,200,200,200,200,-1,200,-2,200,200,200,200,-2,200,-4,200,200,-2,200,200,-1,200,-5,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200],
sm66=[0,-1,201,202,203,204,205,206,207,208,209,-3,210,211,-99,212,213],
sm67=[0,-1,1,2,-1,0,-1,-1,-2,0,-8,80,-1,5,214,-2,153,-27,7,8,-7,9,-12,11,-11,18,-14,154,-2,155,-4,31,32,-1,215,33,34,-29,35,-1,36,37,38,39,40,41,42,43,44,45,46,47],
sm68=[0,-4,0,-1,-1,-2,0,-10,157,-38,216,-1,217],
sm69=[0,218,218,218,-1,0,-1,-1,-2,0,-6,218,218,218,218,218,218,-1,218,218,-16,218,218,218,-1,218,-1,218,-4,218,218,218,-1,218,218,-1,218,-1,218,218,218,-1,218,-2,218,-2,218,-2,218,-2,218,-2,218,-1,218,218,218,218,218,218,218,218,218,218,218,218,-1,218,-2,218,218,218,218,-2,218,-4,218,218,-2,218,218,-1,218,-5,218,218,218,218,218,218,218,218,218,218,218,218,218,218,218,218,218,218,218,218,218,218,218,218,218,218,218,218,218,218,218,218,218,218,218,218],
sm70=[0,219,219,219,-1,0,-1,-1,-2,0,-6,219,219,219,219,219,219,-1,219,219,-16,219,219,219,-1,219,-1,219,-4,219,219,219,-1,219,219,-1,219,-1,219,219,219,-1,219,-2,219,-2,219,-2,219,-2,219,-2,219,-1,219,219,219,219,219,219,219,219,219,219,219,219,-1,219,-2,219,219,219,219,-2,219,-4,219,219,-2,219,219,-1,219,-5,219,219,219,219,219,219,219,219,219,219,219,219,219,219,219,219,219,219,219,219,219,219,219,219,219,219,219,219,219,219,219,219,219,219,219,219],
sm71=[0,-4,0,-1,-1,-2,0,-92,220],
sm72=[0,-4,0,-1,-1,-2,0,-92,221],
sm73=[0,-4,0,-1,-1,-2,0,-61,222],
sm74=[0,-2,2,-1,0,-1,-1,-2,0,-14,223,-36,224,-12,11,-82,47],
sm75=[0,225,225,225,-1,0,-1,-1,-2,0,-5,225,225,-1,225,-1,225,-3,225,-27,225,225,-7,225,-6,225,-5,225,-2,225,225,-1,225,225,225,225,225,225,225,-1,225,225,225,225,225,225,225,225,-2,225,225,225,225,-2,225,-4,225,225,-2,225,225,-1,225,-27,225,-1,225,225,225,225,225,225,225,225,225,225,225,225],
sm76=[0,-4,0,-1,-1,-2,0,-10,226],
sm77=[0,227,227,227,-1,0,-1,-1,-2,0,-5,227,227,-1,227,-1,227,-3,227,-27,227,227,-7,227,-6,227,-5,227,-2,227,227,-1,227,227,227,227,227,227,227,-1,227,227,227,227,227,227,227,227,-2,227,227,227,227,-2,227,-4,227,227,-2,227,227,-1,227,-27,227,-1,227,227,227,227,227,227,227,227,227,227,227,227],
sm78=[0,-1,1,2,-1,0,-1,-1,-2,0,-8,80,-1,5,-3,6,-27,7,8,-7,9,-6,10,-5,11,-5,13,-1,14,15,16,17,18,-1,19,20,21,22,23,24,-1,25,-2,26,-10,31,32,-2,33,34,-29,35,-1,36,37,38,39,40,41,42,43,44,45,46,47],
sm79=[0,-4,0,-1,-1,-2,0,-10,228],
sm80=[0,-4,0,-1,-1,-2,0,-10,229,-65,230],
sm81=[0,-4,0,-1,-1,-2,0,-10,231],
sm82=[0,-2,2,-1,0,-1,-1,-2,0,-58,232,-5,11,-82,47],
sm83=[0,-2,2,-1,0,-1,-1,-2,0,-58,233,-5,11,-82,47],
sm84=[0,-1,1,2,-1,0,-1,-1,-2,0,-8,80,-1,5,-3,153,-27,7,8,-7,9,-6,234,-5,11,-11,18,-14,154,-2,155,-4,31,32,-2,33,34,-29,35,-1,36,37,38,39,40,41,42,43,44,45,46,47],
sm85=[0,-4,0,-1,-1,-2,0,-10,235],
sm86=[0,-4,0,-1,-1,-2,0,-14,6],
sm87=[0,-4,0,-1,-1,-2,0,-58,236],
sm88=[0,237,237,237,-1,0,-1,-1,-2,0,-5,237,237,-1,237,-1,237,-3,237,-27,237,237,-7,237,-6,237,-5,237,-2,237,237,-1,237,-1,237,237,237,237,237,-1,237,237,237,237,237,237,237,237,-2,237,237,237,237,-2,237,-4,237,237,-2,237,237,-1,237,-27,237,-1,237,237,237,237,237,237,237,237,237,237,237,237],
sm89=[0,-2,2,-1,0,-1,-1,-2,0,-14,238,-49,11,-30,239,-51,47],
sm90=[0,240,240,240,-1,0,-1,-1,-2,0,-5,240,240,-1,240,-1,240,-3,240,-27,240,240,-7,240,-6,240,-5,240,-2,240,240,-1,240,-1,240,240,240,240,240,-1,240,240,240,240,240,240,240,240,-2,240,240,240,240,-2,240,-4,240,240,-2,240,240,-1,240,-27,240,-1,240,240,240,240,240,240,240,240,240,240,240,240],
sm91=[0,-2,2,-1,0,-1,-1,-2,0,-10,241,-53,11,-82,47],
sm92=[0,-2,242,-1,0,-1,-1,-2,0,-14,242,-36,242,-12,242,-82,242],
sm93=[0,-2,243,-1,0,-1,-1,-2,0,-14,243,-36,243,-12,243,-82,243],
sm94=[0,244,-3,0,-4,0],
sm95=[0,-4,0,-4,0,-8,245],
sm96=[0,74,-3,0,-1,-1,-2,0],
sm97=[0,-2,54,-1,0,-4,0,-7,246,-1,247,-132,248,249],
sm98=[0,-2,54,-1,0,-1,-1,-2,0,-7,250,-1,251,-132,248,249],
sm99=[0,-2,54,-1,0,-1,-1,-2,0,-7,252,-1,253,-132,248,249],
sm100=[0,-2,254,-1,0,-1,-1,-2,0,-7,254,-1,254,-132,254,254],
sm101=[0,-2,255,-1,256,-1,-1,-2,257,-7,258,-1,258,-23,258,-27,259,-2,260,-69,261,-7,258,258],
sm102=[0,-2,262,-1,262,-1,-1,-2,262,-7,262,-1,262,-23,262,-27,262,-2,262,-69,262,-7,262,262],
sm103=[0,-2,263,-1,0,-4,0,-7,263,-1,263,-132,263,263],
sm104=[0,-2,263,-1,0,-1,-1,-2,0,-7,263,-1,263,-132,263,263],
sm105=[0,264,264,264,-1,0,-1,-1,-2,0,-6,264,-1,264,-1,264,-3,264,-27,264,264,-7,264,-6,264,-5,264,-2,264,-2,264,-1,264,264,264,264,264,-1,264,264,264,264,264,264,-1,264,-2,264,264,264,264,-2,264,-4,264,264,-2,264,264,-29,264,-1,264,264,264,264,264,264,264,264,264,264,264,264],
sm106=[0,75,75,75,-1,0,-4,0,-6,75,75,75,75,75,75,-1,75,75,-16,75,75,75,-1,75,-1,75,-4,75,75,75,-1,75,75,-1,75,-1,75,75,75,-1,75,-2,75,-2,75,-2,75,-2,75,-2,75,-1,75,75,75,75,75,75,75,75,75,75,75,75,-1,75,-2,75,75,75,75,-2,75,-4,75,75,-2,75,75,-1,75,-5,75,75,75,75,75,75,75,75,75,75,75,75,75,75,75,75,75,75,75,75,75,75,75,75,75,75,75,75,75,75,75,75,75,75,75,75],
sm107=[0,-2,54,-1,0,-1,-1,-2,0,-148,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71,72,73],
sm108=[0,-4,0,-1,-1,-2,0,-21,265],
sm109=[0,-4,0,-1,-1,-2,0,-58,266],
sm110=[0,-4,0,-1,-1,-2,0,-13,267,-7,268],
sm111=[0,-4,0,-1,-1,-2,0,-21,268],
sm112=[0,-4,0,-1,-1,-2,0,-13,269,-7,269],
sm113=[0,-4,0,-1,-1,-2,0,-13,270,-7,270,-84,270],
sm114=[0,-4,0,-1,-1,-2,0,-66,271],
sm115=[0,-2,2,-1,0,-1,-1,-2,0,-13,272,-50,11,-41,273,-40,47],
sm116=[0,-4,0,-1,-1,-2,0,-58,274],
sm117=[0,-4,0,-1,-1,-2,0,-21,265,-36,275],
sm118=[0,276,276,276,-1,0,-1,-1,-2,0,-6,276,-1,276,-1,276,-3,276,-27,276,276,-7,276,-6,276,-5,276,-2,276,-2,276,-1,276,276,276,276,276,-1,276,276,276,276,276,276,-1,276,-2,276,276,276,276,-2,276,-4,276,276,-2,276,276,-29,276,-1,276,276,276,276,276,276,276,276,276,276,276,276],
sm119=[0,-1,1,2,-1,0,-1,-1,-2,0,-8,80,-1,5,-3,153,-27,7,8,-7,9,-12,11,-11,18,-14,29,-2,30,-4,31,32,-2,33,34,-29,35,-1,36,37,38,39,40,41,42,43,44,45,46,47],
sm120=[0,-2,2,-1,0,-1,-1,-2,0,-13,277,-50,11,-41,278,-40,47],
sm121=[0,-4,0,-1,-1,-2,0,-106,279],
sm122=[0,-1,1,2,-1,0,-1,-1,-2,0,-5,280,-2,80,-1,5,-3,6,-27,7,8,-7,9,-6,10,-5,11,-3,280,-1,13,-1,14,15,16,17,18,-1,19,20,21,22,23,24,280,25,-2,26,27,28,29,-2,30,-4,31,32,-2,33,34,-1,280,-27,35,-1,36,37,38,39,40,41,42,43,44,45,46,47],
sm123=[0,-1,281,281,-1,0,-1,-1,-2,0,-5,281,-2,281,-1,281,-3,281,-27,281,281,-7,281,-6,281,-5,281,-3,281,-1,281,-1,281,281,281,281,281,-1,281,281,281,281,281,281,281,281,-2,281,281,281,281,-2,281,-4,281,281,-2,281,281,-1,281,-27,281,-1,281,281,281,281,281,281,281,281,281,281,281,281],
sm124=[0,-1,282,282,-1,0,-1,-1,-2,0,-5,282,-2,282,-1,282,-3,282,-27,282,282,-7,282,-6,282,-5,282,-3,282,-1,282,-1,282,282,282,282,282,-1,282,282,282,282,282,282,282,282,-2,282,282,282,282,-2,282,-4,282,282,-2,282,282,-1,282,-27,282,-1,282,282,282,282,282,282,282,282,282,282,282,282],
sm125=[0,283,283,283,-1,0,-1,-1,-2,0,-5,283,283,-1,283,-1,283,-3,283,-27,283,283,-7,283,-6,283,-5,283,-2,283,283,-1,283,283,283,283,283,283,283,-1,283,283,283,283,283,283,283,283,-2,283,283,283,283,-2,283,-4,283,283,-2,283,283,-1,283,-27,283,-1,283,283,283,283,283,283,283,283,283,283,283,283],
sm126=[0,284,284,284,-1,0,-1,-1,-2,0,-6,284,284,284,284,284,284,-1,284,284,-16,284,284,-2,284,-1,284,-4,284,284,284,-1,284,284,-3,284,284,-5,284,-2,284,-2,284,-2,284,-2,284,-1,284,284,284,284,284,-1,284,284,284,284,284,284,-1,284,-2,284,284,284,284,-2,284,-4,284,284,-2,284,284,-1,284,-15,284,284,284,284,284,284,284,284,284,284,284,284,284,284,284,284,284,284,284,284,284,284,284,284,284,284],
sm127=[0,285,285,285,-1,0,-1,-1,-2,0,-6,285,285,285,285,285,285,-1,285,285,-16,285,285,-2,285,-1,285,-4,285,285,285,-1,285,285,-3,285,285,-5,285,-2,285,-2,285,-2,285,-2,285,-1,285,285,285,285,285,-1,285,285,285,285,285,285,-1,285,-2,285,285,285,285,-2,285,-4,285,285,-2,285,285,-1,285,-15,285,285,285,285,285,285,285,285,285,285,285,285,285,285,285,285,285,285,285,285,285,285,285,285,285,285],
sm128=[0,-1,286,286,-1,0,-1,-1,-2,0,-8,286,-1,286,-3,286,-27,286,286,-7,286,-12,286,-11,286,-14,286,-2,286,-4,286,286,-2,286,286,-29,286,-1,286,286,286,286,286,286,286,286,286,286,286,286],
sm129=[0,287,287,287,-1,0,-1,-1,-2,0,-6,287,287,287,287,287,287,-1,287,287,-16,287,287,-2,287,-1,287,-4,287,287,287,-1,287,287,-3,287,287,-5,287,-2,287,-2,287,-2,287,-2,287,-1,287,287,287,287,287,-1,287,287,287,287,287,287,-1,287,-2,287,287,287,287,-2,287,-4,287,287,-2,287,287,-1,287,-15,287,287,287,287,287,287,287,287,287,287,287,287,287,287,287,287,287,287,287,287,287,287,287,287,287,287],
sm130=[0,99,99,99,-1,0,-1,-1,-2,0,-6,99,99,99,99,99,99,-1,99,99,-16,99,99,-2,99,-1,99,-4,99,99,99,-1,99,99,-3,99,99,-5,99,-2,99,-2,99,-2,99,-2,99,-1,99,99,99,99,99,-1,99,99,99,99,99,99,-1,99,-2,99,99,99,99,-2,99,-4,99,99,-2,99,99,-1,99,-15,99,99,99,99,99,99,99,99,99,99,99,99,99,99,99,99,99,99,113,114,99,99,99,99,99,99],
sm131=[0,169,169,169,-1,0,-1,-1,-2,0,-6,169,169,169,169,169,169,-1,169,169,-16,169,169,169,-1,169,-1,169,-4,169,169,169,-1,169,169,-1,169,-1,169,169,169,-1,169,-2,169,-2,169,-2,169,-2,169,-2,169,-1,169,169,169,169,169,169,169,169,169,169,169,169,-1,169,-2,169,169,169,169,-2,169,-4,169,169,-2,169,169,-1,169,-5,169,169,169,169,169,169,169,169,169,169,169,169,169,169,169,169,169,169,169,169,169,169,169,169,169,169,169,169,169,169,169,169,169,169,169,169],
sm132=[0,-1,1,2,-1,0,-1,-1,-2,0,-13,288,-37,289,-12,11,-32,290,291,-3,292,-3,293,-35,42,43,-3,47],
sm133=[0,-2,2,-1,0,-1,-1,-2,0,-10,294,-53,11,-82,47],
sm134=[0,295,295,295,-1,0,-1,-1,-2,0,-6,295,295,295,295,295,295,-1,295,295,-16,295,295,-2,295,-1,295,-4,295,295,295,-1,295,295,-3,295,295,-5,295,-2,295,-2,295,-2,295,-2,295,-1,295,295,295,295,295,-1,295,295,295,295,295,295,-1,295,-2,295,295,295,295,-2,295,-4,295,295,-2,295,295,-1,295,-15,295,295,295,295,295,295,295,295,295,295,295,295,295,295,295,295,295,295,295,295,295,295,295,295,295,295],
sm135=[0,296,296,296,-1,0,-1,-1,-2,0,-6,296,296,296,296,296,296,-1,296,296,-16,296,296,-2,296,-1,296,-4,296,296,296,-1,296,296,-3,296,296,-5,296,-2,296,-2,296,-2,296,-2,296,-1,296,296,296,296,296,-1,296,296,296,296,296,296,-1,296,-2,296,296,296,296,-2,296,-4,296,296,-2,296,296,-1,296,-15,296,296,296,296,296,296,296,296,296,296,296,296,296,296,296,296,296,296,296,296,296,296,296,296,296,296],
sm136=[0,297,297,297,-1,0,-1,-1,-2,0,-6,297,297,297,297,297,297,-1,297,297,-16,297,297,-2,297,-1,297,-4,297,297,297,-1,297,297,-3,297,297,-5,297,-2,297,-2,297,-2,297,-2,297,-1,297,297,297,297,297,-1,297,297,297,297,297,297,-1,297,-2,297,297,297,297,-2,297,-4,297,297,-2,297,297,-1,297,-15,297,297,297,297,297,297,297,297,297,297,297,297,297,297,297,297,297,297,297,297,297,297,297,297,297,297],
sm137=[0,298,298,298,-1,0,-1,-1,-2,0,-6,298,298,298,298,298,298,-1,298,298,-16,298,298,-2,298,-1,298,-4,298,298,298,-1,298,298,-3,298,298,-5,298,-2,298,-2,298,-2,298,-2,298,-1,298,298,298,298,298,-1,298,298,298,298,298,298,-1,298,-2,298,298,298,298,-2,298,-4,298,298,-2,298,298,-1,298,-15,298,298,298,298,298,298,298,298,298,298,298,298,298,298,298,298,298,298,298,298,298,298,298,298,298,298],
sm138=[0,299,299,299,-1,0,-1,-1,-2,0,-6,299,299,299,299,299,299,-1,299,299,-16,299,299,-2,299,-1,299,-4,299,299,299,-1,299,299,-3,299,299,-5,299,-2,299,-2,299,-2,299,-2,299,-1,299,299,299,299,299,-1,299,299,299,299,299,299,-1,299,-2,299,299,299,299,-2,299,-4,299,299,-2,299,299,-1,299,-15,299,299,299,299,299,299,299,299,299,299,299,299,299,299,299,299,299,299,299,299,299,299,299,299,299,299],
sm139=[0,300,300,300,-1,0,-1,-1,-2,0,-6,300,300,300,300,300,300,-1,300,300,-16,300,300,-2,300,-1,300,-4,300,300,300,-1,300,300,-3,300,300,-5,300,-2,300,-2,300,-2,300,-2,300,-1,300,300,300,300,300,-1,300,300,300,300,300,300,-1,300,-2,300,300,300,300,-2,300,-4,300,300,-2,300,300,-1,300,-15,300,300,300,300,300,300,300,300,300,300,300,300,300,300,300,300,300,300,300,300,300,300,300,300,300,300],
sm140=[0,301,301,301,-1,0,-1,-1,-2,0,-6,301,301,301,301,301,301,-1,301,301,-16,301,301,-2,301,-1,301,-4,301,301,301,-1,301,301,-3,301,301,-5,301,-2,301,-2,301,-2,301,-2,301,-1,301,301,301,301,301,-1,301,301,301,301,301,301,-1,301,-2,301,301,301,301,-2,301,-4,301,301,-2,301,301,-1,301,-15,301,301,301,301,301,301,301,301,301,301,301,301,301,301,301,301,301,301,301,301,301,301,301,301,301,301],
sm141=[0,302,302,302,-1,0,-1,-1,-2,0,-6,302,302,302,302,302,302,-1,302,302,-16,302,302,-2,302,-1,302,-4,302,302,302,-1,302,302,-3,302,302,-5,302,-2,302,-2,302,-2,302,-2,302,-1,302,302,302,302,302,-1,302,302,302,302,302,302,-1,302,-2,302,302,302,302,-2,302,-4,302,302,-2,302,302,-1,302,-15,302,302,302,302,302,302,302,302,302,302,302,302,302,302,302,302,302,302,302,302,302,302,302,302,302,302],
sm142=[0,-2,2,-1,0,-1,-1,-2,0,-64,11,-82,47],
sm143=[0,303,303,303,-1,0,-1,-1,-2,0,-6,303,303,303,303,303,303,-1,303,303,-16,303,303,303,-1,303,-1,303,-4,303,303,303,-1,303,303,-1,303,-1,303,303,303,-1,303,-2,303,-2,303,-2,303,-2,303,-2,303,-1,303,303,303,303,303,303,303,303,303,303,303,303,-1,303,-2,303,303,303,303,-2,303,-4,303,303,-2,303,303,-1,303,-5,303,303,303,303,303,303,303,303,303,303,303,303,303,303,303,303,303,303,303,303,303,303,303,303,303,303,303,303,303,303,303,303,303,303,303,303],
sm144=[0,304,304,304,-1,0,-1,-1,-2,0,-6,304,304,304,304,304,304,-1,304,304,-16,304,304,304,-1,304,-1,304,-4,304,304,304,-1,304,304,-1,304,-1,304,304,304,-1,304,-2,304,-2,304,-2,304,-2,304,-2,304,-1,304,304,304,304,304,304,304,304,304,304,304,304,-1,304,-2,304,304,304,304,-2,304,-4,304,304,-2,304,304,-1,304,-5,304,304,304,304,304,304,304,304,304,304,304,304,304,304,304,304,304,304,304,304,304,304,304,304,304,304,304,304,304,304,304,304,304,304,304,304],
sm145=[0,-1,1,2,-1,0,-1,-1,-2,0,-8,80,-1,5,305,-1,306,153,-27,7,8,-7,9,-12,11,-11,18,-14,154,-2,155,-4,31,32,-1,307,33,34,-29,35,-1,36,37,38,39,40,41,42,43,44,45,46,47],
sm146=[0,308,308,308,-1,0,-1,-1,-2,0,-6,308,308,308,308,308,308,-1,308,308,-16,308,308,308,-1,308,-1,308,-4,308,308,308,-1,308,308,-1,308,-1,308,308,308,-1,308,-2,308,-2,308,-2,308,-2,308,-2,308,-1,308,308,308,308,308,308,308,308,308,308,308,308,-1,308,-2,308,308,308,308,-2,308,-4,308,308,-2,308,308,-1,308,-5,308,308,308,308,308,308,308,308,308,308,308,308,308,308,308,308,308,308,308,308,308,308,308,308,308,308,308,308,308,308,308,308,308,308,308,308],
sm147=[0,309,309,309,-1,0,-1,-1,-2,0,-6,309,309,309,309,309,309,-1,309,309,-16,309,309,309,-1,309,-1,309,-4,309,309,309,-1,309,309,-1,309,-1,309,309,309,-1,309,-2,309,-2,309,-2,309,-2,309,-2,309,-1,309,309,309,309,309,309,309,309,309,309,309,309,-1,309,-2,309,309,309,309,-2,309,-4,309,309,-2,309,309,-1,309,-5,309,309,309,309,309,309,309,309,309,309,309,309,309,309,309,309,309,309,309,309,309,309,309,309,309,309,309,309,309,309,309,309,309,309,309,309],
sm148=[0,310,310,310,-1,0,-1,-1,-2,0,-6,310,310,310,310,310,310,-1,310,310,-16,310,310,310,-1,310,-1,310,-4,310,310,310,-1,310,310,-3,310,310,310,-1,310,-2,310,-2,310,-2,310,-2,310,-2,310,-1,310,310,310,310,310,310,310,310,310,310,310,310,-1,310,-2,310,310,310,310,-2,310,-4,310,310,-2,310,310,-1,310,-5,310,310,310,310,310,310,310,310,310,310,310,310,310,310,310,310,310,310,310,310,310,310,310,310,310,310,310,310,310,310,310,310,310,310,310,310],
sm149=[0,-4,0,-1,-1,-2,0,-101,311],
sm150=[0,-4,0,-1,-1,-2,0,-49,216,-1,217],
sm151=[0,312,175,176,-1,177,-1,-1,-2,178,-4,179,-1,312,312,312,312,312,312,-1,312,312,-6,312,-9,312,312,312,-1,312,-1,312,-4,312,312,312,-1,312,312,180,312,-1,312,312,312,-1,312,-2,312,-2,312,-2,181,-1,312,312,-2,312,-1,312,312,312,312,312,312,312,312,312,312,312,312,-1,312,-2,312,312,312,312,312,-1,312,312,-3,312,312,-2,312,312,-1,312,-5,312,312,312,312,312,312,312,312,312,312,312,312,312,312,312,312,312,312,312,312,312,312,312,312,312,312,312,312,312,312,312,312,312,312,312,182],
sm152=[0,313,313,313,-1,0,-1,-1,-2,0,-6,313,313,313,313,313,313,-1,313,313,-6,313,-9,313,313,313,-1,313,-1,313,-4,313,313,313,-1,313,313,-1,313,-1,313,313,313,-1,313,-2,313,-2,313,-2,313,-1,313,313,-2,313,-1,313,313,313,313,313,313,313,313,313,313,313,313,-1,313,-2,313,313,313,313,313,-1,313,313,-3,313,313,-2,313,313,-1,313,-5,313,313,313,313,313,313,313,313,313,313,313,313,313,313,313,313,313,313,313,313,313,313,313,313,313,313,313,313,313,313,313,313,313,313,313,313],
sm153=[0,314,314,314,-1,314,-1,-1,-2,314,-4,314,-1,314,314,314,314,314,314,-1,314,314,-6,314,-9,314,314,314,-1,314,-1,314,-4,314,314,314,-1,314,314,314,314,-1,314,314,314,-1,314,-2,314,-2,314,-2,314,-1,314,314,-2,314,-1,314,314,314,314,314,314,314,314,314,314,314,314,-1,314,-2,314,314,314,314,314,-1,314,314,-3,314,314,-2,314,314,-1,314,-5,314,314,314,314,314,314,314,314,314,314,314,314,314,314,314,314,314,314,314,314,314,314,314,314,314,314,314,314,314,314,314,314,314,314,314,314],
sm154=[0,315,315,315,-1,315,-1,-1,-2,315,-4,315,-1,315,315,315,315,315,315,-1,315,315,-6,315,-9,315,315,315,-1,315,-1,315,-4,315,315,315,-1,315,315,315,315,-1,315,315,315,-1,315,-2,315,-2,315,-2,315,-1,315,315,-2,315,-1,315,315,315,315,315,315,315,315,315,315,315,315,-1,315,-2,315,315,315,315,315,-1,315,315,-3,315,315,-2,315,315,-1,315,-5,315,315,315,315,315,315,315,315,315,315,315,315,315,315,315,315,315,315,315,315,315,315,315,315,315,315,315,315,315,315,315,315,315,315,315,315],
sm155=[0,316,316,316,-1,0,-1,-1,-2,0,-6,316,316,316,316,316,316,-1,316,316,-6,316,-9,316,316,316,-1,316,-1,316,-4,316,316,316,-1,316,316,-1,316,-1,316,316,316,-1,316,-2,316,-2,316,-2,316,-1,316,316,-2,316,-1,316,316,316,316,316,316,316,316,316,316,316,316,-1,316,-2,316,316,316,316,316,-1,316,316,-3,316,316,-2,316,316,-1,316,-5,316,316,316,316,316,316,316,316,316,316,316,316,316,316,316,316,316,316,316,316,316,316,316,316,316,316,316,316,316,316,316,316,316,316,316,316],
sm156=[0,-1,187,188,-1,189,190,191,192,193,0,-142,317],
sm157=[0,318,318,318,-1,0,-1,-1,-2,0,-6,318,318,318,318,318,318,-1,318,318,-16,318,318,318,-1,318,-1,318,-4,318,318,318,-1,318,318,-1,318,-1,318,318,318,-1,318,-2,318,-2,318,-2,318,-2,318,-2,318,-1,318,318,318,318,318,318,318,318,318,318,318,318,-1,318,-2,318,318,318,318,-2,318,-4,318,318,-2,318,318,-1,318,-5,318,318,318,318,318,318,318,318,318,318,318,318,318,318,318,318,318,318,318,318,318,318,318,318,318,318,318,318,318,318,318,318,318,318,318,318],
sm158=[0,-1,319,319,-1,319,319,319,319,319,0,-142,319,319],
sm159=[0,-1,320,320,-1,320,320,320,320,320,0,-142,320,320],
sm160=[0,-1,187,188,-1,189,190,191,192,193,0,-143,321],
sm161=[0,-4,0,-1,-1,-2,0,-13,322,-38,323],
sm162=[0,-1,1,2,-1,0,-1,-1,-2,0,-8,80,-1,5,-2,324,153,-27,7,8,-7,9,325,-11,11,-11,18,-14,154,-2,155,-4,31,32,-1,199,33,34,-29,35,-1,36,37,38,39,40,41,42,43,44,45,46,47],
sm163=[0,326,326,326,-1,0,-1,-1,-2,0,-6,326,326,326,326,326,326,-1,326,326,-16,326,326,326,-1,326,-1,326,-4,326,326,326,-1,326,326,-1,326,-1,326,326,326,-1,326,-2,326,-2,326,-2,326,-2,326,-2,326,-1,326,326,326,326,326,326,326,326,326,326,326,326,-1,326,-2,326,326,326,326,-2,326,-4,326,326,-2,326,326,-1,326,-5,326,326,326,326,326,326,326,326,326,326,326,326,326,326,326,326,326,326,326,326,326,326,326,326,326,326,326,326,326,326,326,326,326,326,326,326],
sm164=[0,-4,0,-1,-1,-2,0,-13,327,-38,327],
sm165=[0,169,169,169,-1,0,-1,-1,-2,0,-6,169,169,169,169,169,169,-1,169,169,-16,169,169,169,-1,169,-1,169,-4,169,169,169,-1,169,169,-1,169,-1,169,169,169,-1,169,-2,169,-2,169,-2,169,-2,169,-2,169,-1,169,169,169,169,169,169,169,169,169,169,169,169,-1,169,-2,169,169,169,169,171,-1,169,-4,169,169,-2,169,169,-1,169,-5,169,169,169,169,169,169,169,169,169,169,169,169,169,169,169,169,169,169,169,169,169,169,169,169,169,169,169,169,169,169,169,169,169,169,169,169],
sm166=[0,-1,328,328,-1,0,-1,-1,-2,0,-8,328,-1,328,-2,328,328,-27,328,328,-7,328,328,-11,328,-11,328,-14,328,-2,328,-4,328,328,-1,328,328,328,-29,328,-1,328,328,328,328,328,328,328,328,328,328,328,328],
sm167=[0,-4,0,-1,-1,-2,0,-104,329,330],
sm168=[0,331,331,331,-1,0,-1,-1,-2,0,-6,331,331,331,331,331,331,-1,331,331,-16,331,331,331,-1,331,-1,331,-4,331,331,331,-1,331,331,-1,331,-1,331,331,331,-1,331,-2,331,-2,331,-2,331,-2,331,-2,331,-1,331,331,331,331,331,331,331,331,331,331,331,331,-1,331,-2,331,331,331,331,-2,331,-4,331,331,-2,331,331,-1,331,-5,331,331,331,331,331,331,331,331,331,331,331,331,331,331,331,331,331,331,331,331,331,331,331,331,331,331,331,331,331,331,331,331,331,331,331,331],
sm169=[0,-1,332,332,-1,0,-1,-1,-2,0,-8,332,-1,332,-3,332,-27,332,332,-7,332,-12,332,-11,332,-14,332,-2,332,-4,332,332,-2,332,332,-29,332,-1,332,332,332,332,332,332,332,332,332,332,332,332],
sm170=[0,-1,201,202,203,204,205,206,207,208,209,-3,210,211,-99,333,333],
sm171=[0,-1,334,334,334,334,334,334,334,334,334,-3,334,334,-99,334,334],
sm172=[0,-1,335,335,335,335,335,335,335,335,335,-3,335,335,-99,335,335],
sm173=[0,-4,0,-1,-1,-2,0,-106,336],
sm174=[0,337,337,337,-1,0,-1,-1,-2,0,-6,337,337,337,337,337,337,-1,337,337,-16,337,337,337,-1,337,-1,337,-4,337,337,337,-1,337,337,-1,337,-1,337,337,337,-1,337,-2,337,-2,337,-2,337,-2,337,-2,337,-1,337,337,337,337,337,337,337,337,337,337,337,337,-1,337,-2,337,337,337,337,337,-1,337,-4,337,337,-2,337,337,-1,337,-5,337,337,337,337,337,337,337,337,337,337,337,337,337,337,337,337,337,337,337,337,337,337,337,337,337,337,337,337,337,337,337,337,337,337,337,337],
sm175=[0,-4,0,-1,-1,-2,0,-11,338,-1,339],
sm176=[0,340,340,340,-1,0,-1,-1,-2,0,-6,340,340,340,340,340,340,-1,340,340,-16,340,340,340,-1,340,-1,340,-4,340,340,340,-1,340,340,-1,340,-1,340,340,340,-1,340,-2,340,-2,340,-2,340,-2,340,-2,340,-1,340,340,340,340,340,340,340,340,340,340,340,340,-1,340,-2,340,340,340,340,-2,340,-4,340,340,-2,340,340,-1,340,-5,340,340,340,340,340,340,340,340,340,340,340,340,340,340,340,340,340,340,340,340,340,340,340,340,340,340,340,340,340,340,340,340,340,340,340,340],
sm177=[0,341,341,341,-1,0,-1,-1,-2,0,-6,341,341,341,341,341,341,-1,341,341,-16,341,341,-2,341,-1,341,-4,341,341,341,-1,341,341,-3,341,341,-5,341,-2,341,-2,341,-2,341,-2,341,-1,341,341,341,341,341,-1,341,341,341,341,341,341,-1,341,-2,341,341,341,341,-2,341,-4,341,341,-2,341,341,-1,341,-15,341,341,341,341,341,341,341,341,341,341,341,341,341,341,341,341,341,341,341,341,341,341,341,341,341,341],
sm178=[0,-1,1,2,-1,0,-1,-1,-2,0,-8,80,-1,5,-3,342,-27,7,8,-7,9,-12,11,-11,18,-14,154,-2,155,-4,31,32,-2,33,34,-29,35,-1,36,37,38,39,40,41,42,43,44,45,46,47],
sm179=[0,343,343,343,-1,0,-1,-1,-2,0,-5,343,343,-1,343,-1,343,-3,343,-27,343,343,-7,343,-6,343,-5,343,-2,343,343,-1,343,343,343,343,343,343,343,-1,343,343,343,343,343,343,343,343,-2,343,343,343,343,-2,343,-4,343,343,-2,343,343,-1,343,-27,343,-1,343,343,343,343,343,343,343,343,343,343,343,343],
sm180=[0,-1,1,2,-1,0,-1,-1,-2,0,-8,80,-1,5,-3,6,-27,7,8,-7,9,-6,10,-5,11,-5,13,-1,14,15,16,17,18,-1,19,20,21,22,23,24,-1,25,-2,26,-2,29,-7,31,32,-2,33,34,-29,35,-1,36,37,38,39,40,41,42,43,44,45,46,47],
sm181=[0,-4,0,-1,-1,-2,0,-13,344,-44,345],
sm182=[0,-4,0,-1,-1,-2,0,-13,346,-44,346],
sm183=[0,-4,0,-1,-1,-2,0,-13,347,-19,348,-24,347],
sm184=[0,-4,0,-1,-1,-2,0,-33,348],
sm185=[0,-4,0,-1,-1,-2,0,-10,171,171,-1,171,171,-18,171,-3,171,-14,171,-5,171,-18,171,-17,171,-10,171],
sm186=[0,-4,0,-1,-1,-2,0,-11,349,-1,349,-19,349,-3,349,-14,349,-24,349,-28,349],
sm187=[0,-1,1,2,-1,0,-1,-1,-2,0,-51,289,-12,11,-37,350,-3,351,-35,42,43,-3,47],
sm188=[0,-2,2,-1,0,-1,-1,-2,0,-13,197,223,-36,224,352,-11,11,-37,353,-44,47],
sm189=[0,-4,0,-1,-1,-2,0,-74,354],
sm190=[0,-1,1,2,-1,0,-1,-1,-2,0,-8,80,-1,5,-3,153,-27,7,8,-7,9,-6,355,-5,11,-7,356,-3,18,-12,27,28,154,-2,155,-4,31,32,-2,33,34,-29,35,-1,36,37,38,39,40,41,42,43,44,45,46,47],
sm191=[0,-4,0,-1,-1,-2,0,-10,357],
sm192=[0,-4,0,-1,-1,-2,0,-58,358],
sm193=[0,359,359,359,-1,0,-1,-1,-2,0,-5,359,359,-1,359,-1,359,-3,359,-27,359,359,-7,359,-6,359,-5,359,-2,359,359,-1,359,359,359,359,359,359,359,-1,359,359,359,359,359,359,359,359,-2,359,359,359,359,-2,359,-4,359,359,-2,359,359,-1,359,-27,359,-1,359,359,359,359,359,359,359,359,359,359,359,359],
sm194=[0,-4,0,-1,-1,-2,0,-58,170],
sm195=[0,-4,0,-1,-1,-2,0,-58,360],
sm196=[0,361,361,361,-1,0,-1,-1,-2,0,-5,361,361,-1,361,-1,361,-3,361,-27,361,361,-7,361,-6,361,-5,361,-2,361,361,-1,361,361,361,361,361,361,361,-1,361,361,361,361,361,361,361,361,-2,361,361,361,361,-2,361,-4,361,361,-2,361,361,-1,361,-27,361,-1,361,361,361,361,361,361,361,361,361,361,361,361],
sm197=[0,-4,0,-1,-1,-2,0,-58,362],
sm198=[0,363,363,363,-1,0,-1,-1,-2,0,-5,363,363,-1,363,-1,363,-3,363,-27,363,363,-7,363,-6,363,-5,363,-2,363,363,-1,363,363,363,363,363,363,363,-1,363,363,363,363,363,363,363,363,-2,363,363,363,363,-2,363,-4,363,363,-2,363,363,-1,363,-27,363,-1,363,363,363,363,363,363,363,363,363,363,363,363],
sm199=[0,-4,0,-1,-1,-2,0,-58,364],
sm200=[0,-4,0,-1,-1,-2,0,-86,365,366],
sm201=[0,367,367,367,-1,0,-1,-1,-2,0,-5,367,367,-1,367,-1,367,-3,367,-27,367,367,-7,367,-6,367,-5,367,-2,367,367,-1,367,367,367,367,367,367,367,-1,367,367,367,367,367,367,367,367,-2,367,367,367,367,-2,367,-4,367,367,-2,367,367,-1,367,-27,367,-1,367,367,367,367,367,367,367,367,367,367,367,367],
sm202=[0,-4,0,-1,-1,-2,0,-14,238,-80,239],
sm203=[0,368,368,368,-1,0,-1,-1,-2,0,-5,368,368,-1,368,-1,368,-3,368,-27,368,368,-7,368,-6,368,-5,368,-2,368,368,-1,368,-1,368,368,368,368,368,-1,368,368,368,368,368,368,368,368,-2,368,368,368,368,-2,368,-4,368,368,-2,368,368,-1,368,-27,368,-1,368,368,368,368,368,368,368,368,368,368,368,368],
sm204=[0,-4,0,-1,-1,-2,0,-14,369],
sm205=[0,-1,1,2,-1,0,-1,-1,-2,0,-51,289,-6,370,-5,11,-31,371,290,291,-7,372,-35,42,43,-3,47],
sm206=[0,-1,1,2,-1,0,-1,-1,-2,0,-8,80,-1,5,-3,153,-36,9,-12,11,-26,154,-2,155,-4,31,32,-2,33,34,-37,42,43,44,45,46,47],
sm207=[0,-4,0,-1,-1,-2,0,-10,373],
sm208=[0,-2,2,-1,0,-1,-1,-2,0,-11,374,-2,223,-36,224,-12,11,-37,353,-44,47],
sm209=[0,-4,0,-1,-1,-2,0,-13,375,-44,376],
sm210=[0,-4,0,-1,-1,-2,0,-13,377,-44,377],
sm211=[0,-2,54,-1,0,-4,0,-7,378,-1,379,-132,248,249],
sm212=[0,-4,0,-4,0,-7,380],
sm213=[0,-4,0,-4,0,-5,381,-2,382],
sm214=[0,-2,383,-1,0,-1,-1,-2,0,-7,383,-1,383,-132,383,383],
sm215=[0,-2,384,-1,0,-1,-1,-2,0,-7,384,-1,384,-23,385,-108,384,384],
sm216=[0,-2,54,-1,0,-1,-1,-2,0,-143,386],
sm217=[0,-2,54,-1,0,-1,-1,-2,0,-142,387],
sm218=[0,-2,388,-1,0,-1,-1,-2,0,-7,388,-1,388,-23,388,-108,388,388],
sm219=[0,-2,54,-1,0,-1,-1,-2,0,-7,389,-1,390,-132,248,249],
sm220=[0,-1,391,392,-1,393,394,395,396,397,0,-5,398,-2,399,-1,400],
sm221=[0,-4,0,-1,-1,-2,0,-7,401],
sm222=[0,-2,54,-1,0,-1,-1,-2,0,-7,402,-1,403,-132,248,249],
sm223=[0,404,404,404,-1,404,404,404,404,404,0,-5,405,404,404,404,404,404,404,-1,404,404,-16,404,404,404,-1,404,-1,404,-4,404,404,404,-1,404,404,-1,404,-1,404,404,404,-1,404,-2,404,-2,404,-2,404,-2,404,-2,404,-1,404,404,404,404,404,404,404,404,404,404,404,404,-1,404,-2,404,404,404,404,-2,404,-4,404,404,-2,404,404,-1,404,-5,404,404,404,404,404,404,404,404,404,404,404,404,404,404,404,404,404,404,404,404,404,404,404,404,404,404,404,404,404,404,404,404,404,404,404,404],
sm224=[0,-4,0,-1,-1,-2,0,-7,406],
sm225=[0,-2,255,-1,256,-1,-1,-2,257,-7,407,-1,407,-23,407,-27,259,-2,260,-69,261,-7,407,407],
sm226=[0,-2,408,-1,0,-1,-1,-2,0,-7,408,-1,408,-23,408,-108,408,408],
sm227=[0,-2,409,-1,409,-1,-1,-2,409,-7,409,-1,409,-23,409,-27,409,-2,409,-69,409,-7,409,409],
sm228=[0,-2,410,-1,410,-1,-1,-2,410,-7,410,-1,410,-23,410,-27,410,-2,410,-69,410,-7,410,410],
sm229=[0,-2,411,-1,0,-1,-1,-2,0,-7,411,-1,411,-23,411,-108,411,411],
sm230=[0,-4,0,-1,-1,-2,0,-58,412],
sm231=[0,-4,0,-1,-1,-2,0,-142,42,43],
sm232=[0,413,413,413,-1,0,-1,-1,-2,0,-6,413,-1,413,-1,413,-3,413,-27,413,413,-7,413,-6,413,-5,413,-2,413,-2,413,-1,413,413,413,413,413,-1,413,413,413,413,413,413,-1,413,-2,413,413,413,413,-2,413,-4,413,413,-2,413,413,-29,413,-1,413,413,413,413,413,413,413,413,413,413,413,413],
sm233=[0,-4,0,-1,-1,-2,0,-14,85,-31,86],
sm234=[0,-4,0,-1,-1,-2,0,-13,414,-92,415],
sm235=[0,-4,0,-1,-1,-2,0,-106,416],
sm236=[0,-4,0,-1,-1,-2,0,-21,417],
sm237=[0,-4,0,-1,-1,-2,0,-13,418,-92,418],
sm238=[0,-4,0,-1,-1,-2,0,-13,419,-92,419],
sm239=[0,-4,0,-1,-1,-2,0,-13,420,-92,420],
sm240=[0,-4,0,-1,-1,-2,0,-13,270,-52,421,-39,270],
sm241=[0,-4,0,-1,-1,-2,0,-58,422],
sm242=[0,-4,0,-1,-1,-2,0,-58,423],
sm243=[0,424,424,424,-1,0,-1,-1,-2,0,-6,424,-1,424,-1,424,-3,424,-27,424,424,-7,424,-6,424,-5,424,-2,424,-2,424,-1,424,424,424,424,424,-1,424,424,424,424,424,424,-1,424,-2,424,424,424,424,-2,424,-4,424,424,-2,424,424,-29,424,-1,424,424,424,424,424,424,424,424,424,424,424,424],
sm244=[0,425,425,425,-1,0,-1,-1,-2,0,-6,425,-1,425,-1,425,-3,425,-27,425,425,-7,425,-6,425,-5,425,-2,425,-2,425,-1,425,425,425,425,425,-1,425,425,425,425,425,425,-1,425,-2,425,425,425,425,-2,425,-4,425,425,-2,425,425,-29,425,-1,425,425,425,425,425,425,425,425,425,425,425,425],
sm245=[0,-4,0,-1,-1,-2,0,-13,426,-92,427],
sm246=[0,-4,0,-1,-1,-2,0,-106,428],
sm247=[0,-4,0,-1,-1,-2,0,-21,429,-36,429],
sm248=[0,-4,0,-1,-1,-2,0,-13,430,-92,430],
sm249=[0,-4,0,-1,-1,-2,0,-13,431,-92,431],
sm250=[0,-4,0,-1,-1,-2,0,-13,432,-52,433,-39,432],
sm251=[0,434,434,434,-1,0,-1,-1,-2,0,-5,434,434,-1,434,-1,434,-3,434,-27,434,434,-7,434,-6,434,-5,434,-2,434,434,-1,434,434,434,434,434,434,434,-1,434,434,434,434,434,434,434,434,434,434,434,434,434,434,-2,434,-4,434,434,-2,434,434,-1,434,-27,434,-1,434,434,434,434,434,434,434,434,434,434,434,434],
sm252=[0,-1,435,435,-1,0,-1,-1,-2,0,-5,435,-2,435,-1,435,-3,435,-27,435,435,-7,435,-6,435,-5,435,-3,435,-1,435,-1,435,435,435,435,435,-1,435,435,435,435,435,435,435,435,-2,435,435,435,435,-2,435,-4,435,435,-2,435,435,-1,435,-27,435,-1,435,435,435,435,435,435,435,435,435,435,435,435],
sm253=[0,-4,0,-1,-1,-2,0,-11,436,-1,436,-38,436,-5,436,-2,436,-44,436],
sm254=[0,437,437,437,-1,0,-1,-1,-2,0,-6,437,-1,437,-1,437,437,-1,437,437,-27,437,437,-7,437,437,-5,437,-2,437,-2,437,-2,437,-2,437,-1,437,437,437,437,437,-1,437,437,437,437,437,437,-1,437,-2,437,437,437,437,-2,437,-4,437,437,-2,437,437,-1,437,-27,437,-1,437,437,437,437,437,437,437,437,437,437,437,437],
sm255=[0,-4,0,-1,-1,-2,0,-61,438],
sm256=[0,439,439,439,-1,0,-1,-1,-2,0,-6,439,-1,439,-1,439,439,-1,439,439,-27,439,439,439,-6,439,439,-5,439,-2,439,-2,439,-2,439,-2,439,-1,439,439,439,439,439,-1,439,439,439,439,439,439,-1,439,-2,439,439,439,439,-2,439,-4,439,439,-2,439,439,-1,439,-15,439,119,-10,439,-1,439,439,439,439,439,439,439,439,439,439,439,439],
sm257=[0,440,440,440,-1,0,-1,-1,-2,0,-6,440,-1,440,-1,440,440,-1,440,440,-27,440,440,440,-2,121,-3,440,440,-5,440,-2,440,-2,440,-2,440,-2,440,-1,440,440,440,440,440,-1,440,440,440,440,440,440,-1,440,-2,440,440,440,440,-2,440,-4,440,440,-2,440,440,-1,440,-15,440,440,-10,440,-1,440,440,440,440,440,440,440,440,440,440,440,440],
sm258=[0,441,441,441,-1,0,-1,-1,-2,0,-6,441,-1,441,-1,441,441,-1,441,441,-27,441,441,441,-2,441,-3,441,441,-5,441,-2,441,-2,441,-2,441,-2,441,-1,441,441,441,441,441,-1,441,441,441,441,441,441,-1,441,-2,441,441,441,441,-2,441,-4,441,441,-2,441,441,-1,441,-15,441,441,123,-9,441,-1,441,441,441,441,441,441,441,441,441,441,441,441],
sm259=[0,442,442,442,-1,0,-1,-1,-2,0,-6,442,-1,442,-1,442,442,-1,442,442,-27,442,442,442,-2,442,-3,442,442,-5,442,-2,442,-2,442,-2,442,-2,442,-1,442,442,442,442,442,-1,442,442,442,442,442,442,-1,442,-2,442,442,442,442,-2,442,-4,442,442,-2,442,442,-1,442,-15,442,442,442,125,-8,442,-1,442,442,442,442,442,442,442,442,442,442,442,442],
sm260=[0,443,443,443,-1,0,-1,-1,-2,0,-6,443,-1,443,-1,443,443,-1,443,443,-27,443,443,443,-2,443,-3,443,443,-5,443,-2,443,-2,443,-2,443,-2,443,-1,443,443,443,443,443,-1,443,443,443,443,443,443,-1,443,-2,443,443,443,443,-2,443,-4,443,443,-2,443,443,-1,443,-15,443,443,443,443,127,128,129,130,-4,443,-1,443,443,443,443,443,443,443,443,443,443,443,443],
sm261=[0,444,444,444,-1,0,-1,-1,-2,0,-6,444,132,133,-1,444,444,-1,444,444,-16,134,135,-4,136,-4,444,444,444,-2,444,-3,444,444,-5,444,-2,444,-2,444,-2,444,-2,444,-1,444,444,444,444,444,-1,444,444,444,444,444,444,-1,444,-2,444,444,444,444,-2,444,-4,444,444,-2,444,444,-1,444,-15,444,444,444,444,444,444,444,444,137,-3,444,-1,444,444,444,444,444,444,444,444,444,444,444,444],
sm262=[0,445,445,445,-1,0,-1,-1,-2,0,-6,445,445,445,-1,445,445,-1,445,445,-16,445,445,-4,445,-4,445,445,445,-2,445,-3,445,445,-5,445,-2,445,-2,445,-2,445,-2,445,-1,445,445,445,445,445,-1,445,445,445,445,445,445,-1,445,-2,445,445,445,445,-2,445,-4,445,445,-2,445,445,-1,445,-15,445,445,445,445,445,445,445,445,445,139,140,141,445,-1,445,445,445,445,445,445,445,445,445,445,445,445],
sm263=[0,446,446,446,-1,0,-1,-1,-2,0,-6,446,446,446,-1,446,446,-1,446,446,-16,446,446,-4,446,-4,446,446,446,-2,446,-3,446,446,-5,446,-2,446,-2,446,-2,446,-2,446,-1,446,446,446,446,446,-1,446,446,446,446,446,446,-1,446,-2,446,446,446,446,-2,446,-4,446,446,-2,446,446,-1,446,-15,446,446,446,446,446,446,446,446,446,139,140,141,446,-1,446,446,446,446,446,446,446,446,446,446,446,446],
sm264=[0,447,447,447,-1,0,-1,-1,-2,0,-6,447,447,447,-1,447,447,-1,447,447,-16,447,447,-4,447,-4,447,447,447,-2,447,-3,447,447,-5,447,-2,447,-2,447,-2,447,-2,447,-1,447,447,447,447,447,-1,447,447,447,447,447,447,-1,447,-2,447,447,447,447,-2,447,-4,447,447,-2,447,447,-1,447,-15,447,447,447,447,447,447,447,447,447,139,140,141,447,-1,447,447,447,447,447,447,447,447,447,447,447,447],
sm265=[0,448,448,448,-1,0,-1,-1,-2,0,-6,448,448,448,-1,448,448,-1,448,448,-16,448,448,-4,448,-4,143,448,448,-2,448,-3,448,448,-5,448,-2,448,-2,448,-2,448,-2,448,-1,448,448,448,448,448,-1,448,448,448,448,448,448,-1,448,-2,448,448,448,448,-2,448,-4,448,448,-2,448,448,-1,448,-15,448,448,448,448,448,448,448,448,448,448,448,448,144,-1,448,448,448,448,448,448,448,448,448,448,448,448],
sm266=[0,449,449,449,-1,0,-1,-1,-2,0,-6,449,449,449,-1,449,449,-1,449,449,-16,449,449,-4,449,-4,143,449,449,-2,449,-3,449,449,-5,449,-2,449,-2,449,-2,449,-2,449,-1,449,449,449,449,449,-1,449,449,449,449,449,449,-1,449,-2,449,449,449,449,-2,449,-4,449,449,-2,449,449,-1,449,-15,449,449,449,449,449,449,449,449,449,449,449,449,144,-1,449,449,449,449,449,449,449,449,449,449,449,449],
sm267=[0,450,450,450,-1,0,-1,-1,-2,0,-6,450,450,450,-1,450,450,-1,450,450,-16,450,450,-4,450,-4,143,450,450,-2,450,-3,450,450,-5,450,-2,450,-2,450,-2,450,-2,450,-1,450,450,450,450,450,-1,450,450,450,450,450,450,-1,450,-2,450,450,450,450,-2,450,-4,450,450,-2,450,450,-1,450,-15,450,450,450,450,450,450,450,450,450,450,450,450,144,-1,450,450,450,450,450,450,450,450,450,450,450,450],
sm268=[0,451,451,451,-1,0,-1,-1,-2,0,-6,451,451,451,146,451,451,-1,451,451,-16,451,451,-2,147,-1,451,-4,451,451,451,-1,148,451,-3,451,451,-5,451,-2,451,-2,451,-2,451,-2,451,-1,451,451,451,451,451,-1,451,451,451,451,451,451,-1,451,-2,451,451,451,451,-2,451,-4,451,451,-2,451,451,-1,451,-15,451,451,451,451,451,451,451,451,451,451,451,451,451,-1,451,451,451,451,451,451,451,451,451,451,451,451],
sm269=[0,452,452,452,-1,0,-1,-1,-2,0,-6,452,452,452,146,452,452,-1,452,452,-16,452,452,-2,147,-1,452,-4,452,452,452,-1,148,452,-3,452,452,-5,452,-2,452,-2,452,-2,452,-2,452,-1,452,452,452,452,452,-1,452,452,452,452,452,452,-1,452,-2,452,452,452,452,-2,452,-4,452,452,-2,452,452,-1,452,-15,452,452,452,452,452,452,452,452,452,452,452,452,452,-1,452,452,452,452,452,452,452,452,452,452,452,452],
sm270=[0,453,453,453,-1,0,-1,-1,-2,0,-6,453,453,453,453,453,453,-1,453,453,-16,453,453,-2,453,-1,453,-4,453,453,453,-1,453,453,-3,453,453,-5,453,-2,453,-2,453,-2,453,-2,453,-1,453,453,453,453,453,-1,453,453,453,453,453,453,-1,453,-2,453,453,453,453,-2,453,-4,453,453,-2,453,453,-1,453,-15,453,453,453,453,453,453,453,453,453,453,453,453,453,-1,453,453,453,453,453,453,453,453,453,453,453,453],
sm271=[0,454,454,454,-1,0,-1,-1,-2,0,-6,454,454,454,454,454,454,-1,454,454,-16,454,454,-2,454,-1,454,-4,454,454,454,-1,454,454,-3,454,454,-5,454,-2,454,-2,454,-2,454,-2,454,-1,454,454,454,454,454,-1,454,454,454,454,454,454,-1,454,-2,454,454,454,454,-2,454,-4,454,454,-2,454,454,-1,454,-15,454,454,454,454,454,454,454,454,454,454,454,454,454,-1,454,454,454,454,454,454,454,454,454,454,454,454],
sm272=[0,455,455,455,-1,0,-1,-1,-2,0,-6,455,455,455,455,455,455,-1,455,455,-16,455,455,-2,455,-1,455,-4,455,455,455,-1,455,455,-3,455,455,-5,455,-2,455,-2,455,-2,455,-2,455,-1,455,455,455,455,455,-1,455,455,455,455,455,455,-1,455,-2,455,455,455,455,-2,455,-4,455,455,-2,455,455,-1,455,-15,455,455,455,455,455,455,455,455,455,455,455,455,455,-1,455,455,455,455,455,455,455,455,455,455,455,455],
sm273=[0,456,456,456,-1,0,-1,-1,-2,0,-6,456,456,456,456,456,456,-1,456,456,-16,456,456,-2,456,-1,456,-4,456,456,456,-1,456,456,-3,456,456,-5,456,-2,456,-2,456,-2,456,-2,456,-1,456,456,456,456,456,-1,456,456,456,456,456,456,-1,456,-2,456,456,456,456,-2,456,-4,456,456,-2,456,456,-1,456,-15,456,456,456,456,456,456,456,456,456,456,456,456,456,-1,456,456,456,456,456,456,456,456,456,456,456,456],
sm274=[0,-4,0,-1,-1,-2,0,-13,457,-92,458],
sm275=[0,-4,0,-1,-1,-2,0,-106,459],
sm276=[0,460,460,460,-1,0,-1,-1,-2,0,-6,460,460,460,460,460,460,-1,460,460,-16,460,460,460,-1,460,-1,460,-4,460,460,460,-1,460,460,-1,460,-1,460,460,460,-1,460,-2,460,-2,460,-2,460,-2,460,-2,460,-1,460,460,460,460,460,460,460,460,460,460,460,460,-1,460,-2,460,460,460,460,-2,460,-4,460,460,-2,460,460,-1,460,-5,460,460,460,460,460,460,460,460,460,460,460,460,460,460,460,460,460,460,460,460,460,460,460,460,460,460,460,460,460,460,460,460,460,460,460,460],
sm277=[0,-4,0,-1,-1,-2,0,-13,461,-92,461],
sm278=[0,-4,0,-1,-1,-2,0,-13,462,-92,462],
sm279=[0,-4,0,-1,-1,-2,0,-13,462,-19,348,-72,462],
sm280=[0,-4,0,-1,-1,-2,0,-10,463,-50,464],
sm281=[0,-4,0,-1,-1,-2,0,-10,465,-2,172,-19,172,-27,465,-44,172],
sm282=[0,-1,1,2,-1,0,-1,-1,-2,0,-51,289,-12,11,-77,42,43,-3,47],
sm283=[0,-4,0,-1,-1,-2,0,-10,466,-50,466],
sm284=[0,-4,0,-1,-1,-2,0,-10,465,-50,465],
sm285=[0,-4,0,-1,-1,-2,0,-10,467],
sm286=[0,-2,2,-1,0,-1,-1,-2,0,-11,468,-2,223,-36,224,-12,11,-37,353,-44,47],
sm287=[0,469,469,469,-1,0,-1,-1,-2,0,-6,469,469,469,469,469,469,-1,469,469,-16,469,469,469,-1,469,-1,469,-4,469,469,469,-1,469,469,-1,469,-1,469,469,469,-1,469,-2,469,-2,469,-2,469,-2,469,-2,469,-1,469,469,469,469,469,469,469,469,469,469,469,469,-1,469,-2,469,469,469,469,-2,469,-4,469,469,-2,469,469,-1,469,-5,469,469,469,469,469,469,469,469,469,469,469,469,469,469,469,469,469,469,469,469,469,469,469,469,469,469,469,469,469,469,469,469,469,469,469,469],
sm288=[0,470,470,470,-1,0,-1,-1,-2,0,-6,470,470,470,470,470,470,-1,470,470,-16,470,470,470,-1,470,-1,470,-4,470,470,470,-1,470,470,-1,470,-1,470,470,470,-1,470,-2,470,-2,470,-2,470,-2,470,-2,470,-1,470,470,470,470,470,470,470,470,470,470,470,470,-1,470,-2,470,470,470,470,-2,470,-4,470,470,-2,470,470,-1,470,-5,470,470,470,470,470,470,470,470,470,470,470,470,470,470,470,470,470,470,470,470,470,470,470,470,470,470,470,470,470,470,470,470,470,470,470,470],
sm289=[0,-4,0,-1,-1,-2,0,-52,471],
sm290=[0,-4,0,-1,-1,-2,0,-11,472,-1,473],
sm291=[0,-4,0,-1,-1,-2,0,-11,474],
sm292=[0,475,475,475,-1,0,-1,-1,-2,0,-6,475,475,475,475,475,475,-1,475,475,-16,475,475,475,-1,475,-1,475,-4,475,475,475,-1,475,475,-1,475,-1,475,475,475,-1,475,-2,475,-2,475,-2,475,-2,475,-2,475,-1,475,475,475,475,475,475,475,475,475,475,475,475,-1,475,-2,475,475,475,475,-2,475,-4,475,475,-2,475,475,-1,475,-5,475,475,475,475,475,475,475,475,475,475,475,475,475,475,475,475,475,475,475,475,475,475,475,475,475,475,475,475,475,475,475,475,475,475,475,475],
sm293=[0,-4,0,-1,-1,-2,0,-11,476,-1,477],
sm294=[0,-4,0,-1,-1,-2,0,-11,478,-1,478],
sm295=[0,-4,0,-1,-1,-2,0,-11,479,-1,479],
sm296=[0,-4,0,-1,-1,-2,0,-52,480],
sm297=[0,481,481,481,-1,0,-1,-1,-2,0,-6,481,481,481,481,481,481,-1,481,481,-16,481,481,481,-1,481,-1,481,-4,481,481,481,-1,481,481,-1,481,-1,481,481,481,-1,481,-2,481,-2,481,-2,481,-2,481,-2,481,-1,481,481,481,481,481,481,481,481,481,481,481,481,-1,481,-2,481,481,481,481,-2,481,-4,481,481,-2,481,481,-1,481,-5,481,481,481,481,481,481,481,481,481,481,481,481,481,481,481,481,481,481,481,481,481,481,481,481,481,481,481,481,481,481,481,481,481,481,481,481],
sm298=[0,482,482,482,-1,0,-1,-1,-2,0,-6,482,482,482,482,482,482,-1,482,482,-16,482,482,482,-1,482,-1,482,-4,482,482,482,-1,482,482,-1,482,-1,482,482,482,-1,482,-2,482,-2,482,-2,482,-2,482,-2,482,-1,482,482,482,482,482,482,482,482,482,482,482,482,-1,482,-2,482,482,482,482,-2,482,-4,482,482,-2,482,482,-1,482,-5,482,482,482,482,482,482,482,482,482,482,482,482,482,482,482,482,482,482,482,482,482,482,482,482,482,482,482,482,482,482,482,482,482,482,482,482],
sm299=[0,483,483,483,-1,0,-1,-1,-2,0,-6,483,483,483,483,483,483,-1,483,483,-16,483,483,483,-1,483,-1,483,-4,483,483,483,-1,483,483,-1,483,-1,483,483,483,-1,483,-2,483,-2,483,-2,483,-2,483,-2,483,-1,483,483,483,483,483,483,483,483,483,483,483,483,-1,483,-2,483,483,483,483,-2,483,-4,483,483,-2,483,483,-1,483,-5,483,483,483,483,483,483,483,483,483,483,483,483,483,483,483,483,483,483,483,483,483,483,483,483,483,483,483,483,483,483,483,483,483,483,483,483],
sm300=[0,484,484,484,-1,0,-1,-1,-2,0,-6,484,484,484,484,484,484,-1,484,484,-6,484,-9,484,484,484,-1,484,-1,484,-4,484,484,484,-1,484,484,-1,484,-1,484,484,484,-1,484,-2,484,-2,484,-2,484,-1,484,484,-2,484,-1,484,484,484,484,484,484,484,484,484,484,484,484,-1,484,-2,484,484,484,484,484,-1,484,484,-3,484,484,-2,484,484,-1,484,-5,484,484,484,484,484,484,484,484,484,484,484,484,484,484,484,484,484,484,484,484,484,484,484,484,484,484,484,484,484,484,484,484,484,484,484,484],
sm301=[0,485,485,485,-1,485,-1,-1,-2,485,-4,485,-1,485,485,485,485,485,485,-1,485,485,-6,485,-9,485,485,485,-1,485,-1,485,-4,485,485,485,-1,485,485,485,485,-1,485,485,485,-1,485,-2,485,-2,485,-2,485,-1,485,485,-2,485,-1,485,485,485,485,485,485,485,485,485,485,485,485,-1,485,-2,485,485,485,485,485,-1,485,485,-3,485,485,-2,485,485,-1,485,-5,485,485,485,485,485,485,485,485,485,485,485,485,485,485,485,485,485,485,485,485,485,485,485,485,485,485,485,485,485,485,485,485,485,485,485,485],
sm302=[0,486,486,486,-1,0,-1,-1,-2,0,-6,486,486,486,486,486,486,-1,486,486,-16,486,486,486,-1,486,-1,486,-4,486,486,486,-1,486,486,-1,486,-1,486,486,486,-1,486,-2,486,-2,486,-2,486,-2,486,-2,486,-1,486,486,486,486,486,486,486,486,486,486,486,486,-1,486,-2,486,486,486,486,-2,486,-4,486,486,-2,486,486,-1,486,-5,486,486,486,486,486,486,486,486,486,486,486,486,486,486,486,486,486,486,486,486,486,486,486,486,486,486,486,486,486,486,486,486,486,486,486,486],
sm303=[0,-1,487,487,-1,487,487,487,487,487,0,-142,487,487],
sm304=[0,-4,0,-1,-1,-2,0,-13,324,-38,488],
sm305=[0,489,489,489,-1,0,-1,-1,-2,0,-6,489,489,489,489,489,489,-1,489,489,-16,489,489,489,-1,489,-1,489,-4,489,489,489,-1,489,489,-1,489,-1,489,489,489,-1,489,-2,489,-2,489,-2,489,-2,489,-2,489,-1,489,489,489,489,489,489,489,489,489,489,489,489,-1,489,-2,489,489,489,489,-2,489,-4,489,489,-2,489,489,-1,489,-5,489,489,489,489,489,489,489,489,489,489,489,489,489,489,489,489,489,489,489,489,489,489,489,489,489,489,489,489,489,489,489,489,489,489,489,489],
sm306=[0,-1,1,2,-1,0,-1,-1,-2,0,-8,80,-1,5,-2,197,153,-27,7,8,-7,9,328,-11,11,-11,18,-14,154,-2,155,-4,31,32,-1,199,33,34,-29,35,-1,36,37,38,39,40,41,42,43,44,45,46,47],
sm307=[0,490,490,490,-1,0,-1,-1,-2,0,-6,490,490,490,490,490,490,-1,490,490,-16,490,490,490,-1,490,-1,490,-4,490,490,490,-1,490,490,-1,490,-1,490,490,490,-1,490,-2,490,-2,490,-2,490,-2,490,-2,490,-1,490,490,490,490,490,490,490,490,490,490,490,490,-1,490,-2,490,490,490,490,-2,490,-4,490,490,-2,490,490,-1,490,-5,490,490,490,490,490,490,490,490,490,490,490,490,490,490,490,490,490,490,490,490,490,490,490,490,490,490,490,490,490,490,490,490,490,490,490,490],
sm308=[0,-4,0,-1,-1,-2,0,-13,491,-38,491],
sm309=[0,-1,492,492,-1,0,-1,-1,-2,0,-8,492,-1,492,-2,492,492,-27,492,492,-7,492,492,-11,492,-11,492,-14,492,-2,492,-4,492,492,-1,492,492,492,-29,492,-1,492,492,492,492,492,492,492,492,492,492,492,492],
sm310=[0,-4,0,-1,-1,-2,0,-13,493,-38,493],
sm311=[0,494,494,494,-1,0,-1,-1,-2,0,-6,494,494,494,494,494,494,-1,494,494,-16,494,494,494,-1,494,-1,494,-4,494,494,494,-1,494,494,-1,494,-1,494,494,494,-1,494,-2,494,-2,494,-2,494,-2,494,-2,494,-1,494,494,494,494,494,494,494,494,494,494,494,494,-1,494,-2,494,494,494,494,-2,494,-4,494,494,-2,494,494,-1,494,-5,494,494,494,494,494,494,494,494,494,494,494,494,494,494,494,494,494,494,494,494,494,494,494,494,494,494,494,494,494,494,494,494,494,494,494,494],
sm312=[0,-1,495,495,-1,0,-1,-1,-2,0,-8,495,-1,495,-3,495,-27,495,495,-7,495,-12,495,-11,495,-14,495,-2,495,-4,495,495,-2,495,495,-29,495,-1,495,495,495,495,495,495,495,495,495,495,495,495],
sm313=[0,-1,496,496,496,496,496,496,496,496,496,-3,496,496,-99,496,496],
sm314=[0,497,497,497,-1,0,-1,-1,-2,0,-6,497,497,497,497,497,497,-1,497,497,-16,497,497,497,-1,497,-1,497,-4,497,497,497,-1,497,497,-1,497,-1,497,497,497,-1,497,-2,497,-2,497,-2,497,-2,497,-2,497,-1,497,497,497,497,497,497,497,497,497,497,497,497,-1,497,-2,497,497,497,497,-2,497,-4,497,497,-2,497,497,-1,497,-5,497,497,497,497,497,497,497,497,497,497,497,497,497,497,497,497,497,497,497,497,497,497,497,497,497,497,497,497,497,497,497,497,497,497,497,497],
sm315=[0,498,498,498,-1,0,-1,-1,-2,0,-6,498,498,498,498,498,498,-1,498,498,-16,498,498,498,-1,498,-1,498,-4,498,498,498,-1,498,498,-1,498,-1,498,498,498,-1,498,-2,498,-2,498,-2,498,-2,498,-2,498,-1,498,498,498,498,498,498,498,498,498,498,498,498,-1,498,-2,498,498,498,498,-2,498,-4,498,498,-2,498,498,-1,498,-5,498,498,498,498,498,498,498,498,498,498,498,498,498,498,498,498,498,498,498,498,498,498,498,498,498,498,498,498,498,498,498,498,498,498,498,498],
sm316=[0,-1,201,202,203,204,205,206,207,208,209,-3,210,211,-99,499,500],
sm317=[0,501,501,501,-1,0,-1,-1,-2,0,-6,501,501,501,501,501,501,-1,501,501,-16,501,501,501,-1,501,-1,501,-4,501,501,501,-1,501,501,-1,501,-1,501,501,501,-1,501,-2,501,-2,501,-2,501,-2,501,-2,501,-1,501,501,501,501,501,501,501,501,501,501,501,501,-1,501,-2,501,501,501,501,501,-1,501,-4,501,501,-2,501,501,-1,501,-5,501,501,501,501,501,501,501,501,501,501,501,501,501,501,501,501,501,501,501,501,501,501,501,501,501,501,501,501,501,501,501,501,501,501,501,501],
sm318=[0,-4,0,-1,-1,-2,0,-11,502,-90,503],
sm319=[0,-4,0,-1,-1,-2,0,-11,504],
sm320=[0,-4,0,-1,-1,-2,0,-11,505],
sm321=[0,506,506,506,-1,0,-1,-1,-2,0,-6,506,506,506,506,506,506,-1,506,506,-16,506,506,506,-1,506,-1,506,-4,506,506,506,-1,506,506,-1,506,-1,506,506,506,-1,506,-2,506,-2,506,-2,506,-2,506,-2,506,-1,506,506,506,506,506,506,506,506,506,506,506,506,-1,506,-2,506,506,506,506,-2,506,-4,506,506,-2,506,506,-1,506,-5,506,506,506,506,506,506,506,506,506,506,506,506,506,506,506,506,506,506,506,506,506,506,506,506,506,506,506,506,506,506,506,506,506,506,506,506],
sm322=[0,-4,0,-1,-1,-2,0,-52,507],
sm323=[0,508,508,508,-1,0,-1,-1,-2,0,-6,508,-1,508,-1,508,508,-1,508,508,-27,508,508,-7,508,508,-5,508,-2,508,-2,508,-2,508,-2,508,-1,508,508,508,508,508,-1,508,508,508,508,508,508,-1,508,-2,508,508,508,508,-2,508,-4,508,508,-2,508,508,-1,508,-27,508,-1,508,508,508,508,508,508,508,508,508,508,508,508],
sm324=[0,509,509,509,-1,0,-1,-1,-2,0,-6,509,-1,509,-1,509,509,-1,509,509,-27,509,509,-7,509,509,-5,509,-2,509,-2,509,-2,509,-2,509,-1,509,509,509,509,509,-1,509,509,509,509,509,509,-1,509,-2,509,509,509,509,-2,509,-4,509,509,-2,509,509,-1,509,-27,509,-1,509,509,509,509,509,509,509,509,509,509,509,509],
sm325=[0,510,510,510,-1,0,-1,-1,-2,0,-5,510,510,-1,510,-1,510,-3,510,-27,510,510,-7,510,-6,510,-5,510,-2,510,510,-1,510,510,510,510,510,510,510,-1,510,510,510,510,510,510,510,510,-2,510,510,510,510,-2,510,-4,510,510,-2,510,510,-1,510,-27,510,-1,510,510,510,510,510,510,510,510,510,510,510,510],
sm326=[0,511,511,511,-1,0,-1,-1,-2,0,-5,511,511,-1,511,-1,511,-3,511,-27,511,511,-7,511,-6,511,-5,511,-2,511,511,-1,511,511,511,511,511,511,511,-1,511,511,511,511,511,511,511,511,-2,511,511,511,511,-2,511,-4,511,511,-2,511,511,-1,511,-27,511,-1,511,511,511,511,511,511,511,511,511,511,511,511],
sm327=[0,512,512,512,-1,0,-1,-1,-2,0,-5,512,512,-1,512,-1,512,-3,512,-27,512,512,-7,512,-6,512,-5,512,-2,512,512,-1,512,512,512,512,512,512,512,-1,512,512,512,512,512,512,512,512,-2,512,512,512,512,-2,512,-4,512,512,-2,512,512,-1,512,-27,512,-1,512,512,512,512,512,512,512,512,512,512,512,512],
sm328=[0,-4,0,-1,-1,-2,0,-13,513,-44,513],
sm329=[0,-4,0,-1,-1,-2,0,-11,514,-1,514,-19,514,-3,514,-14,514,-24,514,-28,514],
sm330=[0,-4,0,-1,-1,-2,0,-106,515],
sm331=[0,-4,0,-1,-1,-2,0,-13,516,-92,517],
sm332=[0,-4,0,-1,-1,-2,0,-13,518,-92,518],
sm333=[0,-4,0,-1,-1,-2,0,-13,519,-92,519],
sm334=[0,-4,0,-1,-1,-2,0,-61,520],
sm335=[0,-4,0,-1,-1,-2,0,-11,521,-1,521,-19,348,-18,521,-53,521],
sm336=[0,-4,0,-1,-1,-2,0,-11,522,-1,522,-19,522,-3,522,-14,522,-24,522,-28,522],
sm337=[0,-2,2,-1,0,-1,-1,-2,0,-13,324,223,-36,224,523,-11,11,-37,353,-44,47],
sm338=[0,-4,0,-1,-1,-2,0,-52,524],
sm339=[0,-4,0,-1,-1,-2,0,-13,525,-38,526],
sm340=[0,-4,0,-1,-1,-2,0,-13,527,-38,527],
sm341=[0,-4,0,-1,-1,-2,0,-13,528,-38,528],
sm342=[0,-4,0,-1,-1,-2,0,-11,529,-1,529,-38,529,-53,529],
sm343=[0,-4,0,-1,-1,-2,0,-11,529,-1,529,-19,348,-18,529,-53,529],
sm344=[0,-4,0,-1,-1,-2,0,-11,530],
sm345=[0,-4,0,-1,-1,-2,0,-10,531],
sm346=[0,-4,0,-1,-1,-2,0,-11,532],
sm347=[0,-4,0,-1,-1,-2,0,-58,533],
sm348=[0,-1,1,2,-1,0,-1,-1,-2,0,-8,80,-1,5,-3,153,-27,7,8,-7,9,-6,534,-5,11,-11,18,-14,154,-2,155,-4,31,32,-2,33,34,-29,35,-1,36,37,38,39,40,41,42,43,44,45,46,47],
sm349=[0,-4,0,-1,-1,-2,0,-37,535,-39,536],
sm350=[0,-1,1,2,-1,0,-1,-1,-2,0,-8,80,-1,5,-3,153,-27,7,8,-7,9,-6,537,-5,11,-11,18,-14,154,-2,155,-4,31,32,-2,33,34,-29,35,-1,36,37,38,39,40,41,42,43,44,45,46,47],
sm351=[0,-4,0,-1,-1,-2,0,-58,538],
sm352=[0,-4,0,-1,-1,-2,0,-7,99,99,99,-3,99,-17,99,99,100,-1,99,-1,99,-4,99,-1,99,-1,99,99,-5,101,-1,102,-2,99,-18,539,-34,103,104,105,106,107,108,109,110,111,112,99,99,99,99,99,99,99,99,99,99,99,99,99,99,-4,113,114],
sm353=[0,-4,0,-1,-1,-2,0,-37,539,-39,539],
sm354=[0,-1,1,2,-1,0,-1,-1,-2,0,-8,80,-1,5,-3,153,-36,9,-12,11,-7,540,-16,27,28,154,-2,155,-4,31,32,-2,33,34,-37,42,43,44,45,46,47],
sm355=[0,-4,0,-1,-1,-2,0,-11,541],
sm356=[0,542,542,542,-1,0,-1,-1,-2,0,-5,542,542,-1,542,-1,542,-3,542,-27,542,542,-7,542,-6,542,-5,542,-2,542,542,-1,542,542,542,542,542,542,542,-1,542,542,542,542,542,542,542,542,-2,542,542,542,542,-2,542,-4,542,542,-2,542,542,-1,542,-27,542,-1,542,542,542,542,542,542,542,542,542,542,542,542],
sm357=[0,543,543,543,-1,0,-1,-1,-2,0,-5,543,543,-1,543,-1,543,-3,543,-27,543,543,-7,543,-6,543,-5,543,-2,543,543,-1,543,543,543,543,543,543,543,-1,543,543,543,543,543,543,543,543,-2,543,543,543,543,-2,543,-4,543,543,-2,543,543,-1,543,-27,543,-1,543,543,543,543,543,543,543,543,543,543,543,543],
sm358=[0,544,544,544,-1,0,-1,-1,-2,0,-5,544,544,-1,544,-1,544,-3,544,-27,544,544,-7,544,-6,544,-5,544,-2,544,544,-1,544,544,544,544,544,544,544,-1,544,544,544,544,544,544,544,544,-2,544,544,544,544,-2,544,-4,544,544,-2,544,544,-1,544,-27,544,-1,544,544,544,544,544,544,544,544,544,544,544,544],
sm359=[0,-4,0,-1,-1,-2,0,-11,545],
sm360=[0,546,546,546,-1,0,-1,-1,-2,0,-5,546,546,-1,546,-1,546,-3,546,-27,546,546,-7,546,-6,546,-5,546,-2,546,546,-1,546,546,546,546,546,546,546,-1,546,546,546,546,546,546,546,546,-2,546,546,546,546,-2,546,-4,546,546,-2,546,546,-1,546,-27,546,-1,546,546,546,546,546,546,546,546,546,546,546,546],
sm361=[0,547,547,547,-1,0,-1,-1,-2,0,-5,547,547,-1,547,-1,547,-3,547,-27,547,547,-7,547,-6,547,-5,547,-2,547,547,-1,547,547,547,547,547,547,547,-1,547,547,547,547,547,547,547,547,-1,366,547,547,547,547,-2,547,-4,547,547,-2,547,547,-1,547,-27,547,-1,547,547,547,547,547,547,547,547,547,547,547,547],
sm362=[0,548,548,548,-1,0,-1,-1,-2,0,-5,548,548,-1,548,-1,548,-3,548,-27,548,548,-7,548,-6,548,-5,548,-2,548,548,-1,548,548,548,548,548,548,548,-1,548,548,548,548,548,548,548,548,-2,548,548,548,548,-2,548,-4,548,548,-2,548,548,-1,548,-27,548,-1,548,548,548,548,548,548,548,548,548,548,548,548],
sm363=[0,-4,0,-1,-1,-2,0,-10,549],
sm364=[0,550,550,550,-1,0,-1,-1,-2,0,-5,550,550,-1,550,-1,550,-3,550,-27,550,550,-7,550,-6,550,-5,550,-2,550,550,-1,550,-1,550,550,550,550,550,-1,550,550,550,550,550,550,550,550,-2,550,550,550,550,-2,550,-4,550,550,-2,550,550,-1,550,-27,550,-1,550,550,550,550,550,550,550,550,550,550,550,550],
sm365=[0,-1,1,2,-1,0,-1,-1,-2,0,-51,289,-6,370,-5,11,-31,371,290,291,-7,551,-35,42,43,-3,47],
sm366=[0,-4,0,-1,-1,-2,0,-106,552],
sm367=[0,553,553,553,-1,0,-1,-1,-2,0,-5,553,553,553,553,553,553,553,-1,553,553,-16,553,553,553,-1,553,-1,553,-4,553,553,553,-1,553,553,-1,553,-1,553,553,553,-1,553,-2,553,-2,553,-2,553,-2,553,553,-1,553,-1,553,553,553,553,553,553,553,553,553,553,553,553,553,553,-2,553,553,553,553,-2,553,-4,553,553,-2,553,553,-1,553,-5,553,553,553,553,553,553,553,553,553,553,553,553,553,553,553,553,553,553,553,553,553,553,553,553,553,553,553,553,553,553,553,553,553,553,553,553],
sm368=[0,-1,1,2,-1,0,-1,-1,-2,0,-51,289,-6,370,-5,11,-31,371,290,291,-7,554,-35,42,43,-3,47],
sm369=[0,-1,555,555,-1,0,-1,-1,-2,0,-51,555,-6,555,-5,555,-31,555,555,555,-7,555,-35,555,555,-3,555],
sm370=[0,-1,556,556,-1,0,-1,-1,-2,0,-51,556,-6,556,-5,556,-31,556,556,556,-7,556,-35,556,556,-3,556],
sm371=[0,-1,1,2,-1,0,-1,-1,-2,0,-51,289,-12,11,-32,290,291,-43,42,43,-3,47],
sm372=[0,-4,0,-1,-1,-2,0,-10,463],
sm373=[0,-4,0,-1,-1,-2,0,-10,465],
sm374=[0,-4,0,-1,-1,-2,0,-14,557],
sm375=[0,-2,2,-1,0,-1,-1,-2,0,-11,558,-2,223,-36,224,-12,11,-37,353,-44,47],
sm376=[0,-4,0,-1,-1,-2,0,-11,559],
sm377=[0,-4,0,-1,-1,-2,0,-14,560],
sm378=[0,-4,0,-1,-1,-2,0,-11,561],
sm379=[0,-4,0,-1,-1,-2,0,-11,562,-1,563],
sm380=[0,-4,0,-1,-1,-2,0,-11,564],
sm381=[0,-4,0,-1,-1,-2,0,-11,565,-1,565],
sm382=[0,-4,0,-1,-1,-2,0,-11,566,-1,566],
sm383=[0,567,567,567,-1,0,-1,-1,-2,0,-5,567,567,-1,567,-1,567,-3,567,-27,567,567,-7,567,-6,567,-5,567,-2,567,567,-1,567,-1,567,567,567,567,567,-1,567,567,567,567,567,567,567,567,-2,567,567,567,567,-2,567,-4,567,567,-2,567,567,-1,567,-27,567,-1,567,567,567,567,567,567,567,567,567,567,567,567],
sm384=[0,-4,0,-1,-1,-2,0,-13,568,-44,568],
sm385=[0,-4,0,-4,0,-7,569],
sm386=[0,-4,0,-4,0,-5,381,-2,570],
sm387=[0,-2,571,-1,0,-1,-1,-2,0,-7,571,-1,571,-132,571,571],
sm388=[0,-4,0,-4,0,-5,381,-2,572],
sm389=[0,-4,0,-4,0,-8,572],
sm390=[0,-4,0,-4,0,-6,573],
sm391=[0,-1,574,54,-1,0,-1,-1,-2,0,-10,400,-131,575,576],
sm392=[0,-4,0,-1,-1,-2,0,-143,577],
sm393=[0,-2,578,-1,0,-1,-1,-2,0,-7,578,-1,578,-23,578,-108,578,578],
sm394=[0,-4,0,-1,-1,-2,0,-142,579],
sm395=[0,-1,391,392,-1,393,394,395,396,397,0,-5,580,-2,399,-1,400],
sm396=[0,-4,0,-1,-1,-2,0,-7,581],
sm397=[0,-4,0,-1,-1,-2,0,-5,582],
sm398=[0,-2,54,-1,0,-1,-1,-2,0],
sm399=[0,-1,391,392,-1,393,394,395,396,397,0,-5,583,-2,399,-1,400],
sm400=[0,-1,584,584,-1,584,584,584,584,584,0,-5,584,-2,584,-1,584],
sm401=[0,-2,54,-1,0,-4,0,-148,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71,72,73,585,586,587],
sm402=[0,-1,588,588,-1,588,588,588,588,588,0,-5,588,-2,588,-1,588],
sm403=[0,-1,589,589,-1,589,589,589,589,589,0,-5,589,-2,589,-1,589],
sm404=[0,-1,391,392,-1,393,394,395,396,397,0,-5,589,-2,589,-1,589],
sm405=[0,-1,590,590,-1,590,590,590,590,590,0,-5,590,-1,590,590,590,590,-131,590,590],
sm406=[0,-4,-1,-4,0,-10,591],
sm407=[0,-1,592,592,-1,592,592,592,592,592,0,-5,592,-2,592,-1,592],
sm408=[0,-1,593,593,-1,593,593,593,593,593,0,-5,593,-2,593,-1,593],
sm409=[0,594,594,594,-1,594,594,594,594,594,0,-5,594,594,594,594,594,594,594,-1,594,594,-16,594,594,594,-1,594,-1,594,-4,594,594,594,-1,594,594,-1,594,-1,594,594,594,-1,594,-2,594,-2,594,-2,594,-2,594,-2,594,-1,594,594,594,594,594,594,594,594,594,594,594,594,-1,594,-2,594,594,594,594,-2,594,-4,594,594,-2,594,594,-1,594,-5,594,594,594,594,594,594,594,594,594,594,594,594,594,594,594,594,594,594,594,594,594,594,594,594,594,594,594,594,594,594,594,594,594,594,594,594],
sm410=[0,595,595,595,-1,595,595,595,595,595,0,-5,596,595,595,595,595,595,595,-1,595,595,-16,595,595,595,-1,595,-1,595,-4,595,595,595,-1,595,595,-1,595,-1,595,595,595,-1,595,-2,595,-2,595,-2,595,-2,595,-2,595,-1,595,595,595,595,595,595,595,595,595,595,595,595,-1,595,-2,595,595,595,595,-2,595,-4,595,595,-2,595,595,-1,595,-5,595,595,595,595,595,595,595,595,595,595,595,595,595,595,595,595,595,595,595,595,595,595,595,595,595,595,595,595,595,595,595,595,595,595,595,595],
sm411=[0,-4,0,-1,-1,-2,0,-7,597],
sm412=[0,-4,0,-1,-1,-2,0,-148,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71,72,73],
sm413=[0,-2,598,-1,0,-1,-1,-2,0,-7,598,-1,598,-23,598,-108,598,598],
sm414=[0,-2,599,-1,599,-1,-1,-2,599,-7,599,-1,599,-23,599,-27,599,-2,599,-69,599,-7,599,599],
sm415=[0,600,600,600,-1,0,-1,-1,-2,0,-6,600,-1,600,-1,600,-3,600,-27,600,600,-7,600,-6,600,-5,600,-2,600,-2,600,-1,600,600,600,600,600,-1,600,600,600,600,600,600,-1,600,-2,600,600,600,600,-2,600,-4,600,600,-2,600,600,-29,600,-1,600,600,600,600,600,600,600,600,600,600,600,600],
sm416=[0,-4,0,-1,-1,-2,0,-58,601],
sm417=[0,-4,0,-1,-1,-2,0,-21,602],
sm418=[0,-4,0,-1,-1,-2,0,-21,603],
sm419=[0,-2,2,-1,0,-1,-1,-2,0,-64,11,-41,604,-40,47],
sm420=[0,-4,0,-1,-1,-2,0,-21,605],
sm421=[0,-4,0,-1,-1,-2,0,-21,606],
sm422=[0,607,607,607,-1,0,-1,-1,-2,0,-6,607,-1,607,-1,607,-3,607,-27,607,607,-7,607,-6,607,-5,607,-2,607,-2,607,-1,607,607,607,607,607,-1,607,607,607,607,607,607,-1,607,-2,607,607,607,607,-2,607,-4,607,607,-2,607,607,-29,607,-1,607,607,607,607,607,607,607,607,607,607,607,607],
sm423=[0,608,608,608,-1,0,-1,-1,-2,0,-6,608,-1,608,-1,608,-3,608,-27,608,608,-7,608,-6,608,-5,608,-2,608,-2,608,-1,608,608,608,608,608,-1,608,608,608,608,608,608,-1,608,-2,608,608,608,608,-2,608,-4,608,608,-2,608,608,-29,608,-1,608,608,608,608,608,608,608,608,608,608,608,608],
sm424=[0,-2,2,-1,0,-1,-1,-2,0,-64,11,-41,609,-40,47],
sm425=[0,-4,0,-1,-1,-2,0,-21,610,-36,610],
sm426=[0,-4,0,-1,-1,-2,0,-21,611,-36,611],
sm427=[0,-1,1,2,-1,0,-1,-1,-2,0,-51,289,-12,11,-32,290,291,-3,292,-3,612,-35,42,43,-3,47],
sm428=[0,613,613,613,-1,0,-1,-1,-2,0,-6,613,613,613,613,613,613,-1,613,613,-16,613,613,613,-1,613,-1,613,-4,613,613,613,-1,613,613,-1,613,-1,613,613,613,-1,613,-2,613,-2,613,-2,613,-2,613,-2,613,-1,613,613,613,613,613,613,613,613,613,613,613,613,-1,613,-2,613,613,613,613,-2,613,-4,613,613,-2,613,613,-1,613,-5,613,613,613,613,613,613,613,613,613,613,613,613,613,613,613,613,613,613,613,613,613,613,613,613,613,613,613,613,613,613,613,613,613,613,613,613],
sm429=[0,614,614,614,-1,0,-1,-1,-2,0,-6,614,614,614,614,614,614,-1,614,614,-16,614,614,614,-1,614,-1,614,-4,614,614,614,-1,614,614,-1,614,-1,614,614,614,-1,614,-2,614,-2,614,-2,614,-2,614,-2,614,-1,614,614,614,614,614,614,614,614,614,614,614,614,-1,614,-2,614,614,614,614,-2,614,-4,614,614,-2,614,614,-1,614,-5,614,614,614,614,614,614,614,614,614,614,614,614,614,614,614,614,614,614,614,614,614,614,614,614,614,614,614,614,614,614,614,614,614,614,614,614],
sm430=[0,-4,0,-1,-1,-2,0,-13,615,-92,615],
sm431=[0,-4,0,-1,-1,-2,0,-13,616,-92,616],
sm432=[0,-2,2,-1,0,-1,-1,-2,0,-11,617,-2,223,-36,224,-12,11,-37,353,-44,47],
sm433=[0,-4,0,-1,-1,-2,0,-10,618],
sm434=[0,-4,0,-1,-1,-2,0,-10,619],
sm435=[0,-4,0,-1,-1,-2,0,-52,620],
sm436=[0,-2,2,-1,0,-1,-1,-2,0,-11,621,-2,223,-36,224,-12,11,-37,353,-44,47],
sm437=[0,-4,0,-1,-1,-2,0,-11,622],
sm438=[0,-4,0,-1,-1,-2,0,-14,623],
sm439=[0,624,624,624,-1,0,-1,-1,-2,0,-6,624,624,624,624,624,624,-1,624,624,-16,624,624,624,-1,624,-1,624,-4,624,624,624,-1,624,624,-1,624,-1,624,624,624,-1,624,-2,624,-2,624,-2,624,-2,624,-2,624,-1,624,624,624,624,624,624,624,624,624,624,624,624,-1,624,-2,624,624,624,624,-2,624,-4,624,624,-2,624,624,-1,624,-5,624,624,624,624,624,624,624,624,624,624,624,624,624,624,624,624,624,624,624,624,624,624,624,624,624,624,624,624,624,624,624,624,624,624,624,624],
sm440=[0,625,625,625,-1,0,-1,-1,-2,0,-6,625,625,625,625,625,625,-1,625,625,-16,625,625,625,-1,625,-1,625,-4,625,625,625,-1,625,625,-1,625,-1,625,625,625,-1,625,-2,625,-2,625,-2,625,-2,625,-2,625,-1,625,625,625,625,625,625,625,625,625,625,625,625,-1,625,-2,625,625,625,625,-2,625,-4,625,625,-2,625,625,-1,625,-5,625,625,625,625,625,625,625,625,625,625,625,625,625,625,625,625,625,625,625,625,625,625,625,625,625,625,625,625,625,625,625,625,625,625,625,625],
sm441=[0,-4,0,-1,-1,-2,0,-11,626],
sm442=[0,627,627,627,-1,0,-1,-1,-2,0,-6,627,627,627,627,627,627,-1,627,627,-16,627,627,627,-1,627,-1,627,-4,627,627,627,-1,627,627,-1,627,-1,627,627,627,-1,627,-2,627,-2,627,-2,627,-2,627,-2,627,-1,627,627,627,627,627,627,627,627,627,627,627,627,-1,627,-2,627,627,627,627,-2,627,-4,627,627,-2,627,627,-1,627,-5,627,627,627,627,627,627,627,627,627,627,627,627,627,627,627,627,627,627,627,627,627,627,627,627,627,627,627,627,627,627,627,627,627,627,627,627],
sm443=[0,628,628,628,-1,0,-1,-1,-2,0,-6,628,628,628,628,628,628,-1,628,628,-16,628,628,628,-1,628,-1,628,-4,628,628,628,-1,628,628,-1,628,-1,628,628,628,-1,628,-2,628,-2,628,-2,628,-2,628,-2,628,-1,628,628,628,628,628,628,628,628,628,628,628,628,-1,628,-2,628,628,628,628,-2,628,-4,628,628,-2,628,628,-1,628,-5,628,628,628,628,628,628,628,628,628,628,628,628,628,628,628,628,628,628,628,628,628,628,628,628,628,628,628,628,628,628,628,628,628,628,628,628],
sm444=[0,-1,1,2,-1,0,-1,-1,-2,0,-8,80,-1,5,-3,153,-27,7,8,-7,9,-12,11,-11,18,-14,154,-2,155,-4,31,32,-1,307,33,34,-29,35,-1,36,37,38,39,40,41,42,43,44,45,46,47],
sm445=[0,-4,0,-1,-1,-2,0,-11,629,-1,629],
sm446=[0,630,630,630,-1,0,-1,-1,-2,0,-6,630,630,630,630,630,630,-1,630,630,-16,630,630,630,-1,630,-1,630,-4,630,630,630,-1,630,630,-1,630,-1,630,630,630,-1,630,-2,630,-2,630,-2,630,-2,630,-2,630,-1,630,630,630,630,630,630,630,630,630,630,630,630,-1,630,-2,630,630,630,630,-2,630,-4,630,630,-2,630,630,-1,630,-5,630,630,630,630,630,630,630,630,630,630,630,630,630,630,630,630,630,630,630,630,630,630,630,630,630,630,630,630,630,630,630,630,630,630,630,630],
sm447=[0,631,631,631,-1,0,-1,-1,-2,0,-6,631,631,631,631,631,631,-1,631,631,-16,631,631,631,-1,631,-1,631,-4,631,631,631,-1,631,631,-1,631,-1,631,631,631,-1,631,-2,631,-2,631,-2,631,-2,631,-2,631,-1,631,631,631,631,631,631,631,631,631,631,631,631,-1,631,-2,631,631,631,631,-2,631,-4,631,631,-2,631,631,-1,631,-5,631,631,631,631,631,631,631,631,631,631,631,631,631,631,631,631,631,631,631,631,631,631,631,631,631,631,631,631,631,631,631,631,631,631,631,631],
sm448=[0,-4,0,-1,-1,-2,0,-13,632,-38,632],
sm449=[0,-1,1,2,-1,0,-1,-1,-2,0,-8,80,-1,5,-2,324,153,-27,7,8,-7,9,-12,11,-11,18,-14,154,-2,155,-4,31,32,-2,33,34,-29,35,-1,36,37,38,39,40,41,42,43,44,45,46,47],
sm450=[0,633,633,633,-1,0,-1,-1,-2,0,-6,633,633,633,633,633,633,-1,633,633,-16,633,633,633,-1,633,-1,633,-4,633,633,633,-1,633,633,-1,633,-1,633,633,633,-1,633,-2,633,-2,633,-2,633,-2,633,-2,633,-1,633,633,633,633,633,633,633,633,633,633,633,633,-1,633,-2,633,633,633,633,-2,633,-4,633,633,-2,633,633,-1,633,-5,633,633,633,633,633,633,633,633,633,633,633,633,633,633,633,633,633,633,633,633,633,633,633,633,633,633,633,633,633,633,633,633,633,633,633,633],
sm451=[0,-4,0,-1,-1,-2,0,-104,634,635],
sm452=[0,636,636,636,-1,0,-1,-1,-2,0,-6,636,636,636,636,636,636,-1,636,636,-16,636,636,636,-1,636,-1,636,-4,636,636,636,-1,636,636,-1,636,-1,636,636,636,-1,636,-2,636,-2,636,-2,636,-2,636,-2,636,-1,636,636,636,636,636,636,636,636,636,636,636,636,-1,636,-2,636,636,636,636,-2,636,-4,636,636,-2,636,636,-1,636,-5,636,636,636,636,636,636,636,636,636,636,636,636,636,636,636,636,636,636,636,636,636,636,636,636,636,636,636,636,636,636,636,636,636,636,636,636],
sm453=[0,-1,637,637,-1,0,-1,-1,-2,0,-8,637,-1,637,-3,637,-27,637,637,-7,637,-12,637,-11,637,-14,637,-2,637,-4,637,637,-2,637,637,-29,637,-1,637,637,637,637,637,637,637,637,637,637,637,637],
sm454=[0,-4,0,-1,-1,-2,0,-106,638],
sm455=[0,639,639,639,-1,0,-1,-1,-2,0,-6,639,639,639,639,639,639,-1,639,639,-16,639,639,639,-1,639,-1,639,-4,639,639,639,-1,639,639,-1,639,-1,639,639,639,-1,639,-2,639,-2,639,-2,639,-2,639,-2,639,-1,639,639,639,639,639,639,639,639,639,639,639,639,-1,639,-2,639,639,639,639,639,-1,639,-4,639,639,-2,639,639,-1,639,-5,639,639,639,639,639,639,639,639,639,639,639,639,639,639,639,639,639,639,639,639,639,639,639,639,639,639,639,639,639,639,639,639,639,639,639,639],
sm456=[0,640,640,640,-1,0,-1,-1,-2,0,-6,640,640,640,640,640,640,-1,640,640,-16,640,640,640,-1,640,-1,640,-4,640,640,640,-1,640,640,-1,640,-1,640,640,640,-1,640,-2,640,-2,640,-2,640,-2,640,-2,640,-1,640,640,640,640,640,640,640,640,640,640,640,640,-1,640,-2,640,640,640,640,640,-1,640,-4,640,640,-2,640,640,-1,640,-5,640,640,640,640,640,640,640,640,640,640,640,640,640,640,640,640,640,640,640,640,640,640,640,640,640,640,640,640,640,640,640,640,640,640,640,640],
sm457=[0,641,641,641,-1,0,-1,-1,-2,0,-6,641,641,641,641,641,641,-1,641,641,-16,641,641,641,-1,641,-1,641,-4,641,641,641,-1,641,641,-1,641,-1,641,641,641,-1,641,-2,641,-2,641,-2,641,-2,641,-2,641,-1,641,641,641,641,641,641,641,641,641,641,641,641,-1,641,-2,641,641,641,641,-2,641,-4,641,641,-2,641,641,-1,641,-5,641,641,641,641,641,641,641,641,641,641,641,641,641,641,641,641,641,641,641,641,641,641,641,641,641,641,641,641,641,641,641,641,641,641,641,641],
sm458=[0,-4,0,-1,-1,-2,0,-106,642],
sm459=[0,-4,0,-1,-1,-2,0,-106,643],
sm460=[0,-4,0,-1,-1,-2,0,-13,644,-44,644],
sm461=[0,-4,0,-1,-1,-2,0,-11,645,-1,645,-38,645,-5,645,-47,645],
sm462=[0,-4,0,-1,-1,-2,0,-11,646,-1,646,-19,646,-3,646,-14,646,-24,646,-28,646],
sm463=[0,-1,1,2,-1,0,-1,-1,-2,0,-51,289,-12,11,-37,350,-3,647,-35,42,43,-3,47],
sm464=[0,-4,0,-1,-1,-2,0,-106,648],
sm465=[0,-4,0,-1,-1,-2,0,-11,649,-1,649,-38,649,-53,649],
sm466=[0,-4,0,-1,-1,-2,0,-52,650],
sm467=[0,-4,0,-1,-1,-2,0,-11,651,-1,651,-19,651,-3,651,-14,651,-24,651,-28,651],
sm468=[0,-4,0,-1,-1,-2,0,-13,652,-38,652],
sm469=[0,-2,2,-1,0,-1,-1,-2,0,-13,197,223,-36,224,653,-11,11,-37,353,-44,47],
sm470=[0,-4,0,-1,-1,-2,0,-11,654,-40,654],
sm471=[0,-4,0,-1,-1,-2,0,-11,655,-1,655,-38,655,-53,655],
sm472=[0,-1,1,2,-1,0,-1,-1,-2,0,-8,80,-1,5,-3,153,-27,7,8,-7,9,-6,656,-5,11,-11,18,-14,154,-2,155,-4,31,32,-2,33,34,-29,35,-1,36,37,38,39,40,41,42,43,44,45,46,47],
sm473=[0,-4,0,-1,-1,-2,0,-58,657],
sm474=[0,-1,1,2,-1,0,-1,-1,-2,0,-8,80,-1,5,658,-2,153,-27,7,8,-7,9,-12,11,-11,18,-14,154,-2,155,-4,31,32,-2,33,34,-29,35,-1,36,37,38,39,40,41,42,43,44,45,46,47],
sm475=[0,-4,0,-1,-1,-2,0,-58,659],
sm476=[0,-1,1,2,-1,0,-1,-1,-2,0,-8,80,-1,5,660,-2,153,-27,7,8,-7,9,-12,11,-11,18,-14,154,-2,155,-4,31,32,-2,33,34,-29,35,-1,36,37,38,39,40,41,42,43,44,45,46,47],
sm477=[0,-4,0,-1,-1,-2,0,-13,344,-44,661],
sm478=[0,-4,0,-1,-1,-2,0,-37,662,-39,662],
sm479=[0,-4,0,-1,-1,-2,0,-13,347,-19,348,-3,663,-20,347,-18,663],
sm480=[0,-4,0,-1,-1,-2,0,-33,348,-3,663,-39,663],
sm481=[0,-4,0,-1,-1,-2,0,-37,664,-39,664],
sm482=[0,-4,0,-1,-1,-2,0,-77,665],
sm483=[0,-4,0,-1,-1,-2,0,-77,539],
sm484=[0,-4,0,-1,-1,-2,0,-14,666],
sm485=[0,667,667,667,-1,0,-1,-1,-2,0,-5,667,667,-1,667,-1,667,-3,667,-27,667,667,-7,667,-6,667,-5,667,-2,667,667,-1,667,667,667,667,667,667,667,-1,667,667,667,667,667,667,667,667,-2,667,667,667,667,-2,667,-4,667,667,-2,667,667,-1,667,-27,667,-1,667,667,667,667,667,667,667,667,667,667,667,667],
sm486=[0,668,668,668,-1,0,-1,-1,-2,0,-5,668,668,-1,668,-1,668,-3,668,-27,668,668,-7,668,-6,668,-5,668,-2,668,668,-1,668,668,668,668,668,668,668,-1,668,668,668,668,668,668,668,668,-2,668,668,668,668,-2,668,-4,668,668,-2,668,668,-1,668,-27,668,-1,668,668,668,668,668,668,668,668,668,668,668,668],
sm487=[0,-4,0,-1,-1,-2,0,-106,669],
sm488=[0,670,670,670,-1,0,-1,-1,-2,0,-5,670,670,670,670,670,670,670,-1,670,670,-16,670,670,670,-1,670,-1,670,-4,670,670,670,-1,670,670,-1,670,-1,670,670,670,-1,670,-2,670,-2,670,-2,670,-2,670,670,-1,670,-1,670,670,670,670,670,670,670,670,670,670,670,670,670,670,-2,670,670,670,670,-2,670,-4,670,670,-2,670,670,-1,670,-5,670,670,670,670,670,670,670,670,670,670,670,670,670,670,670,670,670,670,670,670,670,670,670,670,670,670,670,670,670,670,670,670,670,670,670,670],
sm489=[0,671,671,671,-1,0,-1,-1,-2,0,-5,671,671,671,671,671,671,671,-1,671,671,-16,671,671,671,-1,671,-1,671,-4,671,671,671,-1,671,671,-1,671,-1,671,671,671,-1,671,-2,671,-2,671,-2,671,-2,671,671,-1,671,-1,671,671,671,671,671,671,671,671,671,671,671,671,671,671,-2,671,671,671,671,-2,671,-4,671,671,-2,671,671,-1,671,-5,671,671,671,671,671,671,671,671,671,671,671,671,671,671,671,671,671,671,671,671,671,671,671,671,671,671,671,671,671,671,671,671,671,671,671,671],
sm490=[0,-1,672,672,-1,0,-1,-1,-2,0,-51,672,-6,672,-5,672,-31,672,672,672,-7,672,-35,672,672,-3,672],
sm491=[0,-1,673,673,-1,0,-1,-1,-2,0,-51,673,-6,673,-5,673,-31,673,673,673,-7,673,-35,673,673,-3,673],
sm492=[0,-4,0,-1,-1,-2,0,-11,674],
sm493=[0,-4,0,-1,-1,-2,0,-14,675],
sm494=[0,-4,0,-1,-1,-2,0,-14,676],
sm495=[0,-1,1,2,-1,0,-1,-1,-2,0,-8,80,-1,5,-3,6,-27,7,8,-7,9,-6,10,-5,11,-5,13,-1,14,15,16,17,18,-1,19,20,21,22,23,24,-1,25,-2,26,27,28,29,-2,30,-4,31,32,-2,33,34,-1,677,-27,35,-1,36,37,38,39,40,41,42,43,44,45,46,47],
sm496=[0,-2,2,-1,0,-1,-1,-2,0,-11,678,-2,223,-36,224,-12,11,-37,353,-44,47],
sm497=[0,-4,0,-1,-1,-2,0,-13,679,-44,679],
sm498=[0,-4,0,-4,0,-5,381,-2,680],
sm499=[0,-4,0,-4,0,-8,680],
sm500=[0,-4,0,-4,0,-8,681],
sm501=[0,-4,0,-4,0,-7,682],
sm502=[0,-2,683,-1,0,-1,-1,-2,0,-7,683,-1,683,-132,683,683],
sm503=[0,-2,684,-1,0,-4,0,-7,684,-1,684,-132,684,684],
sm504=[0,-2,685,-1,686,687,688,689,690,0,-3,691,-6,400],
sm505=[0,-2,684,-1,0,-1,-1,-2,0,-7,684,-1,684,-132,684,684],
sm506=[0,-2,685,-1,686,687,688,689,690,0,-3,691],
sm507=[0,-2,692,-1,0,-1,-1,-2,0,-7,692,-1,692,-23,692,-108,692,692],
sm508=[0,-4,0,-1,-1,-2,0,-5,693],
sm509=[0,694,694,694,-1,694,694,694,694,694,0,-5,694,694,694,694,694,694,694,-1,694,694,-16,694,694,694,-1,694,-1,694,-4,694,694,694,-1,694,694,-1,694,-1,694,694,694,-1,694,-2,694,-2,694,-2,694,-2,694,-2,694,-1,694,694,694,694,694,694,694,694,694,694,694,694,-1,694,-2,694,694,694,694,-2,694,-4,694,694,-2,694,694,-1,694,-5,694,694,694,694,694,694,694,694,694,694,694,694,694,694,694,694,694,694,694,694,694,694,694,694,694,694,694,694,694,694,694,694,694,694,694,694],
sm510=[0,-4,0,-1,-1,-2,0,-7,695],
sm511=[0,-1,696,696,-1,696,696,696,696,696,0,-5,696,-2,696,-1,696],
sm512=[0,-2,54,-1,0,-4,0,-7,697,-134,248,249],
sm513=[0,-2,54,-1,0,-4,0,-7,698,-134,248,249],
sm514=[0,-2,54,-1,0,-4,0,-7,699,-134,248,249],
sm515=[0,-1,700,700,-1,700,700,700,700,700,0,-5,700,-2,700,-1,700],
sm516=[0,-1,1,2,-1,0,-4,0,-8,80,-1,5,701,-2,153,-27,7,8,-7,9,-12,11,-11,18,-14,154,-2,155,-4,31,32,-2,33,34,-29,35,-1,36,37,38,39,40,41,42,43,44,45,46,47],
sm517=[0,-4,0,-1,-1,-2,0,-7,702],
sm518=[0,-4,0,-1,-1,-2,0,-21,703],
sm519=[0,-4,0,-1,-1,-2,0,-13,704,-92,704],
sm520=[0,-4,0,-1,-1,-2,0,-13,705,-92,705],
sm521=[0,-4,0,-1,-1,-2,0,-21,706,-36,706],
sm522=[0,-4,0,-1,-1,-2,0,-13,707,-92,707],
sm523=[0,-4,0,-1,-1,-2,0,-13,708,-92,708],
sm524=[0,709,709,709,-1,0,-1,-1,-2,0,-6,709,-1,709,-1,709,709,-1,709,709,-27,709,709,-7,709,709,-5,709,-2,709,-2,709,-2,709,-2,709,-1,709,709,709,709,709,-1,709,709,709,709,709,709,-1,709,-2,709,709,709,709,-2,709,-4,709,709,-2,709,709,-1,709,-27,709,-1,709,709,709,709,709,709,709,709,709,709,709,709],
sm525=[0,710,710,710,-1,0,-1,-1,-2,0,-6,710,710,710,710,710,710,-1,710,710,-16,710,710,710,-1,710,-1,710,-4,710,710,710,-1,710,710,-1,710,-1,710,710,710,-1,710,-2,710,-2,710,-2,710,-2,710,-2,710,-1,710,710,710,710,710,710,710,710,710,710,710,710,-1,710,-2,710,710,710,710,-2,710,-4,710,710,-2,710,710,-1,710,-5,710,710,710,710,710,710,710,710,710,710,710,710,710,710,710,710,710,710,710,710,710,710,710,710,710,710,710,710,710,710,710,710,710,710,710,710],
sm526=[0,-4,0,-1,-1,-2,0,-13,711,-92,711],
sm527=[0,-4,0,-1,-1,-2,0,-13,712,-92,712],
sm528=[0,-4,0,-1,-1,-2,0,-11,713],
sm529=[0,-4,0,-1,-1,-2,0,-14,714],
sm530=[0,-4,0,-1,-1,-2,0,-11,715],
sm531=[0,-4,0,-1,-1,-2,0,-11,716],
sm532=[0,-4,0,-1,-1,-2,0,-10,717,-50,717],
sm533=[0,-4,0,-1,-1,-2,0,-11,718],
sm534=[0,-4,0,-1,-1,-2,0,-14,719],
sm535=[0,-4,0,-1,-1,-2,0,-14,720],
sm536=[0,-1,1,2,-1,0,-1,-1,-2,0,-8,80,-1,5,-3,6,-27,7,8,-7,9,-6,10,-5,11,-5,13,-1,14,15,16,17,18,-1,19,20,21,22,23,24,-1,25,-2,26,27,28,29,-2,30,-4,31,32,-2,33,34,-1,721,-27,35,-1,36,37,38,39,40,41,42,43,44,45,46,47],
sm537=[0,722,722,722,-1,0,-1,-1,-2,0,-6,722,722,722,722,722,722,-1,722,722,-16,722,722,722,-1,722,-1,722,-4,722,722,722,-1,722,722,-1,722,-1,722,722,722,-1,722,-2,722,-2,722,-2,722,-2,722,-2,722,-1,722,722,722,722,722,722,722,722,722,722,722,722,-1,722,-2,722,722,722,722,-2,722,-4,722,722,-2,722,722,-1,722,-5,722,722,722,722,722,722,722,722,722,722,722,722,722,722,722,722,722,722,722,722,722,722,722,722,722,722,722,722,722,722,722,722,722,722,722,722],
sm538=[0,-4,0,-1,-1,-2,0,-11,723,-1,723],
sm539=[0,-4,0,-1,-1,-2,0,-13,724,-38,724],
sm540=[0,-4,0,-1,-1,-2,0,-106,725],
sm541=[0,726,726,726,-1,0,-1,-1,-2,0,-6,726,726,726,726,726,726,-1,726,726,-16,726,726,726,-1,726,-1,726,-4,726,726,726,-1,726,726,-1,726,-1,726,726,726,-1,726,-2,726,-2,726,-2,726,-2,726,-2,726,-1,726,726,726,726,726,726,726,726,726,726,726,726,-1,726,-2,726,726,726,726,-2,726,-4,726,726,-2,726,726,-1,726,-5,726,726,726,726,726,726,726,726,726,726,726,726,726,726,726,726,726,726,726,726,726,726,726,726,726,726,726,726,726,726,726,726,726,726,726,726],
sm542=[0,-1,727,727,-1,0,-1,-1,-2,0,-8,727,-1,727,-3,727,-27,727,727,-7,727,-12,727,-11,727,-14,727,-2,727,-4,727,727,-2,727,727,-29,727,-1,727,727,727,727,727,727,727,727,727,727,727,727],
sm543=[0,-4,0,-1,-1,-2,0,-11,728],
sm544=[0,-4,0,-1,-1,-2,0,-11,729],
sm545=[0,730,730,730,-1,0,-1,-1,-2,0,-6,730,-1,730,-1,730,730,-1,730,730,-27,730,730,-7,730,730,-5,730,-2,730,-2,730,-2,730,-2,730,-1,730,730,730,730,730,-1,730,730,730,730,730,730,-1,730,-2,730,730,730,730,-2,730,-4,730,730,-2,730,730,-1,730,-27,730,-1,730,730,730,730,730,730,730,730,730,730,730,730],
sm546=[0,-4,0,-1,-1,-2,0,-106,731],
sm547=[0,-4,0,-1,-1,-2,0,-11,732,-1,732,-19,732,-3,732,-14,732,-24,732,-28,732],
sm548=[0,-4,0,-1,-1,-2,0,-13,733,-92,733],
sm549=[0,-4,0,-1,-1,-2,0,-13,734,-92,734],
sm550=[0,-4,0,-1,-1,-2,0,-11,735,-1,735,-19,735,-3,735,-14,735,-24,735,-28,735],
sm551=[0,-2,2,-1,0,-1,-1,-2,0,-13,324,223,-36,224,736,-11,11,-37,353,-44,47],
sm552=[0,-4,0,-1,-1,-2,0,-52,737],
sm553=[0,-4,0,-1,-1,-2,0,-13,738,-38,738],
sm554=[0,739,739,739,-1,0,-1,-1,-2,0,-5,739,739,-1,739,-1,739,-3,739,-27,739,739,-7,739,-6,739,-5,739,-2,739,739,-1,739,740,739,739,739,739,739,-1,739,739,739,739,739,739,739,739,-2,739,739,739,739,-2,739,-4,739,739,-2,739,739,-1,739,-27,739,-1,739,739,739,739,739,739,739,739,739,739,739,739],
sm555=[0,-4,0,-1,-1,-2,0,-11,741],
sm556=[0,742,742,742,-1,0,-1,-1,-2,0,-5,742,742,-1,742,-1,742,-3,742,-27,742,742,-7,742,-6,742,-5,742,-2,742,742,-1,742,742,742,742,742,742,742,-1,742,742,742,742,742,742,742,742,-2,742,742,742,742,-2,742,-4,742,742,-2,742,742,-1,742,-27,742,-1,742,742,742,742,742,742,742,742,742,742,742,742],
sm557=[0,-4,0,-1,-1,-2,0,-58,743],
sm558=[0,-1,1,2,-1,0,-1,-1,-2,0,-8,80,-1,5,744,-2,153,-27,7,8,-7,9,-12,11,-11,18,-14,154,-2,155,-4,31,32,-2,33,34,-29,35,-1,36,37,38,39,40,41,42,43,44,45,46,47],
sm559=[0,-1,1,2,-1,0,-1,-1,-2,0,-8,80,-1,5,745,-2,153,-27,7,8,-7,9,-12,11,-11,18,-14,154,-2,155,-4,31,32,-2,33,34,-29,35,-1,36,37,38,39,40,41,42,43,44,45,46,47],
sm560=[0,-4,0,-1,-1,-2,0,-11,746],
sm561=[0,-4,0,-1,-1,-2,0,-11,747],
sm562=[0,-4,0,-1,-1,-2,0,-11,748],
sm563=[0,-1,1,2,-1,0,-1,-1,-2,0,-8,80,-1,5,749,-2,153,-27,7,8,-7,9,-12,11,-11,18,-14,154,-2,155,-4,31,32,-2,33,34,-29,35,-1,36,37,38,39,40,41,42,43,44,45,46,47],
sm564=[0,-4,0,-1,-1,-2,0,-11,750],
sm565=[0,-4,0,-1,-1,-2,0,-77,663],
sm566=[0,751,751,751,-1,0,-1,-1,-2,0,-5,751,751,-1,751,-1,751,-3,751,-27,751,751,-7,751,-6,751,-5,751,-2,751,751,-1,751,751,751,751,751,751,751,-1,751,751,751,751,751,751,751,751,-2,751,751,751,751,-2,751,-4,751,751,-2,751,751,-1,751,-27,751,-1,751,751,751,751,751,751,751,751,751,751,751,751],
sm567=[0,-4,0,-1,-1,-2,0,-68,752,-15,753,-21,754],
sm568=[0,755,755,755,-1,0,-1,-1,-2,0,-5,755,755,-1,755,-1,755,-3,755,-27,755,755,-7,755,-6,755,-5,755,-2,755,755,-1,755,755,755,755,755,755,755,-1,755,755,755,755,755,755,755,755,-2,755,755,755,755,-2,755,-4,755,755,-2,755,755,-1,755,-27,755,-1,755,755,755,755,755,755,755,755,755,755,755,755],
sm569=[0,-4,0,-1,-1,-2,0,-11,756],
sm570=[0,-4,0,-1,-1,-2,0,-11,757],
sm571=[0,758,758,758,-1,0,-1,-1,-2,0,-5,758,758,758,758,758,758,758,-1,758,758,-16,758,758,758,-1,758,-1,758,-4,758,758,758,-1,758,758,-1,758,-1,758,758,758,-1,758,-2,758,-2,758,-2,758,-2,758,758,-1,758,-1,758,758,758,758,758,758,758,758,758,758,758,758,758,758,-2,758,758,758,758,-2,758,-4,758,758,-2,758,758,-1,758,-5,758,758,758,758,758,758,758,758,758,758,758,758,758,758,758,758,758,758,758,758,758,758,758,758,758,758,758,758,758,758,758,758,758,758,758,758],
sm572=[0,-4,0,-1,-1,-2,0,-14,759],
sm573=[0,-1,1,2,-1,0,-1,-1,-2,0,-8,80,-1,5,-3,6,-27,7,8,-7,9,-6,10,-5,11,-5,13,-1,14,15,16,17,18,-1,19,20,21,22,23,24,-1,25,-2,26,27,28,29,-2,30,-4,31,32,-2,33,34,-1,760,-27,35,-1,36,37,38,39,40,41,42,43,44,45,46,47],
sm574=[0,-1,1,2,-1,0,-1,-1,-2,0,-8,80,-1,5,-3,6,-27,7,8,-7,9,-6,10,-5,11,-5,13,-1,14,15,16,17,18,-1,19,20,21,22,23,24,-1,25,-2,26,27,28,29,-2,30,-4,31,32,-2,33,34,-1,761,-27,35,-1,36,37,38,39,40,41,42,43,44,45,46,47],
sm575=[0,-4,0,-1,-1,-2,0,-106,762],
sm576=[0,763,763,763,-1,0,-1,-1,-2,0,-5,763,763,-1,763,-1,763,-3,763,-27,763,763,-7,763,-6,763,-5,763,-2,763,763,-1,763,763,763,763,763,763,763,-1,763,763,763,763,763,763,763,763,-2,763,763,763,763,-2,763,-4,763,763,-2,763,763,-1,763,-27,763,-1,763,763,763,763,763,763,763,763,763,763,763,763],
sm577=[0,-4,0,-1,-1,-2,0,-106,764],
sm578=[0,-4,0,-1,-1,-2,0,-11,765],
sm579=[0,-4,0,-1,-1,-2,0,-11,766,-1,766],
sm580=[0,-4,0,-4,0,-8,767],
sm581=[0,-4,0,-4,0,-8,768],
sm582=[0,-4,0,-4,0,-142,769],
sm583=[0,-4,0,-1,-1,-2,0,-142,770],
sm584=[0,-2,685,-1,686,687,688,689,690,0,-3,691,-138,771,771],
sm585=[0,-2,772,-1,772,772,772,772,772,0,-3,772,-138,772,772],
sm586=[0,-2,773,-1,773,773,773,773,773,0,-3,773,-138,773,773],
sm587=[0,-2,774,-1,774,774,774,774,774,0,-3,774,-138,774,774],
sm588=[0,-4,0,-1,-1,-2,0,-143,775],
sm589=[0,-4,0,-1,-1,-2,0,-7,776],
sm590=[0,-4,0,-1,-1,-2,0,-7,777],
sm591=[0,778,778,778,-1,778,778,778,778,778,0,-5,778,778,778,778,778,778,778,-1,778,778,-16,778,778,778,-1,778,-1,778,-4,778,778,778,-1,778,778,-1,778,-1,778,778,778,-1,778,-2,778,-2,778,-2,778,-2,778,-2,778,-1,778,778,778,778,778,778,778,778,778,778,778,778,-1,778,-2,778,778,778,778,-2,778,-4,778,778,-2,778,778,-1,778,-5,778,778,778,778,778,778,778,778,778,778,778,778,778,778,778,778,778,778,778,778,778,778,778,778,778,778,778,778,778,778,778,778,778,778,778,778],
sm592=[0,-2,54,-1,0,-4,0,-7,779,-134,248,249],
sm593=[0,-2,780,-1,0,-4,0,-5,781,-8,782,-3,783,-27,784,785,786,787,-1,788,-9,789],
sm594=[0,-2,54,-1,0,-4,0,-7,790,-134,248,249],
sm595=[0,-1,1,2,-1,0,-4,0,-5,791,-2,80,-1,5,-3,6,-27,7,8,-7,9,-6,10,-5,11,-5,13,-1,14,15,16,17,18,-1,19,20,21,22,23,24,-1,25,-2,26,27,28,29,-2,30,-4,31,32,-2,33,34,-29,35,-1,36,37,38,39,40,41,42,43,44,45,46,47],
sm596=[0,-2,54,-1,0,-4,0,-7,792,-134,248,249],
sm597=[0,-1,1,2,-1,0,-4,0,-5,793,-2,80,-1,5,-3,6,-27,7,8,-7,9,-6,10,-5,11,-5,13,-1,14,15,16,17,18,-1,19,20,21,22,23,24,-1,25,-2,26,27,28,29,-2,30,-4,31,32,-2,33,34,-29,35,-1,36,37,38,39,40,41,42,43,44,45,46,47],
sm598=[0,-4,0,-4,0,-11,794],
sm599=[0,-4,-1,-4,0,-10,795,796],
sm600=[0,-4,0,-1,-1,-2,0,-7,797],
sm601=[0,798,798,798,-1,798,798,798,798,798,0,-5,798,798,798,798,798,798,798,-1,798,798,-16,798,798,798,-1,798,-1,798,-4,798,798,798,-1,798,798,-1,798,-1,798,798,798,-1,798,-2,798,-2,798,-2,798,-2,798,-2,798,-1,798,798,798,798,798,798,798,798,798,798,798,798,-1,798,-2,798,798,798,798,-2,798,-4,798,798,-2,798,798,-1,798,-5,798,798,798,798,798,798,798,798,798,798,798,798,798,798,798,798,798,798,798,798,798,798,798,798,798,798,798,798,798,798,798,798,798,798,798,798],
sm602=[0,-4,0,-1,-1,-2,0,-14,799],
sm603=[0,-1,1,2,-1,0,-1,-1,-2,0,-8,80,-1,5,-3,6,-27,7,8,-7,9,-6,10,-5,11,-5,13,-1,14,15,16,17,18,-1,19,20,21,22,23,24,-1,25,-2,26,27,28,29,-2,30,-4,31,32,-2,33,34,-1,800,-27,35,-1,36,37,38,39,40,41,42,43,44,45,46,47],
sm604=[0,-4,0,-1,-1,-2,0,-14,801],
sm605=[0,-4,0,-1,-1,-2,0,-11,802],
sm606=[0,-4,0,-1,-1,-2,0,-11,803],
sm607=[0,-4,0,-1,-1,-2,0,-14,804],
sm608=[0,-1,1,2,-1,0,-1,-1,-2,0,-8,80,-1,5,-3,6,-27,7,8,-7,9,-6,10,-5,11,-5,13,-1,14,15,16,17,18,-1,19,20,21,22,23,24,-1,25,-2,26,27,28,29,-2,30,-4,31,32,-2,33,34,-1,805,-27,35,-1,36,37,38,39,40,41,42,43,44,45,46,47],
sm609=[0,-1,1,2,-1,0,-1,-1,-2,0,-8,80,-1,5,-3,6,-27,7,8,-7,9,-6,10,-5,11,-5,13,-1,14,15,16,17,18,-1,19,20,21,22,23,24,-1,25,-2,26,27,28,29,-2,30,-4,31,32,-2,33,34,-1,806,-27,35,-1,36,37,38,39,40,41,42,43,44,45,46,47],
sm610=[0,-4,0,-1,-1,-2,0,-106,807],
sm611=[0,808,808,808,-1,0,-1,-1,-2,0,-6,808,808,808,808,808,808,-1,808,808,-16,808,808,808,-1,808,-1,808,-4,808,808,808,-1,808,808,-1,808,-1,808,808,808,-1,808,-2,808,-2,808,-2,808,-2,808,-2,808,-1,808,808,808,808,808,808,808,808,808,808,808,808,-1,808,-2,808,808,808,808,-2,808,-4,808,808,-2,808,808,-1,808,-5,808,808,808,808,808,808,808,808,808,808,808,808,808,808,808,808,808,808,808,808,808,808,808,808,808,808,808,808,808,808,808,808,808,808,808,808],
sm612=[0,809,809,809,-1,0,-1,-1,-2,0,-6,809,809,809,809,809,809,-1,809,809,-16,809,809,809,-1,809,-1,809,-4,809,809,809,-1,809,809,-1,809,-1,809,809,809,-1,809,-2,809,-2,809,-2,809,-2,809,-2,809,-1,809,809,809,809,809,809,809,809,809,809,809,809,-1,809,-2,809,809,809,809,809,-1,809,-4,809,809,-2,809,809,-1,809,-5,809,809,809,809,809,809,809,809,809,809,809,809,809,809,809,809,809,809,809,809,809,809,809,809,809,809,809,809,809,809,809,809,809,809,809,809],
sm613=[0,-4,0,-1,-1,-2,0,-11,810,-1,810,-19,810,-3,810,-14,810,-24,810,-28,810],
sm614=[0,-4,0,-1,-1,-2,0,-11,811,-1,811,-19,811,-3,811,-14,811,-24,811,-28,811],
sm615=[0,-4,0,-1,-1,-2,0,-52,812],
sm616=[0,-4,0,-1,-1,-2,0,-58,813],
sm617=[0,-1,1,2,-1,0,-1,-1,-2,0,-8,80,-1,5,814,-2,153,-27,7,8,-7,9,-12,11,-11,18,-14,154,-2,155,-4,31,32,-2,33,34,-29,35,-1,36,37,38,39,40,41,42,43,44,45,46,47],
sm618=[0,-4,0,-1,-1,-2,0,-11,815],
sm619=[0,-4,0,-1,-1,-2,0,-11,816],
sm620=[0,817,817,817,-1,0,-1,-1,-2,0,-5,817,817,-1,817,-1,817,-3,817,-27,817,817,-7,817,-6,817,-5,817,-2,817,817,-1,817,817,817,817,817,817,817,-1,817,817,817,817,817,817,817,817,-2,817,817,817,817,-2,817,-4,817,817,-2,817,817,-1,817,-27,817,-1,817,817,817,817,817,817,817,817,817,817,817,817],
sm621=[0,-4,0,-1,-1,-2,0,-11,818],
sm622=[0,819,819,819,-1,0,-1,-1,-2,0,-5,819,819,-1,819,-1,819,-3,819,-27,819,819,-7,819,-6,819,-5,819,-2,819,819,-1,819,819,819,819,819,819,819,-1,819,819,819,819,819,819,819,819,-2,819,819,819,819,-2,819,-4,819,819,-2,819,819,-1,819,-27,819,-1,819,819,819,819,819,819,819,819,819,819,819,819],
sm623=[0,-4,0,-1,-1,-2,0,-11,820],
sm624=[0,821,821,821,-1,0,-1,-1,-2,0,-5,821,821,-1,821,-1,821,-3,821,-27,821,821,-7,821,-6,821,-5,821,-2,821,821,-1,821,821,821,821,821,821,821,-1,821,821,821,821,821,821,821,821,-2,821,821,821,821,-2,821,-4,821,821,-2,821,821,-1,821,-27,821,-1,821,821,821,821,821,821,821,821,821,821,821,821],
sm625=[0,-4,0,-1,-1,-2,0,-68,752,-15,753,-21,822],
sm626=[0,-4,0,-1,-1,-2,0,-84,753,-21,823],
sm627=[0,-4,0,-1,-1,-2,0,-68,824,-15,824,-21,824],
sm628=[0,-4,0,-1,-1,-2,0,-61,825],
sm629=[0,-1,1,2,-1,0,-1,-1,-2,0,-8,80,-1,5,-3,6,-27,7,8,-7,9,-6,10,-5,11,-5,13,-1,14,15,16,17,18,-1,19,20,21,22,23,24,-1,25,-2,26,27,28,29,-2,30,-4,31,32,-2,33,34,-1,826,-27,35,-1,36,37,38,39,40,41,42,43,44,45,46,47],
sm630=[0,-4,0,-1,-1,-2,0,-106,827],
sm631=[0,828,828,828,-1,0,-1,-1,-2,0,-5,828,828,-1,828,-1,828,-3,828,-27,828,828,-7,828,-6,828,-5,828,-2,828,828,-1,828,828,828,828,828,828,828,-1,828,828,828,828,828,828,828,828,-2,828,828,828,828,-2,828,-4,828,828,-2,828,828,-1,828,-27,828,-1,828,828,828,828,828,828,828,828,828,828,828,828],
sm632=[0,-4,0,-1,-1,-2,0,-106,829],
sm633=[0,830,830,830,-1,0,-1,-1,-2,0,-5,830,830,-1,830,-1,830,-3,830,-27,830,830,-7,830,-6,830,-5,830,-2,830,830,-1,830,830,830,830,830,830,830,-1,830,830,830,830,830,830,830,830,-2,830,830,830,830,-2,830,-4,830,830,-2,830,830,-1,830,-27,830,-1,830,830,830,830,830,830,830,830,830,830,830,830],
sm634=[0,831,831,831,-1,0,-1,-1,-2,0,-5,831,831,-1,831,-1,831,-3,831,-27,831,831,-7,831,-6,831,-5,831,-2,831,831,-1,831,831,831,831,831,831,831,-1,831,831,831,831,831,831,831,831,-2,831,831,831,831,-2,831,-4,831,831,-2,831,831,-1,831,-27,831,-1,831,831,831,831,831,831,831,831,831,831,831,831],
sm635=[0,-2,832,-1,0,-4,0,-7,832,-1,832,-132,832,832],
sm636=[0,-2,833,-1,0,-1,-1,-2,0,-7,833,-1,833,-132,833,833],
sm637=[0,-2,834,-1,834,834,834,834,834,0,-3,834,-138,834,834],
sm638=[0,-4,0,-1,-1,-2,0,-7,835],
sm639=[0,836,836,836,-1,836,836,836,836,836,0,-5,836,836,836,836,836,836,836,-1,836,836,-16,836,836,836,-1,836,-1,836,-4,836,836,836,-1,836,836,-1,836,-1,836,836,836,-1,836,-2,836,-2,836,-2,836,-2,836,-2,836,-1,836,836,836,836,836,836,836,836,836,836,836,836,-1,836,-2,836,836,836,836,-2,836,-4,836,836,-2,836,836,-1,836,-5,836,836,836,836,836,836,836,836,836,836,836,836,836,836,836,836,836,836,836,836,836,836,836,836,836,836,836,836,836,836,836,836,836,836,836,836],
sm640=[0,837,837,837,-1,837,837,837,837,837,0,-5,837,837,837,837,837,837,837,-1,837,837,-16,837,837,837,-1,837,-1,837,-4,837,837,837,-1,837,837,-1,837,-1,837,837,837,-1,837,-2,837,-2,837,-2,837,-2,837,-2,837,-1,837,837,837,837,837,837,837,837,837,837,837,837,-1,837,-2,837,837,837,837,-2,837,-4,837,837,-2,837,837,-1,837,-5,837,837,837,837,837,837,837,837,837,837,837,837,837,837,837,837,837,837,837,837,837,837,837,837,837,837,837,837,837,837,837,837,837,837,837,837],
sm641=[0,-2,780,-1,0,-4,0,-5,838,-8,782,-3,783,-27,784,785,786,787,-1,788,-9,789],
sm642=[0,-4,0,-4,0,-5,839],
sm643=[0,-4,0,-4,0,-166,840],
sm644=[0,-4,0,-1,-1,-2,0,-5,841],
sm645=[0,-2,780,-1,0,-1,-1,-2,0,-5,842,-8,782,-3,783,-27,784,785,786,787,-1,788,-9,789],
sm646=[0,-2,780,-1,0,-1,-1,-2,0,-5,843,-8,782,-3,783,-27,784,785,786,787,-1,788,-9,789],
sm647=[0,-2,844,-1,0,-1,-1,-2,0,-5,844,-8,844,-3,844,-27,844,844,844,844,-1,844,-9,844],
sm648=[0,-2,845,-1,0,-1,-1,-2,0,-5,845,-8,845,-3,845,-27,845,845,845,845,-1,845,-6,846,-2,845],
sm649=[0,-4,0,-1,-1,-2,0,-6,847,-10,848,-1,849,-7,850],
sm650=[0,-2,851,-1,0,-1,-1,-2,0,-5,851,-8,851,-3,851,-27,851,851,851,851,-1,851,-9,851],
sm651=[0,-2,852,-1,0,-1,-1,-2,0,-5,852,-8,852,-3,852,-27,852,852,852,852,-1,852,-9,852],
sm652=[0,-4,0,-1,-1,-2,0,-13,853,854],
sm653=[0,-2,780,-1,0,-1,-1,-2,0,-18,783],
sm654=[0,-4,0,-1,-1,-2,0,-13,855,855],
sm655=[0,-2,780,-1,0,-1,-1,-2,0,-7,856,-3,857,-1,857,857,-27,858,859,860,-1,784,785,786,787,-1,788,-9,789],
sm656=[0,-2,861,-1,0,-1,-1,-2,0,-7,861,-3,861,-1,861,861,-27,861,861,861,-1,861,861,786,787,-1,788,-9,789],
sm657=[0,-2,861,-1,0,-1,-1,-2,0,-7,861,-3,861,-1,861,861,-27,861,861,861,-1,861,861,861,861,-1,861,-9,862],
sm658=[0,-2,863,-1,0,-1,-1,-2,0,-7,863,-3,863,-1,863,863,-27,863,863,863,-1,863,863,863,863,-1,863,-9,863],
sm659=[0,-2,780,-1,0,-1,-1,-2,0,-46,864],
sm660=[0,-2,865,-1,0,-1,-1,-2,0,-7,865,-3,865,-1,865,865,-27,865,865,865,-1,865,866,865,865,-1,865,-9,865],
sm661=[0,-2,867,-1,0,-1,-1,-2,0,-7,867,-3,867,-1,867,867,-18,867,-8,867,867,867,-1,867,866,867,867,-1,867,867,867,867,867,-5,867],
sm662=[0,-4,0,-1,-1,-2,0,-47,868],
sm663=[0,-2,869,-1,0,-1,-1,-2,0,-46,869],
sm664=[0,-2,870,-1,871,-1,-1,-2,872,-3,873,-1,873,-1,873,873,-1,873,873,-1,873,873,-3,873,-4,873,-7,873,873,873,-8,873,873,873,-1,873,873,873,873,-1,873,873,873,873,873,873,873,873,-2,873,-2,874,-69,875],
sm665=[0,-2,876,-1,876,-1,-1,-2,876,-3,876,-1,876,-1,876,876,-1,876,876,-1,876,876,-3,876,-4,876,-7,876,876,876,-8,876,876,876,-1,876,876,876,876,-1,876,876,876,876,876,876,876,876,-2,876,-2,876,-69,876],
sm666=[0,-2,877,-1,0,-1,-1,-2,0,-7,877,-3,877,-1,877,877,-27,877,877,877,-1,877,877,877,877,-1,877,-9,877],
sm667=[0,-2,878,-1,0,-1,-1,-2,0,-7,878,-3,878,-1,878,878,-27,878,878,878,-1,878,878,878,878,-1,878,-9,878],
sm668=[0,-2,780,-1,0,-1,-1,-2,0],
sm669=[0,-2,780,-1,0,-1,-1,-2,0,-46,879,785],
sm670=[0,-2,780,-1,0,-1,-1,-2,0,-61,880],
sm671=[0,-2,881,-1,0,-1,-1,-2,0,-7,881,-3,881,-1,881,881,-27,881,881,881,-1,881,881,881,881,-1,881,-9,881],
sm672=[0,-2,882,-1,0,-1,-1,-2,0,-7,882,-3,882,-1,882,882,-27,882,882,882,-1,882,882,882,882,-1,882,-9,880],
sm673=[0,-4,0,-1,-1,-2,0,-58,883],
sm674=[0,-4,0,-1,-1,-2,0,-58,884],
sm675=[0,-4,0,-1,-1,-2,0,-58,885],
sm676=[0,-1,1,2,-1,0,-4,0,-5,886,-2,80,-1,5,-3,6,-27,7,8,-7,9,-6,10,-5,11,-5,13,-1,14,15,16,17,18,-1,19,20,21,22,23,24,-1,25,-2,26,27,28,29,-2,30,-4,31,32,-2,33,34,-29,35,-1,36,37,38,39,40,41,42,43,44,45,46,47],
sm677=[0,-4,0,-4,0,-5,887],
sm678=[0,-4,0,-4,0,-167,888],
sm679=[0,-4,0,-1,-1,-2,0,-5,889],
sm680=[0,-4,0,-1,-1,-2,0,-5,890],
sm681=[0,-1,1,2,-1,0,-4,0,-5,891,-2,80,-1,5,-3,6,-27,7,8,-7,9,-6,10,-5,11,-5,13,-1,14,15,16,17,18,-1,19,20,21,22,23,24,-1,25,-2,26,27,28,29,-2,30,-4,31,32,-2,33,34,-29,35,-1,36,37,38,39,40,41,42,43,44,45,46,47],
sm682=[0,-4,0,-4,0,-5,892],
sm683=[0,-4,0,-4,0,-168,893],
sm684=[0,-4,-1,-4,0,-10,894,895],
sm685=[0,-1,1,2,-1,0,-4,0,-8,80,-1,5,896,-2,153,-27,7,8,-7,9,-12,11,-11,18,-14,154,-2,155,-4,31,32,-2,33,34,-29,35,-1,36,37,38,39,40,41,42,43,44,45,46,47],
sm686=[0,-1,897,897,-1,897,897,897,897,897,0,-5,897,-1,897,897,897,897,-131,897,897],
sm687=[0,898,898,898,-1,898,898,898,898,898,0,-5,898,898,898,898,898,898,898,-1,898,898,-16,898,898,898,-1,898,-1,898,-4,898,898,898,-1,898,898,-1,898,-1,898,898,898,-1,898,-2,898,-2,898,-2,898,-2,898,-2,898,-1,898,898,898,898,898,898,898,898,898,898,898,898,-1,898,-2,898,898,898,898,-2,898,-4,898,898,-2,898,898,-1,898,-5,898,898,898,898,898,898,898,898,898,898,898,898,898,898,898,898,898,898,898,898,898,898,898,898,898,898,898,898,898,898,898,898,898,898,898,898],
sm688=[0,-1,1,2,-1,0,-1,-1,-2,0,-8,80,-1,5,-3,6,-27,7,8,-7,9,-6,10,-5,11,-5,13,-1,14,15,16,17,18,-1,19,20,21,22,23,24,-1,25,-2,26,27,28,29,-2,30,-4,31,32,-2,33,34,-1,899,-27,35,-1,36,37,38,39,40,41,42,43,44,45,46,47],
sm689=[0,-4,0,-1,-1,-2,0,-106,900],
sm690=[0,-1,901,901,-1,0,-1,-1,-2,0,-13,901,-37,901,-6,901,-5,901,-31,901,901,901,-7,901,-35,901,901,-3,901],
sm691=[0,-1,1,2,-1,0,-1,-1,-2,0,-8,80,-1,5,-3,6,-27,7,8,-7,9,-6,10,-5,11,-5,13,-1,14,15,16,17,18,-1,19,20,21,22,23,24,-1,25,-2,26,27,28,29,-2,30,-4,31,32,-2,33,34,-1,902,-27,35,-1,36,37,38,39,40,41,42,43,44,45,46,47],
sm692=[0,-4,0,-1,-1,-2,0,-14,903],
sm693=[0,-1,1,2,-1,0,-1,-1,-2,0,-8,80,-1,5,-3,6,-27,7,8,-7,9,-6,10,-5,11,-5,13,-1,14,15,16,17,18,-1,19,20,21,22,23,24,-1,25,-2,26,27,28,29,-2,30,-4,31,32,-2,33,34,-1,904,-27,35,-1,36,37,38,39,40,41,42,43,44,45,46,47],
sm694=[0,-4,0,-1,-1,-2,0,-106,905],
sm695=[0,906,906,906,-1,0,-1,-1,-2,0,-6,906,906,906,906,906,906,-1,906,906,-16,906,906,906,-1,906,-1,906,-4,906,906,906,-1,906,906,-1,906,-1,906,906,906,-1,906,-2,906,-2,906,-2,906,-2,906,-2,906,-1,906,906,906,906,906,906,906,906,906,906,906,906,-1,906,-2,906,906,906,906,-2,906,-4,906,906,-2,906,906,-1,906,-5,906,906,906,906,906,906,906,906,906,906,906,906,906,906,906,906,906,906,906,906,906,906,906,906,906,906,906,906,906,906,906,906,906,906,906,906],
sm696=[0,-4,0,-1,-1,-2,0,-106,907],
sm697=[0,908,908,908,-1,0,-1,-1,-2,0,-6,908,908,908,908,908,908,-1,908,908,-16,908,908,908,-1,908,-1,908,-4,908,908,908,-1,908,908,-1,908,-1,908,908,908,-1,908,-2,908,-2,908,-2,908,-2,908,-2,908,-1,908,908,908,908,908,908,908,908,908,908,908,908,-1,908,-2,908,908,908,908,-2,908,-4,908,908,-2,908,908,-1,908,-5,908,908,908,908,908,908,908,908,908,908,908,908,908,908,908,908,908,908,908,908,908,908,908,908,908,908,908,908,908,908,908,908,908,908,908,908],
sm698=[0,909,909,909,-1,0,-1,-1,-2,0,-6,909,909,909,909,909,909,-1,909,909,-16,909,909,909,-1,909,-1,909,-4,909,909,909,-1,909,909,-1,909,-1,909,909,909,-1,909,-2,909,-2,909,-2,909,-2,909,-2,909,-1,909,909,909,909,909,909,909,909,909,909,909,909,-1,909,-2,909,909,909,909,-2,909,-4,909,909,-2,909,909,-1,909,-5,909,909,909,909,909,909,909,909,909,909,909,909,909,909,909,909,909,909,909,909,909,909,909,909,909,909,909,909,909,909,909,909,909,909,909,909],
sm699=[0,-4,0,-1,-1,-2,0,-11,910,-1,910,-19,910,-3,910,-14,910,-24,910,-28,910],
sm700=[0,911,911,911,-1,0,-1,-1,-2,0,-5,911,911,-1,911,-1,911,-3,911,-27,911,911,-7,911,-6,911,-5,911,-2,911,911,-1,911,911,911,911,911,911,911,-1,911,911,911,911,911,911,911,911,-2,911,911,911,911,-2,911,-4,911,911,-2,911,911,-1,911,-27,911,-1,911,911,911,911,911,911,911,911,911,911,911,911],
sm701=[0,912,912,912,-1,0,-1,-1,-2,0,-5,912,912,-1,912,-1,912,-3,912,-27,912,912,-7,912,-6,912,-5,912,-2,912,912,-1,912,912,912,912,912,912,912,-1,912,912,912,912,912,912,912,912,-2,912,912,912,912,-2,912,-4,912,912,-2,912,912,-1,912,-27,912,-1,912,912,912,912,912,912,912,912,912,912,912,912],
sm702=[0,-4,0,-1,-1,-2,0,-11,913],
sm703=[0,914,914,914,-1,0,-1,-1,-2,0,-5,914,914,-1,914,-1,914,-3,914,-27,914,914,-7,914,-6,914,-5,914,-2,914,914,-1,914,914,914,914,914,914,914,-1,914,914,914,914,914,914,914,914,-2,914,914,914,914,-2,914,-4,914,914,-2,914,914,-1,914,-27,914,-1,914,914,914,914,914,914,914,914,914,914,914,914],
sm704=[0,915,915,915,-1,0,-1,-1,-2,0,-5,915,915,-1,915,-1,915,-3,915,-27,915,915,-7,915,-6,915,-5,915,-2,915,915,-1,915,915,915,915,915,915,915,-1,915,915,915,915,915,915,915,915,-2,915,915,915,915,-2,915,-4,915,915,-2,915,915,-1,915,-27,915,-1,915,915,915,915,915,915,915,915,915,915,915,915],
sm705=[0,916,916,916,-1,0,-1,-1,-2,0,-5,916,916,-1,916,-1,916,-3,916,-27,916,916,-7,916,-6,916,-5,916,-2,916,916,-1,916,916,916,916,916,916,916,-1,916,916,916,916,916,916,916,916,-2,916,916,916,916,-2,916,-4,916,916,-2,916,916,-1,916,-27,916,-1,916,916,916,916,916,916,916,916,916,916,916,916],
sm706=[0,917,917,917,-1,0,-1,-1,-2,0,-5,917,917,-1,917,-1,917,-3,917,-27,917,917,-7,917,-6,917,-5,917,-2,917,917,-1,917,917,917,917,917,917,917,-1,917,917,917,917,917,917,917,917,-2,917,917,917,917,-2,917,-4,917,917,-2,917,917,-1,917,-27,917,-1,917,917,917,917,917,917,917,917,917,917,917,917],
sm707=[0,918,918,918,-1,0,-1,-1,-2,0,-5,918,918,-1,918,-1,918,-3,918,-27,918,918,-7,918,-6,918,-5,918,-2,918,918,-1,918,918,918,918,918,918,918,-1,918,918,918,918,918,918,918,918,-2,918,918,918,918,-2,918,-4,918,918,-2,918,918,-1,918,-27,918,-1,918,918,918,918,918,918,918,918,918,918,918,918],
sm708=[0,919,919,919,-1,0,-1,-1,-2,0,-5,919,919,-1,919,-1,919,-3,919,-27,919,919,-7,919,-6,919,-5,919,-2,919,919,-1,919,919,919,919,919,919,919,-1,919,919,919,919,919,919,919,919,-2,919,919,919,919,-2,919,-4,919,919,-2,919,919,-1,919,-27,919,-1,919,919,919,919,919,919,919,919,919,919,919,919],
sm709=[0,920,920,920,-1,0,-1,-1,-2,0,-5,920,920,-1,920,-1,920,-3,920,-27,920,920,-7,920,-6,920,-5,920,-2,920,920,-1,920,920,920,920,920,920,920,-1,920,920,920,920,920,920,920,920,-2,920,920,920,920,-2,920,-4,920,920,-2,920,920,-1,920,-27,920,-1,920,920,920,920,920,920,920,920,920,920,920,920],
sm710=[0,-4,0,-1,-1,-2,0,-84,753,-21,921],
sm711=[0,922,922,922,-1,0,-1,-1,-2,0,-5,922,922,-1,922,-1,922,-3,922,-27,922,922,-7,922,-6,922,-5,922,-2,922,922,-1,922,922,922,922,922,922,922,-1,922,922,922,922,922,922,922,922,-2,922,922,922,922,-2,922,-4,922,922,-2,922,922,-1,922,-27,922,-1,922,922,922,922,922,922,922,922,922,922,922,922],
sm712=[0,-4,0,-1,-1,-2,0,-68,923,-15,923,-21,923],
sm713=[0,-4,0,-1,-1,-2,0,-84,753,-21,924],
sm714=[0,-4,0,-1,-1,-2,0,-61,925],
sm715=[0,-1,1,2,-1,0,-1,-1,-2,0,-8,80,-1,5,-3,6,-27,7,8,-7,9,-6,10,-5,11,-5,13,-1,14,15,16,17,18,-1,19,20,21,22,23,24,926,25,-2,26,27,28,29,-2,30,-4,31,32,-2,33,34,-1,926,-27,35,-1,36,37,38,39,40,41,42,43,44,45,46,47],
sm716=[0,927,927,927,-1,0,-1,-1,-2,0,-5,927,927,-1,927,-1,927,-3,927,-27,927,927,-7,927,-6,927,-5,927,-2,927,927,-1,927,927,927,927,927,927,927,-1,927,927,927,927,927,927,927,927,-1,927,927,927,927,927,-2,927,-4,927,927,-2,927,927,-1,927,-27,927,-1,927,927,927,927,927,927,927,927,927,927,927,927],
sm717=[0,-4,0,-1,-1,-2,0,-106,928],
sm718=[0,929,929,929,-1,0,-1,-1,-2,0,-5,929,929,-1,929,-1,929,-3,929,-27,929,929,-7,929,-6,929,-5,929,-2,929,929,-1,929,929,929,929,929,929,929,-1,929,929,929,929,929,929,929,929,-2,929,929,929,929,-2,929,-4,929,929,-2,929,929,-1,929,-27,929,-1,929,929,929,929,929,929,929,929,929,929,929,929],
sm719=[0,930,930,930,-1,0,-1,-1,-2,0,-5,930,930,-1,930,-1,930,-3,930,-27,930,930,-7,930,-6,930,-5,930,-2,930,930,-1,930,930,930,930,930,930,930,-1,930,930,930,930,930,930,930,930,-2,930,930,930,930,-2,930,-4,930,930,-2,930,930,-1,930,-27,930,-1,930,930,930,930,930,930,930,930,930,930,930,930],
sm720=[0,931,931,931,-1,0,-1,-1,-2,0,-5,931,931,-1,931,-1,931,-3,931,-27,931,931,-7,931,-6,931,-5,931,-2,931,931,-1,931,931,931,931,931,931,931,-1,931,931,931,931,931,931,931,931,-2,931,931,931,931,-2,931,-4,931,931,-2,931,931,-1,931,-27,931,-1,931,931,931,931,931,931,931,931,931,931,931,931],
sm721=[0,932,932,932,-1,932,932,932,932,932,0,-5,932,932,932,932,932,932,932,-1,932,932,-16,932,932,932,-1,932,-1,932,-4,932,932,932,-1,932,932,-1,932,-1,932,932,932,-1,932,-2,932,-2,932,-2,932,-2,932,-2,932,-1,932,932,932,932,932,932,932,932,932,932,932,932,-1,932,-2,932,932,932,932,-2,932,-4,932,932,-2,932,932,-1,932,-5,932,932,932,932,932,932,932,932,932,932,932,932,932,932,932,932,932,932,932,932,932,932,932,932,932,932,932,932,932,932,932,932,932,932,932,932],
sm722=[0,-4,0,-4,0,-5,933],
sm723=[0,-4,0,-4,0,-166,934],
sm724=[0,-4,0,-4,0,-166,935],
sm725=[0,-4,0,-4,0,-7,936],
sm726=[0,-2,780,-1,0,-1,-1,-2,0,-5,937,-8,782,-3,783,-27,784,785,786,787,-1,788,-9,789],
sm727=[0,-2,938,-1,0,-1,-1,-2,0,-5,938,-8,938,-3,938,-27,938,938,938,938,-1,938,-9,938],
sm728=[0,-2,939,-1,0,-1,-1,-2,0,-5,939,-8,939,-3,939,-27,939,939,939,939,-1,939,-9,939],
sm729=[0,-4,0,-1,-1,-2,0,-58,846],
sm730=[0,-2,940,-1,0,-1,-1,-2,0,-5,940,-8,940,-3,940,-27,940,940,940,940,-1,940,-6,940,-2,940,-44,940],
sm731=[0,-4,0,-1,-1,-2,0,-3,941,-35,942,-102,943,944],
sm732=[0,-2,780,-1,0,-1,-1,-2,0,-10,945,-14,946,-2,947],
sm733=[0,-4,0,-1,-1,-2,0,-20,948,-121,943,944],
sm734=[0,-2,780,-1,0,-1,949,-2,0,-10,950,-14,951],
sm735=[0,-2,780,-1,0,-1,-1,-2,0,-46,784,785,786,787,-1,788,-9,789],
sm736=[0,-2,780,-1,0,-1,-1,-2,0,-18,783,-39,952,-47,953],
sm737=[0,-2,954,-1,0,-1,-1,-2,0,-18,954,-39,955,-47,954],
sm738=[0,-2,954,-1,0,-1,-1,-2,0,-18,954,-39,954,-47,954],
sm739=[0,-2,956,-1,0,-1,-1,-2,0,-18,956,-39,956,-47,956],
sm740=[0,-2,957,-1,0,-1,-1,-2,0,-18,957,-39,957,-47,957],
sm741=[0,-4,0,-1,-1,-2,0,-61,958],
sm742=[0,-2,780,-1,0,-1,-1,-2,0,-7,856,-3,959,-1,959,959,-27,858,859,860,-1,784,785,786,787,-1,788,-9,789],
sm743=[0,-2,960,-1,0,-1,-1,-2,0,-7,960,-3,960,-1,960,960,-27,960,960,960,-1,960,960,960,960,-1,960,-9,960],
sm744=[0,-2,961,-1,0,-1,-1,-2,0,-7,961,-3,961,-1,961,961,-27,961,961,961,-1,961,961,961,961,-1,961,-9,961],
sm745=[0,-2,962,-1,0,-1,-1,-2,0,-46,962,962,962,962,-1,962,-9,962],
sm746=[0,-2,963,-1,0,-1,-1,-2,0,-7,963,-3,963,-1,963,963,-27,963,963,963,-1,963,963,786,787,-1,788,-9,789],
sm747=[0,-2,963,-1,0,-1,-1,-2,0,-7,963,-3,963,-1,963,963,-27,963,963,963,-1,963,963,963,963,-1,963,-9,862],
sm748=[0,-2,964,-1,0,-1,-1,-2,0,-7,964,-3,964,-1,964,964,-27,964,964,964,-1,964,964,964,964,-1,964,-9,964],
sm749=[0,-2,965,-1,0,-1,-1,-2,0,-7,965,-3,965,-1,965,965,-27,965,965,965,-1,965,965,965,965,-1,965,-9,965],
sm750=[0,-4,0,-1,-1,-2,0,-61,880],
sm751=[0,-2,966,-1,0,-1,-1,-2,0,-7,966,-3,966,-1,966,966,-27,966,966,966,-1,966,966,966,966,-1,966,-9,966],
sm752=[0,-2,967,-1,0,-1,-1,-2,0,-7,967,-3,967,-1,967,967,-18,967,-8,967,967,967,-1,967,967,967,967,-1,967,967,967,967,967,-5,967],
sm753=[0,-2,968,-1,0,-1,-1,-2,0,-46,968],
sm754=[0,-2,870,-1,871,-1,-1,-2,872,-3,969,-1,969,-1,969,969,-1,969,969,-1,969,969,-3,969,-4,969,-7,969,969,969,-8,969,969,969,-1,969,969,969,969,-1,969,969,969,969,969,969,969,969,-2,969,-2,874,-69,875],
sm755=[0,-2,970,-1,970,-1,-1,-2,0,-3,970,-1,970,-1,970,970,-1,970,970,-1,970,970,-3,970,-4,970,-7,970,970,970,-8,970,970,970,-1,970,970,970,970,-1,970,970,970,970,970,970,970,970,-2,970],
sm756=[0,-2,971,-1,971,-1,-1,-2,971,-3,971,-1,971,-1,971,971,-1,971,971,-1,971,971,-3,971,-4,971,-7,971,971,971,-8,971,971,971,-1,971,971,971,971,-1,971,971,971,971,971,971,971,971,-2,971,-2,971,-69,971],
sm757=[0,-2,972,-1,972,-1,-1,-2,972,-3,972,-1,972,-1,972,972,-1,972,972,-1,972,972,-3,972,-4,972,-7,972,972,972,-8,972,972,972,-1,972,972,972,972,-1,972,972,972,972,972,972,972,972,-2,972,-2,972,-69,972],
sm758=[0,-2,973,-1,973,-1,-1,-2,0,-3,973,-1,973,-1,973,973,-1,973,973,-1,973,973,-3,973,-4,973,-7,973,973,973,-8,973,973,973,-1,973,973,973,973,-1,973,973,973,973,973,973,973,973,-2,973],
sm759=[0,-2,974,-1,0,-1,-1,-2,0,-7,974,-3,974,-1,974,974,-27,974,974,974,-1,974,974,974,974,-1,974,-9,974],
sm760=[0,-2,975,-1,0,-1,-1,-2,0,-7,975,-3,975,-1,975,975,-27,975,975,975,-1,975,975,975,975,-1,975,-9,975],
sm761=[0,-4,0,-1,-1,-2,0,-33,976,-9,977,-8,978,979,980,981],
sm762=[0,-4,0,-1,-1,-2,0,-47,866],
sm763=[0,-2,982,-1,0,-1,-1,-2,0,-7,982,-2,983,982,-1,982,982,-27,982,982,982,-1,982,982,982,982,-1,982,-9,982],
sm764=[0,-2,984,-1,0,-1,-1,-2,0,-7,984,-3,984,-1,984,984,-27,984,984,984,-1,984,984,984,984,-1,984,-9,984],
sm765=[0,-2,985,-1,0,-1,-1,-2,0,-7,985,-3,985,-1,985,985,-27,985,985,985,-1,985,985,985,985,-1,985,-9,880],
sm766=[0,-2,986,-1,0,-1,-1,-2,0,-7,986,-3,986,-1,986,986,-27,986,986,986,-1,986,986,986,986,-1,986,-9,986],
sm767=[0,-4,0,-4,0,-5,987],
sm768=[0,-4,0,-4,0,-167,988],
sm769=[0,-4,0,-4,0,-167,989],
sm770=[0,-4,0,-4,0,-7,990],
sm771=[0,-4,0,-4,0,-5,991],
sm772=[0,-4,0,-4,0,-168,992],
sm773=[0,-4,0,-4,0,-168,993],
sm774=[0,-4,0,-4,0,-7,994],
sm775=[0,-1,1,2,-1,0,-4,0,-8,80,-1,5,995,-2,153,-27,7,8,-7,9,-12,11,-11,18,-14,154,-2,155,-4,31,32,-2,33,34,-29,35,-1,36,37,38,39,40,41,42,43,44,45,46,47],
sm776=[0,-1,996,996,-1,996,996,996,996,996,0,-5,996,-1,996,996,996,996,-131,996,996],
sm777=[0,-4,0,-4,0,-11,997],
sm778=[0,-4,-1,-4,0,-11,998],
sm779=[0,-4,0,-1,-1,-2,0,-106,999],
sm780=[0,-1,1000,1000,-1,0,-1,-1,-2,0,-13,1000,-37,1000,-6,1000,-5,1000,-31,1000,1000,1000,-7,1000,-35,1000,1000,-3,1000],
sm781=[0,-1,1001,1001,-1,0,-1,-1,-2,0,-13,1001,-37,1001,-6,1001,-5,1001,-31,1001,1001,1001,-7,1001,-35,1001,1001,-3,1001],
sm782=[0,-4,0,-1,-1,-2,0,-106,1002],
sm783=[0,-1,1003,1003,-1,0,-1,-1,-2,0,-13,1003,-37,1003,-6,1003,-5,1003,-31,1003,1003,1003,-7,1003,-35,1003,1003,-3,1003],
sm784=[0,-1,1,2,-1,0,-1,-1,-2,0,-8,80,-1,5,-3,6,-27,7,8,-7,9,-6,10,-5,11,-5,13,-1,14,15,16,17,18,-1,19,20,21,22,23,24,-1,25,-2,26,27,28,29,-2,30,-4,31,32,-2,33,34,-1,1004,-27,35,-1,36,37,38,39,40,41,42,43,44,45,46,47],
sm785=[0,-4,0,-1,-1,-2,0,-106,1005],
sm786=[0,1006,1006,1006,-1,0,-1,-1,-2,0,-6,1006,1006,1006,1006,1006,1006,-1,1006,1006,-16,1006,1006,1006,-1,1006,-1,1006,-4,1006,1006,1006,-1,1006,1006,-1,1006,-1,1006,1006,1006,-1,1006,-2,1006,-2,1006,-2,1006,-2,1006,-2,1006,-1,1006,1006,1006,1006,1006,1006,1006,1006,1006,1006,1006,1006,-1,1006,-2,1006,1006,1006,1006,-2,1006,-4,1006,1006,-2,1006,1006,-1,1006,-5,1006,1006,1006,1006,1006,1006,1006,1006,1006,1006,1006,1006,1006,1006,1006,1006,1006,1006,1006,1006,1006,1006,1006,1006,1006,1006,1006,1006,1006,1006,1006,1006,1006,1006,1006,1006],
sm787=[0,1007,1007,1007,-1,0,-1,-1,-2,0,-6,1007,1007,1007,1007,1007,1007,-1,1007,1007,-16,1007,1007,1007,-1,1007,-1,1007,-4,1007,1007,1007,-1,1007,1007,-1,1007,-1,1007,1007,1007,-1,1007,-2,1007,-2,1007,-2,1007,-2,1007,-2,1007,-1,1007,1007,1007,1007,1007,1007,1007,1007,1007,1007,1007,1007,-1,1007,-2,1007,1007,1007,1007,-2,1007,-4,1007,1007,-2,1007,1007,-1,1007,-5,1007,1007,1007,1007,1007,1007,1007,1007,1007,1007,1007,1007,1007,1007,1007,1007,1007,1007,1007,1007,1007,1007,1007,1007,1007,1007,1007,1007,1007,1007,1007,1007,1007,1007,1007,1007],
sm788=[0,1008,1008,1008,-1,0,-1,-1,-2,0,-6,1008,1008,1008,1008,1008,1008,-1,1008,1008,-16,1008,1008,1008,-1,1008,-1,1008,-4,1008,1008,1008,-1,1008,1008,-1,1008,-1,1008,1008,1008,-1,1008,-2,1008,-2,1008,-2,1008,-2,1008,-2,1008,-1,1008,1008,1008,1008,1008,1008,1008,1008,1008,1008,1008,1008,-1,1008,-2,1008,1008,1008,1008,-2,1008,-4,1008,1008,-2,1008,1008,-1,1008,-5,1008,1008,1008,1008,1008,1008,1008,1008,1008,1008,1008,1008,1008,1008,1008,1008,1008,1008,1008,1008,1008,1008,1008,1008,1008,1008,1008,1008,1008,1008,1008,1008,1008,1008,1008,1008],
sm789=[0,1009,1009,1009,-1,0,-1,-1,-2,0,-5,1009,1009,-1,1009,-1,1009,-3,1009,-27,1009,1009,-7,1009,-6,1009,-5,1009,-2,1009,1009,-1,1009,1009,1009,1009,1009,1009,1009,-1,1009,1009,1009,1009,1009,1009,1009,1009,-2,1009,1009,1009,1009,-2,1009,-4,1009,1009,-2,1009,1009,-1,1009,-27,1009,-1,1009,1009,1009,1009,1009,1009,1009,1009,1009,1009,1009,1009],
sm790=[0,1010,1010,1010,-1,0,-1,-1,-2,0,-5,1010,1010,-1,1010,-1,1010,-3,1010,-27,1010,1010,-7,1010,-6,1010,-5,1010,-2,1010,1010,-1,1010,1010,1010,1010,1010,1010,1010,-1,1010,1010,1010,1010,1010,1010,1010,1010,-2,1010,1010,1010,1010,-2,1010,-4,1010,1010,-2,1010,1010,-1,1010,-27,1010,-1,1010,1010,1010,1010,1010,1010,1010,1010,1010,1010,1010,1010],
sm791=[0,1011,1011,1011,-1,0,-1,-1,-2,0,-5,1011,1011,-1,1011,-1,1011,-3,1011,-27,1011,1011,-7,1011,-6,1011,-5,1011,-2,1011,1011,-1,1011,1011,1011,1011,1011,1011,1011,-1,1011,1011,1011,1011,1011,1011,1011,1011,-2,1011,1011,1011,1011,-2,1011,-4,1011,1011,-2,1011,1011,-1,1011,-27,1011,-1,1011,1011,1011,1011,1011,1011,1011,1011,1011,1011,1011,1011],
sm792=[0,1012,1012,1012,-1,0,-1,-1,-2,0,-5,1012,1012,-1,1012,-1,1012,-3,1012,-27,1012,1012,-7,1012,-6,1012,-5,1012,-2,1012,1012,-1,1012,1012,1012,1012,1012,1012,1012,-1,1012,1012,1012,1012,1012,1012,1012,1012,-2,1012,1012,1012,1012,-2,1012,-4,1012,1012,-2,1012,1012,-1,1012,-27,1012,-1,1012,1012,1012,1012,1012,1012,1012,1012,1012,1012,1012,1012],
sm793=[0,1013,1013,1013,-1,0,-1,-1,-2,0,-5,1013,1013,-1,1013,-1,1013,-3,1013,-27,1013,1013,-7,1013,-6,1013,-5,1013,-2,1013,1013,-1,1013,1013,1013,1013,1013,1013,1013,-1,1013,1013,1013,1013,1013,1013,1013,1013,-2,1013,1013,1013,1013,-2,1013,-4,1013,1013,-2,1013,1013,-1,1013,-27,1013,-1,1013,1013,1013,1013,1013,1013,1013,1013,1013,1013,1013,1013],
sm794=[0,-4,0,-1,-1,-2,0,-106,1014],
sm795=[0,1015,1015,1015,-1,0,-1,-1,-2,0,-5,1015,1015,-1,1015,-1,1015,-3,1015,-27,1015,1015,-7,1015,-6,1015,-5,1015,-2,1015,1015,-1,1015,1015,1015,1015,1015,1015,1015,-1,1015,1015,1015,1015,1015,1015,1015,1015,-2,1015,1015,1015,1015,-2,1015,-4,1015,1015,-2,1015,1015,-1,1015,-27,1015,-1,1015,1015,1015,1015,1015,1015,1015,1015,1015,1015,1015,1015],
sm796=[0,-1,1,2,-1,0,-1,-1,-2,0,-8,80,-1,5,-3,6,-27,7,8,-7,9,-6,10,-5,11,-3,1016,-1,13,-1,14,15,16,17,18,-1,19,20,21,22,23,24,1016,25,-2,26,27,28,29,-2,30,-4,31,32,-2,33,34,-1,1016,-27,35,-1,36,37,38,39,40,41,42,43,44,45,46,47],
sm797=[0,-4,0,-1,-1,-2,0,-84,1017,-21,1017],
sm798=[0,1018,1018,1018,-1,0,-1,-1,-2,0,-5,1018,1018,-1,1018,-1,1018,-3,1018,-27,1018,1018,-7,1018,-6,1018,-5,1018,-2,1018,1018,-1,1018,1018,1018,1018,1018,1018,1018,-1,1018,1018,1018,1018,1018,1018,1018,1018,-2,1018,1018,1018,1018,-2,1018,-4,1018,1018,-2,1018,1018,-1,1018,-27,1018,-1,1018,1018,1018,1018,1018,1018,1018,1018,1018,1018,1018,1018],
sm799=[0,-4,0,-4,0,-166,1019],
sm800=[0,-4,0,-4,0,-7,1020],
sm801=[0,-4,0,-4,0,-7,1021],
sm802=[0,-1,1022,1022,-1,1022,1022,1022,1022,1022,0,-5,1022,-2,1022,-1,1022],
sm803=[0,-4,0,-1,-1,-2,0,-3,1023,-35,942,-102,943,944],
sm804=[0,-2,780,-1,0,-1,-1,-2,0,-5,1024,-4,945,-3,1024,-2,1025,1024,-6,946,-2,947,-17,1024,1024,1024,1024,-1,1024,-6,1024,-2,1024],
sm805=[0,-4,0,-1,-1,-2,0,-3,1026,-35,1026,-102,1026,1026],
sm806=[0,-2,1027,-1,0,-1,-1,-2,0,-5,1027,-4,1027,-3,1027,-2,1027,1027,-6,1027,-2,1027,-17,1027,1027,1027,1027,-1,1027,-6,1027,-2,1027],
sm807=[0,-4,0,-1,-1,-2,0,-3,941],
sm808=[0,-4,0,-1,-1,-2,0,-10,1028],
sm809=[0,-4,0,-1,-1,-2,0,-13,1029,1030],
sm810=[0,-2,1031,-1,0,-1,-1,-2,0,-5,1031,-7,1031,1031,-3,1031,-27,1031,1031,1031,1031,-1,1031,-6,1031,-2,1031],
sm811=[0,-2,1032,-1,0,-1,-1,-2,0,-5,1032,-7,1032,1032,-3,1032,-27,1032,1032,1032,1032,-1,1032,-6,1032,-2,1032],
sm812=[0,-2,1032,-1,0,-1,-1,-2,0,-5,1032,-7,1032,1032,-3,1032,-4,1033,-22,1032,1032,1032,1032,-1,1032,-6,1032,-2,1032],
sm813=[0,-2,1034,-1,0,-1,-1,-2,0,-5,1034,-5,1034,-1,1034,1034,-3,1034,-27,1034,1034,1034,1034,-1,1034,-6,1034,-2,1034],
sm814=[0,-2,1035,-1,0,-1,-1,-2,0,-5,1035,-5,1035,-1,1035,1035,-3,1035,-27,1035,1035,1035,1035,-1,1035,-6,1035,-2,1035],
sm815=[0,-2,1035,-1,0,-1,-1,-2,0,-5,1035,-5,1035,-1,1035,1035,-3,1035,-4,1036,1037,-21,1035,1035,1035,1035,-1,1035,-6,1035,-2,1035],
sm816=[0,-2,780,-1,0,-1,-1,-2,0,-10,945],
sm817=[0,-1,1038,780,-1,0,-1,-1,-2,0,-10,945,-14,1039],
sm818=[0,-2,1040,-1,0,-1,-1,-2,0,-5,1040,-5,1040,-1,1040,1040,-3,1040,-4,1040,1040,-21,1040,1040,1040,1040,-1,1040,-6,1040,-2,1040],
sm819=[0,-2,1041,-1,0,-1,-1,-2,0,-5,1041,-4,1042,-2,1041,1041,-3,1041,-4,1041,-22,1041,1041,1041,1041,-1,1041,-6,1041,-2,1041],
sm820=[0,-2,1043,-1,0,-1,-1,-2,0],
sm821=[0,-4,0,-1,-1,-2,0,-14,1044],
sm822=[0,-4,0,-1,-1,-2,0,-14,1045],
sm823=[0,-4,0,-1,-1,-2,0,-14,1046],
sm824=[0,-2,780,-1,0,-1,949,-2,0,-10,950],
sm825=[0,-4,0,-1,-1,-2,0,-11,1047,-2,1047,-8,1048,1049],
sm826=[0,-4,0,-1,-1,-2,0,-11,1050,-2,1050,-8,1050,1050],
sm827=[0,-4,0,-1,-1,-2,0,-11,1051,-2,1051,-8,1051,1051],
sm828=[0,-4,0,-1,-1,-2,0,-10,1052],
sm829=[0,-4,0,-1,-1,-2,0,-10,1042],
sm830=[0,-2,780,-1,0,-1,-1,-2,0,-18,783,-39,1053,-47,1054],
sm831=[0,-4,0,-1,-1,-2,0,-13,1055,1055],
sm832=[0,-4,0,-1,-1,-2,0,-106,1056],
sm833=[0,-2,1057,-1,0,-1,-1,-2,0,-5,1057,-8,1057,-3,1057,-27,1057,1057,1057,1057,-1,1057,-9,1057,-44,1057],
sm834=[0,-2,1058,-1,0,-1,-1,-2,0,-18,1058,-39,1058,-47,1058],
sm835=[0,-2,1059,-1,0,-1,-1,-2,0,-18,1059,-39,1060,-47,1059],
sm836=[0,-2,780,-1,0,-1,-1,-2,0,-18,1061,-39,1061,-47,1061],
sm837=[0,-2,1062,-1,1063,-1,-1,-2,0,-3,1064,-6,1065],
sm838=[0,-2,1066,-1,0,-1,-1,-2,0,-7,1066,-3,1066,-1,1066,1066,-27,1066,1066,1066,-1,1066,1066,1066,1066,-1,1066,-9,1066],
sm839=[0,-2,1067,-1,0,-1,-1,-2,0,-7,1067,-3,1067,-1,1067,1067,-27,1067,1067,1067,-1,1067,1067,1067,1067,-1,1067,-9,1067],
sm840=[0,-2,1068,-1,0,-1,-1,-2,0,-7,1068,-3,1068,-1,1068,1068,-27,1068,1068,1068,-1,1068,1068,1068,1068,-1,1068,-9,862],
sm841=[0,-2,1069,-1,1069,-1,-1,-2,0,-3,1069,-1,1069,-1,1069,1069,-1,1069,1069,-1,1069,1069,-3,1069,-4,1069,-7,1069,1069,1069,-8,1069,1069,1069,-1,1069,1069,1069,1069,-1,1069,1069,1069,1069,1069,1069,1069,1069,-2,1069],
sm842=[0,-2,1070,-1,1070,-1,-1,-2,1070,-3,1070,-1,1070,-1,1070,1070,-1,1070,1070,-1,1070,1070,-3,1070,-4,1070,-7,1070,1070,1070,-8,1070,1070,1070,-1,1070,1070,1070,1070,-1,1070,1070,1070,1070,1070,1070,1070,1070,-2,1070,-2,1070,-69,1070],
sm843=[0,-2,1071,-1,0,-1,-1,-2,0,-7,1071,-3,1071,-1,1071,1071,-27,1071,1071,1071,-1,1071,1071,1071,1071,-1,1071,-9,1071],
sm844=[0,-2,780,1072,0,-1,-1,-2,0],
sm845=[0,-4,0,-1,-1,-2,0,-33,1073],
sm846=[0,-2,1074,1074,0,-1,-1,-2,0],
sm847=[0,-2,1075,-1,0,-1,-1,-2,0,-7,1075,-3,1075,-1,1075,1075,-27,1075,1075,1075,-1,1075,1075,1075,1075,-1,1075,-9,1075],
sm848=[0,-2,1076,-1,0,-1,-1,-2,0,-7,1076,-3,1076,-1,1076,1076,-27,1076,1076,1076,-1,1076,1076,1076,1076,-1,1076,-9,1076],
sm849=[0,-4,0,-4,0,-167,1077],
sm850=[0,-4,0,-4,0,-7,1078],
sm851=[0,-4,0,-4,0,-7,1079],
sm852=[0,-4,0,-4,0,-168,1080],
sm853=[0,-4,0,-4,0,-7,1081],
sm854=[0,-4,0,-4,0,-7,1082],
sm855=[0,-4,0,-4,0,-11,1083],
sm856=[0,-4,-1,-4,0,-11,1084],
sm857=[0,-4,-1,-4,0,-11,1085],
sm858=[0,-1,1086,1086,-1,1086,1086,1086,1086,1086,0,-5,1086,-1,1086,1086,1086,1086,-131,1086,1086],
sm859=[0,-1,1087,1087,-1,0,-1,-1,-2,0,-13,1087,-37,1087,-6,1087,-5,1087,-31,1087,1087,1087,-7,1087,-35,1087,1087,-3,1087],
sm860=[0,-1,1088,1088,-1,0,-1,-1,-2,0,-13,1088,-37,1088,-6,1088,-5,1088,-31,1088,1088,1088,-7,1088,-35,1088,1088,-3,1088],
sm861=[0,-4,0,-1,-1,-2,0,-106,1089],
sm862=[0,-1,1090,1090,-1,0,-1,-1,-2,0,-13,1090,-37,1090,-6,1090,-5,1090,-31,1090,1090,1090,-7,1090,-35,1090,1090,-3,1090],
sm863=[0,1091,1091,1091,-1,0,-1,-1,-2,0,-6,1091,1091,1091,1091,1091,1091,-1,1091,1091,-16,1091,1091,1091,-1,1091,-1,1091,-4,1091,1091,1091,-1,1091,1091,-1,1091,-1,1091,1091,1091,-1,1091,-2,1091,-2,1091,-2,1091,-2,1091,-2,1091,-1,1091,1091,1091,1091,1091,1091,1091,1091,1091,1091,1091,1091,-1,1091,-2,1091,1091,1091,1091,-2,1091,-4,1091,1091,-2,1091,1091,-1,1091,-5,1091,1091,1091,1091,1091,1091,1091,1091,1091,1091,1091,1091,1091,1091,1091,1091,1091,1091,1091,1091,1091,1091,1091,1091,1091,1091,1091,1091,1091,1091,1091,1091,1091,1091,1091,1091],
sm864=[0,1092,1092,1092,-1,0,-1,-1,-2,0,-5,1092,1092,-1,1092,-1,1092,-3,1092,-27,1092,1092,-7,1092,-6,1092,-5,1092,-2,1092,1092,-1,1092,1092,1092,1092,1092,1092,1092,-1,1092,1092,1092,1092,1092,1092,1092,1092,-2,1092,1092,1092,1092,-2,1092,-4,1092,1092,-2,1092,1092,-1,1092,-27,1092,-1,1092,1092,1092,1092,1092,1092,1092,1092,1092,1092,1092,1092],
sm865=[0,1093,1093,1093,-1,0,-1,-1,-2,0,-5,1093,1093,-1,1093,-1,1093,-3,1093,-27,1093,1093,-7,1093,-6,1093,-5,1093,-2,1093,1093,-1,1093,1093,1093,1093,1093,1093,1093,-1,1093,1093,1093,1093,1093,1093,1093,1093,-2,1093,1093,1093,1093,-2,1093,-4,1093,1093,-2,1093,1093,-1,1093,-27,1093,-1,1093,1093,1093,1093,1093,1093,1093,1093,1093,1093,1093,1093],
sm866=[0,-4,0,-1,-1,-2,0,-68,1094,-15,1094,-21,1094],
sm867=[0,-4,0,-4,0,-7,1095],
sm868=[0,-1,1096,1096,-1,1096,1096,1096,1096,1096,0,-5,1096,-2,1096,-1,1096],
sm869=[0,-1,1097,1097,-1,1097,1097,1097,1097,1097,0,-5,1097,-2,1097,-1,1097],
sm870=[0,-2,780,-1,0,-1,-1,-2,0,-5,1098,-4,945,-3,1098,-2,1025,1098,-6,946,-2,947,-17,1098,1098,1098,1098,-1,1098,-6,1098,-2,1098],
sm871=[0,-4,0,-1,-1,-2,0,-3,1099,-35,1099,-102,1099,1099],
sm872=[0,-2,780,-1,0,-1,-1,-2,0,-5,1098,-4,945,-3,1098,-3,1098,-6,946,-2,947,-17,1098,1098,1098,1098,-1,1098,-6,1098,-2,1098],
sm873=[0,-2,1098,-1,0,-1,-1,-2,0,-5,1098,-7,1029,1098,-3,1098,-27,1098,1098,1098,1098,-1,1098,-6,1098,-2,1098],
sm874=[0,-4,0,-1,-1,-2,0,-10,1100],
sm875=[0,-4,0,-1,-1,-2,0,-3,1023,-138,1101],
sm876=[0,-4,0,-1,-1,-2,0,-3,1023,-139,1102],
sm877=[0,-4,0,-1,-1,-2,0,-142,943,944],
sm878=[0,-2,780,-1,0,-1,-1,-2,0,-14,782,-31,784,785,786,787,-1,788,-9,789,-44,1103],
sm879=[0,-2,1104,-1,0,-1,-1,-2,0,-5,1104,-7,1104,1104,-3,1104,-4,1033,-22,1104,1104,1104,1104,-1,1104,-6,1104,-2,1104],
sm880=[0,-2,1041,-1,0,-1,-1,-2,0,-5,1041,-7,1041,1041,-3,1041,-4,1041,-22,1041,1041,1041,1041,-1,1041,-6,1041,-2,1041],
sm881=[0,-2,1104,-1,0,-1,-1,-2,0,-5,1104,-7,1104,1104,-3,1104,-27,1104,1104,1104,1104,-1,1104,-6,1104,-2,1104],
sm882=[0,-2,780,-1,0,-1,-1,-2,0,-10,945,-14,1039],
sm883=[0,-2,1105,-1,0,-1,-1,-2,0,-5,1105,-5,1105,-1,1105,1105,-3,1105,-4,1036,-22,1105,1105,1105,1105,-1,1105,-6,1105,-2,1105],
sm884=[0,-2,1106,-1,0,-1,-1,-2,0,-5,1106,-5,1106,-1,1106,1106,-3,1106,-5,1037,-21,1106,1106,1106,1106,-1,1106,-6,1106,-2,1106],
sm885=[0,-2,1107,-1,0,-1,-1,-2,0,-5,1107,-5,1107,-1,1107,1107,-3,1107,-4,1107,-22,1107,1107,1107,1107,-1,1107,-6,1107,-2,1107],
sm886=[0,-2,1108,-1,0,-1,-1,-2,0,-5,1108,-5,1108,-1,1108,1108,-3,1108,-5,1108,-21,1108,1108,1108,1108,-1,1108,-6,1108,-2,1108],
sm887=[0,-2,1109,-1,0,-1,-1,-2,0,-5,1109,-5,1109,-1,1109,1109,-3,1109,-27,1109,1109,1109,1109,-1,1109,-6,1109,-2,1109],
sm888=[0,-4,0,-1,-1,-2,0,-11,1110],
sm889=[0,-4,0,-1,-1,-2,0,-11,1111],
sm890=[0,-4,1112,-1,-1,-2,0,-3,1113,-3,1114,1114,-1,1042,1115,-19,1114,1114,1114,-27,1114],
sm891=[0,-4,0,-1,-1,-2,0,-11,1116],
sm892=[0,-4,0,-1,-1,-2,0,-7,1117,1118,-22,1119,1120,1121,-27,1122],
sm893=[0,-4,0,-1,-1,-2,0,-7,1117,1118,-22,1119,1120,1121],
sm894=[0,-4,0,-1,-1,-2,0,-7,1123,1123,1124,-1,1123,-19,1123,1123,1123,-2,1125,1126,1127],
sm895=[0,-4,0,-1,-1,-2,0,-7,1123,1123,-2,1123,-19,1123,1123,1123],
sm896=[0,-4,1112,-1,-1,-2,0,-3,1113,-7,1128],
sm897=[0,-1,1129,-2,0,-1,-1,-2,0,-21,1130,1131],
sm898=[0,-4,0,-1,-1,-2,0,-11,1132,-2,1132],
sm899=[0,-4,0,-1,-1,-2,0,-11,1132,-2,1132,-8,1048,1049],
sm900=[0,-4,0,-1,-1,-2,0,-11,1133,-2,1133,-8,1133,1133],
sm901=[0,-2,1134,-1,0,-1,1134,-2,0,-10,1134],
sm902=[0,-4,0,-1,-1,-2,0,-11,1135],
sm903=[0,-4,0,-1,-1,-2,0,-11,1136],
sm904=[0,-4,1112,-1,-1,-2,0,-3,1113,-6,1042,1115,-49,958],
sm905=[0,-4,0,-1,-1,-2,0,-106,1137],
sm906=[0,-2,1138,-1,0,-1,-1,-2,0,-5,1138,-8,1138,-3,1138,-27,1138,1138,1138,1138,-1,1138,-9,1138,-44,1138],
sm907=[0,-2,1139,-1,0,-1,-1,-2,0,-5,1139,-8,1139,-3,1139,-27,1139,1139,1139,1139,-1,1139,-9,1139,-44,1139],
sm908=[0,-2,780,-1,0,-1,-1,-2,0,-18,1140,-39,1140,-47,1140],
sm909=[0,-2,1141,-1,0,-1,-1,-2,0,-18,1141,-39,1141,-47,1141],
sm910=[0,-2,1062,-1,1063,-1,-1,-2,0,-3,1064,-6,1065,1142,-6,1142,-39,1142,-47,1142,-32,1143],
sm911=[0,-2,1062,-1,1063,-1,-1,-2,0,-3,1064,-6,1144,1144,-6,1144,-39,1144,-47,1144,-32,1144],
sm912=[0,-2,1145,-1,1145,-1,-1,-2,0,-3,1145,-6,1145,1145,-6,1145,-39,1145,-47,1145,-32,1145],
sm913=[0,-2,1146,-1,1146,-1,-1,-2,0,-3,1146,-6,1146,1146,-6,1146,-39,1146,-47,1146,-32,1146],
sm914=[0,-4,0,-1,-1,-2,0,-52,1147,-3,1148,1149],
sm915=[0,-4,0,-1,-1,-2,0,-52,1150,-3,1150,1150],
sm916=[0,-2,1151,1151,0,-1,-1,-2,0],
sm917=[0,-4,0,-1,-1,-2,0,-11,1152],
sm918=[0,-4,0,-4,0,-7,1153],
sm919=[0,-4,0,-4,0,-7,1154],
sm920=[0,-4,-1,-4,0,-11,1155],
sm921=[0,-1,1156,1156,-1,1156,1156,1156,1156,1156,0,-5,1156,-1,1156,1156,1156,1156,-131,1156,1156],
sm922=[0,-1,1157,1157,-1,1157,1157,1157,1157,1157,0,-5,1157,-1,1157,1157,1157,1157,-131,1157,1157],
sm923=[0,-1,1158,1158,-1,0,-1,-1,-2,0,-13,1158,-37,1158,-6,1158,-5,1158,-31,1158,1158,1158,-7,1158,-35,1158,1158,-3,1158],
sm924=[0,-1,1159,1159,-1,1159,1159,1159,1159,1159,0,-5,1159,-2,1159,-1,1159],
sm925=[0,-2,780,-1,0,-1,-1,-2,0,-5,1160,-4,945,-3,1160,-3,1160,-6,946,-2,947,-17,1160,1160,1160,1160,-1,1160,-6,1160,-2,1160],
sm926=[0,-2,1160,-1,0,-1,-1,-2,0,-5,1160,-7,1029,1160,-3,1160,-27,1160,1160,1160,1160,-1,1160,-6,1160,-2,1160],
sm927=[0,-2,1161,-1,0,-1,-1,-2,0,-5,1161,-4,1161,1161,-2,1161,-2,1161,1161,-6,1161,-2,1161,-17,1161,1161,1161,1161,-1,1161,-6,1161,-2,1161],
sm928=[0,-4,0,-1,-1,-2,0,-11,1162],
sm929=[0,-4,0,-1,-1,-2,0,-106,1163],
sm930=[0,-2,780,-1,0,-1,-1,-2,0,-14,782,-31,784,785,786,787,-1,788,-9,789,-44,1164],
sm931=[0,-2,1165,-1,0,-1,-1,-2,0,-14,1165,-31,1165,1165,1165,1165,-1,1165,-9,1165,-44,1165],
sm932=[0,-2,1166,-1,0,-1,-1,-2,0,-5,1166,-7,1166,1166,-3,1166,-27,1166,1166,1166,1166,-1,1166,-6,1166,-2,1166],
sm933=[0,-2,1167,-1,0,-1,-1,-2,0,-5,1167,-7,1167,1167,-3,1167,-27,1167,1167,1167,1167,-1,1167,-6,1167,-2,1167],
sm934=[0,-2,1168,-1,0,-1,-1,-2,0,-5,1168,-7,1168,1168,-3,1168,-27,1168,1168,1168,1168,-1,1168,-6,1168,-2,1168],
sm935=[0,-2,1035,-1,0,-1,-1,-2,0,-5,1035,-7,1035,1035,-3,1035,-4,1036,-22,1035,1035,1035,1035,-1,1035,-6,1035,-2,1035],
sm936=[0,-2,1169,-1,0,-1,-1,-2,0,-5,1169,-5,1169,-1,1169,1169,-3,1169,-4,1169,-22,1169,1169,1169,1169,-1,1169,-6,1169,-2,1169],
sm937=[0,-2,1170,-1,0,-1,-1,-2,0,-5,1170,-5,1170,-1,1170,1170,-3,1170,-5,1170,-21,1170,1170,1170,1170,-1,1170,-6,1170,-2,1170],
sm938=[0,-2,1171,-1,0,-1,-1,-2,0,-5,1171,-5,1171,-1,1171,1171,-3,1171,-4,1171,-22,1171,1171,1171,1171,-1,1171,-6,1171,-2,1171],
sm939=[0,-2,1172,-1,0,-1,-1,-2,0,-5,1172,-5,1172,-1,1172,1172,-3,1172,-5,1172,-21,1172,1172,1172,1172,-1,1172,-6,1172,-2,1172],
sm940=[0,-2,1173,-1,0,-1,-1,-2,0,-5,1173,-5,1173,-1,1173,1173,-3,1173,-4,1173,1173,-21,1173,1173,1173,1173,-1,1173,-6,1173,-2,1173],
sm941=[0,-2,1174,-1,0,-1,-1,-2,0,-5,1174,-5,1174,-1,1174,1174,-3,1174,-4,1174,1174,-21,1174,1174,1174,1174,-1,1174,-6,1174,-2,1174],
sm942=[0,-4,1112,-1,-1,-2,0,-3,1113,-7,1175],
sm943=[0,-2,1176,-1,0,-1,-1,-2,0,-5,1176,-5,1176,-1,1176,1176,-3,1176,-4,1176,1176,-21,1176,1176,1176,1176,-1,1176,-6,1176,-2,1176],
sm944=[0,-4,1177,-1,-1,-2,0,-3,1177,-7,1177],
sm945=[0,-4,1178,-1,-1,-2,0,-3,1178,-7,1178],
sm946=[0,-1,1038,780,-1,0,-1,-1,-2,0],
sm947=[0,-1,1179,1179,-1,0,-1,-1,-2,0],
sm948=[0,-1,1180,1180,-1,0,-1,-1,-2,0],
sm949=[0,-1,1181,1181,-1,0,-1,-1,-2,0],
sm950=[0,-4,0,-1,-1,-2,0,-7,1182,1182,-2,1182,-19,1182,1182,1182],
sm951=[0,-1,1183,-2,0,-1,-1,-2,0],
sm952=[0,-4,0,-1,-1,-2,0,-7,1184,1184,-2,1184,-19,1184,1184,1184],
sm953=[0,-4,1112,-1,-1,-2,0,-3,1113,-7,1185],
sm954=[0,-1,1129,-2,0,-1,-1,-2,0,-21,1130,1131,-83,1186],
sm955=[0,-1,1187,-2,0,-1,-1,-2,0,-21,1187,1187,-83,1187],
sm956=[0,-4,0,-1,-1,-2,0,-13,1188,1189],
sm957=[0,-4,0,-1,-1,-2,0,-13,1190,1190],
sm958=[0,-4,0,-1,-1,-2,0,-13,1191,1191],
sm959=[0,-4,0,-1,-1,-2,0,-35,1192],
sm960=[0,-4,0,-1,-1,-2,0,-106,1193],
sm961=[0,-4,0,-1,-1,-2,0,-11,1194,-2,1194,-8,1194,1194],
sm962=[0,-4,0,-1,-1,-2,0,-11,1195,-2,1195,-8,1195,1195],
sm963=[0,-4,0,-1,-1,-2,0,-11,1196,-2,1196,-8,1196,1196],
sm964=[0,-4,0,-1,-1,-2,0,-11,1197,-2,1197,-8,1197,1197],
sm965=[0,-4,0,-1,-1,-2,0,-11,1198],
sm966=[0,-2,1199,-1,0,-1,-1,-2,0,-5,1199,-8,1199,-3,1199,-27,1199,1199,1199,1199,-1,1199,-9,1199,-44,1199],
sm967=[0,-2,1200,-1,0,-1,-1,-2,0,-11,1200,-6,1200,-39,1200,-47,1200],
sm968=[0,-2,1062,-1,1063,-1,-1,-2,0,-3,1064,-6,1065,1201,-6,1201,-39,1201,-47,1201,-32,1201],
sm969=[0,-4,0,-1,-1,-2,0,-60,1202],
sm970=[0,-2,1203,-1,1203,-1,-1,-2,0,-3,1203,-6,1203,1203,-6,1203,-39,1203,-47,1203,-32,1203],
sm971=[0,-2,1062,-1,1063,-1,-1,-2,0,-3,1064,-6,1065,1204],
sm972=[0,-4,0,-1,-1,-2,0,-52,1205],
sm973=[0,-2,1206,-1,0,-1,-1,-2,0,-7,1206,-3,1206,-1,1206,1206,-27,1206,1206,1206,-1,1206,1206,1206,1206,-1,1206,-9,1206],
sm974=[0,-4,0,-1,-1,-2,0,-52,1207],
sm975=[0,-2,1208,-1,0,-1,-1,-2,0,-7,1208,-3,1208,-1,1208,1208,-27,1208,1208,1208,-1,1208,1208,1208,1208,-1,1208,-9,1208],
sm976=[0,-1,1209,1209,-1,1209,1209,1209,1209,1209,0,-5,1209,-1,1209,1209,1209,1209,-131,1209,1209],
sm977=[0,-2,1210,-1,0,-1,-1,-2,0,-5,1210,-7,1029,1210,-3,1210,-27,1210,1210,1210,1210,-1,1210,-6,1210,-2,1210],
sm978=[0,-4,0,-1,-1,-2,0,-11,1211],
sm979=[0,-4,0,-1,-1,-2,0,-11,1212],
sm980=[0,-4,0,-1,-1,-2,0,-10,1042,-50,958],
sm981=[0,-2,1213,-1,0,-1,-1,-2,0,-5,1213,-4,1213,-3,1213,-2,1213,1213,-6,1213,-2,1213,-17,1213,1213,1213,1213,-1,1213,-6,1213,-2,1213],
sm982=[0,-4,0,-1,-1,-2,0,-58,1214],
sm983=[0,-2,1215,-1,0,-1,-1,-2,0,-14,1215,-31,1215,1215,1215,1215,-1,1215,-9,1215,-44,1215],
sm984=[0,-2,1216,-1,0,-1,-1,-2,0,-5,1216,-5,1216,-1,1216,1216,-3,1216,-4,1216,1216,-21,1216,1216,1216,1216,-1,1216,-6,1216,-2,1216],
sm985=[0,-4,1217,-1,-1,-2,0,-3,1217,-7,1217],
sm986=[0,-4,0,-1,-1,-2,0,-11,1218],
sm987=[0,-4,0,-1,-1,-2,0,-11,1123],
sm988=[0,-4,0,-1,-1,-2,0,-11,1114],
sm989=[0,-4,0,-1,-1,-2,0,-11,1219],
sm990=[0,-4,0,-1,-1,-2,0,-7,1117,-24,1120],
sm991=[0,-4,0,-1,-1,-2,0,-8,1118,-22,1119],
sm992=[0,-4,0,-1,-1,-2,0,-7,1220,1220,-2,1220,-19,1220,1220,1220],
sm993=[0,-4,0,-1,-1,-2,0,-58,1221],
sm994=[0,-1,1222,-2,0,-1,-1,-2,0,-21,1222,1222,-83,1222],
sm995=[0,-4,0,-1,-1,-2,0,-13,1223,1223],
sm996=[0,-4,0,-1,-1,-2,0,-58,1224],
sm997=[0,-4,0,-1,-1,-2,0,-11,1225,-2,1225,-8,1225,1225],
sm998=[0,-2,1226,-1,0,-1,-1,-2,0,-11,1226,-6,1226,-39,1226,-47,1226],
sm999=[0,-2,1227,-1,1227,-1,-1,-2,0,-3,1227,-6,1227,1227,-6,1227,-39,1227,-47,1227,-32,1227],
sm1000=[0,-2,1228,-1,0,-1,-1,-2,0,-7,1228,-3,1228,-1,1228,1228,-27,1228,1228,1228,-1,1228,1228,1228,1228,-1,1228,-9,1228],
sm1001=[0,-2,1229,-1,0,-1,-1,-2,0,-5,1229,-4,1229,-3,1229,-3,1229,-6,1229,-2,1229,-17,1229,1229,1229,1229,-1,1229,-6,1229,-2,1229],
sm1002=[0,-2,780,-1,0,-1,-1,-2,0,-18,783,-39,1230,-47,1231],
sm1003=[0,-4,0,-1,-1,-2,0,-13,1232,1232],
sm1004=[0,-4,0,-1,-1,-2,0,-11,1233],
sm1005=[0,-4,0,-1,-1,-2,0,-106,1234],
sm1006=[0,-1,1235,-2,0,-1,-1,-2,0,-21,1235,1235,-83,1235],
sm1007=[0,-1,1236,-2,0,-1,-1,-2,0,-21,1236,1236,-83,1236],

    // Symbol Lookup map
    lu = new Map([[1,1],[2,2],[4,3],[8,4],[16,5],[32,6],[64,7],[128,8],[256,9],[512,10],[3,11],[264,11],[200,13],[201,14],["</",15],["import",16],[">",17],["<",18],["/",19],["(",20],[")",21],[null,6],[",",23],["{",24],[";",68],["}",116],["supports",27],["@",28],["keyframes",29],["id",30],["from",31],["to",32],["and",33],["or",34],["not",35],["media",37],["only",38],[":",71],["<=",41],[">=",42],["=",43],["%",45],["px",46],["in",47],["rad",48],["url",49],["\"",152],["'",153],["+",52],["~",53],["||",54],["*",56],["|",57],["#",58],[".",59],["[",61],["]",62],["^=",63],["$=",64],["*=",65],["i",66],["s",67],["!",149],["important",70],["-",144],["_",74],["as",76],["export",77],["default",78],["if",80],["else",81],["var",82],["do",83],["while",84],["for",85],["await",86],["of",87],["continue",88],["break",89],["return",90],["throw",91],["with",92],["switch",93],["case",94],["try",95],["catch",96],["finally",97],["debugger",98],["let",99],["const",100],["function",101],["=>",102],["async",103],["class",104],["extends",105],["static",106],["get",107],["set",108],["new",109],["super",110],["target",111],["...",112],["this",113],["`",114],["${",115],["/=",122],["%=",123],["+=",124],["-=",125],["<<=",126],[">>=",127],[">>>=",128],["&=",129],["|=",130],["**=",131],["?",132],["&&",133],["^",134],["&",135],["==",136],["!=",137],["===",138],["!==",139],["instanceof",140],["<<",141],[">>",142],[">>>",143],["**",145],["delete",146],["void",147],["typeof",148],["++",150],["--",151],["null",154],["true",155],["false",156],["$",157],["f",158],["filter",159],["input",160],["area",161],["base",162],["br",163],["col",164],["command",165],["embed",166],["hr",167],["img",168],["keygen",169],["link",170],["meta",171],["param",172],["source",173],["track",174],["wbr",175],["style",176],["script",177],["js",178]]),

    // States 
    state = [sm0,
sm1,
sm2,
sm2,
sm3,
sm4,
sm5,
sm6,
sm7,
sm8,
sm9,
sm10,
sm11,
sm12,
sm13,
sm14,
sm15,
sm16,
sm16,
sm17,
sm18,
sm19,
sm20,
sm20,
sm21,
sm21,
sm21,
sm21,
sm21,
sm21,
sm21,
sm21,
sm21,
sm21,
sm21,
sm21,
sm21,
sm21,
sm22,
sm23,
sm24,
sm25,
sm26,
sm27,
sm28,
sm28,
sm29,
sm30,
sm31,
sm32,
sm33,
sm34,
sm35,
sm36,
sm37,
sm38,
sm39,
sm40,
sm41,
sm42,
sm43,
sm43,
sm43,
sm43,
sm43,
sm43,
sm43,
sm44,
sm43,
sm43,
sm45,
sm46,
sm47,
sm48,
sm49,
sm49,
sm49,
sm50,
sm51,
sm51,
sm51,
sm51,
sm52,
sm53,
sm54,
sm55,
sm56,
sm57,
sm57,
sm57,
sm58,
sm58,
sm58,
sm58,
sm59,
sm59,
sm60,
sm61,
sm62,
sm63,
sm64,
sm65,
sm65,
sm66,
sm43,
sm67,
sm68,
sm69,
sm70,
sm70,
sm43,
sm71,
sm72,
sm73,
sm74,
sm75,
sm76,
sm77,
sm77,
sm78,
sm79,
sm80,
sm81,
sm82,
sm83,
sm84,
sm85,
sm43,
sm86,
sm87,
sm88,
sm88,
sm88,
sm89,
sm90,
sm91,
sm74,
sm92,
sm93,
sm94,
sm95,
sm96,
sm97,
sm98,
sm99,
sm100,
sm101,
sm102,
sm103,
sm103,
sm104,
sm104,
sm104,
sm104,
sm104,
sm104,
sm104,
sm104,
sm104,
sm104,
sm104,
sm104,
sm104,
sm104,
sm104,
sm104,
sm105,
sm106,
sm107,
sm108,
sm109,
sm110,
sm111,
sm111,
sm112,
sm113,
sm114,
sm115,
sm116,
sm108,
sm117,
sm118,
sm118,
sm119,
sm120,
sm121,
sm122,
sm123,
sm124,
sm125,
sm43,
sm43,
sm43,
sm126,
sm127,
sm128,
sm128,
sm128,
sm128,
sm128,
sm128,
sm128,
sm128,
sm128,
sm128,
sm128,
sm128,
sm43,
sm43,
sm43,
sm43,
sm43,
sm43,
sm43,
sm43,
sm43,
sm43,
sm43,
sm43,
sm43,
sm43,
sm43,
sm43,
sm43,
sm43,
sm43,
sm43,
sm43,
sm43,
sm43,
sm43,
sm43,
sm129,
sm44,
sm130,
sm51,
sm51,
sm51,
sm51,
sm131,
sm132,
sm133,
sm89,
sm134,
sm135,
sm136,
sm137,
sm138,
sm139,
sm140,
sm141,
sm142,
sm143,
sm43,
sm144,
sm145,
sm43,
sm142,
sm146,
sm147,
sm148,
sm47,
sm149,
sm150,
sm151,
sm152,
sm153,
sm154,
sm154,
sm154,
sm154,
sm154,
sm154,
sm155,
sm155,
sm156,
sm157,
sm158,
sm159,
sm159,
sm159,
sm159,
sm159,
sm159,
sm159,
sm160,
sm157,
sm161,
sm162,
sm163,
sm164,
sm164,
sm165,
sm43,
sm166,
sm167,
sm168,
sm169,
sm170,
sm171,
sm172,
sm172,
sm172,
sm172,
sm172,
sm172,
sm172,
sm172,
sm172,
sm172,
sm172,
sm173,
sm174,
sm175,
sm74,
sm142,
sm43,
sm176,
sm177,
sm178,
sm179,
sm180,
sm181,
sm182,
sm183,
sm184,
sm185,
sm186,
sm186,
sm187,
sm188,
sm43,
sm189,
sm43,
sm190,
sm191,
sm43,
sm192,
sm193,
sm194,
sm195,
sm196,
sm197,
sm198,
sm43,
sm199,
sm200,
sm201,
sm202,
sm203,
sm204,
sm205,
sm206,
sm207,
sm208,
sm209,
sm210,
sm184,
sm184,
sm211,
sm212,
sm213,
sm214,
sm215,
sm216,
sm217,
sm218,
sm219,
sm220,
sm221,
sm222,
sm223,
sm224,
sm225,
sm226,
sm227,
sm228,
sm228,
sm228,
sm228,
sm229,
sm229,
sm230,
sm231,
sm232,
sm233,
sm142,
sm234,
sm235,
sm236,
sm237,
sm238,
sm239,
sm240,
sm241,
sm242,
sm243,
sm244,
sm244,
sm244,
sm245,
sm246,
sm247,
sm248,
sm249,
sm250,
sm251,
sm252,
sm253,
sm254,
sm254,
sm255,
sm256,
sm257,
sm258,
sm259,
sm260,
sm261,
sm261,
sm261,
sm261,
sm262,
sm262,
sm262,
sm262,
sm263,
sm264,
sm265,
sm266,
sm267,
sm268,
sm269,
sm270,
sm271,
sm272,
sm273,
sm274,
sm275,
sm276,
sm277,
sm278,
sm279,
sm278,
sm43,
sm280,
sm281,
sm282,
sm282,
sm283,
sm283,
sm284,
sm284,
sm43,
sm285,
sm286,
sm202,
sm287,
sm288,
sm289,
sm290,
sm291,
sm292,
sm293,
sm294,
sm295,
sm43,
sm296,
sm297,
sm298,
sm299,
sm300,
sm301,
sm302,
sm303,
sm302,
sm304,
sm305,
sm306,
sm307,
sm308,
sm308,
sm309,
sm310,
sm311,
sm312,
sm313,
sm314,
sm315,
sm173,
sm316,
sm43,
sm317,
sm318,
sm319,
sm320,
sm321,
sm322,
sm323,
sm324,
sm23,
sm325,
sm326,
sm326,
sm327,
sm74,
sm328,
sm43,
sm328,
sm329,
sm330,
sm331,
sm142,
sm332,
sm333,
sm334,
sm335,
sm336,
sm337,
sm338,
sm339,
sm74,
sm340,
sm341,
sm342,
sm343,
sm344,
sm345,
sm346,
sm347,
sm348,
sm349,
sm350,
sm351,
sm74,
sm352,
sm74,
sm353,
sm354,
sm355,
sm356,
sm357,
sm358,
sm359,
sm360,
sm361,
sm362,
sm363,
sm86,
sm364,
sm365,
sm366,
sm367,
sm368,
sm369,
sm370,
sm371,
sm370,
sm372,
sm373,
sm374,
sm375,
sm376,
sm377,
sm378,
sm379,
sm380,
sm381,
sm382,
sm383,
sm74,
sm384,
sm384,
sm385,
sm386,
sm387,
sm388,
sm389,
sm390,
sm391,
sm392,
sm393,
sm394,
sm393,
sm395,
sm396,
sm397,
sm398,
sm399,
sm400,
sm401,
sm402,
sm402,
sm403,
sm404,
sm405,
sm405,
sm406,
sm407,
sm408,
sm408,
sm408,
sm408,
sm408,
sm408,
sm408,
sm409,
sm410,
sm411,
sm412,
sm409,
sm413,
sm414,
sm415,
sm416,
sm417,
sm417,
sm418,
sm419,
sm420,
sm421,
sm142,
sm422,
sm423,
sm424,
sm425,
sm426,
sm142,
sm43,
sm427,
sm428,
sm429,
sm430,
sm431,
sm43,
sm432,
sm433,
sm434,
sm435,
sm436,
sm437,
sm438,
sm439,
sm440,
sm441,
sm442,
sm443,
sm444,
sm445,
sm446,
sm447,
sm448,
sm448,
sm449,
sm450,
sm43,
sm451,
sm452,
sm453,
sm454,
sm455,
sm74,
sm456,
sm456,
sm457,
sm458,
sm459,
sm460,
sm461,
sm462,
sm462,
sm463,
sm464,
sm74,
sm465,
sm466,
sm467,
sm468,
sm467,
sm467,
sm469,
sm470,
sm470,
sm471,
sm78,
sm43,
sm78,
sm472,
sm473,
sm474,
sm43,
sm43,
sm475,
sm476,
sm477,
sm478,
sm479,
sm480,
sm481,
sm480,
sm480,
sm482,
sm483,
sm74,
sm74,
sm484,
sm78,
sm485,
sm74,
sm486,
sm487,
sm488,
sm489,
sm490,
sm491,
sm492,
sm493,
sm494,
sm495,
sm496,
sm497,
sm498,
sm499,
sm500,
sm501,
sm502,
sm503,
sm504,
sm505,
sm505,
sm505,
sm506,
sm507,
sm507,
sm508,
sm398,
sm509,
sm398,
sm510,
sm511,
sm512,
sm513,
sm514,
sm515,
sm516,
sm412,
sm509,
sm517,
sm518,
sm519,
sm520,
sm521,
sm522,
sm523,
sm524,
sm525,
sm526,
sm527,
sm528,
sm529,
sm530,
sm531,
sm74,
sm532,
sm533,
sm534,
sm535,
sm536,
sm537,
sm538,
sm539,
sm540,
sm541,
sm542,
sm543,
sm544,
sm545,
sm546,
sm547,
sm548,
sm549,
sm550,
sm550,
sm551,
sm552,
sm553,
sm554,
sm555,
sm556,
sm557,
sm558,
sm559,
sm560,
sm78,
sm561,
sm562,
sm563,
sm564,
sm78,
sm43,
sm565,
sm565,
sm566,
sm567,
sm568,
sm569,
sm570,
sm570,
sm571,
sm572,
sm573,
sm574,
sm575,
sm576,
sm577,
sm578,
sm579,
sm580,
sm581,
sm582,
sm583,
sm584,
sm585,
sm586,
sm587,
sm587,
sm587,
sm587,
sm587,
sm587,
sm587,
sm588,
sm398,
sm589,
sm590,
sm591,
sm592,
sm593,
sm594,
sm595,
sm596,
sm597,
sm598,
sm599,
sm600,
sm601,
sm602,
sm603,
sm604,
sm605,
sm606,
sm607,
sm608,
sm609,
sm610,
sm611,
sm612,
sm612,
sm613,
sm614,
sm615,
sm614,
sm78,
sm616,
sm617,
sm618,
sm78,
sm619,
sm78,
sm78,
sm620,
sm78,
sm78,
sm621,
sm78,
sm78,
sm622,
sm623,
sm624,
sm625,
sm626,
sm627,
sm43,
sm628,
sm86,
sm629,
sm630,
sm631,
sm632,
sm633,
sm634,
sm635,
sm636,
sm637,
sm636,
sm638,
sm639,
sm640,
sm641,
sm642,
sm643,
sm644,
sm645,
sm646,
sm647,
sm648,
sm649,
sm650,
sm651,
sm651,
sm652,
sm653,
sm654,
sm655,
sm656,
sm656,
sm657,
sm658,
sm659,
sm660,
sm661,
sm662,
sm663,
sm664,
sm665,
sm666,
sm667,
sm667,
sm667,
sm667,
sm668,
sm668,
sm669,
sm670,
sm671,
sm672,
sm673,
sm674,
sm675,
sm676,
sm677,
sm678,
sm679,
sm680,
sm681,
sm682,
sm683,
sm684,
sm685,
sm686,
sm687,
sm688,
sm689,
sm690,
sm691,
sm692,
sm693,
sm694,
sm695,
sm696,
sm697,
sm698,
sm699,
sm700,
sm701,
sm702,
sm78,
sm78,
sm703,
sm78,
sm704,
sm705,
sm706,
sm707,
sm78,
sm708,
sm709,
sm78,
sm710,
sm711,
sm712,
sm713,
sm711,
sm714,
sm715,
sm716,
sm717,
sm718,
sm719,
sm720,
sm721,
sm722,
sm723,
sm724,
sm725,
sm726,
sm727,
sm728,
sm729,
sm730,
sm731,
sm732,
sm733,
sm734,
sm653,
sm735,
sm736,
sm737,
sm738,
sm739,
sm740,
sm741,
sm742,
sm743,
sm735,
sm744,
sm745,
sm745,
sm745,
sm745,
sm746,
sm747,
sm747,
sm748,
sm749,
sm750,
sm751,
sm752,
sm753,
sm754,
sm755,
sm756,
sm757,
sm757,
sm757,
sm758,
sm758,
sm759,
sm760,
sm761,
sm668,
sm762,
sm763,
sm764,
sm668,
sm765,
sm766,
sm730,
sm730,
sm730,
sm767,
sm768,
sm769,
sm770,
sm771,
sm772,
sm773,
sm774,
sm775,
sm776,
sm777,
sm778,
sm779,
sm780,
sm781,
sm782,
sm783,
sm784,
sm785,
sm786,
sm787,
sm788,
sm78,
sm789,
sm790,
sm791,
sm792,
sm793,
sm794,
sm795,
sm795,
sm796,
sm797,
sm798,
sm799,
sm800,
sm801,
sm802,
sm803,
sm804,
sm805,
sm806,
sm806,
sm807,
sm807,
sm808,
sm809,
sm810,
sm811,
sm668,
sm812,
sm813,
sm813,
sm814,
sm814,
sm815,
sm816,
sm817,
sm818,
sm818,
sm819,
sm820,
sm821,
sm822,
sm822,
sm823,
sm824,
sm825,
sm734,
sm826,
sm826,
sm827,
sm827,
sm828,
sm829,
sm830,
sm831,
sm832,
sm833,
sm834,
sm835,
sm836,
sm837,
sm838,
sm839,
sm840,
sm841,
sm842,
sm843,
sm844,
sm845,
sm846,
sm846,
sm846,
sm846,
sm847,
sm735,
sm848,
sm849,
sm850,
sm851,
sm802,
sm852,
sm853,
sm854,
sm802,
sm855,
sm856,
sm857,
sm858,
sm859,
sm860,
sm861,
sm862,
sm863,
sm864,
sm865,
sm866,
sm867,
sm868,
sm869,
sm870,
sm871,
sm872,
sm873,
sm874,
sm875,
sm876,
sm877,
sm878,
sm732,
sm879,
sm880,
sm881,
sm882,
sm883,
sm884,
sm885,
sm816,
sm886,
sm816,
sm887,
sm888,
sm889,
sm890,
sm816,
sm891,
sm891,
sm891,
sm892,
sm893,
sm894,
sm895,
sm895,
sm896,
sm897,
sm878,
sm898,
sm899,
sm900,
sm824,
sm901,
sm901,
sm902,
sm903,
sm904,
sm735,
sm905,
sm906,
sm907,
sm908,
sm909,
sm910,
sm911,
sm837,
sm912,
sm913,
sm913,
sm913,
sm914,
sm915,
sm915,
sm916,
sm917,
sm918,
sm868,
sm869,
sm919,
sm868,
sm869,
sm920,
sm921,
sm922,
sm923,
sm924,
sm925,
sm926,
sm926,
sm734,
sm927,
sm927,
sm928,
sm929,
sm930,
sm931,
sm932,
sm933,
sm934,
sm935,
sm936,
sm937,
sm938,
sm939,
sm940,
sm941,
sm942,
sm943,
sm944,
sm945,
sm945,
sm946,
sm946,
sm947,
sm947,
sm947,
sm948,
sm948,
sm949,
sm949,
sm668,
sm668,
sm668,
sm950,
sm951,
sm952,
sm952,
sm952,
sm953,
sm943,
sm954,
sm955,
sm956,
sm957,
sm958,
sm958,
sm958,
sm959,
sm960,
sm961,
sm962,
sm963,
sm964,
sm965,
sm966,
sm967,
sm968,
sm969,
sm970,
sm971,
sm972,
sm973,
sm974,
sm974,
sm975,
sm924,
sm924,
sm976,
sm977,
sm978,
sm979,
sm979,
sm980,
sm981,
sm982,
sm983,
sm984,
sm985,
sm986,
sm987,
sm988,
sm989,
sm989,
sm990,
sm991,
sm992,
sm984,
sm993,
sm994,
sm653,
sm897,
sm995,
sm996,
sm997,
sm998,
sm999,
sm1000,
sm1001,
sm946,
sm946,
sm1002,
sm1003,
sm1004,
sm1004,
sm1005,
sm1006,
sm1007],

/************ Functions *************/

    max = Math.max, //Error Functions
    e$1 = (...d)=>fn.defaultError(...d), 
    eh = [e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1,
e$1],

    //Empty Function
    nf = ()=>-1, 

    //Environment Functions
    
redv = (ret, fn, plen, ln, t, e, o, l, s) => {        ln = max(o.length - plen, 0);        const slice = o.slice(-plen);        o.length = ln + 1;        o[ln] = fn(slice, e, l, s, o, plen);        return ret;    },
rednv = (ret, Fn, plen, ln, t, e, o, l, s) => {        ln = max(o.length - plen, 0);        const slice = o.slice(-plen);        o.length = ln + 1;        o[ln] = new Fn(slice, e, l, s, o, plen);        return ret;    },
redn = (ret, plen, t, e, o) => {        if (plen > 0) {            let ln = max(o.length - plen, 0);            o[ln] = o[o.length - 1];            o.length = ln + 1;        }        return ret;    },
shftf = (ret, fn, t, e, o, l, s) => (fn(o, e, l, s), ret),
R00_S=sym=>sym[0],
R30_undefined501_group_list=sym=>(((sym[1] !== null) ? sym[0].push(sym[1]) : null,sym[0])),
R31_undefined501_group_list=sym=>(sym[0] !== null) ? [sym[0]] : [],
R50_IMPORT_TAG=(sym,env,lex)=>fn.element_selector(sym[1],sym[2],null,env,lex),
R51_IMPORT_TAG=(sym,env,lex)=>fn.element_selector(sym[1],null,null,env,lex),
R70_BASIC_BINDING=(sym,env,lex)=>(((env.off = lex.off,new fn.wick_binding(sym[2],null,env,lex)))),
I71_BASIC_BINDING=function (sym,env,lex){env.start = lex.off + 2;},
R72_BASIC_BINDING=(sym,env,lex)=>(((env.off = lex.off,new fn.wick_binding(null,null,env,lex)))),
R80_CALL_BINDING=(sym,env,lex)=>(((env.off = lex.off,new fn.wick_binding(sym[2],sym[5],env,lex)))),
R81_CALL_BINDING=(sym,env,lex)=>(((env.off = lex.off,new fn.wick_binding(null,sym[4],env,lex)))),
R140_css_STYLE_SHEET=sym=>new fn.ruleset(sym[0],sym[1]),
R141_css_STYLE_SHEET=sym=>new fn.ruleset(null,sym[0]),
R142_css_STYLE_SHEET=sym=>new fn.ruleset(sym[0],null),
R150_css_COMPLEX_SELECTOR_list=sym=>(((sym[1] !== null) ? sym[0].push(sym[2]) : null,sym[0])),
R160_css_STYLE_RULE=sym=>new fn.stylerule(sym[0],sym[2]),
R161_css_STYLE_RULE=sym=>new fn.stylerule(null,sym[1]),
C270_css_keyframes=function (sym){this.keyframes = sym[4];},
C300_css_keyframes_blocks=function (sym){this.selectors = sym[0];this.props = sym[2].props;},
R590_css_undefined6202_group_list=sym=>sym[0] + sym[1],
R591_css_undefined6202_group_list=sym=>sym[0] + "",
R880_css_TYPE_SELECTOR=sym=>new fn.type_selector([sym[0],sym[1]]),
R881_css_TYPE_SELECTOR=sym=>new fn.type_selector([sym[0]]),
R910_css_WQ_NAME=sym=>[sym[0],sym[1]],
R911_css_WQ_NAME=sym=>[sym[0]],
R1050_css_declaration_list=sym=>((sym[0].push(sym[1]),sym[0])),
R1051_css_declaration_list=sym=>((sym[0].push(...sym[1]),sym[0])),
R1100_css_declaration_values=sym=>sym.join(""),
I1160_js_javascript=function (sym,env){env.IS_MODULE = false;},
R1170_js_start=(sym,env)=>(env.IS_MODULE) ? new fn.module(sym[0]) : new fn.script(sym[0]),
I1220_js_module_item=function (sym,env){env.IS_MODULE = true;},
R1230_js_import_declaration=sym=>new fn.import_declaration(sym[2],sym[1]),
R1231_js_import_declaration=sym=>new fn.import_declaration(sym[1]),
R1240_js_import_clause=sym=>[sym[0],sym[2]],
R1290_js_named_imports=sym=>new fn.named_imports(sym[1]),
R1291_js_named_imports=()=>new fn.named_imports(null),
R1300_js_from_clause=sym=>sym[1],
R1310_js_import_specifier=sym=>new fn.import_specifier(sym[0]),
R1311_js_import_specifier=sym=>new fn.import_specifier(sym[0],sym[2]),
R1340_js_export_declaration=sym=>new fn.export_declaration(null,sym[2],false),
R1341_js_export_declaration=sym=>new fn.export_declaration(sym[1],sym[2],false),
R1342_js_export_declaration=sym=>new fn.export_declaration(sym[1],null,false),
R1343_js_export_declaration=sym=>new fn.export_declaration(sym[2],null,true),
R1370_js_export_clause=sym=>new fn.export_clause(sym[1]),
R1371_js_export_clause=()=>new fn.export_clause(null),
R1380_js_export_specifier=sym=>new fn.export_specifier(sym[0]),
R1381_js_export_specifier=sym=>new fn.export_specifier(sym[0],sym[2]),
R1560_js_iteration_statement=sym=>(new fn.for_statement(sym[2],sym[4],sym[6],sym[8])),
I1561_js_iteration_statement=function (sym,env){env.ASI = false;},
I1562_js_iteration_statement=function (sym,env){env.ASI = true;},
R1563_js_iteration_statement=sym=>(new fn.for_statement(sym[2],sym[3],sym[5],sym[7])),
R1564_js_iteration_statement=sym=>(new fn.for_in_statement(sym[2],sym[4],sym[6])),
R1565_js_iteration_statement=sym=>(new fn.for_of_statement(sym[1],sym[3],sym[5],sym[7])),
R1566_js_iteration_statement=sym=>(new fn.for_statement(null,sym[3],sym[5],sym[7])),
R1567_js_iteration_statement=sym=>(new fn.for_statement(sym[2],null,sym[5],sym[7])),
R1568_js_iteration_statement=sym=>(new fn.for_statement(sym[2],sym[4],null,sym[7])),
R1569_js_iteration_statement=sym=>(new fn.for_statement(sym[2],null,sym[4],sym[6])),
R15610_js_iteration_statement=sym=>(new fn.for_statement(sym[2],sym[3],null,sym[6])),
R15611_js_iteration_statement=sym=>(new fn.for_of_statement(null,sym[2],sym[4],sym[6])),
R15612_js_iteration_statement=sym=>(new fn.for_statement(null,null,sym[4],sym[6])),
R15613_js_iteration_statement=sym=>(new fn.for_statement(null,sym[3],null,sym[6])),
R15614_js_iteration_statement=sym=>(new fn.for_statement(sym[2],null,null,sym[6])),
R15615_js_iteration_statement=sym=>(new fn.for_statement(sym[2],null,null,sym[5])),
R15616_js_iteration_statement=sym=>(new fn.for_statement(null,null,null,sym[5])),
R1590_js_continue_statement=sym=>(new fn.continue_statement(sym[1])),
R1591_js_continue_statement=()=>(new fn.continue_statement(null)),
R1600_js_break_statement=sym=>(new fn.break_statement(sym[1])),
R1601_js_break_statement=()=>(new fn.break_statement(null)),
R1610_js_return_statement=sym=>new fn.return_statement(sym[1]),
R1611_js_return_statement=()=>new fn.return_statement(null),
R1620_js_throw_statement=sym=>new fn.throw_statement(sym[1]),
R1630_js_with_statement=sym=>new fn.with_statement(sym[2],sym[4]),
R1640_js_switch_statement=sym=>new fn.switch_statement(sym[2],sym[4]),
R1650_js_case_block=()=>[],
R1651_js_case_block=sym=>sym[1].concat(sym[2].concat(sym[3])),
R1652_js_case_block=sym=>sym[1].concat(sym[2]),
R1660_js_case_clauses=sym=>sym[0].concat(sym[1]),
R1670_js_case_clause=sym=>(new fn.case_statement(sym[1],sym[3])),
R1671_js_case_clause=sym=>(new fn.case_statement(sym[1],null)),
R1680_js_default_clause=sym=>(new fn.default_case_statement(sym[2])),
R1681_js_default_clause=()=>(new fn.default_case_statement(null)),
R1720_js_try_statement=sym=>(new fn.try_statement(sym[1],sym[2])),
R1721_js_try_statement=sym=>(new fn.try_statement(sym[1],null,sym[2])),
R1722_js_try_statement=sym=>(new fn.try_statement(sym[1],sym[2],sym[3])),
R1780_js_variable_declaration_list=sym=>((sym[0].push(sym[2]),sym[0])),
R1810_js_let_or_const=()=>"let",
R1811_js_let_or_const=()=>"const",
R1840_js_function_expression=sym=>new fn.function_declaration(sym[1],sym[3],sym[6]),
R1841_js_function_expression=sym=>new fn.function_declaration(null,sym[2],sym[5]),
R1842_js_function_expression=sym=>new fn.function_declaration(sym[1],null,sym[5]),
R1843_js_function_expression=sym=>new fn.function_declaration(sym[1],sym[3],null),
R1844_js_function_expression=sym=>new fn.function_declaration(null,null,sym[4]),
R1845_js_function_expression=sym=>new fn.function_declaration(null,sym[2],null),
R1846_js_function_expression=sym=>new fn.function_declaration(sym[1],null,null),
R1847_js_function_expression=()=>new fn.function_declaration(null,null,null),
R1870_js_formal_parameters=sym=>new fn.parenthasized(sym[0]),
R1871_js_formal_parameters=sym=>new fn.parenthasized(...sym[0]),
R1872_js_formal_parameters=sym=>new fn.parenthasized(...sym[0],sym[2]),
R1930_js_arrow_function=sym=>new fn.arrow_function_declaration(null,sym[0],sym[2]),
R2000_js_class_declaration=sym=>new fn.class_declaration(sym[1],sym[2].h,sym[2].t),
R2001_js_class_declaration=sym=>new fn.class_declaration(null,sym[1].h,sym[1].t),
R2020_js_class_tail=sym=>({h : sym[0],t : sym[2]}),
R2021_js_class_tail=sym=>({h : null,t : sym[1]}),
R2022_js_class_tail=sym=>({h : sym[0],t : null}),
R2023_js_class_tail=()=>({h : null,t : null}),
R2060_js_class_element=sym=>(((sym[1].static = true,sym[1]))),
R2070_js_method_definition=sym=>new fn.class_method(sym[0],sym[2],sym[5]),
R2071_js_method_definition=sym=>new fn.class_method(sym[1],null,sym[5],"get"),
R2072_js_method_definition=sym=>new fn.class_method(sym[1],sym[3],sym[6],"set"),
R2073_js_method_definition=sym=>new fn.class_method(sym[0],null,sym[4]),
R2074_js_method_definition=sym=>new fn.class_method(sym[0],sym[2],null),
R2075_js_method_definition=sym=>new fn.class_method(sym[1],null,null,"get"),
R2076_js_method_definition=sym=>new fn.class_method(sym[1],sym[3],null,"set"),
R2077_js_method_definition=sym=>new fn.class_method(sym[0],null,null),
R2130_js_new_expression=sym=>new fn.new_expression(sym[1],null),
R2140_js_member_expression=sym=>new fn.member_expression(sym[0],sym[2],true),
R2141_js_member_expression=sym=>new fn.member_expression(sym[0],sym[2],false),
R2142_js_member_expression=sym=>new fn.member_expression(sym[0],sym[1],false),
R2143_js_member_expression=sym=>new fn.new_expression(sym[1],sym[2]),
R2150_js_super_property=sym=>new fn.member_expression(new fn.super_literal(),sym[2],true),
R2151_js_super_property=sym=>new fn.member_expression(new fn.super_literal(),sym[2],false),
R2180_js_call_expression=sym=>new fn.member_expression(sym[0],sym[1],true),
R2190_js_super_call=sym=>new fn.call_expression([new fn.super_literal(),sym[1]]),
R2200_js_arguments=sym=>new fn.parenthasized(...sym[1]),
R2201_js_arguments=()=>new fn.parenthasized(),
R2240_js_primary_expression=sym=>new fn.js_wick_node(sym[0]),
R2260_js_no_substitute_template=sym=>new fn.template(sym[1]),
R2261_js_no_substitute_template=()=>new fn.template(null),
R2270_js_substitute_template=sym=>((sym[0].vals[1] = sym[1],sym[2].unshift(sym[0]),new fn.template(sym[2]))),
R2280_js_template_spans=sym=>((sym[0].vals[1] = sym[1],sym[0])),
R2290_js_template_middle_list=sym=>((sym[1].vals[1] = sym[2],sym[0].push(sym[1]),sym[0])),
R2300_js_template_head=sym=>new fn.template_head(sym[1]),
R2301_js_template_head=()=>new fn.template_head(null),
R2310_js_template_middle=sym=>new fn.template_middle(sym[1]),
R2311_js_template_middle=()=>new fn.template_middle(null),
R2320_js_template_tail=sym=>new fn.template_tail(sym[1]),
R2321_js_template_tail=()=>new fn.template_tail(null),
R2370_js_object_literal=sym=>new fn.object_literal(sym[1]),
R2371_js_object_literal=()=>new fn.object_literal(null),
R2440_js_array_literal=sym=>new fn.array_literal(sym[1]),
R2441_js_array_literal=()=>new fn.array_literal(null),
R2450_js_element_list=sym=>[sym[1]],
R2451_js_element_list=sym=>(((sym[0].push(sym[2]),sym[0]))),
R2650_js_cover_parenthesized_expression_and_arrow_parameter_list=()=>null,
R2651_js_cover_parenthesized_expression_and_arrow_parameter_list=sym=>new fn.parenthasized(sym[1]),
R2652_js_cover_parenthesized_expression_and_arrow_parameter_list=sym=>new fn.parenthasized(new fn.spread_element(sym.slice(1,3))),
R2653_js_cover_parenthesized_expression_and_arrow_parameter_list=sym=>new fn.parenthasized(sym$2,new fn.spread_element(sym.slice(3,5))),
R2960_html_BODY=sym=>((sym[1].import_list = sym[0],sym[1])),
R2980_html_TAG=(sym,env,lex)=>fn.element_selector(sym[1],sym[2],sym[4],env,lex),
R2981_html_TAG=(sym,env,lex)=>fn.element_selector(sym[1],sym[2],sym[3],env,lex),
R2982_html_TAG=(sym,env,lex)=>fn.element_selector(sym[1],null,sym[3],env,lex),
R2983_html_TAG=(sym,env,lex)=>fn.element_selector(sym[1],null,sym[2],env,lex),

    //Sparse Map Lookup
    lsm = (index, map) => {    if (map[0] == 0xFFFFFFFF) return map[index + 1];    for (let i = 1, ind = 0, l = map.length, n = 0; i < l && ind <= index; i++) {        if (ind !== index) {            if ((n = map[i]) > -1) ind++;            else ind += -n;        } else return map[i];    }    return -1;},

    //State Action Functions
    state_funct = [e=>398,
e=>354,
e=>82,
e=>38,
e=>422,
e=>158,
e=>254,
e=>262,
e=>402,
e=>462,
e=>358,
e=>86,
e=>466,
e=>458,
e=>478,
e=>482,
e=>486,
e=>442,
e=>494,
e=>498,
e=>502,
e=>510,
e=>506,
e=>490,
e=>514,
e=>518,
e=>550,
e=>554,
e=>542,
e=>534,
e=>294,
e=>426,
e=>310,
e=>414,
e=>258,
e=>242,
e=>246,
e=>250,
e=>266,
e=>274,
e=>278,
e=>390,
e=>394,
e=>386,
e=>378,
e=>382,
e=>350,
(...v)=>redv(5,R00_S,1,0),
(...v)=>redn(1031,1),
(...v)=>redn(302087,1),
(...v)=>redn(303111,1),
(...v)=>redv(3079,R31_undefined501_group_list,1,0),
(...v)=>redn(2055,1),
e=>590,
e=>570,
e=>594,
e=>598,
e=>602,
e=>606,
e=>610,
e=>614,
e=>618,
e=>622,
e=>626,
e=>630,
e=>634,
e=>638,
e=>642,
e=>646,
e=>650,
e=>654,
e=>658,
e=>662,
(...v)=>redn(304135,1),
(...v)=>redv(229383,R2240_js_primary_expression,1,0),
(...v)=>(redv(118791,R00_S,1,0),shftf(118791,I1160_js_javascript)),
(...v)=>redv(119815,R1170_js_start,1,0),
(...v)=>redn(120839,1),
(...v)=>rednv(123911,fn.statements,1,0),
e=>674,
(...v)=>redv(122887,R31_undefined501_group_list,1,0),
(...v)=>redn(121863,1),
(...v)=>(redn(124935,1),shftf(124935,I1220_js_module_item)),
(...v)=>redn(124935,1),
e=>710,
e=>706,
e=>738,
e=>718,
e=>734,
(...v)=>redn(147463,1),
(...v)=>redn(148487,1),
(...v)=>redn(152583,1),
e=>758,
(...v)=>rednv(216071,fn.expression_list,1,0),
e=>762,
(...v)=>redv(215047,R31_undefined501_group_list,1,0),
(...v)=>redn(214023,1),
(...v)=>redn(253959,1),
(...v)=>redn(269319,1),
e=>766,
e=>818,
e=>782,
e=>786,
e=>790,
e=>794,
e=>798,
e=>802,
e=>806,
e=>810,
e=>814,
e=>822,
e=>826,
e=>774,
e=>778,
(...v)=>redn(256007,1),
e=>834,
e=>830,
(...v)=>redn(257031,1),
e=>838,
(...v)=>redn(258055,1),
e=>842,
(...v)=>redn(259079,1),
e=>846,
(...v)=>redn(260103,1),
e=>850,
(...v)=>redn(261127,1),
e=>854,
e=>858,
e=>862,
e=>866,
(...v)=>redn(262151,1),
e=>874,
e=>870,
e=>878,
e=>882,
e=>890,
e=>886,
(...v)=>redn(263175,1),
e=>894,
e=>898,
e=>902,
(...v)=>redn(264199,1),
e=>906,
e=>910,
(...v)=>redn(265223,1),
e=>918,
e=>922,
e=>914,
(...v)=>redn(266247,1),
(...v)=>redn(267271,1),
(...v)=>redn(268295,1),
e=>926,
e=>962,
e=>966,
e=>970,
(...v)=>redn(217095,1),
e=>1022,
e=>1006,
e=>1014,
(...v)=>redn(218119,1),
e=>1030,
e=>1026,
e=>1050,
e=>1054,
(...v)=>redn(219143,1),
(...v)=>rednv(229383,fn.this_literal,1,0),
(...v)=>redn(229383,1),
(...v)=>redn(198663,1),
(...v)=>redn(292871,1),
(...v)=>redn(291847,1),
(...v)=>redn(293895,1),
(...v)=>redn(294919,1),
(...v)=>rednv(295943,fn.identifier,1,0),
(...v)=>redv(301063,R00_S,1,0),
e=>1086,
e=>1082,
e=>1094,
e=>1098,
e=>1078,
e=>1070,
e=>1090,
e=>1074,
(...v)=>redn(296967,1),
(...v)=>redn(283655,1),
(...v)=>rednv(290823,fn.bool_literal,1,0),
(...v)=>rednv(289799,fn.null_literal,1,0),
e=>1126,
e=>1118,
e=>1114,
e=>1134,
e=>1138,
e=>1130,
e=>1122,
e=>1106,
e=>1146,
(...v)=>rednv(288775,fn.numeric_literal,1,0),
e=>1178,
e=>1158,
e=>1174,
(...v)=>redn(230407,1),
e=>1234,
e=>1238,
e=>1242,
e=>1206,
e=>1226,
e=>1230,
e=>1218,
e=>1222,
e=>1210,
e=>1202,
e=>1214,
e=>1186,
e=>1190,
e=>1250,
e=>1258,
e=>1262,
e=>1266,
(...v)=>redn(221191,1),
(...v)=>redn(223239,1),
e=>1278,
(...v)=>redv(198663,R1870_js_formal_parameters,1,0),
e=>1286,
e=>1318,
e=>1322,
(...v)=>rednv(154631,fn.empty_statement,1,0),
e=>1326,
(...v)=>redn(151559,1),
e=>1334,
(...v)=>shftf(1338,I1561_js_iteration_statement),
e=>1342,
e=>1346,
e=>1354,
e=>1366,
e=>1374,
e=>1378,
e=>1390,
(...v)=>redn(149511,1),
e=>1406,
e=>1410,
(...v)=>redn(150535,1),
e=>1418,
(...v)=>redv(185351,R1810_js_let_or_const,1,0),
(...v)=>redv(185351,R1811_js_let_or_const,1,0),
(...v)=>redv(303115,R2960_html_BODY,2,0),
(...v)=>redv(3083,R30_undefined501_group_list,2,0),
e=>1446,
e=>1442,
e=>1462,
e=>1458,
e=>1474,
e=>1478,
e=>1486,
e=>1490,
(...v)=>redn(314375,1),
e=>1506,
e=>1522,
e=>1526,
(...v)=>redv(319495,R00_S,1,0),
e=>1518,
e=>1514,
e=>1510,
(...v)=>redn(315399,1),
(...v)=>redn(306183,1),
(...v)=>redv(122891,R30_undefined501_group_list,2,0),
e=>1534,
e=>1538,
e=>1542,
(...v)=>redn(126983,1),
(...v)=>rednv(128007,fn.default_import,1,0),
(...v)=>redn(136199,1),
e=>1546,
e=>1554,
e=>1558,
(...v)=>redn(135175,1),
e=>1586,
(...v)=>redv(137227,R1342_js_export_declaration,2,0),
e=>1606,
e=>1610,
e=>1626,
(...v)=>rednv(146439,fn.statements,1,0),
(...v)=>redv(145415,R31_undefined501_group_list,1,0),
(...v)=>redn(144391,1),
(...v)=>rednv(155659,fn.expression_statement,2,0),
(...v)=>rednv(269323,fn.post_increment_expression,2,0),
(...v)=>rednv(269323,fn.post_decrement_expression,2,0),
(...v)=>redn(254983,1),
(...v)=>rednv(268299,fn.delete_expression,2,0),
e=>1750,
e=>1810,
e=>1786,
e=>1790,
e=>1774,
e=>1754,
e=>1818,
(...v)=>rednv(268299,fn.void_expression,2,0),
(...v)=>rednv(268299,fn.typeof_expression,2,0),
(...v)=>rednv(268299,fn.plus_expression,2,0),
(...v)=>rednv(268299,fn.negate_expression,2,0),
(...v)=>rednv(268299,fn.unary_or_expression,2,0),
(...v)=>rednv(268299,fn.unary_not_expression,2,0),
(...v)=>rednv(269323,fn.pre_increment_expression,2,0),
(...v)=>rednv(269323,fn.pre_decrement_expression,2,0),
(...v)=>rednv(223243,fn.call_expression,2,0),
(...v)=>redv(223243,R2180_js_call_expression,2,0),
e=>1846,
e=>1842,
e=>1862,
(...v)=>redv(219147,R2142_js_member_expression,2,0),
(...v)=>rednv(203787,fn.call_expression,2,0),
(...v)=>redv(218123,R2130_js_new_expression,2,0),
e=>1878,
(...v)=>redv(301067,R590_css_undefined6202_group_list,2,0),
(...v)=>redv(301067,R00_S,2,0),
(...v)=>redv(299015,R591_css_undefined6202_group_list,1,0),
(...v)=>redn(297991,1),
(...v)=>redn(300039,1),
e=>1890,
(...v)=>rednv(287755,fn.string_literal,2,0),
(...v)=>redv(286727,R591_css_undefined6202_group_list,1,0),
(...v)=>redn(284679,1),
e=>1898,
e=>1910,
e=>1906,
e=>1926,
e=>1914,
(...v)=>redv(249867,R2441_js_array_literal,2,0),
(...v)=>redv(250887,R911_css_WQ_NAME,1,0),
(...v)=>redn(251911,1),
e=>1934,
e=>1938,
(...v)=>redv(231435,R2261_js_no_substitute_template,2,0),
(...v)=>redv(235531,R2301_js_template_head,2,0),
(...v)=>redn(240647,1),
(...v)=>redv(239623,R591_css_undefined6202_group_list,1,0),
(...v)=>redn(238599,1),
e=>1958,
(...v)=>redv(271371,R2650_js_cover_parenthesized_expression_and_arrow_parameter_list,2,0),
e=>1966,
e=>1970,
(...v)=>redv(224267,R2190_js_super_call,2,0),
(...v)=>rednv(270347,fn.await_expression,2,0),
e=>1998,
(...v)=>rednv(173067,fn.label_statement,2,0),
e=>2018,
e=>2014,
(...v)=>redv(182279,R911_css_WQ_NAME,1,0),
(...v)=>rednv(183303,fn.binding,1,0),
e=>2026,
(...v)=>redn(272391,1),
e=>2046,
e=>2034,
e=>2066,
e=>2082,
e=>2106,
e=>2126,
e=>2134,
e=>2150,
e=>2158,
(...v)=>redv(162827,R1591_js_continue_statement,2,0),
e=>2162,
(...v)=>redv(163851,R1601_js_break_statement,2,0),
e=>2166,
(...v)=>redv(164875,R1611_js_return_statement,2,0),
e=>2174,
e=>2186,
e=>2190,
(...v)=>rednv(180235,fn.debugger_statement,2,0),
(...v)=>redv(204811,R2001_js_class_declaration,2,0),
e=>2198,
e=>2226,
e=>2222,
e=>2206,
e=>2242,
e=>2250,
e=>2278,
e=>2274,
(...v)=>redv(186375,R911_css_WQ_NAME,1,0),
e=>2294,
e=>2290,
e=>2302,
e=>2310,
(...v)=>redv(5135,R51_IMPORT_TAG,3,0),
(...v)=>redv(310279,R911_css_WQ_NAME,1,0),
(...v)=>rednv(311303,fn.attribute,1,0),
e=>2314,
e=>2322,
e=>2330,
(...v)=>redn(312327,1),
e=>2334,
e=>2338,
e=>2418,
e=>2394,
e=>2398,
e=>2410,
e=>2414,
e=>2406,
e=>2402,
e=>2346,
e=>2358,
e=>2386,
e=>2422,
e=>2426,
e=>2430,
(...v)=>redv(305167,R51_IMPORT_TAG,3,0),
e=>2434,
e=>2438,
(...v)=>redv(319499,R590_css_undefined6202_group_list,2,0),
(...v)=>redv(319499,R00_S,2,0),
(...v)=>redv(317447,R591_css_undefined6202_group_list,1,0),
(...v)=>redn(316423,1),
(...v)=>redn(318471,1),
e=>2450,
(...v)=>redv(125967,R1231_js_import_declaration,3,0),
e=>2470,
e=>2474,
e=>2478,
(...v)=>redv(132107,R1291_js_named_imports,2,0),
(...v)=>redv(131079,R31_undefined501_group_list,1,0),
(...v)=>redn(130055,1),
(...v)=>redv(134151,R1310_js_import_specifier,1,0),
e=>2482,
e=>2486,
e=>2490,
(...v)=>redv(137231,R1342_js_export_declaration,3,0),
(...v)=>redv(137231,R1343_js_export_declaration,3,0),
e=>2494,
e=>2498,
e=>2502,
(...v)=>redv(140299,R1371_js_export_clause,2,0),
(...v)=>redv(139271,R31_undefined501_group_list,1,0),
(...v)=>redn(138247,1),
(...v)=>redv(141319,R1380_js_export_specifier,1,0),
e=>2506,
(...v)=>rednv(153615,fn.block_statement,3,0),
(...v)=>redv(145419,R30_undefined501_group_list,2,0),
(...v)=>redv(215055,R150_css_COMPLEX_SELECTOR_list,3,0),
(...v)=>rednv(253967,fn.assignment_expression,3,0),
e=>2510,
(...v)=>rednv(257039,fn.or_expression,3,0),
(...v)=>rednv(258063,fn.and_expression,3,0),
(...v)=>rednv(259087,fn.bit_or_expression,3,0),
(...v)=>rednv(260111,fn.bit_xor_expression,3,0),
(...v)=>rednv(261135,fn.bit_and_expression,3,0),
(...v)=>rednv(262159,fn.equality_expression,3,0),
(...v)=>rednv(263183,fn.equality_expression,3,0),
(...v)=>rednv(263183,fn.instanceof_expression,3,0),
(...v)=>rednv(263183,fn.in_expression,3,0),
(...v)=>rednv(264207,fn.left_shift_expression,3,0),
(...v)=>rednv(264207,fn.right_shift_expression,3,0),
(...v)=>rednv(264207,fn.right_shift_fill_expression,3,0),
(...v)=>rednv(265231,fn.add_expression,3,0),
(...v)=>rednv(265231,fn.subtract_expression,3,0),
(...v)=>rednv(266255,fn.multiply_expression,3,0),
(...v)=>rednv(266255,fn.divide_expression,3,0),
(...v)=>rednv(266255,fn.modulo_expression,3,0),
(...v)=>rednv(267279,fn.exponent_expression,3,0),
e=>2514,
e=>2518,
e=>2522,
(...v)=>redv(242699,R2371_js_object_literal,2,0),
(...v)=>redv(241671,R31_undefined501_group_list,1,0),
(...v)=>redn(243719,1),
e=>2538,
e=>2534,
(...v)=>redn(245767,1),
(...v)=>redn(244743,1),
e=>2554,
e=>2562,
(...v)=>redv(205835,R2001_js_class_declaration,2,0),
(...v)=>redv(223247,R2141_js_member_expression,3,0),
e=>2570,
e=>2578,
e=>2574,
e=>2582,
(...v)=>redv(225291,R2201_js_arguments,2,0),
(...v)=>redn(228359,1),
e=>2586,
(...v)=>redv(227335,R31_undefined501_group_list,1,0),
(...v)=>redn(226311,1),
e=>2594,
(...v)=>redv(219151,R2141_js_member_expression,3,0),
(...v)=>redv(219151,R2143_js_member_expression,3,0),
(...v)=>rednv(222223,fn.new_target_expression,3,0),
(...v)=>redv(301071,R590_css_undefined6202_group_list,3,0),
(...v)=>redv(299019,R590_css_undefined6202_group_list,2,0),
(...v)=>rednv(287759,fn.string_literal,3,0),
(...v)=>redv(286731,R590_css_undefined6202_group_list,2,0),
e=>2598,
(...v)=>redv(249871,R2440_js_array_literal,3,0),
(...v)=>redv(249871,R2441_js_array_literal,3,0),
(...v)=>redv(250891,R2450_js_element_list,2,0),
(...v)=>redn(251915,2),
(...v)=>rednv(252939,fn.spread_element,2,0),
(...v)=>redv(231439,R2260_js_no_substitute_template,3,0),
(...v)=>redv(235535,R2300_js_template_head,3,0),
(...v)=>redv(239627,R590_css_undefined6202_group_list,2,0),
(...v)=>redv(232463,R2270_js_substitute_template,3,0),
(...v)=>redv(233479,R911_css_WQ_NAME,1,0),
e=>2626,
e=>2630,
(...v)=>redv(271375,R2651_js_cover_parenthesized_expression_and_arrow_parameter_list,3,0),
e=>2638,
e=>2642,
e=>2646,
e=>2650,
(...v)=>redv(220175,R2150_js_super_property,3,0),
e=>2654,
(...v)=>redv(197647,R1930_js_arrow_function,3,0),
(...v)=>redn(199687,1),
(...v)=>redv(174091,R1300_js_from_clause,2,0),
(...v)=>redn(175111,1),
(...v)=>rednv(181263,fn.variable_statement,3,0),
(...v)=>rednv(183307,fn.binding,2,0),
(...v)=>redn(273419,2),
e=>2674,
e=>2682,
e=>2678,
(...v)=>redn(276487,1),
(...v)=>redn(279559,1),
e=>2690,
(...v)=>redn(281607,1),
(...v)=>redn(274443,2),
e=>2702,
e=>2710,
e=>2718,
e=>2714,
(...v)=>redn(277511,1),
(...v)=>redn(278535,1),
(...v)=>redn(280583,1),
e=>2734,
e=>2738,
e=>2742,
e=>2746,
e=>2754,
e=>2758,
e=>2762,
e=>2770,
(...v)=>redn(157703,1),
(...v)=>redn(158727,1),
e=>2810,
e=>2818,
(...v)=>redv(162831,R1590_js_continue_statement,3,0),
(...v)=>redv(163855,R1600_js_break_statement,3,0),
(...v)=>redv(164879,R1610_js_return_statement,3,0),
e=>2822,
(...v)=>redv(165903,R1620_js_throw_statement,3,0),
(...v)=>redv(176143,R1720_js_try_statement,3,0),
(...v)=>redv(176143,R1721_js_try_statement,3,0),
e=>2830,
(...v)=>redv(204815,R2000_js_class_declaration,3,0),
e=>2842,
e=>2846,
(...v)=>redv(206859,R2023_js_class_tail,2,0),
(...v)=>redn(208903,1),
(...v)=>redv(209927,R911_css_WQ_NAME,1,0),
(...v)=>redn(210951,1),
(...v)=>redv(207883,R1300_js_from_clause,2,0),
e=>2862,
e=>2866,
e=>2870,
(...v)=>redv(191495,R1870_js_formal_parameters,1,0),
(...v)=>redv(191495,R1871_js_formal_parameters,1,0),
e=>2874,
(...v)=>redn(193543,1),
(...v)=>redv(192519,R911_css_WQ_NAME,1,0),
(...v)=>redn(194567,1),
(...v)=>rednv(184335,fn.lexical,3,0),
(...v)=>rednv(187403,fn.binding,2,0),
e=>2882,
(...v)=>redv(5139,R50_IMPORT_TAG,4,0),
(...v)=>redv(310283,R1050_css_declaration_list,2,0),
(...v)=>redv(5139,R51_IMPORT_TAG,4,0),
e=>2894,
e=>2918,
e=>2906,
e=>2922,
e=>2926,
(...v)=>redv(312331,R1300_js_from_clause,2,0),
e=>2930,
e=>2938,
e=>2942,
e=>2946,
(...v)=>redn(308231,1),
(...v)=>redv(307207,R31_undefined501_group_list,1,0),
e=>2958,
e=>2962,
e=>2966,
(...v)=>redn(309255,1),
(...v)=>rednv(321543,fn.text,1,0),
(...v)=>redn(6151,1),
(...v)=>shftf(2974,I71_BASIC_BINDING),
(...v)=>redv(320519,R591_css_undefined6202_group_list,1,0),
(...v)=>redn(322567,1),
(...v)=>redv(305171,R51_IMPORT_TAG,4,0),
(...v)=>redv(305171,R50_IMPORT_TAG,4,0),
e=>2978,
e=>2982,
(...v)=>redv(319503,R590_css_undefined6202_group_list,3,0),
(...v)=>redv(317451,R590_css_undefined6202_group_list,2,0),
(...v)=>redv(125971,R1230_js_import_declaration,4,0),
(...v)=>redv(133131,R1300_js_from_clause,2,0),
(...v)=>redv(126991,R1240_js_import_clause,3,0),
(...v)=>rednv(129039,fn.name_space_import,3,0),
e=>2990,
(...v)=>redv(132111,R1290_js_named_imports,3,0),
(...v)=>redv(132111,R1291_js_named_imports,3,0),
(...v)=>redv(137235,R1340_js_export_declaration,4,0),
(...v)=>redv(137235,R1341_js_export_declaration,4,0),
e=>3002,
(...v)=>redv(140303,R1370_js_export_clause,3,0),
(...v)=>redv(140303,R1371_js_export_clause,3,0),
e=>3018,
(...v)=>redv(242703,R2370_js_object_literal,3,0),
(...v)=>redv(242703,R2371_js_object_literal,3,0),
(...v)=>rednv(247819,fn.binding,2,0),
(...v)=>rednv(243723,fn.spread_element,2,0),
e=>3034,
e=>3042,
e=>3046,
e=>3050,
e=>3058,
e=>3062,
e=>3066,
(...v)=>redv(205839,R2000_js_class_declaration,3,0),
(...v)=>redv(223251,R2140_js_member_expression,4,0),
e=>3070,
(...v)=>redv(225295,R2200_js_arguments,3,0),
(...v)=>redv(225295,R2201_js_arguments,3,0),
(...v)=>rednv(226315,fn.spread_element,2,0),
(...v)=>redv(219155,R2140_js_member_expression,4,0),
(...v)=>redv(249875,R2440_js_array_literal,4,0),
(...v)=>redv(250895,R2451_js_element_list,3,0),
(...v)=>redv(233483,R2280_js_template_spans,2,0),
e=>3086,
e=>3090,
(...v)=>redv(237579,R2321_js_template_tail,2,0),
(...v)=>redv(236555,R2311_js_template_middle,2,0),
(...v)=>redv(234507,R2280_js_template_spans,2,0),
(...v)=>redv(271379,R2651_js_cover_parenthesized_expression_and_arrow_parameter_list,4,0),
(...v)=>redv(271379,R2652_js_cover_parenthesized_expression_and_arrow_parameter_list,4,0),
(...v)=>redv(220179,R2151_js_super_property,4,0),
e=>3102,
(...v)=>redn(196615,1),
(...v)=>redv(182287,R1780_js_variable_declaration_list,3,0),
(...v)=>redv(248843,R1300_js_from_clause,2,0),
(...v)=>redn(273423,3),
e=>3110,
(...v)=>redn(275467,2),
(...v)=>redn(281611,2),
e=>3122,
(...v)=>redn(274447,3),
(...v)=>redn(278539,2),
e=>3126,
(...v)=>redn(282635,2),
(...v)=>redn(280587,2),
e=>3158,
e=>3162,
(...v)=>shftf(3170,I1562_js_iteration_statement),
e=>3182,
(...v)=>shftf(3190,I1562_js_iteration_statement),
(...v)=>rednv(157707,fn.variable_statement,2,0),
(...v)=>redv(158731,R1300_js_from_clause,2,0),
(...v)=>redn(161799,1),
(...v)=>rednv(160779,fn.lexical_expression,2,0),
e=>3194,
e=>3210,
(...v)=>redv(176147,R1722_js_try_statement,4,0),
(...v)=>rednv(178187,fn.finally_statement,2,0),
e=>3230,
(...v)=>redv(206863,R2022_js_class_tail,3,0),
(...v)=>redv(206863,R2021_js_class_tail,3,0),
(...v)=>redv(209931,R1050_css_declaration_list,2,0),
(...v)=>redv(210955,R2060_js_class_element,2,0),
e=>3234,
e=>3238,
e=>3242,
e=>3250,
(...v)=>redv(191499,R1871_js_formal_parameters,2,0),
(...v)=>redv(186383,R1780_js_variable_declaration_list,3,0),
(...v)=>redv(5143,R50_IMPORT_TAG,5,0),
(...v)=>redv(5143,R51_IMPORT_TAG,5,0),
e=>3270,
(...v)=>rednv(311311,fn.attribute,3,0),
(...v)=>redn(313351,1),
e=>3294,
e=>3298,
e=>3318,
e=>3314,
e=>3310,
e=>3306,
e=>3302,
(...v)=>redv(312335,R1300_js_from_clause,3,0),
e=>3326,
(...v)=>redv(305175,R50_IMPORT_TAG,5,0),
e=>3338,
(...v)=>redv(307211,R30_undefined501_group_list,2,0),
e=>3346,
e=>3354,
e=>3362,
(...v)=>redv(320523,R590_css_undefined6202_group_list,2,0),
e=>3370,
e=>3378,
(...v)=>redv(132115,R1290_js_named_imports,4,0),
(...v)=>redv(131087,R150_css_COMPLEX_SELECTOR_list,3,0),
(...v)=>redv(134159,R1311_js_import_specifier,3,0),
(...v)=>redv(140307,R1370_js_export_clause,4,0),
(...v)=>redv(139279,R150_css_COMPLEX_SELECTOR_list,3,0),
(...v)=>redv(141327,R1381_js_export_specifier,3,0),
(...v)=>rednv(256023,fn.condition_expression,5,0),
(...v)=>redv(242707,R2370_js_object_literal,4,0),
(...v)=>redv(241679,R150_css_COMPLEX_SELECTOR_list,3,0),
(...v)=>rednv(243727,fn.property_binding,3,0),
e=>3382,
e=>3386,
(...v)=>redn(190471,1),
e=>3390,
(...v)=>redv(246799,R1300_js_from_clause,3,0),
e=>3402,
e=>3406,
e=>3410,
e=>3418,
(...v)=>redv(225299,R2200_js_arguments,4,0),
(...v)=>redv(227343,R150_css_COMPLEX_SELECTOR_list,3,0),
(...v)=>redv(250899,R2451_js_element_list,4,0),
(...v)=>redv(234511,R2290_js_template_middle_list,3,0),
(...v)=>redv(237583,R2320_js_template_tail,3,0),
(...v)=>redv(236559,R2310_js_template_middle,3,0),
e=>3422,
e=>3426,
(...v)=>redv(199695,R1300_js_from_clause,3,0),
e=>3430,
(...v)=>redn(273427,4),
(...v)=>redn(276495,3),
(...v)=>redn(279567,3),
(...v)=>redn(274451,4),
e=>3434,
e=>3442,
(...v)=>redn(277519,3),
(...v)=>rednv(156695,fn.if_statement,5,0),
e=>3446,
e=>3450,
(...v)=>rednv(159767,fn.while_statement,5,0),
e=>3454,
(...v)=>shftf(3462,I1562_js_iteration_statement),
(...v)=>shftf(3470,I1562_js_iteration_statement),
(...v)=>shftf(3474,I1562_js_iteration_statement),
(...v)=>shftf(3482,I1562_js_iteration_statement),
(...v)=>shftf(3486,I1562_js_iteration_statement),
(...v)=>shftf(3494,I1562_js_iteration_statement),
(...v)=>shftf(3498,I1562_js_iteration_statement),
(...v)=>redv(167959,R1640_js_switch_statement,5,0),
e=>3530,
e=>3526,
e=>3510,
(...v)=>redv(166935,R1630_js_with_statement,5,0),
e=>3534,
(...v)=>redn(179207,1),
(...v)=>redv(206867,R2020_js_class_tail,4,0),
e=>3538,
e=>3546,
e=>3554,
e=>3558,
(...v)=>redv(189463,R1847_js_function_expression,5,0),
(...v)=>redn(195591,1),
(...v)=>redv(191503,R1872_js_formal_parameters,3,0),
(...v)=>redv(192527,R1780_js_variable_declaration_list,3,0),
(...v)=>redv(5147,R50_IMPORT_TAG,6,0),
(...v)=>redn(4111,3),
e=>3562,
e=>3566,
(...v)=>redn(326663,1),
(...v)=>redv(325639,R591_css_undefined6202_group_list,1,0),
(...v)=>redn(324615,1),
(...v)=>redn(327687,1),
e=>3574,
e=>3582,
e=>3586,
(...v)=>redv(305179,R51_IMPORT_TAG,6,0),
e=>3590,
e=>3694,
e=>3598,
e=>3642,
e=>3622,
e=>3674,
e=>3686,
e=>3718,
e=>3722,
e=>3726,
e=>3730,
e=>3754,
e=>3762,
e=>3774,
e=>3782,
e=>3786,
e=>3790,
e=>3794,
e=>3798,
(...v)=>redv(305179,R2983_html_TAG,6,0),
e=>3802,
e=>3810,
e=>3814,
e=>3818,
(...v)=>redn(212999,1),
e=>3822,
e=>3830,
e=>3838,
e=>3842,
(...v)=>redv(188439,R1847_js_function_expression,5,0),
(...v)=>redv(271387,R2653_js_cover_parenthesized_expression_and_arrow_parameter_list,6,0),
(...v)=>redn(273431,5),
(...v)=>redn(274455,5),
e=>3846,
e=>3854,
(...v)=>shftf(3862,I1562_js_iteration_statement),
(...v)=>shftf(3866,I1562_js_iteration_statement),
(...v)=>shftf(3874,I1562_js_iteration_statement),
(...v)=>redv(159771,R15615_js_iteration_statement,6,0),
(...v)=>shftf(3894,I1562_js_iteration_statement),
(...v)=>redv(159771,R15616_js_iteration_statement,6,0),
(...v)=>shftf(3906,I1562_js_iteration_statement),
(...v)=>redv(168971,R1650_js_case_block,2,0),
e=>3914,
e=>3926,
(...v)=>redv(169991,R911_css_WQ_NAME,1,0),
e=>3934,
e=>3946,
e=>3950,
(...v)=>redv(189467,R1846_js_function_expression,6,0),
e=>3954,
(...v)=>redv(189467,R1845_js_function_expression,6,0),
(...v)=>redv(189467,R1844_js_function_expression,6,0),
(...v)=>redv(313359,R1300_js_from_clause,3,0),
(...v)=>redv(323599,R1300_js_from_clause,3,0),
(...v)=>redv(325643,R590_css_undefined6202_group_list,2,0),
e=>3958,
(...v)=>redv(305183,R50_IMPORT_TAG,7,0),
(...v)=>redv(305183,R2982_html_TAG,7,0),
e=>3966,
e=>3970,
e=>3974,
(...v)=>rednv(9223,fn.stylesheet,1,0),
(...v)=>redv(14343,R142_css_STYLE_SHEET,1,0),
(...v)=>redv(14343,R141_css_STYLE_SHEET,1,0),
(...v)=>redv(11271,R31_undefined501_group_list,1,0),
(...v)=>redn(10247,1),
e=>3994,
e=>3998,
e=>4010,
e=>4006,
e=>4002,
(...v)=>redv(13319,R31_undefined501_group_list,1,0),
(...v)=>redn(12295,1),
e=>4018,
e=>4014,
(...v)=>redv(15367,R31_undefined501_group_list,1,0),
e=>4062,
(...v)=>rednv(82951,fn.selector,1,0),
e=>4066,
e=>4070,
e=>4074,
(...v)=>rednv(88071,fn.compoundSelector,1,0),
e=>4098,
(...v)=>rednv(90119,fn.typeselector,1,0),
e=>4102,
(...v)=>redv(90119,R881_css_TYPE_SELECTOR,1,0),
(...v)=>redn(91143,1),
(...v)=>redv(93191,R911_css_WQ_NAME,1,0),
e=>4110,
(...v)=>redn(92167,1),
e=>4126,
e=>4138,
e=>4142,
(...v)=>redv(117767,R00_S,1,0),
e=>4134,
e=>4130,
(...v)=>redn(113671,1),
(...v)=>redv(83975,R31_undefined501_group_list,1,0),
(...v)=>redn(94215,1),
e=>4162,
e=>4174,
(...v)=>redv(87047,R31_undefined501_group_list,1,0),
(...v)=>redn(86023,1),
e=>4186,
e=>4190,
e=>4194,
e=>4202,
e=>4206,
e=>4210,
(...v)=>rednv(142343,fn.script,1,0),
(...v)=>redn(143367,1),
e=>4218,
e=>4222,
e=>4226,
e=>4230,
e=>4234,
e=>4242,
(...v)=>redv(7187,R72_BASIC_BINDING,4,0),
(...v)=>redv(305183,R2981_html_TAG,7,0),
e=>4250,
e=>4254,
(...v)=>redv(211991,R2077_js_method_definition,5,0),
e=>4262,
e=>4266,
e=>4274,
e=>4278,
(...v)=>redv(188443,R1846_js_function_expression,6,0),
e=>4282,
(...v)=>redv(188443,R1845_js_function_expression,6,0),
(...v)=>redv(188443,R1844_js_function_expression,6,0),
(...v)=>redn(274459,6),
(...v)=>rednv(156703,fn.if_statement,7,0),
(...v)=>rednv(159775,fn.do_while_statement,7,0),
(...v)=>shftf(4286,I1562_js_iteration_statement),
(...v)=>redv(159775,R15614_js_iteration_statement,7,0),
(...v)=>redv(159775,R15610_js_iteration_statement,7,0),
(...v)=>redv(159775,R1569_js_iteration_statement,7,0),
(...v)=>redv(159775,R1564_js_iteration_statement,7,0),
(...v)=>redv(159775,R15611_js_iteration_statement,7,0),
(...v)=>redv(159775,R15613_js_iteration_statement,7,0),
(...v)=>redv(159775,R15612_js_iteration_statement,7,0),
e=>4314,
(...v)=>redv(168975,R1300_js_from_clause,3,0),
(...v)=>redv(169995,R1660_js_case_clauses,2,0),
e=>4318,
e=>4322,
(...v)=>redv(172043,R1681_js_default_clause,2,0),
(...v)=>rednv(177175,fn.catch_statement,5,0),
e=>4330,
(...v)=>redv(189471,R1843_js_function_expression,7,0),
(...v)=>redv(189471,R1842_js_function_expression,7,0),
(...v)=>redv(189471,R1841_js_function_expression,7,0),
(...v)=>redv(305187,R2980_html_TAG,8,0),
e=>4334,
e=>4338,
e=>4342,
e=>4346,
(...v)=>redv(14347,R140_css_STYLE_SHEET,2,0),
(...v)=>redv(11275,R30_undefined501_group_list,2,0),
(...v)=>redv(13323,R30_undefined501_group_list,2,0),
(...v)=>redn(19467,2),
e=>4358,
e=>4378,
e=>4370,
e=>4374,
e=>4426,
e=>4422,
e=>4442,
e=>4450,
e=>4490,
e=>4470,
e=>4462,
e=>4506,
e=>4510,
(...v)=>redv(107527,R00_S,1,0),
e=>4522,
(...v)=>redv(106503,R31_undefined501_group_list,1,0),
(...v)=>redn(104455,1),
e=>4526,
(...v)=>rednv(82955,fn.selector,2,0),
(...v)=>redv(81927,R31_undefined501_group_list,1,0),
(...v)=>rednv(80903,fn.comboSelector,1,0),
(...v)=>redn(89095,1),
(...v)=>rednv(88075,fn.compoundSelector,2,0),
(...v)=>redv(83979,R30_undefined501_group_list,2,0),
(...v)=>redv(87051,R30_undefined501_group_list,2,0),
(...v)=>redv(90123,R880_css_TYPE_SELECTOR,2,0),
(...v)=>redv(93195,R910_css_WQ_NAME,2,0),
(...v)=>redn(92171,2),
(...v)=>redv(117771,R590_css_undefined6202_group_list,2,0),
(...v)=>redv(117771,R00_S,2,0),
(...v)=>redv(115719,R591_css_undefined6202_group_list,1,0),
(...v)=>redn(114695,1),
(...v)=>redn(116743,1),
(...v)=>rednv(95243,fn.idSelector,2,0),
(...v)=>rednv(96267,fn.classSelector,2,0),
e=>4574,
e=>4558,
e=>4550,
e=>4562,
e=>4566,
e=>4570,
(...v)=>rednv(102411,fn.pseudoClassSelector,2,0),
e=>4582,
(...v)=>rednv(103435,fn.pseudoElementSelector,2,0),
(...v)=>redn(86027,2),
(...v)=>redv(84999,R31_undefined501_group_list,1,0),
e=>4590,
e=>4594,
e=>4598,
e=>4602,
e=>4606,
e=>4610,
e=>4614,
e=>4618,
e=>4626,
(...v)=>redv(7191,R70_BASIC_BINDING,5,0),
e=>4630,
e=>4634,
e=>4638,
(...v)=>redv(211995,R2074_js_method_definition,6,0),
(...v)=>redv(211995,R2073_js_method_definition,6,0),
e=>4642,
(...v)=>redv(211995,R2075_js_method_definition,6,0),
e=>4650,
e=>4654,
(...v)=>redv(188447,R1843_js_function_expression,7,0),
(...v)=>redv(188447,R1842_js_function_expression,7,0),
(...v)=>redv(188447,R1841_js_function_expression,7,0),
(...v)=>redv(159779,R1568_js_iteration_statement,8,0),
(...v)=>redv(159779,R1567_js_iteration_statement,8,0),
(...v)=>redv(159779,R1563_js_iteration_statement,8,0),
(...v)=>redv(159779,R1566_js_iteration_statement,8,0),
(...v)=>redv(159779,R1565_js_iteration_statement,8,0),
e=>4662,
(...v)=>redv(168979,R1652_js_case_block,4,0),
(...v)=>redv(171023,R1671_js_case_clause,3,0),
(...v)=>redv(172047,R1680_js_default_clause,3,0),
(...v)=>redv(189475,R1840_js_function_expression,8,0),
e=>4670,
e=>4674,
e=>4678,
(...v)=>redv(309275,R51_IMPORT_TAG,6,0),
e=>4686,
(...v)=>redn(25615,3),
e=>4698,
(...v)=>redv(78855,R591_css_undefined6202_group_list,1,0),
(...v)=>redn(21511,1),
e=>4710,
e=>4718,
e=>4714,
(...v)=>redv(41991,R31_undefined501_group_list,1,0),
(...v)=>redn(46087,1),
e=>4734,
(...v)=>redn(48135,1),
(...v)=>redn(47111,1),
e=>4750,
e=>4758,
e=>4802,
e=>4778,
(...v)=>redn(56327,1),
(...v)=>redn(71687,1),
e=>4814,
(...v)=>redn(44039,1),
e=>4818,
(...v)=>redn(28679,1),
e=>4822,
(...v)=>redn(36871,1),
e=>4842,
e=>4846,
(...v)=>redn(37895,1),
(...v)=>redn(38919,1),
e=>4862,
e=>4866,
e=>4870,
(...v)=>redv(15375,R150_css_COMPLEX_SELECTOR_list,3,0),
e=>4874,
(...v)=>redv(16399,R161_css_STYLE_RULE,3,0),
(...v)=>redv(107531,R1050_css_declaration_list,2,0),
(...v)=>redv(107531,R1051_css_declaration_list,2,0),
e=>4878,
(...v)=>redv(107531,R00_S,2,0),
e=>4910,
e=>4902,
e=>4906,
e=>4894,
(...v)=>redv(81931,R30_undefined501_group_list,2,0),
(...v)=>rednv(80907,fn.comboSelector,2,0),
(...v)=>rednv(88079,fn.compoundSelector,3,0),
(...v)=>redv(117775,R590_css_undefined6202_group_list,3,0),
(...v)=>redv(115723,R590_css_undefined6202_group_list,2,0),
(...v)=>rednv(98319,fn.attribSelector,3,0),
e=>4922,
e=>4926,
(...v)=>redn(99335,1),
(...v)=>rednv(102415,fn.pseudoClassSelector,3,0),
(...v)=>redv(85003,R30_undefined501_group_list,2,0),
e=>4934,
e=>4938,
e=>4942,
e=>4946,
e=>4950,
e=>4954,
e=>4958,
e=>4962,
e=>4966,
(...v)=>redv(8219,R72_BASIC_BINDING,6,0),
(...v)=>redv(211999,R2070_js_method_definition,7,0),
(...v)=>redv(211999,R2071_js_method_definition,7,0),
e=>4970,
(...v)=>redv(211999,R2076_js_method_definition,7,0),
(...v)=>redv(188451,R1840_js_function_expression,8,0),
(...v)=>redv(159783,R1560_js_iteration_statement,9,0),
(...v)=>redv(168983,R1651_js_case_block,5,0),
(...v)=>redv(171027,R1670_js_case_clause,4,0),
e=>4974,
(...v)=>redv(309279,R50_IMPORT_TAG,7,0),
(...v)=>redv(309279,R2982_html_TAG,7,0),
(...v)=>redn(25619,4),
(...v)=>redv(78859,R590_css_undefined6202_group_list,2,0),
e=>4990,
e=>4994,
e=>4998,
(...v)=>(redn(18435,0)),
(...v)=>redn(46091,2),
(...v)=>redn(52235,2),
(...v)=>redn(55307,2),
(...v)=>redv(51207,R31_undefined501_group_list,1,0),
(...v)=>redv(54279,R31_undefined501_group_list,1,0),
(...v)=>redn(49163,2),
e=>5050,
e=>5054,
e=>5074,
e=>5070,
(...v)=>redn(70663,1),
e=>5062,
(...v)=>redn(57351,1),
e=>5106,
e=>5098,
e=>5102,
e=>5110,
e=>5094,
e=>5078,
(...v)=>redn(68615,1),
e=>5130,
e=>5134,
e=>5138,
e=>5142,
e=>5150,
e=>5182,
e=>5170,
e=>5174,
(...v)=>redn(36875,2),
(...v)=>redv(35847,R31_undefined501_group_list,1,0),
(...v)=>redn(33799,1),
e=>5198,
e=>5202,
e=>5210,
(...v)=>redv(16403,R160_css_STYLE_RULE,4,0),
(...v)=>redv(16403,R161_css_STYLE_RULE,4,0),
(...v)=>redv(107535,R1051_css_declaration_list,3,0),
(...v)=>redv(106511,R150_css_COMPLEX_SELECTOR_list,3,0),
(...v)=>redv(109583,fn.parseDeclaration,3,0),
e=>5222,
(...v)=>redn(112647,1),
(...v)=>redv(111623,R591_css_undefined6202_group_list,1,0),
(...v)=>redn(110599,1),
e=>5238,
e=>5242,
e=>5246,
(...v)=>redn(97287,1),
(...v)=>redn(99339,2),
e=>5250,
e=>5254,
e=>5258,
e=>5262,
(...v)=>redv(8223,R70_BASIC_BINDING,7,0),
(...v)=>redv(8223,R81_CALL_BINDING,7,0),
(...v)=>redv(212003,R2072_js_method_definition,8,0),
(...v)=>redv(309283,R2980_html_TAG,8,0),
(...v)=>redn(25623,5),
(...v)=>redn(79887,3),
e=>5286,
e=>5290,
(...v)=>redn(18439,1),
(...v)=>redv(17415,R31_undefined501_group_list,1,0),
(...v)=>redv(41999,R150_css_COMPLEX_SELECTOR_list,3,0),
(...v)=>redn(46095,3),
(...v)=>redn(45067,2),
(...v)=>redv(51211,R30_undefined501_group_list,2,0),
(...v)=>redv(54283,R30_undefined501_group_list,2,0),
(...v)=>redn(50187,2),
(...v)=>redn(53259,2),
(...v)=>redn(56335,3),
(...v)=>redn(58383,3),
e=>5298,
(...v)=>redn(62479,3),
(...v)=>redv(61447,R591_css_undefined6202_group_list,1,0),
(...v)=>redn(59399,1),
(...v)=>redn(66567,1),
(...v)=>redn(64519,1),
(...v)=>redn(65543,1),
(...v)=>redn(75787,2),
e=>5334,
(...v)=>redn(74759,1),
e=>5338,
e=>5342,
(...v)=>redv(26631,R31_undefined501_group_list,1,0),
e=>5354,
e=>5350,
(...v)=>redv(29703,R31_undefined501_group_list,1,0),
(...v)=>redn(31751,1),
e=>5358,
e=>5362,
(...v)=>redv(35851,R30_undefined501_group_list,2,0),
(...v)=>redn(34827,2),
(...v)=>redn(37903,3),
(...v)=>redn(39951,3),
e=>5366,
(...v)=>redv(16407,R160_css_STYLE_RULE,5,0),
(...v)=>redv(109587,fn.parseDeclaration,4,0),
(...v)=>redv(112651,R1100_css_declaration_values,2,0),
e=>5370,
(...v)=>redv(111627,R590_css_undefined6202_group_list,2,0),
e=>5374,
e=>5378,
(...v)=>rednv(98327,fn.attribSelector,5,0),
(...v)=>redn(100359,1),
(...v)=>redn(101391,3),
(...v)=>redv(8227,R80_CALL_BINDING,8,0),
(...v)=>redn(25627,6),
e=>5382,
(...v)=>redn(22535,1),
(...v)=>redn(76819,4),
(...v)=>redn(43035,6),
(...v)=>redv(17419,R30_undefined501_group_list,2,0),
(...v)=>redn(62483,4),
(...v)=>redv(61451,R590_css_undefined6202_group_list,2,0),
(...v)=>redn(63503,3),
(...v)=>redn(67599,3),
(...v)=>redn(72719,3),
(...v)=>rednv(27675,C270_css_keyframes,6,0),
(...v)=>redv(26635,R30_undefined501_group_list,2,0),
(...v)=>redn(73739,2),
(...v)=>redn(32795,6),
(...v)=>redn(40979,4),
(...v)=>redn(108555,2),
(...v)=>redv(112655,R1100_css_declaration_values,3,0),
(...v)=>rednv(98331,fn.attribSelector,6,0),
(...v)=>redn(23571,4),
e=>5410,
e=>5414,
(...v)=>redv(29711,R150_css_COMPLEX_SELECTOR_list,3,0),
(...v)=>redn(67607,5),
e=>5418,
(...v)=>rednv(30739,C300_css_keyframes_blocks,4,0),
(...v)=>rednv(30743,C300_css_keyframes_blocks,5,0)],

    //Goto Lookup Functions
    goto = [v=>lsm(v,gt0),
nf,
nf,
nf,
nf,
v=>lsm(v,gt1),
nf,
nf,
nf,
v=>lsm(v,gt2),
nf,
nf,
nf,
nf,
v=>lsm(v,gt3),
nf,
nf,
nf,
nf,
nf,
v=>lsm(v,gt4),
v=>lsm(v,gt5),
nf,
nf,
nf,
nf,
nf,
nf,
nf,
nf,
nf,
nf,
nf,
nf,
nf,
nf,
nf,
nf,
nf,
v=>lsm(v,gt6),
nf,
nf,
nf,
nf,
nf,
nf,
v=>lsm(v,gt7),
nf,
nf,
nf,
nf,
nf,
nf,
nf,
nf,
nf,
nf,
nf,
nf,
nf,
v=>lsm(v,gt8),
v=>lsm(v,gt9),
v=>lsm(v,gt10),
v=>lsm(v,gt11),
v=>lsm(v,gt12),
v=>lsm(v,gt13),
v=>lsm(v,gt14),
nf,
v=>lsm(v,gt15),
v=>lsm(v,gt16),
nf,
v=>lsm(v,gt17),
v=>lsm(v,gt18),
v=>lsm(v,gt19),
nf,
nf,
nf,
nf,
nf,
nf,
nf,
nf,
nf,
nf,
nf,
nf,
v=>lsm(v,gt20),
nf,
nf,
nf,
nf,
nf,
nf,
nf,
nf,
nf,
nf,
v=>lsm(v,gt21),
v=>lsm(v,gt22),
nf,
v=>lsm(v,gt23),
nf,
nf,
v=>lsm(v,gt24),
v=>lsm(v,gt25),
v=>lsm(v,gt26),
v=>lsm(v,gt27),
nf,
nf,
nf,
v=>lsm(v,gt28),
nf,
nf,
v=>lsm(v,gt29),
v=>lsm(v,gt30),
nf,
nf,
nf,
nf,
v=>lsm(v,gt31),
nf,
nf,
nf,
v=>lsm(v,gt32),
v=>lsm(v,gt33),
v=>lsm(v,gt34),
nf,
v=>lsm(v,gt35),
v=>lsm(v,gt36),
nf,
nf,
nf,
nf,
v=>lsm(v,gt37),
nf,
v=>lsm(v,gt38),
v=>lsm(v,gt39),
nf,
nf,
nf,
nf,
nf,
v=>lsm(v,gt40),
v=>lsm(v,gt41),
v=>lsm(v,gt42),
nf,
v=>lsm(v,gt43),
nf,
nf,
nf,
nf,
nf,
nf,
nf,
nf,
nf,
nf,
nf,
nf,
nf,
nf,
nf,
nf,
nf,
nf,
nf,
nf,
nf,
v=>lsm(v,gt2),
v=>lsm(v,gt44),
nf,
nf,
nf,
nf,
nf,
nf,
nf,
v=>lsm(v,gt45),
nf,
v=>lsm(v,gt46),
v=>lsm(v,gt47),
nf,
nf,
v=>lsm(v,gt48),
v=>lsm(v,gt49),
nf,
v=>lsm(v,gt50),
nf,
nf,
nf,
v=>lsm(v,gt51),
v=>lsm(v,gt52),
v=>lsm(v,gt53),
nf,
nf,
nf,
nf,
nf,
nf,
nf,
nf,
nf,
nf,
nf,
nf,
nf,
nf,
v=>lsm(v,gt54),
v=>lsm(v,gt55),
v=>lsm(v,gt56),
v=>lsm(v,gt57),
v=>lsm(v,gt58),
v=>lsm(v,gt59),
v=>lsm(v,gt60),
v=>lsm(v,gt61),
v=>lsm(v,gt62),
v=>lsm(v,gt63),
v=>lsm(v,gt64),
v=>lsm(v,gt65),
v=>lsm(v,gt66),
v=>lsm(v,gt67),
v=>lsm(v,gt68),
v=>lsm(v,gt69),
v=>lsm(v,gt70),
v=>lsm(v,gt71),
v=>lsm(v,gt72),
v=>lsm(v,gt73),
v=>lsm(v,gt74),
v=>lsm(v,gt75),
v=>lsm(v,gt76),
v=>lsm(v,gt77),
v=>lsm(v,gt78),
nf,
nf,
nf,
nf,
nf,
nf,
nf,
nf,
v=>lsm(v,gt79),
v=>lsm(v,gt80),
v=>lsm(v,gt81),
nf,
nf,
nf,
nf,
nf,
nf,
nf,
nf,
v=>lsm(v,gt82),
nf,
v=>lsm(v,gt83),
nf,
v=>lsm(v,gt84),
v=>lsm(v,gt85),
v=>lsm(v,gt86),
nf,
nf,
nf,
v=>lsm(v,gt87),
nf,
nf,
v=>lsm(v,gt88),
nf,
nf,
nf,
nf,
nf,
nf,
nf,
nf,
nf,
nf,
v=>lsm(v,gt89),
nf,
nf,
nf,
nf,
nf,
nf,
nf,
nf,
nf,
v=>lsm(v,gt89),
nf,
v=>lsm(v,gt90),
v=>lsm(v,gt91),
nf,
nf,
nf,
nf,
v=>lsm(v,gt92),
nf,
nf,
nf,
nf,
v=>lsm(v,gt93),
nf,
nf,
nf,
nf,
nf,
nf,
nf,
nf,
nf,
nf,
nf,
nf,
v=>lsm(v,gt94),
nf,
nf,
v=>lsm(v,gt95),
v=>lsm(v,gt96),
v=>lsm(v,gt97),
nf,
nf,
v=>lsm(v,gt98),
nf,
v=>lsm(v,gt99),
nf,
nf,
v=>lsm(v,gt100),
v=>lsm(v,gt101),
nf,
nf,
nf,
v=>lsm(v,gt102),
v=>lsm(v,gt103),
v=>lsm(v,gt104),
nf,
v=>lsm(v,gt105),
v=>lsm(v,gt106),
nf,
v=>lsm(v,gt107),
nf,
nf,
nf,
nf,
nf,
nf,
nf,
v=>lsm(v,gt108),
nf,
v=>lsm(v,gt109),
nf,
v=>lsm(v,gt110),
nf,
nf,
v=>lsm(v,gt111),
v=>lsm(v,gt112),
nf,
v=>lsm(v,gt113),
nf,
nf,
v=>lsm(v,gt114),
v=>lsm(v,gt115),
v=>lsm(v,gt116),
nf,
v=>lsm(v,gt117),
nf,
nf,
v=>lsm(v,gt118),
v=>lsm(v,gt119),
nf,
v=>lsm(v,gt116),
v=>lsm(v,gt120),
nf,
v=>lsm(v,gt116),
nf,
nf,
v=>lsm(v,gt121),
nf,
nf,
nf,
nf,
nf,
nf,
nf,
nf,
nf,
v=>lsm(v,gt122),
nf,
v=>lsm(v,gt123),
v=>lsm(v,gt124),
nf,
nf,
nf,
nf,
nf,
nf,
nf,
nf,
nf,
nf,
nf,
nf,
nf,
nf,
nf,
nf,
nf,
nf,
nf,
nf,
nf,
nf,
nf,
nf,
nf,
nf,
nf,
nf,
nf,
nf,
nf,
nf,
nf,
nf,
nf,
nf,
nf,
nf,
nf,
nf,
nf,
nf,
nf,
nf,
nf,
nf,
nf,
nf,
nf,
nf,
nf,
nf,
nf,
nf,
v=>lsm(v,gt125),
nf,
v=>lsm(v,gt126),
nf,
nf,
v=>lsm(v,gt127),
v=>lsm(v,gt128),
nf,
nf,
nf,
nf,
v=>lsm(v,gt129),
nf,
v=>lsm(v,gt130),
v=>lsm(v,gt131),
nf,
nf,
nf,
nf,
nf,
nf,
nf,
nf,
nf,
v=>lsm(v,gt132),
nf,
nf,
nf,
nf,
nf,
nf,
nf,
nf,
nf,
nf,
nf,
v=>lsm(v,gt133),
nf,
nf,
nf,
nf,
nf,
nf,
nf,
nf,
nf,
nf,
v=>lsm(v,gt134),
v=>lsm(v,gt135),
v=>lsm(v,gt136),
nf,
nf,
nf,
nf,
nf,
nf,
nf,
nf,
v=>lsm(v,gt137),
nf,
nf,
nf,
nf,
v=>lsm(v,gt138),
nf,
v=>lsm(v,gt139),
nf,
nf,
nf,
nf,
v=>lsm(v,gt140),
nf,
nf,
nf,
v=>lsm(v,gt141),
nf,
v=>lsm(v,gt142),
nf,
nf,
v=>lsm(v,gt143),
nf,
nf,
nf,
v=>lsm(v,gt144),
nf,
nf,
nf,
nf,
v=>lsm(v,gt145),
nf,
v=>lsm(v,gt146),
nf,
v=>lsm(v,gt147),
v=>lsm(v,gt7),
v=>lsm(v,gt148),
nf,
v=>lsm(v,gt149),
nf,
nf,
nf,
nf,
nf,
nf,
v=>lsm(v,gt150),
nf,
nf,
v=>lsm(v,gt151),
nf,
v=>lsm(v,gt152),
nf,
nf,
v=>lsm(v,gt153),
nf,
nf,
v=>lsm(v,gt154),
nf,
nf,
nf,
nf,
v=>lsm(v,gt155),
nf,
nf,
nf,
nf,
nf,
nf,
nf,
nf,
v=>lsm(v,gt156),
nf,
nf,
nf,
v=>lsm(v,gt157),
nf,
v=>lsm(v,gt158),
nf,
nf,
v=>lsm(v,gt159),
nf,
nf,
nf,
nf,
v=>lsm(v,gt160),
nf,
nf,
v=>lsm(v,gt161),
v=>lsm(v,gt162),
nf,
v=>lsm(v,gt2),
nf,
nf,
nf,
v=>lsm(v,gt163),
nf,
nf,
nf,
nf,
nf,
nf,
nf,
nf,
nf,
nf,
nf,
nf,
nf,
nf,
v=>lsm(v,gt164),
nf,
nf,
nf,
nf,
nf,
nf,
nf,
nf,
v=>lsm(v,gt165),
nf,
nf,
v=>lsm(v,gt166),
nf,
nf,
v=>lsm(v,gt167),
nf,
nf,
v=>lsm(v,gt168),
v=>lsm(v,gt169),
v=>lsm(v,gt170),
nf,
nf,
nf,
nf,
v=>lsm(v,gt171),
v=>lsm(v,gt172),
nf,
nf,
nf,
v=>lsm(v,gt173),
nf,
nf,
nf,
nf,
nf,
nf,
nf,
v=>lsm(v,gt174),
nf,
nf,
nf,
nf,
nf,
v=>lsm(v,gt175),
nf,
v=>lsm(v,gt176),
nf,
nf,
nf,
nf,
nf,
v=>lsm(v,gt177),
nf,
nf,
nf,
nf,
nf,
nf,
nf,
nf,
nf,
v=>lsm(v,gt178),
nf,
v=>lsm(v,gt179),
nf,
nf,
nf,
nf,
nf,
nf,
v=>lsm(v,gt180),
nf,
nf,
nf,
v=>lsm(v,gt181),
v=>lsm(v,gt182),
v=>lsm(v,gt183),
v=>lsm(v,gt184),
nf,
v=>lsm(v,gt185),
v=>lsm(v,gt186),
v=>lsm(v,gt187),
nf,
v=>lsm(v,gt188),
nf,
nf,
v=>lsm(v,gt100),
v=>lsm(v,gt101),
nf,
v=>lsm(v,gt114),
v=>lsm(v,gt115),
nf,
nf,
v=>lsm(v,gt189),
v=>lsm(v,gt190),
v=>lsm(v,gt191),
v=>lsm(v,gt192),
nf,
v=>lsm(v,gt193),
nf,
nf,
nf,
nf,
nf,
nf,
nf,
nf,
nf,
v=>lsm(v,gt194),
v=>lsm(v,gt195),
nf,
v=>lsm(v,gt196),
nf,
nf,
nf,
nf,
nf,
v=>lsm(v,gt197),
nf,
nf,
nf,
v=>lsm(v,gt198),
nf,
nf,
nf,
v=>lsm(v,gt199),
nf,
v=>lsm(v,gt200),
nf,
nf,
v=>lsm(v,gt201),
v=>lsm(v,gt202),
v=>lsm(v,gt203),
nf,
v=>lsm(v,gt204),
v=>lsm(v,gt205),
nf,
nf,
nf,
nf,
nf,
nf,
nf,
nf,
nf,
nf,
nf,
nf,
nf,
nf,
nf,
nf,
v=>lsm(v,gt206),
nf,
nf,
nf,
nf,
v=>lsm(v,gt207),
nf,
nf,
nf,
nf,
nf,
nf,
nf,
nf,
nf,
nf,
nf,
nf,
nf,
nf,
nf,
v=>lsm(v,gt208),
nf,
nf,
nf,
nf,
nf,
nf,
v=>lsm(v,gt209),
v=>lsm(v,gt210),
nf,
v=>lsm(v,gt211),
nf,
nf,
v=>lsm(v,gt212),
nf,
v=>lsm(v,gt213),
v=>lsm(v,gt214),
nf,
nf,
nf,
v=>lsm(v,gt215),
nf,
nf,
nf,
nf,
nf,
nf,
v=>lsm(v,gt216),
v=>lsm(v,gt217),
nf,
nf,
nf,
nf,
nf,
nf,
nf,
nf,
nf,
v=>lsm(v,gt218),
nf,
nf,
nf,
nf,
nf,
nf,
nf,
nf,
nf,
nf,
v=>lsm(v,gt219),
nf,
nf,
nf,
v=>lsm(v,gt116),
v=>lsm(v,gt220),
v=>lsm(v,gt116),
v=>lsm(v,gt221),
v=>lsm(v,gt116),
v=>lsm(v,gt222),
nf,
nf,
nf,
nf,
nf,
v=>lsm(v,gt223),
nf,
nf,
nf,
nf,
v=>lsm(v,gt224),
v=>lsm(v,gt225),
nf,
nf,
nf,
nf,
nf,
nf,
nf,
nf,
v=>lsm(v,gt226),
nf,
v=>lsm(v,gt227),
nf,
v=>lsm(v,gt228),
nf,
v=>lsm(v,gt229),
v=>lsm(v,gt230),
nf,
v=>lsm(v,gt231),
v=>lsm(v,gt232),
nf,
v=>lsm(v,gt233),
v=>lsm(v,gt234),
nf,
nf,
nf,
v=>lsm(v,gt235),
v=>lsm(v,gt236),
nf,
v=>lsm(v,gt237),
nf,
v=>lsm(v,gt238),
v=>lsm(v,gt239),
nf,
nf,
nf,
nf,
nf,
nf,
nf,
nf,
nf,
nf,
nf,
nf,
v=>lsm(v,gt240),
nf,
nf,
nf,
v=>lsm(v,gt241),
v=>lsm(v,gt242),
nf,
nf,
nf,
nf,
nf,
nf,
nf,
v=>lsm(v,gt243),
nf,
v=>lsm(v,gt244),
v=>lsm(v,gt245),
v=>lsm(v,gt246),
v=>lsm(v,gt247),
nf,
v=>lsm(v,gt248),
nf,
nf,
nf,
nf,
v=>lsm(v,gt249),
nf,
nf,
nf,
nf,
nf,
nf,
v=>lsm(v,gt250),
v=>lsm(v,gt251),
v=>lsm(v,gt252),
v=>lsm(v,gt253),
nf,
v=>lsm(v,gt254),
nf,
nf,
nf,
v=>lsm(v,gt255),
nf,
nf,
nf,
nf,
v=>lsm(v,gt256),
nf,
nf,
nf,
v=>lsm(v,gt257),
nf,
nf,
v=>lsm(v,gt258),
nf,
nf,
v=>lsm(v,gt259),
nf,
v=>lsm(v,gt260),
nf,
nf,
nf,
nf,
nf,
nf,
nf,
nf,
nf,
v=>lsm(v,gt261),
v=>lsm(v,gt262),
nf,
v=>lsm(v,gt263),
nf,
nf,
nf,
nf,
v=>lsm(v,gt264),
nf,
nf,
v=>lsm(v,gt265),
v=>lsm(v,gt266),
nf,
nf,
v=>lsm(v,gt267),
nf,
nf,
v=>lsm(v,gt268),
nf,
nf,
nf,
nf,
nf,
nf,
nf,
nf,
nf,
nf,
v=>lsm(v,gt242),
nf,
nf,
nf,
nf,
v=>lsm(v,gt269),
v=>lsm(v,gt270),
v=>lsm(v,gt271),
v=>lsm(v,gt272),
v=>lsm(v,gt273),
v=>lsm(v,gt274),
v=>lsm(v,gt275),
nf,
nf,
nf,
nf,
nf,
v=>lsm(v,gt276),
nf,
v=>lsm(v,gt277),
nf,
nf,
nf,
nf,
nf,
v=>lsm(v,gt278),
v=>lsm(v,gt247),
v=>lsm(v,gt247),
nf,
nf,
v=>lsm(v,gt279),
nf,
nf,
nf,
v=>lsm(v,gt280),
nf,
nf,
nf,
nf,
nf,
nf,
nf,
nf,
nf,
v=>lsm(v,gt281),
v=>lsm(v,gt248),
nf,
v=>lsm(v,gt282),
nf,
v=>lsm(v,gt283),
v=>lsm(v,gt284),
nf,
nf,
nf,
nf,
nf,
nf,
nf,
nf,
nf,
nf,
nf,
nf,
v=>lsm(v,gt285),
nf,
nf,
nf,
nf,
nf,
nf,
nf,
nf,
v=>lsm(v,gt286),
nf,
nf,
nf,
nf,
v=>lsm(v,gt287),
nf,
nf,
nf,
nf,
nf,
nf,
nf,
nf,
v=>lsm(v,gt288),
nf,
nf,
nf,
nf,
nf,
nf,
v=>lsm(v,gt289),
v=>lsm(v,gt290),
nf,
nf,
nf,
v=>lsm(v,gt291),
v=>lsm(v,gt292),
nf,
nf,
nf,
nf,
v=>lsm(v,gt293),
v=>lsm(v,gt294),
nf,
nf,
nf,
nf,
v=>lsm(v,gt295),
v=>lsm(v,gt296),
v=>lsm(v,gt297),
nf,
nf,
nf,
nf,
nf,
nf,
nf,
nf,
v=>lsm(v,gt298),
v=>lsm(v,gt299),
v=>lsm(v,gt300),
nf,
nf,
nf,
nf,
nf,
nf,
v=>lsm(v,gt275),
nf,
nf,
nf,
nf,
nf,
v=>lsm(v,gt301),
v=>lsm(v,gt302),
nf,
nf,
v=>lsm(v,gt247),
nf,
nf,
nf,
v=>lsm(v,gt303),
nf,
nf,
nf,
nf,
nf,
nf,
v=>lsm(v,gt304),
nf,
nf,
nf,
nf,
nf,
nf,
nf,
nf,
nf,
nf,
nf,
nf,
nf,
nf,
nf,
nf,
nf,
nf,
nf,
nf,
nf,
nf,
nf,
nf,
v=>lsm(v,gt305),
nf,
v=>lsm(v,gt306),
nf,
nf,
nf,
nf,
v=>lsm(v,gt307),
v=>lsm(v,gt308),
v=>lsm(v,gt309),
v=>lsm(v,gt310),
nf,
nf,
v=>lsm(v,gt311),
v=>lsm(v,gt312),
v=>lsm(v,gt313),
nf,
v=>lsm(v,gt314),
nf,
v=>lsm(v,gt315),
nf,
nf,
nf,
v=>lsm(v,gt316),
v=>lsm(v,gt296),
nf,
nf,
nf,
v=>lsm(v,gt317),
v=>lsm(v,gt318),
v=>lsm(v,gt319),
nf,
nf,
v=>lsm(v,gt320),
v=>lsm(v,gt321),
v=>lsm(v,gt322),
nf,
v=>lsm(v,gt323),
nf,
v=>lsm(v,gt324),
nf,
nf,
nf,
nf,
v=>lsm(v,gt316),
v=>lsm(v,gt325),
nf,
nf,
nf,
v=>lsm(v,gt301),
nf,
v=>lsm(v,gt326),
v=>lsm(v,gt327),
v=>lsm(v,gt328),
nf,
nf,
nf,
nf,
v=>lsm(v,gt329),
nf,
nf,
nf,
nf,
nf,
nf,
nf,
nf,
nf,
nf,
nf,
nf,
nf,
nf,
nf,
v=>lsm(v,gt330),
nf,
nf,
v=>lsm(v,gt331),
nf,
nf,
nf,
nf,
v=>lsm(v,gt332),
nf,
nf,
nf,
nf,
v=>lsm(v,gt333),
nf,
nf,
nf,
nf,
nf,
nf,
v=>lsm(v,gt334),
nf,
nf,
nf,
nf,
v=>lsm(v,gt335),
v=>lsm(v,gt336),
nf,
nf,
nf,
nf,
nf,
nf,
nf,
v=>lsm(v,gt337),
v=>lsm(v,gt338),
v=>lsm(v,gt339),
nf,
nf,
nf,
nf,
nf,
v=>lsm(v,gt334),
nf,
v=>lsm(v,gt340),
nf,
nf,
nf,
nf,
nf,
nf,
nf,
nf,
nf,
nf,
nf,
nf,
nf,
nf,
nf,
v=>lsm(v,gt341),
nf,
nf,
v=>lsm(v,gt341),
nf,
nf,
nf,
nf,
nf,
nf,
nf,
nf,
nf,
nf,
nf,
nf,
nf,
nf,
nf,
nf,
nf,
nf,
nf,
nf,
nf,
nf,
nf,
v=>lsm(v,gt342),
v=>lsm(v,gt343),
nf,
nf,
nf,
nf,
v=>lsm(v,gt344),
v=>lsm(v,gt345),
nf,
nf,
nf,
nf,
nf,
nf,
nf,
v=>lsm(v,gt346),
v=>lsm(v,gt347),
v=>lsm(v,gt275),
nf,
nf,
nf,
nf,
nf,
nf];

function getToken(l, SYM_LU) {
    if (l.END) return 0; /*$eof*/

    switch (l.ty) {
        case 2:
            //*
            if (SYM_LU.has(l.tx)) return 14;
            /*/
                console.log(l.tx, SYM_LU.has(l.tx), SYM_LU.get(l.tx))
                if (SYM_LU.has(l.tx)) return SYM_LU.get(l.tx);
            //*/
            return 2;
        case 1:
            return 1;
        case 4:
            return 3;
        case 256:
            return 9;
        case 8:
            return 4;
        case 512:
            return 10;
        default:
            return SYM_LU.get(l.tx) || SYM_LU.get(l.ty);
    }
}

/************ Parser *************/

function parser(l, e = {}) {

    fn = e.functions;

    l.IWS = false;
    l.PARSE_STRING = true;

    if (symbols.length > 0) {
        symbols.forEach(s => { l.addSymbol(s); });
        l.tl = 0;
        l.next();
    }

    const o = [],
        ss = [0, 0];

    let time = 1000000,
        RECOVERING = 100,
        tk = getToken(l, lu),
        p = l.copy(),
        sp = 1,
        len = 0,
        reduceStack = (e.reduceStack = []),
        off = 0;

    outer:

        while (time-- > 0) {

            const fn = lsm(tk, state[ss[sp]]) || 0;

            let r,
                gt = -1;

            if (fn == 0) {
                /*Ignore the token*/
                tk = getToken(l.next(), lu);
                continue;
            }

            if (fn > 0) {
                r = state_funct[fn - 1](tk, e, o, l, ss[sp - 1]);
            } else {

                if (tk == 14) {
                    tk = lu.get(l.tx);
                    continue;
                }

                if (l.ty == 8 && l.tl > 1) {
                    // Make sure that special tokens are not getting in the way
                    l.tl = 0;
                    // This will skip the generation of a custom symbol
                    l.next(l, false);

                    if (l.tl == 1)
                        continue;
                }

                if (RECOVERING > 1 && !l.END) {

                    if (tk !== lu.get(l.ty)) {
                        tk = lu.get(l.ty);
                        continue;
                    }

                    if (tk !== 13) {
                        tk = 13;
                        RECOVERING = 1;
                        continue;
                    }
                }

                tk = getToken(l, lu);

                const recovery_token = eh[ss[sp]](tk, e, o, l, p, ss[sp], (lex) => getToken(lex, lu));

                if (RECOVERING > 0 && recovery_token >= 0) {
                    RECOVERING = -1; /* To prevent infinite recursion */
                    tk = recovery_token;
                    l.tl = 0; /*reset current token */
                    continue;
                }
            }

            switch (r & 3) {
                case 0:
                    /* ERROR */

                    if (tk == "$eof")
                        l.throw("Unexpected end of input");

                    l.throw(`Unexpected token [${RECOVERING ? l.next().tx : l.tx}]`);
                    return [null];

                case 1:
                    /* ACCEPT */
                    break outer;

                case 2:

                    /*SHIFT */
                    o.push(l.tx);
                    ss.push(off, r >> 2);
                    sp += 2;
                    l.next();
                    off = l.off;
                    tk = getToken(l, lu);
                    RECOVERING++;
                    break;

                case 3:

                    len = (r & 0x3FC) >> 1;

                    ss.length -= len;
                    sp -= len;
                    gt = goto[ss[sp]](r >> 10);

                    if (gt < 0)
                        l.throw("Invalid state reached!");

                    if (reduceStack.length > 0) {
                        let i = reduceStack.length - 1;
                        while (i > -1) {
                            let item = reduceStack[i--];

                            if (item.index == sp) {
                                item.action(output);
                            } else if (item.index > sp) {
                                reduceStack.length--;
                            } else {
                                break;
                            }
                        }
                    }

                    ss.push(off, gt);
                    sp += 2;
                    break;
            }
        }
    return o[0];
}

// This prevents env variable access conflicts when concurrent compilation
// are processing text data. 

class CompilerEnvironment {
    constructor(presets, env, url) {
        this.functions = env.functions;
        this.prst = [presets];
        this.url = url || new URL;
        this.pending = 0;
        this.parent = null;
        this.ASI = true; // Automatic Semi-Colon Insertion
        this.pendingResolvedFunction = () => {};
    }

    pushPresets(prst) {
        this.prst.push(prst);
    }

    popPresets() {
        return this.prst.pop();
    }

    get presets() {
        return this.prst[this.prst.length - 1] || null;
    }

    setParent(parent){
        this.parent = parent;
        parent.pending++;
    }

    resolve() {
        this.pending--;
        if (this.pending < 1) {
            if (this.parent)
                this.parent.resolve();
            else
                this.pendingResolvedFunction();
        }
    }
}

var types$1 = {
	//Identifier
identifier:1,
string:2,
//
add_expression:3,
and_expression:4,
array_literal:5,
arrow_function_declaration:6,
assignment_expression:7,
await_expression:8,
binding:9,
block_statement:10,
bool_literal:11,
call_expression:12,
catch_statement:13,
condition_expression:14,
debugger_statement:15,
delete_expression:16,
divide_expression:17,
equality_expression:18,
exponent_expression:19,
expression_list:20,
expression_statement:21,
for_statement:22,
function_declaration:23,
if_statement:25,
in_expression:26,
instanceof_expression:27,
left_shift_expression:28,
lexical_declaration:29,
member_expression:30,
modulo_expression:31,
multiply_expression:32,
negate_expression:33,
new_expression:34,
null_literal:35,
numeric_literal:36,
object_literal:37,
or_expression:38,
plus_expression:39,
post_decrement_expression:40,
post_increment_expression:41,
pre_decrement_expression:42,
pre_increment_expression:43,
property_binding:44,
right_shift_expression:45,
right_shift_fill_expression:46,
return_statement:47,
spread_element:48,
statements:49,
subtract_expression:51,
this_literal:52,
try_statement:53,
typeof_expression:54,
unary_not_expression:55,
unary_or_expression:56,
unary_xor_expression:57,
void_expression:58,
argument_list:59,
variable_declaration:61,
class_method:62,
class_declaration:63,
template:64,
template_head:65,
template_middle:66,
template_tail:67,
export_declaration:68,
empty:69,
module:71,
import_declaration:70,
super_literal:72,
cover_parenthesized_expression_and_arrow_parameter_list:60,
for_of_statement:73,
for_in_statement:74
	};

class base {
    constructor(...vals) {

        this.vals = vals;
        this.parent = null;
    }

    replaceNode(original, _new = null, vals = this.vals) {
        for (let i = 0; i < vals.length; i++) {
            if (vals[i] === original)
                if (_new === null) {
                    return i;
                } else
                    return vals[i] = _new, -1;
        }
    }

    replace(node) {
        if (this.parent)
            this.parent.replaceNode(this, node);
    }

    getRootIds(ids, closure) {
        for(const id of this.vals)
            if(id && id.getRootIds)
                id.getRootIds(ids, closure);
    }

    * traverseDepthFirst(p, vals = this.vals) {
        this.parent = p;
        this.SKIP = false;

        if(vals == this.vals)
            yield this;

        for (let i = 0; i < vals.length; i++) {
            if(this.SKIP == true)
                break;

            const node = vals[i];

            if (!node) continue;

            if(Array.isArray(node)){
                yield* this.traverseDepthFirst(p, node);
            }else if(typeof(node) == "object"){
                yield* node.traverseDepthFirst(this);
            }

            if (vals[i] !== node) // Check to see if node has been replaced. 
                i--; //Reparse the node
        }
    }

    skip() {
        this.SKIP = true;
    }

    spin(trvs) {
        let val = trvs.next().value;
        while (val !== undefined && val !== this) { val = trvs.next().value; }    }

    toString() { return this.render() }

    render() { return this.vals.join("") }

    get connect(){
        this.vals.forEach(v=>{
            try{
                v.parent = this;
            }catch(e){
                
            }
        });
        return this;
    }
}

class statement extends base {get IS_STATEMENT(){return true}}

/** OPERATOR **/
class operator$1 extends base {

    constructor(sym) {
        super(sym[0], sym[2]);
        this.op = "";
    }

    get left() { return this.vals[0] }
    get right() { return this.vals[1] }

    getRootIds(ids, closure) { 
        this.left.getRootIds(ids, closure);
        this.right.getRootIds(ids, closure);
    }

    replaceNode(original, _new = null) {
        var index;

        if ((index = super.replaceNode(original, _new)) > -1){
            this.replace(this.vals[(index+1)%2]);
        }
    }

    render() { return `${this.left.render()} ${this.op} ${this.right.render()}` }
}

/** ADD **/
class add_expression extends operator$1 {

    constructor(sym) {
        super(sym);
        this.op = "+";
    }

    get type() { return types$1.add_expression }
}

/** AND **/
class and_expression extends operator$1 {

    constructor(sym) {
        super(sym);
        this.op = "&&";
    }

    get type() { return types$1.and_expression }
}

/** ARGUMENT_LIST **/
class argument_list extends base {
    constructor(sym) {

        //if (sym && sym.length == 1)
        //    return sym[0];
        
        super( sym || []);
    }

    clearRoots(){
        this.args.forEach(a=>a.root = false);
    }

    get args() { return this.vals[0] }

    getRootIds(ids, closure) {
        this.args.forEach(s => s.getRootIds(ids, closure));
    }

    replaceNode(original, _new = null) {
        let index = -1;
        if ((index = super.replaceNode(original, _new, this.vals[0])) > -1) {
            this.vals[0].splice(index, 1);
        }
    }

    * traverseDepthFirst(p) {
        yield * super.traverseDepthFirst(p, this.vals[0]);
    }

    get length (){
        return this.args.length;
    }

    get type() { return types$1.argument_list }

    render(USE_PARENTHASIZ) { 
        return this.args.map(s=>(s.render())).join(",") ;
    }
}

class array_literal extends base {
    constructor(list) {

        
        super(list || []);
    }

    get exprs() { return this.vals[0] }

    getRootIds(ids, closure) {
        this.exprs.forEach(e => e.getRootIds(ids, closure));
    }

    replaceNode(original, _new = null) {
        let index = 0;
        if ((index = super.replaceNode(original, _new, this.vals[0])) > -1) {
            this.vals[0].splice(index, 1);
        }
    }

    get type() { return types$1.array_literal }

    render() { return `[${this.exprs.map(a=>a.render()).join(",")}]` }
}

class function_declaration extends base {
    constructor(id, args, body) {

        super(id, args || null, body || null);

        //This is a declaration and id cannot be a closure variable. 
        if (this.id)
            this.id.root = false;
    }

    get id() { return this.vals[0] }
    get args() { return this.vals[1] }
    get body() { return this.vals[2] }

    getRootIds(ids, closure) {
        if (this.id)
            this.id.getRootIds(ids, closure);
        if (this.args)
            this.args.getRootIds(ids, closure);
        if (this.body)
            this.body.getRootIds(ids, closure);
    }

    get name() { return this.id.name }

    get type() { return types$1.function_declaration }

    render() {
        const
            body_str = (this.body) ? this.body.render() : "",
            args_str = (this.args) ? this.args.render() : "()",
            id = this.id ? this.id.render() : "";

        return `function ${id}${args_str}{${body_str}}`;
    }
}

/** cover_parenthesized_expression_and_arrow_parameter_list **/

class argument_list$1 extends base {
    constructor(...sym) {
        if(!sym || !sym[0])        
            super();
        else
            super(...sym);

        this.looking = this.render() == "($$sym3,$$sym6,env,lex)";
    }

    clearRoots(){
        this.vals.forEach(a=>a.root = false);
    }

    addToClosure(closure){
        this.vals.forEach(a=>closure.add(a.name));   
    }

    get args() { return this.vals }

    get length (){
        return this.vals.length;
    }

    replaceNode(original, _new = null) {

        let index = -1;
        if ((index = super.replaceNode(original, _new)) > -1) {
            this.vals.splice(index, 1);
        }
    }

    get type() { return types$1.argument_list }

    render(USE_PARENTHASIS = true) { 
        const str = this.vals.map(s=>(s.render())).join(",") ;
        return USE_PARENTHASIS ? `(${str})` : str;
    }
}

class arrow_function_declaration extends function_declaration {
    constructor(...sym) {

        super(...sym);

        if (!this.args)
            this.vals[1] = new argument_list$1();

        this.args.clearRoots();
    }

    getRootIds(ids, closure) {
        if (this.args){
            this.args.getRootIds(ids, closure);
            this.args.addToClosure(closure);
        }
        if (this.body)
            this.body.getRootIds(ids, closure);
    }

    get IS_STATEMENT() { return false }

    get name() { return null }

    get type() { return types$1.arrow_function_declaration }

    render() {
        const
            body_str = ((this.body) ?
                ((this.body.IS_STATEMENT || (this.body.type == types$1.statements && this.body.stmts.length > 1)) ?
                    `{${this.body.render()}}` :
                    this.body.render()) :
                "{}"),
            args_str = this.args.render(this.args.length !== 1);

        return `${args_str}=>${body_str}`;
    }
}

/** ASSIGNEMENT EXPRESSION **/

class assignment_expression extends operator$1 {
    constructor(sym) {
        super(sym);
        this.op = sym[1];
        //this.id.root = false;
    }
    
    getRootIds(ids, closure) { 
        if(this.left.type !== types$1.identifier)
            this.left.getRootIds(ids, closure);
        this.right.getRootIds(ids, closure);
    }

    get id() { return this.vals[0] }
    get expr() { return this.vals[2] }
    get type() { return types$1.assignment_expression }
}

/** OPERATOR **/
class unary_pre extends base {

    constructor(sym) {
        super(sym[1]);
        this.op = "";
    }

    get expr() { return this.vals[0] }

    replaceNode(original, _new = null) {
        if(_new === null || _new.type == types$1.null_literal){
            this.replace(_new);
        }
        else
            this.vals[0] = _new;
    }

    render() { return `${this.op}${this.expr.render()}` }
}

/** VOID **/

class await_expression extends unary_pre {

    constructor(sym) {
        super(sym);
        this.op = "await";
    }

    get type() { return types$1.await_expression }
}

/** BINDING DECLARATION **/
class binding extends base {
    constructor(sym) {
        super(sym[0], sym[1] || null);
        this.id.root = false;
    }

    get id() { return this.vals[0] }
    get init() { return this.vals[1] }
    get type(){return types$1.binding}

    getRootIds(ids, closure, declaration = false) {
        if(declaration)
            closure.add(this.id.val);
            //this.id.getRootIds(closure, closure);
        //closure.add(this.id.val)
        if (this.init) this.init.getRootIds(ids, closure);
    }

    render() { return `${this.id}${this.init ? ` = ${this.init.render()}` : ""}` }
}

/** BITWISE AND EXPRESSION **/
class bitwise_and_espression extends operator$1 {

    constructor(sym) {
        super(sym);
        this.op = "&";
    }

    get type () { return types$1.bitwise_and_espression }
}

/** BITWISE OR EXPRESSION **/
class bitwise_or_espression extends operator$1 {

    constructor(sym) {
        super(sym);
        this.op = "|";
    }

    get type () { return types$1.bitwise_or_espression }
}

/** BITWISE XOR EXPRESSION **/
class bitwise_xor_espression extends operator$1 {

    constructor(sym) {
        super(sym);
        this.op = "^";
    }

    get type () { return types$1.bitwise_xor_espression }
}

/** STATEMENTS **/
class statements extends statement {
    constructor(sym) {

        if (sym[0].length == 1)
            return sym[0][0];
        
        super(sym[0]);
    }

    get stmts() { return this.vals[0] }

    getRootIds(ids, closure) {
        this.stmts.forEach(s => s.getRootIds(ids, closure));
    }

    replaceNode(original, _new = null) {
        let index = -1;
        if ((index = super.replaceNode(original, _new, this.vals[0])) > -1) {
            this.vals[0].splice(index, 1);
        }
    }

    * traverseDepthFirst(p) {
        yield * super.traverseDepthFirst(p, this.vals[0]);
    }

    get type() { return types$1.statements }

    render() { 
        return this.stmts.map(s=>(s.render())).join("") ;
    }
}

/** BLOCK **/
class block_statement extends statements {

    constructor(sym) {
        if (!(sym[1] instanceof statements))
            return sym[1];

        super(sym[1].vals);
    }

    getRootIds(ids, closure) {
        super.getRootIds(ids, new Set([...closure.values()]));
    }

    get type() { return types$1.block_statement }

    render() { return `{${super.render()}}` }
}

/** BOOLEAN **/

class bool_literal extends base {
    constructor(sym) { super(sym[0]); }

    get type() { return types$1.bool_literal }

    * traverseDepthFirst(p) {
        this.parent = p;
        yield this;
    }
}

/** BREAK STATMENT  **/



class break_statement extends base {
    constructor(sym) {
        super((Array.isArray(sym)) ? null : sym );
    }

    get label() { return this.vals[0] }

    get type() { return types$1.break_statement }

    render() {
        let label_str = this.label ? " " + this.label.render(): "";        
        return `break${label_str};`;
    }
}

class call_expression extends base {
    constructor(sym) {
        super(...sym);
    }

    get id() { return this.vals[0] }
    get args() { return this.vals[1] }

    getRootIds(ids, closure) {
        this.id.getRootIds(ids, closure);
        this.args.getRootIds(ids, closure);
    }

    replaceNode(original, _new = null) {
        let index = 0;
        if ((index = super.replaceNode(original, _new, this.vals)) > -1) {
            if(index == 0)
                this.replace(_new);
            else
                this.replace(null);
        }
    }

    get name() { return this.id.name }
    get type() { return types$1.call_expression }

    render() { 
        return `${this.id.render()}${this.args.render()}` 
    }
}

/** CASE STATMENT  **/

class case_statement extends base {
    get expression() { return this.vals[0] }
    get statements() { return this.vals[1] }

    getRootIds(ids, closure) {
        this.expression.getRootIds(ids, closure);
        if (this.statements) this.statements.getRootIds(ids, closure);
    }

    get type() { return types$1.case_statement }

    render() {
        return `case ${this.expression.render()}:${this.statements?this.statements.render():""}`;
    }
}

/** CATCH **/
class catch_statement extends statement {
    constructor(sym) {
        super(sym[2], sym[4]);
    }

    get expression() { return this.vals[0] }
    get body() { return this.vals[1] }

    getRootIds(ids, closure) {
        this.expression.getRootIds(ids, closure);
        this.body.getRootIds(ids, closure);
    }

    get type() { return types$1.catch_statement }

    render(){
        return `catch (${this.expression})${this.body.type == types$1.block_statement ? this.body : `{${this.body}}`}`
    }
}

class class_declaration extends base {
    constructor(id, heritage, body) {

        super(id, heritage, body);

        //This is a declaration and id cannot be a closure variable. 
        if (this.id)
            this.id.root = false;
    }

    get id() { return this.vals[0] }
    get heritage() { return this.vals[1] }
    get body() { return this.vals[2] }


    getRootIds(ids, closure) {
        if (this.id)
            this.id.getRootIds(ids, closure);
        if (this.heritage)
            this.heritage.getRootIds(ids, closure);
        if (this.body)
            for(const item of this.body)
                item.getRootIds(ids, closure);
    }

    get name() { return this.id.name }

    get type() { return types$1.class_declaration }

    render() {
        const
            body_str = this.body.map(b=>b.render()).join(""),
            heritage = (this.heritage) ? " extends "+this.heritage.render() : "",
            id = this.id ? " " + this.id.render() : "";

        return `class${id}${heritage}{${body_str}}`;
    }
}

class class_method extends function_declaration {
    constructor(id, args, body, method_type = "") {

        super(id, args, body);

        this.method_type = "";
        this.static = false;
    }

    get type() { return types$1.class_method }

    render() {
        const
            body_str = (this.body) ? this.body.render() : "",
            args_str = (this.args) ? this.args.render(true) : "()",
            id = this.id ? this.id.render() : "";

        return `${this.method_type ? this.method_type + " ": ""}${id}${args_str}{${body_str}}`;
    }
}

/** CONDITION EXPRESSIONS **/
class condition_expression extends base {
    constructor(sym) {
        super(sym[0], sym[2], sym[4]);
    }

    get bool() { return this.vals[0] }
    get left() { return this.vals[1] }
    get right() { return this.vals[2] }

    getRootIds(ids, closure) {
        this.bool.getRootIds(ids, closure);
        this.left.getRootIds(ids, closure);
        this.right.getRootIds(ids, closure);
    }

    get type() { return types$1.condition_expression }

    render() {
        const
            bool = this.bool.render(),
            left = this.left.render(),
            right = this.right.render();

        return `${bool} ? ${left} : ${right}`;
    }
}

/** CONTINUE STATMENT  **/

class continue_statement extends base {
    get label() { return this.vals[0] }

    get type() { return types$1.continue_statement }

    render() {
        let label_str = this.label ? " " + this.label.render(): "";        
        return `continue${label_str};`;
    }
}

/** DEBUGGER STATEMENT  **/

class debugger_statement extends base {
    constructor() {
        super();
    }

    getRootIds(ids, closure) {
        if (this.expr) this.expr.getRootIds(ids, closure);
    }

    * traverseDepthFirst(p) {
        this.parent = p;
        yield this;
    }

    get type() { return types$1.debugger_statement }

    render() { return `debugger;` }
}

/** DEFAULT CASE STATMENT  **/

class default_case_statement extends base {
    get statements() { return this.vals[0] }

    getRootIds(ids, closure) {
        if (this.statements) this.statements.getRootIds(ids, closure);
    }

    get type() { return types$1.default_case_statement }

    render() {
        return `default:${this.statements?this.statements.render():""}`;
    }
}

class default_import extends base {
    constructor(sym) {
        super(sym[0]);

    }

    get id() { return this.vals[0] }

    getRootIds(ids, closure) {
        if (this.id)
            this.id.getRootIds(ids, closure);
    }

    get name() { return this.id.name }

    get type() { return types$1.default_import }

    render() {
        return this.id.render();
    }
}

/** POSTFIX INCREMENT **/

class delete_expression extends unary_pre {

    constructor(sym) {
        super(sym);
        this.op = "delete";
    }

    get type() { return types$1.delete_expression }
}

/** DIVIDE EXPRESSION **/
class divide_expression extends operator$1 {

    constructor(sym) {
        super(sym);
        this.op = "/";
    }

    get type () { return types$1.divide_expression }
}

/** empty **/
class empty_statement extends base {
    constructor() {
        super();
    }
    get type() { return types$1.empty }
    render() { return ";" }
}

/** EQ **/
class equality_expression extends operator$1 {
    constructor(sym) {super(sym); this.op = sym[1];  }
    get type() { return types$1.equality_expression }
}

/** EXPONENT **/
class equality_expression$1 extends operator$1 {

    constructor(sym) {
        super(sym);
        this.op = "**";
    }

    get type() { return types$1.equality_expression }
}

class export_clause extends base {
	
    constructor(exports) {
        super(exports);
    }

    get exports() { return this.vals[0] }

    get type() { return types$1.named_exports }

    render() {
        const
            exports = this.exports.map(e => e.render()).join(",");

        return `{${exports}}`;
    }
}

class export_declaration extends base {
    constructor(exports, specifier, DEFAULT = false) {
        
        super(exports, specifier);

        this.DEFAULT = DEFAULT;
    }

    get exports() { return this.vals[0] }
    get specifier() { return this.vals[1] }

    getRootIds(ids, closure) {
        if (this.exports)
            this.exports.getRootIds(ids, closure);
    }

    get type() { return types$1.export_declaration }

    render() {
        const
            exports = this.exports ? this.exports.render() : "",
        	specifier  = this.specifier ? ` from ${this.specifier.render()}` : "";

        return `export ${this.DEFAULT ? "default " : ""}${exports}${specifier}`;
    }
}

class export_specifier extends base {
    constructor(id, args, body) {
        
        args = (Array.isArray(args)) ? args : [args];

        super(id, args || [], body || []);

        //This is a declaration and id cannot be a closure variable. 
        if (this.id)
            this.id.root = false;
    }

    get id() { return this.vals[0] }
    get args() { return this.vals[1] }
    get body() { return this.vals[2] }

    getRootIds(ids, closure) {
        if (this.id)
            this.id.getRootIds(ids, closure);
        this.args.forEach(e => e.getRootIds(ids, closure));
    }

    get name() { return this.id.name }

    get type() { return types$1.export_specifier }

    render() {
        const
            body_str = (this.body) ? this.body.render() : "",
            args_str = this.args.map(e => e.render()).join(","),
            id = this.id ? this.id.render() : "";

        return `function ${id}(${args_str}){${body_str}}`;
    }
}

/** EXPRESSION_LIST **/

class expression_list extends base {
    constructor(sym) {

        if (sym[0].length == 1)
            return sym[0][0];

        super(sym[0]);
    }

    get expressions() { return this.vals[0] }

    getRootIds(ids, closure) {
        this.expressions.forEach(s => s.getRootIds(ids, closure));
    }

    replaceNode(original, _new = null) {
        let index = -1;
        if ((index = super.replaceNode(original, _new, this.vals[0])) > -1) {
            this.vals[0].splice(index, 1);
        }
    }

    * traverseDepthFirst(p) {
        yield * super.traverseDepthFirst(p, this.vals[0]);
    }

    get type() { return types$1.expression_list }

    render() { return `(${this.expressions.map(s=>s.render()).join(",")})` }
}

/** EXPRESSION STATEMENT **/

class expression_statement extends statement {

    constructor(sym) {
        super(sym[0]);
    }

    get expression() { return this.vals[0] }

    getRootIds(ids, closure) {
        this.expression.getRootIds(ids, closure);
    }

    replaceNode(original, _new = null) {
        if(!super.replaceNode(original, _new, this.vals[0]))
            this.replace();
    }

    get type() { return types$1.expression_statement }

    render() { return this.expression.render() + ";" }
}

/** FOR **/
class for_statement extends base {

    get init() { return this.vals[0] }
    get bool() { return this.vals[1] }
    get iter() { return this.vals[2] }
    get body() { return this.vals[3] }

    getRootIds(ids, closure) {  
        if (this.init) this.init.getRootIds(ids, closure);
        if (this.bool) this.bool.getRootIds(ids, closure);
        if (this.iter) this.iter.getRootIds(ids, closure);

       // closure = new Set([...closure.values()]);
        
        if (this.body) this.body.getRootIds(ids, new Set);

    }

    * traverseDepthFirst(p) {
        this.parent = p;
        yield this;
        if (this.init) yield* this.init.traverseDepthFirst(this);
        if (this.bool) yield* this.bool.traverseDepthFirst(this);
        if (this.iter) yield* this.iter.traverseDepthFirst(this);
        if (this.body) yield* this.body.traverseDepthFirst(this);
        yield this;
    }

    get type() { return types$1.for_statement }

    render() {
        let init, bool, iter, body;

        if (this.init) init = this.init.render();
        if (this.bool) bool = this.bool.render();
        if (this.iter) iter = this.iter.render();
        if (this.body) body = this.body.render();

        const init_simicolon = init[init.length-1] == ";";

        return `for(${init}${init_simicolon ? "" : ";"}${bool};${iter})${body}`;
    }
}

/** IDENTIFIER **/
class identifier$1 extends base {
    constructor(sym) {
        super(sym[0]);
        this.root = true;
    }

    get val() { return this.vals[0] }

    getRootIds(ids, closure) { 
        if(!closure.has(this.val)){
            ids.add(this.val);
        }
    }

      addToClosure(closure){
        this.vals.forEach(a=>closure.add(a.name));   
    }


    * traverseDepthFirst(p) {
        this.parent = p;
        yield this;
    }

    get name() { return this.val }

    get type() { return types$1.identifier }

    render() { return this.val }
}

/** STATEMENTS **/

class if_statement extends base {
    constructor(sym) {
        const expr = sym[2],
            stmt = sym[4],
            else_stmt = (sym.length > 5) ? sym[6] : null;

        super(expr, stmt, else_stmt);
    }

    get expr() { return this.vals[0] }
    get stmt() { return this.vals[1] }
    get else_stmt() { return this.vals[2] }

    getRootIds(ids, closure) {
        this.expr.getRootIds(ids, closure);
        this.stmt.getRootIds(ids, closure);
        if (this.else_stmt)
            this.else_stmt.getRootIds(ids, closure);
    }

    * traverseDepthFirst(p) {

        this.parent = p;

        yield this;

        yield* this.expr.traverseDepthFirst(this);
        yield* this.stmt.traverseDepthFirst(this);

        if (this.else_stmt)
            yield* this.else_stmt.traverseDepthFirst(this);
    }

    get type() { return types$1.if_statement }

    render() {
        const
            expr = this.expr.render(),
            stmt = this.stmt.type == types$1.statements ? `{${this.stmt.render()}}` : this.stmt.render(),
            _else = (this.else_stmt) ? " else " + (
                this.else_stmt.type == types$1.statements || this.else_stmt.type == types$1.if_statement ? `{${this.else_stmt.render()}}` : this.else_stmt.render()
            ) : "";
        return `if(${expr})${stmt}${_else}`;
    }
}

class import_clause extends base {

    constructor(imports) {
        super(imports);
    }

    get imports() { return this.vals[0] }

    getRootIds(ids, closure) {
        this.imports.getRootIds(ids, closure);
    }

    get type() { return types$1.import_clause }

    render() {
        return this.imports.render();
    }
}

/** IMPORT STATEMENT  **/



class import_declaration extends base {

    constructor(specifier, import_clause = null) {
        console.log(import_clause);
        super((Array.isArray(import_clause)) ? new base(import_clause) : import_clause , specifier);
    }

    get import_clause() { return this.vals[0] }
    get specifier() { return this.vals[1] }

    getRootIds(ids, closure) {
        if (this.expr) this.expr.getRootIds(ids, closure);
    }

    get type() { return types$1.import_declaration }

    render() {
        if(this.import_clause)
            return `import ${this.import_clause.render()} from ${this.specifier.render()};`
        else
            return `import ${this.specifier.render()};`
    }
}

class import_specifier extends base {
     constructor(id, alt_id) {

         super(id, alt_id );

         //This is a declaration and id cannot be a closure variable. 
         if (this.id)
             this.id.root = false;
     }

     get id() { return this.vals[0] }
     get alt_id() { return this.vals[1] }

     getRootIds(ids, closure) {
         if (this.alt_id)
             this.alt_id.getRootIds(ids, closure);
         else this.id.getRootIds(ids, closure);
     }

     get name() { return this.alt_id.name }

     get type() { return types$1.import_specifier }

     render() {
		if (this.alt_id)
            return `${this.id.render()} as ${this.alt_id.render()}`
         else return `${this.id.render()} `
     }
 }

/** IN **/
class in_expression extends operator$1 {

    constructor(sym) {
        super(sym);
        this.op = "in";
    }

    get type() { return types$1.in_expression }
}

/** INSTANCEOF **/
class instanceof_expression extends operator$1 {

    constructor(sym) {
        super(sym);
        this.op = "instanceof";
    }

    get type() { return types$1.instanceof_expression }
}

/** RETURN STATMENT  **/



class label_statement extends base {
    constructor(sym) {
        super(sym[0], sym[1]);
    }

    get id(){return this.vals[0]}
    get stmt(){return this.vals[1]}

    get type() { return types$1.label_statement }

    render() {
        return `${this.id.render()}: ${this.stmt.render()}`;
    }
}

/** LEFT_SHIFT **/
class left_shift_expression extends operator$1 {

    constructor(sym) {
        super(sym);
        this.op = "<<";
    }

    get type() { return types$1.left_shift_expression }
}

/** LEXICAL DECLARATION **/
class lexical_declaration extends base {
    constructor(sym) {
        super(sym[1]);
        this.mode = sym[0];
    }

    get bindings() { return this.vals[0] }

    getRootIds(ids, closure) {
        this.bindings.forEach(b => b.getRootIds(ids, closure, true));
    }

    get type() { return types$1.lexical_declaration }

    render() { return `${this.mode} ${this.bindings.map(b=>b.render()).join(",")};` }
}

/** MEMBER **/

class member_expression extends base {
    constructor(id, mem, evaluated = false) { 
        super(id, mem);
        this.evaluated = evaluated;
        this.root = true;
        this.mem.root = false;
    }

    get id() { return this.vals[0] }
    get mem() { return this.vals[1] }

    getRootIds(ids, closure) {
        this.id.getRootIds(ids, closure);
    }

    replaceNode(original, _new = null) {
        let index = 0;
        if ((index = super.replaceNode(original, _new, this.vals)) > -1) {
            if(index == 0)
                this.replace(_new);
            else
                this.replace(null);
        }
    }

    get name() { return this.id.name }
    get type() { return types$1.member_expression }

    render() { 
        if(this.evaluated){
            return `${this.id.render()}[${this.mem.render()}]`;
        }else{
            return `${this.id.render()}.${this.mem.render()}`;
        }
    }
}

/** MODULE TL  **/

class module$1 extends base {
    constructor(sym) {
        super(sym);
    }

    get statements() { return this.vals[0] }

    getRootIds(ids, closure) {
        if (this.statements) this.statements.getRootIds(ids, closure);
    }

    get type() { return types$1.module }

    render() {
        return this.statements.render();
    }
}

/** MODULO **/
class modulo_expression extends operator$1 {

    constructor(sym) {
        super(sym);
        this.op = "%";
    }

    get type() { return types$1.modulo_expression }
}

/** MULTIPLY **/
class multiply_expression extends operator$1 {

    constructor(sym) {
        super(sym);
        this.op = "*";
    }

    get type () { return types$1.multiply_expression }

    
}

class name_space_import extends base {
    constructor(sym) {

        super(sym[0]);

        //This is a declaration and id cannot be a closure variable. 
        if (this.id)
            this.id.root = false;
    }

    get id() { return this.vals[0] }

    getRootIds(ids, closure) {
        if (this.id)
            this.id.getRootIds(ids, closure);
    }

    get name() { return this.id.name }

    get type() { return types$1.name_space_import }

    render() {
        return `* as ${this.id.render()}`;
    }
}

class named_imports extends base {
    constructor(imports) {
        super(imports);
    }

    get imports() { return this.vals[0] }

    get type() { return types$1.named_imports }

    render() {
        const
            imports = this.imports.map(e => e.render()).join(",");

        return `{${imports}}`;
    }
}

/** NEGATE **/

class negate_expression extends unary_pre {
    constructor(sym) { super(sym);
        this.op = "-";
    }
    get type() { return types$1.negate_expression }
}

/** NEW EXPRESSION **/

class new_expression extends call_expression {
    constructor(id, args) { 
        super([id, args]);
        this.root = false;
        this.id.root = false;
    }

    get type(){return types$1.new_expression}

    render() { 
        const
            args_str = (this.args) ? this.args.render() : "";

        return `new ${this.id.render()}${args_str}`;
    }
}

/** NULL **/
class null_literal extends base {
    constructor() { super(); }
    get type() { return types$1.null_literal }
    render() { return "null" }
}

/** NUMBER **/
class numeric_literal extends base {
    constructor(sym) { super(parseFloat(sym)); }
    get val() { return this.vals[0] }
    get type() { return types$1.numeric_literal }
    render() { return this.val + "" }
    * traverseDepthFirst(p) {
        this.parent = p;
        yield this;
    }
}

/** OBJECT **/

class object_literal extends base {
    constructor(props) {
        super(props);
    }

    get props() { return this.vals[0] }

    * traverseDepthFirst(p) {
        this.parent = p;
        yield this;
        for (const prop of this.props)
            yield* prop.traverseDepthFirst(this);
    }

    getRootIds(ids, closure) {
        for(const id of this.props)
            if(id && id.getRootIds)
                id.getRootIds(ids, closure);
    }

    get type() { return types$1.object_literal }

    render() { return `{${this.props.map(p=>p.render()).join(",")}}` }
}

/** OR **/
class or_expression extends operator$1 {

    constructor(sym) {
        super(sym);
        this.op = "||";
    }

    get type() { return types$1.or_expression }
}

/** PLUS **/

class plus_expression extends unary_pre {
    constructor(sym) { super(sym);
        this.op = "+";
    }
    get type() { return types$1.plus_expression }
}

/** OPERATOR **/

class unary_post extends base {

    constructor(sym) {
        super(sym[0]);
        this.op = "";
    }

    replaceNode(original, _new = null) {
        if(_new === null || _new.type == types.null_literal){
            this.replace(_new);
        }
        else
            this.vals[0] = _new;
    }

    get expr() { return this.vals[0] }
    render() { return `${this.expr.render()}${this.op}` }
}

/** POSTFIX INCREMENT **/

class post_decrement_expression extends unary_post {

    constructor(sym) {
        super(sym);
        this.op = "--";
    }

    get type() { return types$1.post_decrement_expression }
}

/** POSTFIX INCREMENT **/

class post_increment_expression extends unary_post {

    constructor(sym) {
        super(sym);
        this.op = "++";
    }

    get type() { return types$1.post_increment_expression }

}

/** UNARY NOT **/

class pre_decrement_expression extends unary_pre {

    constructor(sym) {
        super(sym);
        this.op = "--";
    }

    get type() { return types$1.pre_decrement_expression }
}

/** UNARY NOT **/

class pre_increment_expression extends unary_pre {

    constructor(sym) {
        super(sym);
        this.op = "--";
    }

    get type() { return types$1.pre_increment_expression }
}

/** PROPERTY BINDING DECLARATION **/
class property_binding extends binding {
    constructor(sym) {
        super([sym[0], sym[2]]);
    }
    get type( ){return types$1.property_binding}
    render() { return `${this.id.type > 2 ? `[${this.id.render()}]` : this.id.render()} : ${this.init.render()}` }
}

/** RETURN STATMENT  **/



class return_statement extends base {
    constructor(sym) {
        super(sym);
    }

    get expr() { return this.vals[0] }

    getRootIds(ids, closure) {
        if (this.expr) this.expr.getRootIds(ids, closure);
    }

    get type() { return types$1.return_statement }

    render() {
        let expr_str = "";
        if (this.expr) {
            if (Array.isArray(this.expr)) {
                expr_str = this.expr.map(e=>e.render()).join(",");
            } else
                expr_str = this.expr.render();
        }
        return `return ${expr_str};`;
    }
}

/** RIGHT SHIFT **/
class right_shift_expression extends operator$1 {

    constructor(sym) {
        super(sym);
        this.op = ">>";
    }

    get type() { return types$1.right_shift_expression }
}

/** RIGHT SHIFT **/
class right_shift_fill_expression extends operator$1 {

    constructor(sym) {
        super(sym);
        this.op = ">>>";
    }

    get type() { return types$1.right_shift_fill_expression }
}

/** SCRIPT TL  **/



class script extends base {
    constructor(sym) {
        super((Array.isArray(sym)) ? sym[0] : sym) ;
    }

    get statements() { return this.vals[0] }

    getRootIds(ids, closure) {
        if (this.statements) this.statements.getRootIds(ids, closure);
    }

    get type() { return types$1.script }

    render() {
        return this.statements.render();
    }
}

/** SPREAD **/

class spread_element extends unary_pre {

    constructor(sym) {
        super(sym);
        this.op = "...";
    }

    get type() { return types$1.spread_element }

}

/** STRING **/

class string$2 extends base {
    constructor(sym) { super(sym.length === 3 ? sym[1]: ""); }

    get val() { return this.vals[0] }

    getRootIds(ids, closuere) { if (!closuere.has(this.val)) ids.add(this.val); }

    * traverseDepthFirst(p) {
        this.parent = p;
        yield this;
    }


    get type() { return types$1.string }

    render() { return `"${this.val}"` }
}

/** SUBTRACT **/
class subtract_expression extends operator$1 {

    constructor(sym) {
        super(sym);
        this.op = "-";
    }

    get type () { return types$1.subtract_expression }
}

/** SWITCH STATEMENT **/
class switch_statement extends base {

    get expression() { return this.vals[0] }
    get caseblock() { return this.vals[1] }

    getRootIds(ids, closure) {
        //closure = new Set([...closure.values()]);
        this.expression.getRootIds(ids, closure);
        if (this.caseblock) this.caseblock.forEach(c=>c.getRootIds(ids, closure));
    }

    get type() { return types$1.switch_statement }

    render() {
        let
            expression = this.expression.render(),
            caseblock = this.caseblock.map(
                c =>
                c.render()).join("");

        return `switch(${expression}){${caseblock}}`;
    }
}

/** TEMPLATE **/

class template extends base {
    constructor(sym) {
    	const NO_SUBSTITUTE = typeof sym == "string";

        if (NO_SUBSTITUTE)
            super(new string$2(sym));
        else
            super(...sym);

        this.NO_SUBSTITUTE = NO_SUBSTITUTE;
    }

    get str() { return this.vals[0] }

    get type() { return types$1.template }

    render() {
        let str = [this.str.render()];

        if (!this.NO_SUBSTITUTE)
            str = this.vals.map(v => v.render());

        return "`" + str.join("") + "`";
    }
}

/** TEMPLATE HEAD **/

class template_head extends base {
	
    constructor(sym) { super(sym); }

    get string() { return this.vals[0] }

    get expression() { return this.vals[1] }

    get type() { return types$1.template_head }

    render() { 
    	return `${this.string}\${${this.expression.render()}`;
    }
}

/** TEMPLATE MIDDLE **/

class template_middle extends base {

    constructor(sym) { super(sym); }

    get string() { return this.vals[0] }

    get expression() { return this.vals[1] }

    get type() { return types$1.template_middle }

    render() { 
    	return `}${this.string}\${${this.expression.render()}`;
    }
}

/** TEMPLATE MIDDLE **/

class template_tail extends base {

    get string() { return this.vals[0] }

    get type() { return types$1.template_tail }

    render() { 
    	return `}${this.string}`;
    }
}

/** THIS LITERAL  **/

class this_literal extends base {
    constructor() {
        super();
        this.root = false;
    }

    get name() { return "this" }
    get type() { return types$1.this_literal }

    render() { return `this` }
}

/** THROW STATEMENT  **/

class throw_statement extends statement {
    constructor(sym) {
        super(sym[1] == ";" ? null : sym[1]);
    }

    get expr() { return this.vals[0] }

    getRootIds(ids, closure) {
        if (this.expr) this.expr.getRootIds(ids, closure);
    }

    get type() { return types$1.throw_statement }

    render() {
        let expr_str = "";
        if (this.expr) {
            if (Array.isArray(this.expr)) {
                expr_str = this.expr.map(e=>e.render()).join(",");
            } else
                expr_str = this.expr.render();
        }
        return `throw ${expr_str};`;
    }
}

/** TRY STATEMENT **/
class try_statement extends statement {
    constructor(body, _catch, _finally) {
        super(body, _catch, _finally);
    }

    get body() { return this.vals[0] }
    get catch() { return this.vals[1] }
    get finally() { return this.vals[2] }

    getRootIds(ids, clsr) {
        this.body.getRootIds(ids, clsr);
        if (this.catch) this.catch.getRootIds(ids, clsr);
        if (this.finally) this.finally.getRootIds(ids, clsr);
    }

    get type() { return types$1.try_statement }

    render(){
        return `try ${this.body}${this.catch ? " "+ this.catch : ""}${this.finally ? " "+this.finally : ""}`
    }
}

/** TYPEOF **/

class typeof_expression extends unary_pre {

    constructor(sym) {
        super(sym);
        this.op = "typeof";
    }

    get type() { return types$1.typeof_expression }
}

/** UNARY NOT **/

class unary_not_expression extends unary_pre {
    constructor(sym) {
        super(sym);
        this.op = "!";
    }
    get type() { return types$1.unary_not_expression }
}

/** UNARY BIT OR **/

class unary_or_expression extends unary_pre {

    constructor(sym) {
        super(sym);
        this.op = "|";
    }

    get type() { return types$1.unary_or_expression }
}

/** UNARY BIT XOR **/

class unary_xor_expression extends unary_pre {

    constructor(sym) {
        super(sym);
        this.op = "~";
    }

    get type() { return types$1.unary_xor_expression }
}

/** VARIABLE STATEMENT **/
class variable_declaration extends statement {
    constructor(sym) {
        super(sym[1]);
    }

    get bindings() { return this.vals[0] }

    getRootIds(ids, closure) {
        this.bindings.forEach(b => b.getRootIds(ids, closure, true));
    }

    get type() { return types$1.variable_declaration }

    render() { return `var ${this.bindings.map(b=>b.render()).join(",")};` }
}

/** VOID **/

class void_expression extends unary_pre {

    constructor(sym) {
        super(sym);
        this.op = "void";
    }

    get type() { return types$1.void_expression }
}

/** SUPER LITERAL  **/

class super_literal extends base {
    constructor(sym) {
        super(sym);
    }

    getRootIds(ids, closure) {}

    get type() { return types$1.super_literal }

    render() { return `super`; }
}

/** FOR OF **/
class for_of_statement extends base {

    get await() { return this.vals[0] }
    get binding() { return this.vals[1] }
    get expression() { return this.vals[2] }
    get body() { return this.vals[3] }

    get type() { return types$1.for_of_statement }

    render() {
        let binding, expression, body;

        if (this.binding) binding = this.binding.render();
        if (this.expression) expression = this.expression.render();
        if (this.body) body = this.body.render();

        return `for(${binding} of ${expression})${body}`;
    }
}

/** LEXICAL EXPRESSION **/
//Like lexical declaration except omiting the semi-colon within the render() output.
class lexical_expression extends lexical_declaration {
	constructor(sym) {
        super(sym);
        this.vals[0] = [new binding([this.vals[0]])];
    }
    render() { 
    	return super.render().slice(0, -1);
   	}
    get type(){return types$1.lexical_expression}
}

const removeFromArray = (array, ...elems) => {
    const results = [];
    outer:
        for (let j = 0; j < elems.length; j++) {
            const ele = elems[j];
            for (let i = 0; i < array.length; i++) {
                if (array[i] === ele) {
                    array.splice(i, 1);
                    results.push(true);
                    continue outer;
                }
            }
            results.push(false);
        }

    return results;
};

// Mode Flag
const KEEP = 0;
const IMPORT = 1;
const EXPORT = 2;
const PUT = 4;

/**
 * Gateway for data flow. Represents a single "channel" of data flow. 
 * 
 * By using different modes, one can control how data enters and exits the scope context.
 * -`keep`: 
 *  This mode is the default and treats any data on the channel as coming from the model. The model itself is not changed from any input on the channel, and any data flow from outside the scope context is ignored.
 * -`put`:
 *  This mode will update the model to reflect inputs on the channel. This will also cause any binding to update to reflect the change on the model.
 * -`import`:
 *  This mode will allow data from outside the scope context to enter the context as if it came from the model. The model itself is unchanged unless put is specified for the same property.
 *  -`export`:
 *  This mode will propagate data flow to the parent scope context, allowing other scopes to listen on the data flow of the originating scope context.
 *  
 *  if `import` is active, then `keep` is implicitly inactive and the model no longer has any bearing on the value of the bindings.
 */
class Tap {

    constructor(scope, prop, modes = 0) {
        this.scope = scope;
        this.prop = prop;
        this.modes = modes; // 0 implies keep
        this.ios = [];       
        this.value;
    }

    destroy() {
        this.ios && this.ios.forEach(io => io.destroy());
        this.ios = null;
        this.scope = null;
        this.prop = null;
        this.modes = null;
        this.value = null;
    }

    linkImport(parent_scope){
        if ((this.modes & IMPORT)){
            const tap = parent_scope.getTap(this.prop);
            tap.addIO(this);
            
        }

    }

    load(data) {

        this.downS(data);

        //Make sure export occures as soon as data is ready. 
        const value = data[this.prop];

        if ((typeof(value) !== "undefined") && (this.modes & EXPORT))
            this.scope.up(this, data[this.prop]);
    }

    down(value, meta) {

        for (let i = 0, l = this.ios.length; i < l; i++) {

            this.ios[i].down(value, meta);
        }
    }

    downS(model, IMPORTED = false, meta = null) {

        const value = model[this.prop];

        if (typeof(value) !== "undefined") {
            this.value = value;

            if (IMPORTED) {
                if (!(this.modes & IMPORT))
                    return;

                if ((this.modes & PUT) && typeof(value) !== "function") {
                    if (this.scope.model.set)
                        this.scope.model.set({
                            [this.prop]: value
                        });
                    else
                        this.scope.model[this.prop] = value;
                }
            }

            for (let i = 0, l = this.ios.length; i < l; i++) {
                if (this.ios[i] instanceof Tap) {
                    this.ios[i].downS(model, true, meta);
                } else
                    this.ios[i].down(value, meta);
            }
        }
    }

    up(value, meta) {

        if (!(this.modes & (EXPORT | PUT)))
            this.down(value, meta);
        
        if ((this.modes & PUT) && typeof(value) !== "undefined") {

            if (this.scope.model.set)
                this.scope.model.set({
                    [this.prop]: value
                });
            else
                this.scope.model[this.prop] = value;
        }

        if (this.modes & EXPORT){

            
            this.scope.up(this, value, meta);
        }
    }
    
    pruneIO(ele){
        const pending_delete = [];

        for(const io of this.ios)
            if(io.ele === ele)
                pending_delete = io;

        pending_delete.forEach(io=>io.destroy());
    }

    addIO(io) {
        if (io.parent === this)
            return;

        if (io.parent)
            io.parent.removeIO(io);

        this.ios.push(io);

        io.parent = this;

        if(this.value !== undefined)
            io.down(this.value);
        
    }

    removeIO(io) {
        if (removeFromArray(this.ios || [], io)[0])
            io.parent = null;
    }

    discardElement(ele){
        this.scope.discardElement(ele);
    }
}

class UpdateTap extends Tap {
    downS(model) {
        for (let i = 0, l = this.ios.length; i < l; i++)
            this.ios[i].down(model);
    }
    up() {}
}

class IOBase {

    constructor(parent, element = null) {

        this.parent = null;
        this.ele = element;

        parent.addIO(this);
    }

    discardElement(ele){
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
    set data(data) { this.down(data); }

    addIO(child) {
        this.ele = child;
        child.parent = this;
    }

    removeIO() {
        this.ele = null;
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
class IO extends IOBase {

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
}

class RedirectAttribIO extends IOBase {
    constructor(scope, errors, down_tap, up_tap) {
        super(down_tap);
        this.up_tap = up_tap;
    }

    down(value) {
        this.up_tap.up(value);
    }
}

/**
    This IO object will update the attribute value of the watched element, using the "prop" property to select the attribute to update.
*/
class AttribIO extends IOBase {
    constructor(scope, errors, tap, attr, element, default_val) {

        if (element.io) {
            let down_tap = element.io.parent;
            let root = scope.parent;
            tap.modes |= EXPORT;
            return new RedirectAttribIO(scope, errors, element.io.parent, tap);
        }

        super(tap, element);

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

    set data(v) {
        this.down(v);
    }

    get data() {

    }
}

class DataNodeIO extends IOBase {
    constructor(scope, tap, element, default_val) {
        if(!tap)  return {};

        super(tap, element);
        
        this.ele = element;
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

/**
    This io updates the value of a TextNode or it replaces the TextNode with another element if it is passed an HTMLElement
*/
class TextNodeIO extends DataNodeIO {
    constructor(scope, tap, element, default_val) {
        if(!tap) return {};

        super(scope, tap, element, default_val);
        
        this.ELEMENT_IS_TEXT = element instanceof Text;

        this.init(default_val);
    }
    
    down(value) {

        const ele = this.ele;
        if (value instanceof HTMLElement) {
            
            if (value !== this.ele) {
                this.ELEMENT_IS_TEXT = false;
                this.ele = value;
                ele.parentElement.replaceChild(value, ele);
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
}

class EventIO extends IOBase {

    constructor(scope, errors, tap, attrib_name, element, default_val) {

        super(tap);

        this.ele = element;

        const up_tap = default_val ? scope.getTap(default_val) : tap;

        this.event = (e) => { 
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            up_tap.up(e.target.value, { event: e }); 
            return false;
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
        this.ele.value = value;
    }
}

class InputIO extends IOBase {

    constructor(scope, errors, tap, attrib_name, element, default_val) {
        if(tap)
            super(tap);
        else if(default_val)
            super(scope);
        else
            return;

        this.ele = element;
        this.event = null;

        let up_tap = tap;

        if(default_val){
            switch(default_val.type){
                case types$1.identifier:
                    up_tap = scope.getTap(default_val.name);
                break;
                case types$1.null_literal:
                    up_tap = null;
                break;
            }
        }

        if(up_tap){
            if (element.type == "checkbox")
                this.event = (e) => { up_tap.up(e.target.checked, { event: e }); };
            else
                this.event = (e) => { up_tap.up(e.target.value, { event: e }); };
            
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

/**
 * Base class for an object that binds to and observes a Model.
 *@alias module:wick.core.observer
 */
class View{

	constructor(){
		/**
		 * property
		 */
		this.nx = null;
		this.pv = null;
		this.model = null;
	}

	/**
     * Unbinds the View from its Model and sets all properties to undefined. Should be called by any class extending View
	 * ``` js
	 * class ExtendingView extends wick.core.observer.View{
	 * 		destroy(){
	 * 			//... do some stuff ...
	 * 			super.destroy();
	 * 		}
	 * }
	 * ```
     * @protected
     */
	destroy(){
		this.unsetModel();
		this.model = undefined;
		this.nx = undefined;
	}	
	/**
		Called by a Model when its data has changed.
	*/
	update(data){

	}
	/**
		Called by a ModelContainerBase when an item has been removed.
	*/
	removed(data){

	}

	/**
		Called by a ModelContainerBase when an item has been added.
	*/
	added(data){

	}
	setModel(model){
	}

	reset(){
		
	}
	unsetModel(){
		if(this.model && this.model.removeView)
			this.model.removeView(this);
		this.nx = null;
		this.model = null;
	}
}

class Scope extends View {

    /**
     *   In the Wick dynamic template system, Scopes serve as the primary access to Model data. They, along with {@link ScopeContainer}s, are the only types of objects the directly _bind_ to a Model. When a Model is updated, the Scope will transmit the updated data to their descendants, which are comprised of {@link Tap}s and {@link ScopeContainer}s.
     *   A Scope will also _bind_ to an HTML element. It has no methodes to update the element, but it's descendants, primarily instances of the {@link IO} class, can update attributes and values of then element and its sub-elements.
     *   @param {Scope} parent - The parent {@link Scope}, used internally to build a hierarchy of Scopes.
     *   @param {Object} data - An object containing HTMLELement attribute values and any other values produced by the template parser.
     *   @param {Presets} presets - An instance of the {@link Presets} object.
     *   @param {HTMLElement} element - The HTMLElement the Scope will _bind_ to.
     *   @memberof module:wick~internals.scope
     *   @alias Scope
     *   @extends ScopeBase
     */
    constructor(parent, presets, element, ast) {

        super();

        this.ast = ast;
        this.ele = element;
        
        if(element)
            element.wick_scope = this;

        this.parent = null;
        this.model = null;
        this.update_tap = null;

        this.ios = [];
        this.taps = new Map;
        this.scopes = [];
        this.containers = [];
        this.css = [];

        this.DESTROYED = false;
        this.LOADED = false;
        this.CONNECTED = false;
        this.TRANSITIONED_IN = false;
        this.PENDING_LOADS = 1; //set to one for self
        this.temp_data_cache = null;

        this.addToParent(parent);
    }

    discardElement(ele, ios) {
        if (!ios) {
            ios = [];

            for (const tap of this.taps.values())
                for (let io of tap.ios) {
                    while (io.ele instanceof IOBase)
                        io = io.ele;
                    ios.push(io);
                }

        }

        for (let i = 0; i < ios.length; i++) {
            const io = ios[i];
            if (io.ele == ele) {
                io.destroy();
                ios.splice(i--, 1);
            }
        }

        const children = ele.children;
        
        if(children)
            for (let i = 0; i < children.length; i++)
                this.discardElement(children[i], ios);

        if (ele.wick_scope)
            ele.wick_scope.destroy();
    }

    purge(){
        if (this.parent && this.parent.removeScope)
            this.parent.removeScope(this);

        if (this.ele && this.ele.parentNode)
            this.ele.parentNode.removeChild(this.ele);

        for (const tap of this.taps.values())
            tap.destroy();

        while (this.scopes[0])
            this.scopes[0].destroy();

        //while (this.containers[0])
        //    this.containers[0].destroy();
        
        this.taps = new Map;
        this.scopes.length = 0;
        this.containers.length = 0;
        this.temp_data_cache = null;
        this.css.length = 0;
    }

    destroy() {
        if(this.DESTROYED)
            return;
        
        try{
            this.update({ destroying: true }, null, false, {IMMEDIATE:true}); //Lifecycle Events: Destroying <======================================================================
        }catch(e){
            console.throw(e);
        }


        this.DESTROYED = true;
        this.LOADED = false;

        this.purge();

        this.data = null;
        this.taps = null;
        this.ios = null;
        this.ele = null;

        super.destroy();
    }

    addToParent(parent) {
        if (parent)
            parent.addScope(this);
    }

    addTemplate(template) {
        template.parent = this;
        this.PENDING_LOADS++;
        this.containers.push(template);
    }

    addScope(scope) {
        if (scope.parent == this)
            return;
        scope.parent = this;
        this.scopes.push(scope);
        this.PENDING_LOADS++;
        scope.linkImportTaps(this);
    }

    removeScope(scope) {
        if (scope.parent !== this)
            return;

        for (let i = 0; i < this.scopes.length; i++)
            if (this.scopes[i] == scope)
                return (this.scopes.splice(i, 1), scope.parent = null);
    }

    linkImportTaps(parent_scope) {
        for (const tap of this.taps.values()) {
            tap.linkImport(parent_scope);
        }
    }

    getTap(name) {
        if (!name) return null;

        let tap = this.taps.get(name);

        if (!tap) {
            if (name == "update")
                tap = this.update_tap = new UpdateTap(this, name);
            else {
                tap = new Tap(this, name);
                this.taps.set(name, tap);
            }

            if (this.temp_data_cache)
                tap.downS(this.temp_data_cache);
        }
        return tap;
    }

    /**
        Makes the scope a observer of the given Model. If no model passed, then the scope will bind to another model depending on its `scheme` or `model` attributes. 
    */
    load(model) {

        let
            m = null,
            SchemedConstructor = null,
            presets = this.ast.presets,
            model_name = this.ast.model_name,
            scheme_name = this.ast.scheme_name;

        if (model_name && presets.models)
            m = presets.models[model_name];
        if (scheme_name && presets.schemas) {
            SchemedConstructor = presets.schemas[scheme_name];
        }

        if (m)
            model = m;
        else if (SchemedConstructor) {
            model = new SchemedConstructor();
        } else if (!model)
            model = new Model(model);

        if (this.css.length > 0)
            this.loadCSS();

        for (const scope of this.scopes) {
            scope.load(model);
            // /scope.getBadges(this);
        }

        if (model.addObserver)
            model.addObserver(this);

        this.model = model;

        for (const tap of this.taps.values())
            tap.load(this.model, false);

        this.update({ loading: true }); //Lifecycle Events: Loading <======================================================================

        //Allow one tick to happen before acknowledging load
        setTimeout(this.loadAcknowledged.bind(this), 1);
    }

    loadCSS(element = this.ele) {

        for (const css of this.css) {

            const rules = css.getApplicableRules(element);

            element.style = ("" + rules).slice(1, -1) + "";
        }

        Array.prototype.slice.apply(element.children).forEach(child => this.loadCSS(child));
    }

    loadAcknowledged() {
        //This is called when all elements of responded with a loaded signal.

        if (!this.LOADED && --this.PENDING_LOADS <= 0) {
            this.LOADED = true;
            this.update({ loaded: true }); //Lifecycle Events: Loaded <======================================================================
            if (this.parent && this.parent.loadAcknowledged)
                this.parent.loadAcknowledged();
        }
    }

    /*************** DATA HANDLING CODE **************************************/

    down(data, changed_values) {
        this.update(data, changed_values, true);
    }

    up(tap, data, meta) {
        if (this.parent)
            this.parent.upImport(tap.prop, data, meta, this);
    }

    upImport(prop_name, data, meta) {

        
        if (this.taps.has(prop_name)){
            this.taps.get(prop_name).up(data, meta);
        }
    }

    update(data, changed_values, IMPORTED = false, meta = null) {

        this.temp_data_cache = data;

        (this.update_tap && this.update_tap.downS(data, IMPORTED));

        if (changed_values) {
            for (let name in changed_values)
                if (this.taps.has(name))
                    this.taps.get(name).downS(data, IMPORTED, meta);
        } else 
            for (const tap of this.taps.values())
                tap.downS(data, IMPORTED, meta);

        for (const container of this.containers)
            container.down(data, changed_values);
    }

    bubbleLink(child) {
        if (this.parent)
            this.parent.bubbleLink(this);
    }

    /*************** DOM CODE ****************************/

    appendToDOM(element, before_element) {

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
        this.update({ disconnectied: true });
    }

    transitionIn(transition, transition_name = "trs_in") {
        if (transition)
            this.update({ [transition_name]: transition }, null, false, { IMMEDIATE: true });

        this.TRANSITIONED_IN = true;
    }

    transitionOut(transition, transition_name = "trs_out", DESTROY_AFTER_TRANSITION = false) {

        this.CONNECTED = false;

        if (this.TRANSITIONED_IN === false) {
            this.removeFromDOM();
            if (DESTROY_AFTER_TRANSITION) this.destroy();
            return;
        }

        let transition_time = 0;

        if (transition) {

            this.update({ [transition_name]: transition }, null, false, { IMMEDIATE: true });

            if (transition.trs)
                transition_time = transition.trs.out_duration;
            else
                transition_time = transition.out_duration;
        }

        this.TRANSITIONED_IN = false;

        transition_time = Math.max(transition_time, 0);

        setTimeout(() => {
            this.removeFromDOM();
            if (DESTROY_AFTER_TRANSITION) this.destroy();
        }, transition_time + 2);

        return transition_time;
    }
}

Scope.prototype.removeIO = Tap.prototype.removeIO;
Scope.prototype.addIO = Tap.prototype.addIO;

const err = function(...vals){
    vals[vals.length-1].message = vals.slice(0,-1).join("\n") + "\n"+ vals[vals.length-1].message;
    return vals[vals.length-1];
};

var defaults = {
    IO_FUNCTION_FAIL : (e, o) => {
       return err(`Problem found while running JavaScript in ${(o.url || o.origin_url) + ""}`
            ,e );
    },
    ELEMENT_PARSE_FAILURE : (e, o) => {
       return err(`Problem found while parsing resource ${o.url + ""}`,e);
    },
    COMPONENT_PARSE_FAILURE : (e, o) => {
       return err(`Problem found while parsing component defined in ${o.url + ""}`,e);
    },
    RESOURCE_FETCHED_FROM_NODE_FAILURE: (e, o) => {
       return err(`Error while trying to fetch ${o.url + ""}`,e);
    },
    SCRIPT_FUNCTION_CREATE_FAILURE: (e, o) => {
       return err(`Error while trying to create function from script

${o.val + ""} 

in file ${o.url || o.origin_url}`,e);
        
    },
    default: e => {
        return err(`Unable to retrieve error handler`, e);
    }
};

const error_list = {};

function integrateErrors(error_list_object) {
    if (typeof error_list_object !== "object") return void console.trace("An object of function properties must be passed to this function");
    for (const label in error_list_object) {
        const prop = error_list_object[label];
        if (typeof prop == "function") {
            error_list[label] = prop;
            prop.error_name = label;
        }
    }
}

integrateErrors(defaults);

var error = new Proxy(function(error_function, error_object, errored_node) {
	//console.warn(`Encountered error ${error_function.error_name}`);
    return error_function(error_object, errored_node);
}, {
    get: (obj, prop) => {

        if (prop == "integrateErrors")
            return integrateErrors;

        if (!error_list[prop]) {
            error_list.default.error_name = prop;
            return error_list.default;
        }

        return error_list[prop];
    }
});

const offset = "    ";

class ElementNode {

    constructor(env, tag = "", children = [], attribs = [], presets, USE_PENDING_LOAD_ATTRIB) {

        if (children)
            for (const child of children)
                child.parent = this;

        this.SINGLE = false;
        this.MERGED = false;

        this.presets = presets;
        this.tag = tag;
        this.children = children || [];
        this.proxied = null;
        this.slots = null;
        this.origin_url = env.url;
        this.attribs = new Map((attribs || []).map(a => (a.link(this), [a.name, a])));

        if(this.attribs.has(""))
            this.attribs.delete("");

        this.pending_load_attrib = USE_PENDING_LOAD_ATTRIB;

        this.component = this.getAttrib("component").value;

        if (this.component)
            presets.components[this.component] = this;

        this.url = this.getAttribute("url") ? URL.resolveRelative(this.getAttribute("url"), env.url) : null;
        this.id = this.getAttribute("id");
        this.class = this.getAttribute("id");
        this.name = this.getAttribute("name");
        this.slot = this.getAttribute("slot");
        this.pinned = (this.getAttribute("pin")) ? this.getAttribute("pin") + "$" : "";

        if (this.url)
            this.loadAndParseUrl(env);

        return this;
    }

    // Traverse the contructed AST and apply any necessary transforms. 
    finalize(slots_in = {}) {


        if (this.slot) {

            if (!this.proxied_mount)
                this.proxied_mount = this.mount.bind(this);

            //if(!slots_in[this.slot])
            slots_in[this.slot] = this.proxied_mount;

            this.mount = () => {};
        }

        for (let i = 0; i < this.children.length; i++) {
            const child = this.children[i];
            this.children[i] = child.finalize(slots_in);
        }

        const slots_out = Object.assign({}, slots_in);

        if (this.presets.components[this.tag])
            this.proxied = this.presets.components[this.tag].merge(this);

        if (this.proxied) {
            const ele = this.proxied.finalize(slots_out);
            ele.slots = slots_out;
            this.mount = ele.mount.bind(ele);
        }

        this.children.sort(function(a, b) {
            if (a.tag == "script" && b.tag !== "script")
                return 1;
            if (a.tag !== "script" && b.tag == "script")
                return -1;
            return 0;
        });

        return this;
    }

    getAttribute(name) {
        return this.getAttrib(name).value;
    }

    getAttrib(name) {
        return this.attribs.get(name) || { name: "", value: "" };
    }

    createElement() {
        return createElement(this.tag);
    }

    toString(off = 0) {

        var o = offset.repeat(off),
            str = `${o}<${this.tag}`;

        for (const attr of this.attribs.values()) {
            if (attr.name)
                str += ` ${attr.name}=${typeof attr.value == "object" ? attr.value + "" : `"${attr.value}"`}`;
        }

        if (this.SINGLE)
            return str + "/>";


        str += ">\n";


        str += this.innerToString(off + 1);

        return str + `${o}</${this.tag}>\n`;
    }

    innerToString(off) {
        return this.children.map(e => e.toString()).join("");
    }

    /****************************************** COMPONENTIZATION *****************************************/

    loadAST(ast) {
        if (ast instanceof ElementNode)
            this.proxied = ast;//.merge();
    }

    async loadAndParseUrl(env) {
        var ast = null,
            text_data = "",
            own_env = new CompilerEnvironment(env.presets, env, this.url);

        own_env.setParent(env);

        try {
            own_env.pending++;
            text_data = await this.url.fetchText();
        } catch (e) {
            error(error.RESOURCE_FETCHED_FROM_NODE_FAILURE, e, this);
        }
        
        if (text_data)
            try {
                ast = parser(whind$1(text_data), own_env);
            } catch (e) { error(error.ELEMENT_PARSE_FAILURE, e, this); }

        this.loadAST(ast);

        own_env.resolve();

        return;
    }

    merge(node, merged_node = new this.constructor({}, this.tag, null, null, this.presets)) {

        merged_node.line = this.line;
        merged_node.char = this.char;
        merged_node.offset = this.offset;
        merged_node.single = this.single;
        merged_node.url = this.url;
        merged_node.tag = this.tag;
        merged_node.children = (node.children || this.children) ? [...node.children, ...this.children] : [];
        merged_node.css = this.css;
        merged_node.HAS_TAPS = this.HAS_TAPS;
        merged_node.MERGED = true;
        merged_node._badge_name_ = node._badge_name_;
        merged_node.presets = this.presets;
        merged_node.par = node.par;
        merged_node.pinned = node.pinned || this.pinned;
        merged_node.origin_url = node.url;

        if (this.tap_list)
            merged_node.tap_list = this.tap_list.map(e => Object.assign({}, e));

        merged_node.attribs = new Map(function*(...a) { for (const e of a) yield* e; }(this.attribs, node.attribs));

        merged_node.statics = node.statics;

        return merged_node;
    }

    /******************************************* BUILD ****************************************************/

    mount(element, scope, presets = this.presets, slots = {}, pinned = {}, RETURN_ELEMENT = false) {

        const own_element = this.createElement(scope);
        

        appendChild(element, own_element);

        if (this.slots)
            slots = Object.assign({}, slots, this.slots);

        pinned[this.pinned] = own_element;

        if (!scope)
            scope = new Scope(null, presets || this.presets, own_element, this);

        if (!scope.ele) scope.ele = own_element;

        for (const attr of this.attribs.values())
            attr.bind(own_element, scope, pinned);

        for (let i = 0; i < this.children.length; i++) {
            const node = this.children[i];
            node.mount(own_element, scope, presets, slots, pinned);
        }

        /* 
            If there is an attribute that will cause the browser to fetch a resource that is 
            is subsequently loaded in to the element, then create a listener that will 
            update the scopes PENDING_LOADS property when the resource is requested and then 
            received.

            example elemnts = img, svg
        */
        if(this.pending_load_attrib && this.getAttrib(this.pending_load_attrib).value){
            debugger
            const fn = e=>{
                scope.acknowledgePending();
                own_element.removeEventListener("load", fn);
            };
            own_element.addEventListener("load", fn);
            scope.PENDING_LOADS++;
        } 


        return (RETURN_ELEMENT) ? own_element : scope;
    }
}

class ArgumentIO extends IO {
    constructor(scope, errors, tap, script, id) {
        super(scope, errors, tap);
        this.ele = script;
        this.id = id;
        this.ACTIVE = false;
    }

    destroy() {
        this.id = null;
        super.destroy();
    }

    down(value) {

        this.ele.updateProp(this, value);
    }
}

class ScriptIO extends IOBase {

    constructor(scope, node, tap, script, lex, pinned) {

        super(tap);

        this.scope = scope;
        this.TAP_BINDING_INDEX = script.args.reduce((r, a, i) => (a.name == tap.prop) ? i : r, -1);
        this.ACTIVE_IOS = 0;
        this.IO_ACTIVATIONS = 0;
        this._SCHD_ = 0;
        this.node = node;
        this.function = script.function.bind(scope);
        this.AWAITING_DEPENDENCIES = false;

        //Embedded emit functions
        const func_bound = this.emit.bind(this);
        func_bound.onTick = this.onTick.bind(this);

        //TODO: only needed if emit is called in function. Though highly probable. 
        this.arg_props = [];
        this.arg_ios = {};

        this.initProps(script.args, tap, node, pinned);

        this.arg_props.push(new Proxy(func_bound, { set: (obj, name, value) => { obj(name, value); } }));
    }

    /*
        Removes all references to other objects.
        Calls destroy on any child objects.
     */
    destroy() {
        this.function = null;
        this.scope = null;
        this._bound_emit_function_ = null;
        this._meta = null;
        this.arg_props = null;
        this.props = null;

        for (const a in this.arg_ios)
            this.arg_ios[a].destroy();

        this.arg_ios = null;

        super.destroy();
    }

    initProps(arg_array, tap, errors, pinned) {
        for (let i = 0; i < arg_array.length; i++) {
            const a = arg_array[i];

            if (a.IS_ELEMENT) {
                this.arg_props.push(pinned[a.name]);
            } else if (a.IS_TAPPED) {

                let val = null;

                const name = a.name;

                if (name == tap.name) {
                    val = tap.prop;
                    this.TAP_BINDING_INDEX = i;
                }

                this.IO_ACTIVATIONS++;

                this.arg_ios[name] = new ArgumentIO(this.scope, errors, this.scope.getTap(name), this, i);

                this.arg_props.push(val);
            } else {
                this.arg_props.push(a.val);
            }
        }
    }

    updateProp(io, val) {
        this.arg_props[io.id] = val;

        if (!io.ACTIVE) {
            io.ACTIVE = true;
            this.ACTIVE_IOS++;
        }

        if(this.AWAITING_DEPENDENCIES){
            if (this.ACTIVE_IOS < this.IO_ACTIVATIONS)
                return;

            this.AWAITING_DEPENDENCIES = false;

            if (!this._SCHD_)
                spark.queueUpdate(this);
        }
    }

    setValue(value, meta) {
        if (typeof(value) == "object") {
            //Distribute iterable properties amongst the IO_Script's own props.
            for (const a in value) {
                if (this.arg_ios[a])
                    this.arg_ios[a].down(value[a]);
            }
        } else if (this.TAP_BINDING_INDEX !== -1) {
            this.arg_props[this.TAP_BINDING_INDEX] = value;
        }
    }

    scheduledUpdate() {
        // Check to make sure the function reference is still. May not be if the IO was destroyed between
        // a down update and spark subsequently calling the io's scheduledUpdate method

        if (this.function) {
            try {
                return this.function.apply(this, this.arg_props);
            } catch (e) {
                throw error(error.IO_FUNCTION_FAIL, e, this.node);
            }
        }
    }

    down(value, meta) {

        if (value)
            this.setValue(value);

        if (meta) {
            this.setValue(meta);
            if (meta.IMMEDIATE && this.ACTIVE_IOS >= this.IO_ACTIVATIONS) {
                return this.scheduledUpdate();
            }
        }
        
        if (this.ACTIVE_IOS < this.IO_ACTIVATIONS){
            this.AWAITING_DEPENDENCIES = true;
            return;
        }
        

        if (!this._SCHD_)
            spark.queueUpdate(this);
    }

    emit(name, value) {
        if (
            typeof(name) !== "undefined" &&
            typeof(value) !== "undefined"
        ) {
            this.scope.upImport(name, value, this.meta);
        }
    }

    /* 
        Same as emit, except the message is generated on the next global tick. 
        Useful for actions which require incremental updates to the UI.
    */
    onTick(name) {
        spark.queueUpdate({
            _SCHD_: 0, // Meta value for spark;
            scheduledUpdate: (s, d) => this.emit(name, { step: s, diff: d })
        });
    }
}

//Cache for scripts that have already been built. Keys are the final strings of processed ASTs
var FUNCTION_CACHE = new Map();

var JS = {

    getFirst(ast, type) {
        const tvrs = ast.traverseDepthFirst();
        let node = null;

        while ((node = tvrs.next().value)) {
            if (node.type == type) {
                return node;
            }
        }

        return null;
    },

    getClosureVariableNames(ast, ...global_objects) {
        if (!ast)
            return;
        const
            tvrs = ast.traverseDepthFirst(),
            non_global = new Set(global_objects),
            globals = new Set();
        let
            node = tvrs.next().value;

        //Retrieve undeclared variables to inject as function arguments.
        while (node) {
            if (
                node.type == types$1.identifier ||
                node.type == types$1.member_expression
            ) {
                if (node.type == types$1.member_expression && !(
                        node.id.type == types$1.identifier ||
                        node.id.type == types$1.member_expression
                    )) ; else
                if (node.root && !non_global.has(node.name)) {
                    globals.add(node);
                }
            }

            if (ast !== node 
                    &&(
                    (node.type == types$1.arrow_function_declaration) 
                    || (node.type == types$1.for_of_statement) 
                    )
                    ) {


                const glbl = new Set;
                const closure = new Set;

                node.getRootIds(glbl, closure);

                const g = this.getClosureVariableNames(node, ...[...closure.values(), ...non_global.values()]);
                
                g.forEach(v => {
                    if (Array.isArray(v)) debugger;
                    globals.add(v);
                });

                node.skip();
            }

            if (
                node.type == types$1.lexical_declaration ||
                node.type == types$1.variable_declaration
            ) {
                node.bindings.forEach(b => (non_global.add(b.id.name), globals.forEach(g => { if (g.name == b.id.name) globals.delete(b.id.name); })));
            }

            node = tvrs.next().value;
        }

        return [...globals.values()].reduce((red, out) => {
            const name = out.name;

            const root = window || global;
            if ((root[name] && !(root[name] instanceof HTMLElement)) || name == "this")
                //Skip anything already defined on the global object. 
                return red;

            red.push(out);

            return red;
        }, []);
    },

    types: types$1
};

class Color extends Float64Array {

    constructor(r, g, b, a = 0) {
        super(4);

        this.r = 0;
        this.g = 0;
        this.b = 0;
        this.a = 1;

        if (typeof(r) === "number") {
            this.r = r; //Math.max(Math.min(Math.round(r),255),-255);
            this.g = g; //Math.max(Math.min(Math.round(g),255),-255);
            this.b = b; //Math.max(Math.min(Math.round(b),255),-255);
            this.a = a; //Math.max(Math.min(a,1),-1);
        }
    }

    get r() {
        return this[0];
    }

    set r(r) {
        this[0] = r;
    }

    get g() {
        return this[1];
    }

    set g(g) {
        this[1] = g;
    }

    get b() {
        return this[2];
    }

    set b(b) {
        this[2] = b;
    }

    get a() {
        return this[3];
    }

    set a(a) {
        this[3] = a;
    }

    set(color) {
        this.r = color.r;
        this.g = color.g;
        this.b = color.b;
        this.a = (color.a != undefined) ? color.a : this.a;
    }

    add(color) {
        return new Color(
            color.r + this.r,
            color.g + this.g,
            color.b + this.b,
            color.a + this.a
        );
    }

    mult(color) {
        if (typeof(color) == "number") {
            return new Color(
                this.r * color,
                this.g * color,
                this.b * color,
                this.a * color
            );
        } else {
            return new Color(
                this.r * color.r,
                this.g * color.g,
                this.b * color.b,
                this.a * color.a
            );
        }
    }

    sub(color) {
        return new Color(
            this.r - color.r,
            this.g - color.g,
            this.b - color.b,
            this.a - color.a
        );
    }

    lerp(to, t){
        return this.add(to.sub(this).mult(t));
    }

    toString() {
        return `rgba(${this.r|0},${this.g|0},${this.b|0},${this.a})`;
    }

    toJSON() {
        return `rgba(${this.r|0},${this.g|0},${this.b|0},${this.a})`;
    }

    copy(other){
        let out = new Color(other);
        return out;
    }
}

/*
    BODY {color: black; background: white }
    H1 { color: maroon }
    H2 { color: olive }
    EM { color: #f00 }              // #rgb //
    EM { color: #ff0000 }           // #rrggbb //
    EM { color: rgb(255,0,0) }      // integer range 0 - 255 //
    EM { color: rgb(100%, 0%, 0%) } // float range 0.0% - 100.0% //
*/
class CSS_Color extends Color {
    static parse(l) {

        let c = CSS_Color._fs_(l);

        if (c) {

            let color = new CSS_Color();

            color.set(c);

            return color;
        }

        return null;
    }
    static _verify_(l) {
        let c = CSS_Color._fs_(l, true);
        if (c)
            return true;
        return false;
    }
    /**
        Creates a new Color from a string or a Lexer.
    */
    static _fs_(l, v = false) {
        let c;

        if (typeof(l) == "string")
            l = whind$1(l);

        let out = { r: 0, g: 0, b: 0, a: 1 };

        switch (l.ch) {
            case "#":
                l.next();
                let pk = l.copy();

                let type = l.types;
                pk.IWS = false;


                while(!(pk.ty & (type.newline | type.ws)) && !pk.END && pk.ch !== ";"){
                    pk.next();
                }

                var value = pk.slice(l);
                l.sync(pk);
                l.tl = 0;
                l.next();
                
                let num = parseInt(value,16);

                if(value.length == 3 || value.length == 4){
                    
                    if(value.length == 4){
                        const a = (num >> 8) & 0xF;
                        out.a = a | a << 4;
                        num >>= 4;
                    }

                    const r = (num >> 8) & 0xF;
                    out.r = r | r << 4;
                    
                    const g = (num >> 4) & 0xF;
                    out.g = g | g << 4;
                    
                    const b = (num) & 0xF;
                    out.b = b | b << 4;

                }else{

                    if(value.length == 8){
                        out.a = num & 0xFF;
                        num >>= 8;
                    }

                    out.r = (num >> 16) & 0xFF;       
                    out.g = (num >> 8) & 0xFF;
                    out.b = (num) & 0xFF;
                }
                l.next();
                break;
            case "r":
                let tx = l.tx;

                const RGB_TYPE = tx === "rgba"  ? 1 : tx === "rgb" ? 2 : 0;
                
                if(RGB_TYPE > 0){

                    l.next(); // (
                    
                    out.r = parseInt(l.next().tx);
                    
                    l.next(); // , or  %

                    if(l.ch == "%"){
                        l.next(); out.r = out.r * 255 / 100;
                    }
                    
                    
                    out.g = parseInt(l.next().tx);
                    
                    l.next(); // , or  %
                   
                    if(l.ch == "%"){
                        l.next(); out.g = out.g * 255 / 100;
                    }
                    
                    
                    out.b = parseInt(l.next().tx);
                    
                    l.next(); // , or ) or %
                    
                    if(l.ch == "%")
                        l.next(), out.b = out.b * 255 / 100;

                    if(RGB_TYPE < 2){
                        out.a = parseFloat(l.next().tx);

                        l.next();
                        
                        if(l.ch == "%")
                            l.next(), out.a = out.a * 255 / 100;
                    }

                    l.a(")");
                    c = new CSS_Color();
                    c.set(out);
                    return c;
                }  // intentional
            default:

                let string = l.tx;

                if (l.ty == l.types.str){
                    string = string.slice(1, -1);
                }

                out = CSS_Color.colors[string.toLowerCase()];

                if(out)
                    l.next();
        }

        return out;
    }

    constructor(r, g, b, a) {
        super(r, g, b, a);

        if (typeof(r) == "string")
            this.set(CSS_Color._fs_(r) || {r:255,g:255,b:255,a:0});

    }

    toString(){
        if(this.a !== 1)
            return this.toRGBString();
        return `#${("0"+this.r.toString(16)).slice(-2)}${("0"+this.g.toString(16)).slice(-2)}${("0"+this.b.toString(16)).slice(-2)}`
    }
    toRGBString(){
        return `rgba(${this.r.toString()},${this.g.toString()},${this.b.toString()},${this.a.toString()})`   
    }
} {

    let _$ = (r = 0, g = 0, b = 0, a = 1) => ({ r, g, b, a });
    let c = _$(0, 255, 25);
    CSS_Color.colors = {
        "alice blue": _$(240, 248, 255),
        "antique white": _$(250, 235, 215),
        "aqua marine": _$(127, 255, 212),
        "aqua": c,
        "azure": _$(240, 255, 255),
        "beige": _$(245, 245, 220),
        "bisque": _$(255, 228, 196),
        "black": _$(),
        "blanched almond": _$(255, 235, 205),
        "blue violet": _$(138, 43, 226),
        "blue": _$(0, 0, 255),
        "brown": _$(165, 42, 42),
        "burly wood": _$(222, 184, 135),
        "cadet blue": _$(95, 158, 160),
        "chart reuse": _$(127, 255),
        "chocolate": _$(210, 105, 30),
        "clear": _$(255, 255, 255),
        "coral": _$(255, 127, 80),
        "corn flower blue": _$(100, 149, 237),
        "corn silk": _$(255, 248, 220),
        "crimson": _$(220, 20, 60),
        "cyan": c,
        "dark blue": _$(0, 0, 139),
        "dark cyan": _$(0, 139, 139),
        "dark golden rod": _$(184, 134, 11),
        "dark gray": _$(169, 169, 169),
        "dark green": _$(0, 100),
        "dark khaki": _$(189, 183, 107),
        "dark magenta": _$(139, 0, 139),
        "dark olive green": _$(85, 107, 47),
        "dark orange": _$(255, 140),
        "dark orchid": _$(153, 50, 204),
        "dark red": _$(139),
        "dark salmon": _$(233, 150, 122),
        "dark sea green": _$(143, 188, 143),
        "dark slate blue": _$(72, 61, 139),
        "dark slate gray": _$(47, 79, 79),
        "dark turquoise": _$(0, 206, 209),
        "dark violet": _$(148, 0, 211),
        "deep pink": _$(255, 20, 147),
        "deep sky blue": _$(0, 191, 255),
        "dim gray": _$(105, 105, 105),
        "dodger blue": _$(30, 144, 255),
        "firebrick": _$(178, 34, 34),
        "floral white": _$(255, 250, 240),
        "forest green": _$(34, 139, 34),
        "fuchsia": _$(255, 0, 255),
        "gainsboro": _$(220, 220, 220),
        "ghost white": _$(248, 248, 255),
        "gold": _$(255, 215),
        "golden rod": _$(218, 165, 32),
        "gray": _$(128, 128, 128),
        "green yellow": _$(173, 255, 47),
        "green": _$(0, 128),
        "honeydew": _$(240, 255, 240),
        "hot pink": _$(255, 105, 180),
        "indian red": _$(205, 92, 92),
        "indigo": _$(75, 0, 130),
        "ivory": _$(255, 255, 240),
        "khaki": _$(240, 230, 140),
        "lavender blush": _$(255, 240, 245),
        "lavender": _$(230, 230, 250),
        "lawn green": _$(124, 252),
        "lemon chiffon": _$(255, 250, 205),
        "light blue": _$(173, 216, 230),
        "light coral": _$(240, 128, 128),
        "light cyan": _$(224, 255, 255),
        "light golden rod yellow": _$(250, 250, 210),
        "light gray": _$(211, 211, 211),
        "light green": _$(144, 238, 144),
        "light pink": _$(255, 182, 193),
        "light salmon": _$(255, 160, 122),
        "light sea green": _$(32, 178, 170),
        "light sky blue": _$(135, 206, 250),
        "light slate gray": _$(119, 136, 153),
        "light steel blue": _$(176, 196, 222),
        "light yellow": _$(255, 255, 224),
        "lime green": _$(50, 205, 50),
        "lime": _$(0, 255),
        "lime": _$(0, 255),
        "linen": _$(250, 240, 230),
        "magenta": _$(255, 0, 255),
        "maroon": _$(128),
        "medium aqua marine": _$(102, 205, 170),
        "medium blue": _$(0, 0, 205),
        "medium orchid": _$(186, 85, 211),
        "medium purple": _$(147, 112, 219),
        "medium sea green": _$(60, 179, 113),
        "medium slate blue": _$(123, 104, 238),
        "medium spring green": _$(0, 250, 154),
        "medium turquoise": _$(72, 209, 204),
        "medium violet red": _$(199, 21, 133),
        "midnight blue": _$(25, 25, 112),
        "mint cream": _$(245, 255, 250),
        "misty rose": _$(255, 228, 225),
        "moccasin": _$(255, 228, 181),
        "navajo white": _$(255, 222, 173),
        "navy": _$(0, 0, 128),
        "old lace": _$(253, 245, 230),
        "olive drab": _$(107, 142, 35),
        "olive": _$(128, 128),
        "orange red": _$(255, 69),
        "orange": _$(255, 165),
        "orchid": _$(218, 112, 214),
        "pale golden rod": _$(238, 232, 170),
        "pale green": _$(152, 251, 152),
        "pale turquoise": _$(175, 238, 238),
        "pale violet red": _$(219, 112, 147),
        "papaya whip": _$(255, 239, 213),
        "peach puff": _$(255, 218, 185),
        "peru": _$(205, 133, 63),
        "pink": _$(255, 192, 203),
        "plum": _$(221, 160, 221),
        "powder blue": _$(176, 224, 230),
        "purple": _$(128, 0, 128),
        "red": _$(255),
        "rosy brown": _$(188, 143, 143),
        "royal blue": _$(65, 105, 225),
        "saddle brown": _$(139, 69, 19),
        "salmon": _$(250, 128, 114),
        "sandy brown": _$(244, 164, 96),
        "sea green": _$(46, 139, 87),
        "sea shell": _$(255, 245, 238),
        "sienna": _$(160, 82, 45),
        "silver": _$(192, 192, 192),
        "sky blue": _$(135, 206, 235),
        "slate blue": _$(106, 90, 205),
        "slate gray": _$(112, 128, 144),
        "snow": _$(255, 250, 250),
        "spring green": _$(0, 255, 127),
        "steel blue": _$(70, 130, 180),
        "tan": _$(210, 180, 140),
        "teal": _$(0, 128, 128),
        "thistle": _$(216, 191, 216),
        "tomato": _$(255, 99, 71),
        "transparent": _$(0, 0, 0, 0),
        "turquoise": _$(64, 224, 208),
        "violet": _$(238, 130, 238),
        "wheat": _$(245, 222, 179),
        "white smoke": _$(245, 245, 245),
        "white": _$(255, 255, 255),
        "yellow green": _$(154, 205, 50),
        "yellow": _$(255, 255)
    };
}

class CSS_Percentage extends Number {    
    static parse(l, rule, r) {
        let tx = l.tx,
            pky = l.pk.ty;

        if (l.ty == l.types.num || tx == "-" && pky == l.types.num) {
            let mult = 1;

            if (l.ch == "-") {
                mult = -1;
                tx = l.p.tx;
                l.p.next();
            }

            if (l.p.ch == "%") {
                l.sync().next();
                return new CSS_Percentage(parseFloat(tx) * mult);
            }
        }
        return null;
    }

    static _verify_(l) {
        if(typeof(l) == "string" &&  !isNaN(parseInt(l)) && l.includes("%"))
            return true;
        return false;
    }
    
    constructor(v) {

        if (typeof(v) == "string") {
            let lex = whind(v);
            let val = CSS_Percentage.parse(lex);
            if (val) 
                return val;
        }
        
        super(v);
    }

    toJSON() {
        return super.toString() + "%";
    }

    toString(radix) {
        return super.toString(radix) + "%";
    }

    get str() {
        return this.toString();
    }

    lerp(to, t) {
        return new CSS_Percentage(this + (to - this) * t);
    }

    copy(other){
        return new CSS_Percentage(other);
    }

    get type(){
        return "%";
    }
}

CSS_Percentage.label_name = "Percentage";

class CSS_Length extends Number {

    static parse(l) {
        let tx = l.tx,
            pky = l.pk.ty;
        if (l.ty == l.types.num || tx == "-" && pky == l.types.num) {
            let sign = 1;
            if (l.ch == "-") {
                sign = -1;
                tx = l.p.tx;
                l.p.next();
            }
            if (l.p.ty == l.types.id) {
                let id = l.sync().tx;
                l.next();
                return new CSS_Length(parseFloat(tx) * sign, id);
            }
        }
        return null;
    }

    static _verify_(l) {
        if (typeof(l) == "string" && !isNaN(parseInt(l)) && !l.includes("%")) return true;
        return false;
    }

    constructor(v, u = "") {
        
        if (typeof(v) == "string") {
            let lex = whind$1(v);
            let val = CSS_Length.parse(lex);
            if (val) return val;
        }

        if(u){
            switch(u){
                //Absolute
                case "px": return new PXLength(v);
                case "mm": return new MMLength(v);
                case "cm": return new CMLength(v);
                case "in": return new INLength(v);
                case "pc": return new PCLength(v);
                case "pt": return new PTLength(v);
                
                //Relative
                case "ch": return new CHLength(v);
                case "em": return new EMLength(v);
                case "ex": return new EXLength(v);
                case "rem": return new REMLength(v);

                //View Port
                case "vh": return new VHLength(v);
                case "vw": return new VWLength(v);
                case "vmin": return new VMINLength(v);
                case "vmax": return new VMAXLength(v);

                //Deg
                case "deg": return new DEGLength(v);

                case "%" : return new CSS_Percentage(v);
            }
        }

        super(v);
    }

    get milliseconds() {
        switch (this.unit) {
            case ("s"):
                return parseFloat(this) * 1000;
        }
        return parseFloat(this);
    }

    toString(radix) {
        return super.toString(radix) + "" + this.unit;
    }

    toJSON() {
        return super.toString() + "" + this.unit;
    }

    get str() {
        return this.toString();
    }

    lerp(to, t) {
        return new CSS_Length(this + (to - this) * t, this.unit);
    }

    copy(other) {
        return new CSS_Length(other, this.unit);
    }

    set unit(t){}
    get unit(){return "";}
}

class PXLength extends CSS_Length {
    get unit(){return "px";}
}
class MMLength extends CSS_Length {
    get unit(){return "mm";}
}
class CMLength extends CSS_Length {
    get unit(){return "cm";}
}
class INLength extends CSS_Length {
    get unit(){return "in";}
}
class PTLength extends CSS_Length {
    get unit(){return "pt";}
}
class PCLength extends CSS_Length {
    get unit(){return "pc";}
}
class CHLength extends CSS_Length {
    get unit(){return "ch";}
}
class EMLength extends CSS_Length {
    get unit(){return "em";}
}
class EXLength extends CSS_Length {
    get unit(){return "ex";}
}
class REMLength extends CSS_Length {
    get unit(){return "rem";}
}
class VHLength extends CSS_Length {
    get unit(){return "vh";}
}
class VWLength extends CSS_Length {
    get unit(){return "vw";}
}
class VMINLength extends CSS_Length {
    get unit(){return "vmin";}
}
class VMAXLength extends CSS_Length {
    get unit(){return "vmax";}
}
class DEGLength extends CSS_Length {
    get unit(){return "deg";}
}

class CSS_URL extends URL {
    static parse(l) {
        if (l.tx == "url" || l.tx == "uri") {
            l.next().a("(");
            let v = "";
            if (l.ty == l.types.str) {
                v = l.tx.slice(1,-1);
                l.next().a(")");
            } else {
                const p = l.peek();
                while (!p.END && p.next().tx !== ")") { /* NO OP */ }
                v = p.slice(l);
                l.sync().a(")");
            }
            return new CSS_URL(v);
        } if (l.ty == l.types.str){
            let v = l.tx.slice(1,-1);
            l.next();
            return new CSS_URL(v);
        }

        return null;
    }
}

class CSS_String extends String {

    static parse(l) {
        if (l.ty == l.types.str) {
            let tx = l.tx;
            l.next();
            return new CSS_String(tx);
        }
        return null;
    }

    constructor(string) {
        //if(string[0] == "\"" || string[0] == "\'" || string[0] == "\'")
        //    string = string.slice(1,-1);
        super(string);
    }
}

class CSS_Id extends String {
    static parse(l) {
        if (l.ty == l.types.id) {
            let tx = l.tx;
            l.next();
            return new CSS_Id(tx);
        }
        return null;
    }
}

/* https://www.w3.org/TR/css-shapes-1/#typedef-basic-shape */
class CSS_Shape extends Array {
    static parse(l) {
        if (l.tx == "inset" || l.tx == "circle" || l.tx == "ellipse" || l.tx == "polygon" || l.tx == "rect") {
            l.next().a("(");
            let v = "";
            if (l.ty == l.types.str) {
                v = l.tx.slice(1,-1);
                l.next().a(")");
            } else {
                let p = l.pk;
                while (!p.END && p.next().tx !== ")") { /* NO OP */ }
                v = p.slice(l);
                l.sync().a(")");
            }
            return new CSS_Shape(v);
        }
        return null;
    }
}

class CSS_Number extends Number {

    static parse(l) {
        
        let sign = 1;

        if(l.ch == "-" && l.pk.ty == l.types.num){
        	l.sync();
        	sign = -1;
        }

        if(l.ty == l.types.num){
        	let tx = l.tx;
            l.next();
            return new CSS_Number(sign*(new Number(tx)));
        }
        return null;
    }
}

class Point2D extends Float64Array{
	
	constructor(x, y) {
		super(2);

		if (typeof(x) == "number") {
			this[0] = x;
			this[1] = y;
			return;
		}

		if (x instanceof Array) {
			this[0] = x[0];
			this[1] = x[1];
		}
	}

	draw(ctx, s = 1){
		ctx.beginPath();
		ctx.moveTo(this.x*s,this.y*s);
		ctx.arc(this.x*s, this.y*s, s*0.01, 0, 2*Math.PI);
		ctx.stroke();
	}

	get x (){ return this[0]}
	set x (v){if(typeof(v) !== "number") return; this[0] = v;}

	get y (){ return this[1]}
	set y (v){if(typeof(v) !== "number") return; this[1] = v;}
}

const sqrt = Math.sqrt;
const cos = Math.cos;
const acos = Math.acos;
const PI = Math.PI; 
const pow = Math.pow;

// A real-cuberoots-only function:
function cuberoot(v) {
  if(v<0) return -pow(-v,1/3);
  return pow(v,1/3);
}

function point(t, p1, p2, p3, p4) {
	var ti = 1 - t;
	var ti2 = ti * ti;
	var t2 = t * t;
	return ti * ti2 * p1 + 3 * ti2 * t * p2 + t2 * 3 * ti * p3 + t2 * t * p4;
}


class CBezier extends Float64Array{
	constructor(x1, y1, x2, y2, x3, y3, x4, y4) {
		super(8);

		//Map P1 and P2 to {0,0,1,1} if only four arguments are provided; for use with animations
		if(arguments.length == 4){
			this[0] = 0;
			this[1] = 0;
			this[2] = x1;
			this[3] = y1;
			this[4] = x2;
			this[5] = y2;
			this[6] = 1;
			this[7] = 1;
			return;
		}
		
		if (typeof(x1) == "number") {
			this[0] = x1;
			this[1] = y1;
			this[2] = x2;
			this[3] = y2;
			this[4] = x3;
			this[5] = y3;
			this[6] = x4;
			this[7] = y4;
			return;
		}

		if (x1 instanceof Array) {
			this[0] = x1[0];
			this[1] = x1[1];
			this[2] = x1[2];
			this[3] = x1[3];
			this[4] = x1[4];
			this[5] = x1[5];
			this[6] = x1[6];
			this[7] = x1[4];
			return;
		}
	}

	get x1 (){ return this[0]}
	set x1 (v){this[0] = v;}
	get x2 (){ return this[2]}
	set x2 (v){this[2] = v;}
	get x3 (){ return this[4]}
	set x3 (v){this[4] = v;}
	get x4 (){ return this[6]}
	set x4 (v){this[6] = v;}
	get y1 (){ return this[1]}
	set y1 (v){this[1] = v;}
	get y2 (){ return this[3]}
	set y2 (v){this[3] = v;}
	get y3 (){ return this[5]}
	set y3 (v){this[5] = v;}
	get y4 (){ return this[7]}
	set y4 (v){this[7] = v;}

	add(x,y = 0){
		return new CCurve(
			this[0] + x,
			this[1] + y,
			this[2] + x,
			this[3] + y,
			this[4] + x,
			this[5] + y,
			this[6] + x,
			this[7] + y
		)
	}

	valY(t){
		return point(t, this[1], this[3], this[5], this[7]);
	}

	valX(t){
		return point(t, this[0], this[2], this[4], this[6]);
	}

	point(t) {
		return new Point2D(
			point(t, this[0], this[2], this[4], this[6]),
			point(t, this[1], this[3], this[5], this[7])
		)
	}
	
	/** 
		Acquired from : https://pomax.github.io/bezierinfo/
		Author:  Mike "Pomax" Kamermans
		GitHub: https://github.com/Pomax/
	*/

	roots(p1,p2,p3,p4) {
		var d = (-p1 + 3 * p2 - 3 * p3 + p4),
			a = (3 * p1 - 6 * p2 + 3 * p3) / d,
			b = (-3 * p1 + 3 * p2) / d,
			c = p1 / d;

		var p = (3 * b - a * a) / 3,
			p3 = p / 3,
			q = (2 * a * a * a - 9 * a * b + 27 * c) / 27,
			q2 = q / 2,
			discriminant = q2 * q2 + p3 * p3 * p3;

		// and some variables we're going to use later on:
		var u1, v1, root1, root2, root3;

		// three possible real roots:
		if (discriminant < 0) {
			var mp3 = -p / 3,
				mp33 = mp3 * mp3 * mp3,
				r = sqrt(mp33),
				t = -q / (2 * r),
				cosphi = t < -1 ? -1 : t > 1 ? 1 : t,
				phi = acos(cosphi),
				crtr = cuberoot(r),
				t1 = 2 * crtr;
			root1 = t1 * cos(phi / 3) - a / 3;
			root2 = t1 * cos((phi + 2 * PI) / 3) - a / 3;
			root3 = t1 * cos((phi + 4 * PI) / 3) - a / 3;
			return [root3, root1, root2]
		}

		// three real roots, but two of them are equal:
		if (discriminant === 0) {
			u1 = q2 < 0 ? cuberoot(-q2) : -cuberoot(q2);
			root1 = 2 * u1 - a / 3;
			root2 = -u1 - a / 3;
			return [root2, root1];
		}

		// one real root, two complex roots
		var sd = sqrt(discriminant);
		u1 = cuberoot(sd - q2);
		v1 = cuberoot(sd + q2);
		root1 = u1 - v1 - a / 3;
		return [root1];
	}

	rootsY() {
		return this.roots(this[1],this[3],this[5],this[7]);
	}

	rootsX() {
		return this.roots(this[0],this[2],this[4],this[6]);
	}
	
	getYatX(x){
		var x1 = this[0] - x, x2 = this[2] - x, x3 = this[4] - x, x4 = this[6] - x,
			x2_3 = x2 * 3, x1_3 = x1 *3, x3_3 = x3 * 3,
			d = (-x1 + x2_3 - x3_3 + x4), di = 1/d, i3 = 1/3,
			a = (x1_3 - 6 * x2 + x3_3) * di,
			b = (-x1_3 + x2_3) * di,
			c = x1 * di,
			p = (3 * b - a * a) * i3,
			p3 = p * i3,
			q = (2 * a * a * a - 9 * a * b + 27 * c) * (1/27),
			q2 = q * 0.5,
			discriminant = q2 * q2 + p3 * p3 * p3;

		// and some variables we're going to use later on:
		var u1, v1, root;

		//Three real roots can never happen if p1(0,0) and p4(1,1);

		// three real roots, but two of them are equal:
		if (discriminant < 0) {
			var mp3 = -p / 3,
				mp33 = mp3 * mp3 * mp3,
				r = sqrt(mp33),
				t = -q / (2 * r),
				cosphi = t < -1 ? -1 : t > 1 ? 1 : t,
				phi = acos(cosphi),
				crtr = cuberoot(r),
				t1 = 2 * crtr;
			root = t1 * cos((phi + 4 * PI) / 3) - a / 3;
		}else if (discriminant === 0) {
			u1 = q2 < 0 ? cuberoot(-q2) : -cuberoot(q2);
			root = -u1 - a * i3;
		}else{
			var sd = sqrt(discriminant);
			// one real root, two complex roots
			u1 = cuberoot(sd - q2);
			v1 = cuberoot(sd + q2);
			root = u1 - v1 - a * i3;	
		}

		return point(root, this[1], this[3], this[5], this[7]);
	}
	/**
		Given a Canvas 2D context object and scale value, strokes a cubic bezier curve.
	*/
	draw(ctx, s = 1){
		ctx.beginPath();
		ctx.moveTo(this[0]*s, this[1]*s);
		ctx.bezierCurveTo(
			this[2]*s, this[3]*s,
			this[4]*s, this[5]*s,
			this[6]*s, this[7]*s
			);
		ctx.stroke();
	}
}

class CSS_Bezier extends CBezier {
	static parse(l) {

		let out = null;

		switch(l.tx){
			case "cubic":
				l.next().a("(");
				let v1 = parseFloat(l.tx);
				let v2 = parseFloat(l.next().a(",").tx);
				let v3 = parseFloat(l.next().a(",").tx);
				let v4 = parseFloat(l.next().a(",").tx);
				l.a(")");
				out = new CSS_Bezier(v1, v2, v3, v4);
				break;
			case "ease":
				l.next();
				out = new CSS_Bezier(0.25, 0.1, 0.25, 1);
				break;
			case "ease-in":
				l.next();
				out = new CSS_Bezier(0.42, 0, 1, 1);
				break;
			case "ease-out":
				l.next();
				out = new CSS_Bezier(0, 0, 0.58, 1);
				break;
			case "ease-in-out":
				l.next();
				out = new CSS_Bezier(0.42, 0, 0.58, 1);
				break;
		}

		return out;
	}

	toString(){
		 return `cubic-bezier(${this[2]},${this[3]},${this[4]},${this[5]})`;
	}
}

class Stop{
    constructor(color, percentage){
        this.color = color;
        this.percentage = percentage || null;
    }

    toString(){
        return `${this.color}${(this.percentage)?" "+this.percentage:""}`;
    }
}

class CSS_Gradient{

    static parse(l) {
        let tx = l.tx,
            pky = l.pk.ty;
        if (l.ty == l.types.id) {
            switch(l.tx){
                case "linear-gradient":
                l.next().a("(");
                let num,type ="deg";
                if(l.tx == "to");else if(l.ty == l.types.num){
                    num = parseFloat(l.ty);
                    type = l.next().tx;
                    l.next().a(',');
                }

                let stops = [];
                
                while(!l.END && l.ch != ")"){
                    let v = CSS_Color.parse(l, rule, r);
                    let len = null;

                    if(l.ch == ")") {
                        stops.push(new Stop(v, len));
                        break;
                    }
                    
                    if(l.ch != ","){
                        if(!(len = CSS_Length.parse(l)))
                            len = CSS_Percentage.parse(l);
                    }else
                        l.next();
                    

                    stops.push(new Stop(v, len));
                }
                l.a(")");
                let grad = new CSS_Gradient();
                grad.stops = stops;
                return grad;
            }
        }
        return null;
    }


    constructor(type = 0){
        this.type = type; //linear gradient
        this.direction = new CSS_Length(0, "deg");
        this.stops = [];
    }

    toString(){
        let str = [];
        switch(this.type){
            case 0:
            str.push("linear-gradient(");
            if(this.direction !== 0)
                str.push(this.direction.toString() + ",");
            break;
        }

        for(let i = 0; i < this.stops.length; i++)
            str.push(this.stops[i].toString()+((i<this.stops.length-1)?",":""));

        str.push(")");

        return str.join(" ");
    }
}

const $medh = (prefix) => ({
    parse: (l, r, a, n = 0) => (n = CSS_Length.parse(l, r, a), (prefix > 0) ? ((prefix > 1) ? (win) => win.innerHeight <= n : (win) => win.innerHeight >= n) : (win) => win.screen.height == n)
});


const $medw = (prefix) => ({
    parse: (l, r, a, n = 0) => 
        (n = CSS_Length.parse(l, r, a), (prefix > 0) ? ((prefix > 1) ? (win) => win.innerWidth >= n : (win) => win.innerWidth <= n) : (win) => win.screen.width == n)
});

function CSS_Media_handle(type, prefix) {
    switch (type) {
        case "h":
            return $medh(prefix);
        case "w":
            return $medw(prefix);
    }

    return {
        parse: function(a) {
            debugger;
        }
    };
}

function getValue(lex, attribute) {
    let v = lex.tx,
        mult = 1;

    if (v == "-")
        v = lex.n.tx, mult = -1;

    let n = parseFloat(v) * mult;

    lex.next();

    if (lex.ch !== ")" && lex.ch !== ",") {
        switch (lex.tx) {
            case "%":
                break;

            /* Rotational Values */
            case "grad":
                n *= Math.PI / 200;
                break;
            case "deg":
                n *= Math.PI / 180;
                break;
            case "turn":
                n *= Math.PI * 2;
                break;
            case "px":
                break;
            case "em":
                break;
        }
        lex.next();
    }
    return n;
}

function ParseString(string, transform) {
    let lex = null;
    lex = string;

    if(typeof(string) == "string")
        lex = whind$1(string);
    
    while (!lex.END) {
        let tx = lex.tx;
        lex.next();
        switch (tx) {
            case "matrix":

                let a = getValue(lex.a("(")),
                    b = getValue(lex.a(",")),
                    c = getValue(lex.a(",")),
                    d = getValue(lex.a(",")),
                    r = -Math.atan2(b, a),
                    sx1 = (a / Math.cos(r)) || 0,
                    sx2 = (b / -Math.sin(r)) || 0,
                    sy1 = (c / Math.sin(r)) || 0,
                    sy2 = (d / Math.cos(r)) || 0;
                
                if(sx2 !== 0)
                    transform.sx = (sx1 + sx2) * 0.5;
                else
                    transform.sx = sx1;

                if(sy1 !== 0)
                    transform.sy = (sy1 + sy2) * 0.5;
                else
                    transform.sy = sy2;

                transform.px = getValue(lex.a(","));
                transform.py = getValue(lex.a(","));
                transform.r = r;
                lex.a(")");
                break;
            case "matrix3d":
                break;
            case "translate":
                transform.px = getValue(lex.a("("));
                lex.a(",");
                transform.py = getValue(lex);
                lex.a(")");
                continue;
            case "translateX":
                transform.px = getValue(lex.a("("));
                lex.a(")");
                continue;
            case "translateY":
                transform.py = getValue(lex.a("("));
                lex.a(")");
                continue;
            case "scale":
                transform.sx = getValue(lex.a("("));
                if(lex.ch ==","){
                    lex.a(",");
                    transform.sy = getValue(lex);
                }
                else transform.sy = transform.sx;
                lex.a(")");
                continue;
            case "scaleX":
                transform.sx = getValue(lex.a("("));
                lex.a(")");
                continue;
            case "scaleY":
                transform.sy = getValue(lex.a("("));
                lex.a(")");
                continue;
            case "scaleZ":
                break;
            case "rotate":
                transform.r = getValue(lex.a("("));
                lex.a(")");
                continue;
            case "rotateX":
                break;
            case "rotateY":
                break;
            case "rotateZ":
                break;
            case "rotate3d":
                break;
            case "perspective":
                break;
        }
        lex.next();
    }
}
// A 2D transform composition of 2D position, 2D scale, and 1D rotation.

class CSS_Transform2D extends Float64Array {
    static ToString(pos = [0, 0], scl = [1, 1], rot = 0) {
        var px = 0,
            py = 0,
            sx = 1,
            sy = 1,
            r = 0, cos = 1, sin = 0;
        if (pos.length == 5) {
            px = pos[0];
            py = pos[1];
            sx = pos[2];
            sy = pos[3];
            r = pos[4];
        } else {
            px = pos[0];
            py = pos[1];
            sx = scl[0];
            sy = scl[1];
            r = rot;
        }
        
        if(r !== 0){
            cos = Math.cos(r);
            sin = Math.sin(r);
        }

        return `matrix(${cos * sx}, ${-sin * sx}, ${sy * sin}, ${sy * cos}, ${px}, ${py})`;
    }


    constructor(px, py, sx, sy, r) {
        super(5);
        this.sx = 1;
        this.sy = 1;
        if (px !== undefined) {
            if (px instanceof CSS_Transform2D) {
                this[0] = px[0];
                this[1] = px[1];
                this[2] = px[2];
                this[3] = px[3];
                this[4] = px[4];
            } else if (typeof(px) == "string") ParseString(px, this);
            else {
                this[0] = px;
                this[1] = py;
                this[2] = sx;
                this[3] = sy;
                this[4] = r;
            }
        }
    }
    get px() {
        return this[0];
    }
    set px(v) {
        this[0] = v;
    }
    get py() {
        return this[1];
    }
    set py(v) {
        this[1] = v;
    }
    get sx() {
        return this[2];
    }
    set sx(v) {
        this[2] = v;
    }
    get sy() {
        return this[3];
    }
    set sy(v) {
        this[3] = v;
    }
    get r() {
        return this[4];
    }
    set r(v) {
        this[4] = v;
    }

    set scale(s){
        this.sx = s;
        this.sy = s;
    }

    get scale(){
        return this.sx;
    }
    
    lerp(to, t) {
        let out = new CSS_Transform2D();
        for (let i = 0; i < 5; i++) out[i] = this[i] + (to[i] - this[i]) * t;
        return out;
    }
    toString() {
        return CSS_Transform2D.ToString(this);
    }

    copy(v) {
        let copy = new CSS_Transform2D(this);


        if (typeof(v) == "string")
            ParseString(v, copy);

        return copy;
    }

    /**
     * Sets the transform value of a canvas 2D context;
     */
    setCTX(ctx){       
        let cos = 1, sin = 0;
        if(this[4] != 0){
            cos = Math.cos(this[4]);
            sin = Math.sin(this[4]);
        }
        ctx.transform(cos * this[2], -sin * this[2], this[3] * sin, this[3] * cos, this[0], this[1]);
    }

    getLocalX(X){
        return (X - this.px) / this.sx;
    }

    getLocalY(Y){
        return (Y - this.py) / this.sy;
    }
}

/**
 * @brief Path Info
 * @details Path syntax information for reference
 * 
 * MoveTo: M, m
 * LineTo: L, l, H, h, V, v
 * Cubic Bézier Curve: C, c, S, s
 * Quadratic Bézier Curve: Q, q, T, t
 * Elliptical Arc Curve: A, a
 * ClosePath: Z, z
 * 
 * Capital symbols represent absolute positioning, lowercase is relative
 */
const PathSym = {
    M: 0,
    m: 1,
    L: 2,
    l: 3,
    h: 4,
    H: 5,
    V: 6,
    v: 7,
    C: 8,
    c: 9,
    S: 10,
    s: 11,
    Q: 12,
    q: 13,
    T: 14,
    t: 15,
    A: 16,
    a: 17,
    Z: 18,
    z: 19,
    pairs: 20
};

function getSignedNumber(lex) {
    let mult = 1,
        tx = lex.tx;
    if (tx == "-") {
        mult = -1;
        tx = lex.n.tx;
    }
    lex.next();
    return parseFloat(tx) * mult;
}

function getNumberPair(lex, array) {
    let x = getSignedNumber(lex);
    if (lex.ch == ',') lex.next();
    let y = getSignedNumber(lex);
    array.push(x, y);
}

function parseNumberPairs(lex, array) {
    while ((lex.ty == lex.types.num || lex.ch == "-") && !lex.END) {    	
    	array.push(PathSym.pairs);
        getNumberPair(lex, array);
    }
}
/**
 * @brief An array store of path data in numerical form
 */
class CSS_Path extends Array {
    static FromString(string, array) {
        let lex = whind(string);
        while (!lex.END) {
            let relative = false,
                x = 0,
                y = 0;
            switch (lex.ch) {
                //Move to
                case "m":
                    relative = true;
                case "M":
                    lex.next(); //
                    array.push((relative) ? PathSym.m : PathSym.M);
                    getNumberPair(lex, array);
                    parseNumberPairs(lex, array);
                    continue;
                    //Line to
                case "h":
                    relative = true;
                case "H":
                    lex.next();
                    x = getSignedNumber(lex);
                    array.push((relative) ? PathSym.h : PathSym.H, x);
                    continue;
                case "v":
                    relative = true;
                case "V":
                    lex.next();
                    y = getSignedNumber(lex);
                    array.push((relative) ? PathSym.v : PathSym.V, y);
                    continue;
                case "l":
                    relative = true;
                case "L":
                    lex.next();
                    array.push((relative) ? PathSym.l : PathSym.L);
                    getNumberPair(lex, array);
                    parseNumberPairs(lex, array);
                    continue;
                    //Cubic Curve
                case "c":
                    relative = true;
                case "C":
                    array.push((relative) ? PathSym.c : PathSym.C);
                    getNumberPair(lex, array);
                    getNumberPair(lex, array);
                    getNumberPair(lex, array);
                    parseNumberPairs(lex, array);
                    continue;
                case "s":
                    relative = true;
                case "S":
                    array.push((relative) ? PathSym.s : PathSym.S);
                    getNumberPair(lex, array);
                    getNumberPair(lex, array);
                    parseNumberPairs(lex, array);
                    continue;
                    //Quadratic Curve0
                case "q":
                    relative = true;
                case "Q":
                    array.push((relative) ? PathSym.q : PathSym.Q);
                    getNumberPair(lex, array);
                    getNumberPair(lex, array);
                    parseNumberPairs(lex, array);
                    continue;
                case "t":
                    relative = true;
                case "T":
                    array.push((relative) ? PathSym.t : PathSym.T);
                    getNumberPair(lex, array);
                    parseNumberPairs(lex, array);
                    continue;
                    //Elliptical Arc
                    //Close path:
                case "z":
                    relative = true;
                case "Z":
                    array.push((relative) ? PathSym.z : PathSym.Z);
            }
            lex.next();
        }
    }

    static ToString(array) {
    	let string = [], l = array.length, i = 0;
    	while(i < l){
    		switch(array[i++]){
    			case PathSym.M:
    				string.push("M", array[i++], array[i++]);
    				break;
			    case PathSym.m:
			    	string.push("m", array[i++], array[i++]);
			    	break;
			    case PathSym.L:
			    	string.push("L", array[i++], array[i++]);
			    	break;
			    case PathSym.l:
			    	string.push("l", array[i++], array[i++]);
			    	break;
			    case PathSym.h:
			    	string.push("h", array[i++]);
			    	break;
			    case PathSym.H:
			    	string.push("H", array[i++]);
			    	break;
			    case PathSym.V:
			    	string.push("V", array[i++]);
			    	break;
			    case PathSym.v:
			    	string.push("v", array[i++]);
			    	break;
			    case PathSym.C:
			    	string.push("C", array[i++], array[i++], array[i++], array[i++], array[i++], array[i++]);
			    	break;
			    case PathSym.c:
			    	string.push("c", array[i++], array[i++], array[i++], array[i++], array[i++], array[i++]);
			    	break;
			    case PathSym.S:
			    	string.push("S", array[i++], array[i++], array[i++], array[i++]);
			    	break;
			    case PathSym.s:
			    	string.push("s", array[i++], array[i++], array[i++], array[i++]);
			    	break;
			    case PathSym.Q:
			    	string.push("Q", array[i++], array[i++], array[i++], array[i++]);
			    	break;
			    case PathSym.q:
			    	string.push("q", array[i++], array[i++], array[i++], array[i++]);
			    	break;
			    case PathSym.T:
			    	string.push("T", array[i++], array[i++]);
			    	break;
			    case PathSym.t:
			    	string.push("t", array[i++], array[i++]);
			    	break;
			    case PathSym.Z:
			    	string.push("Z");
			    	break;
			    case PathSym.z:
			    	string.push("z");
			    	break;
			    case PathSym.pairs:
			    	string.push(array[i++], array[i++]);
			    	break;
			 	case PathSym.A:
			    case PathSym.a:
			    default:
			    	i++;
    		}
    	}

    	return string.join(" ");
    }

    
    constructor(data) {
        super();	

    	if(typeof(data) == "string"){
    		Path.FromString(data, this);
    	}else if(Array.isArray(data)){
    		for(let i = 0; i < data.length;i++){
    			this.push(parseFloat(data[i]));
    		}
    	}
    }

    toString(){
    	return Path.ToString(this);
    }

    lerp(to, t, array = new Path){
    	let l = Math.min(this.length, to.length);

    	for(let i = 0; i < l; i++)
    		array[i] = this[i] + (to[i] - this[i]) * t;

    	return array;
    }	
}

class CSS_FontName extends String {
	static parse(l) {

		if(l.ty == l.types.str){
			let tx = l.tx;
            l.next();
			return new CSS_String(tx);
		}		

		if(l.ty == l.types.id){

			let pk = l.peek();

			while(pk.type == l.types.id && !pk.END){
				pk.next();
			}

			let str = pk.slice(l);
			
			l.sync();
			return new CSS_String(str);
		}

        return null;
    }
}

/**
 * CSS Type constructors
 */
const types$2 = {
	color: CSS_Color,
	length: CSS_Length,
	time: CSS_Length,
	flex: CSS_Length,
	angle: CSS_Length,
	frequency: CSS_Length,
	resolution: CSS_Length,
	percentage: CSS_Percentage,
	url: CSS_URL,
	uri: CSS_URL,
	number: CSS_Number,
	id: CSS_Id,
	string: CSS_String,
	shape: CSS_Shape,
	cubic_bezier: CSS_Bezier,
	integer: CSS_Number,
	gradient: CSS_Gradient,
	transform2D : CSS_Transform2D,
	path: CSS_Path,
	fontname: CSS_FontName,

	/* Media parsers */
	m_width: CSS_Media_handle("w", 0),
	m_min_width: CSS_Media_handle("w", 1),
	m_max_width: CSS_Media_handle("w", 2),
	m_height: CSS_Media_handle("h", 0),
	m_min_height: CSS_Media_handle("h", 1),
	m_max_height: CSS_Media_handle("h", 2),
	m_device_width: CSS_Media_handle("dw", 0),
	m_min_device_width: CSS_Media_handle("dw", 1),
	m_max_device_width: CSS_Media_handle("dw", 2),
	m_device_height: CSS_Media_handle("dh", 0),
	m_min_device_height: CSS_Media_handle("dh", 1),
	m_max_device_height: CSS_Media_handle("dh", 2)
};

/**
 * CSS Property Definitions https://www.w3.org/TR/css3-values/#value-defs
 */
const property_definitions = {

	/* https://drafts.csswg.org/css-writing-modes-3/ */
		direction:"ltr|rtl",
		unicode_bidi:"normal|embed|isolate|bidi-override|isolate-override|plaintext",
		writing_mode:"horizontal-tb|vertical-rl|vertical-lr",
		text_orientation:"mixed|upright|sideways",
		glyph_orientation_vertical:`auto|0deg|90deg|"0"|"90"`,
		text_combine_upright:"none|all",

	/* https://www.w3.org/TR/css-position-3 */ 
		position: "static|relative|absolute|sticky|fixed",
		top: `<length>|<number>|<percentage>|auto`,
		left: `<length>|<number>|<percentage>|auto`,
		bottom: `<length>|<number>|<percentage>|auto`,
		right: `<length>|<number>|<percentage>|auto`,
		offset_before: `<length>|<percentage>|auto`,
		offset_after: `<length>|<percentage>|auto`,
		offset_start: `<length>|<percentage>|auto`,
		offset_end: `<length>|<percentage>|auto`,
		z_index:"auto|<integer>",

	/* https://www.w3.org/TR/css-display-3/ */
		display: `[ <display_outside> || <display_inside> ] | <display_listitem> | <display_internal> | <display_box> | <display_legacy>`,

	/* https://www.w3.org/TR/css-box-3 */
		margin: `[<length>|<percentage>|0|auto]{1,4}`,
		margin_top: `<length>|<percentage>|0|auto`,
		margin_right: `<length>|<percentage>|0|auto`,
		margin_bottom: `<length>|<percentage>|0|auto`,
		margin_left: `<length>|<percentage>|0|auto`,

		margin_trim:"none|in-flow|all",

		padding: `[<length>|<percentage>|0|auto]{1,4}`,
		padding_top: `<length>|<percentage>|0|auto`,
		padding_right: `<length>|<percentage>|0|auto`,
		padding_bottom: `<length>|<percentage>|0|auto`,
		padding_left: `<length>|<percentage>|0|auto`,

	/* https://www.w3.org/TR/CSS2/visuren.html */
		float: `left|right|none`,
		clear: `left|right|both|none`,

	/* https://drafts.csswg.org/css-sizing-3 todo:implement fit-content(%) function */
		box_sizing: `content-box | border-box`,
		width: `<length>|<percentage>|min-content|max-content|fit-content|auto`,
		height: `<length>|<percentage>|min-content|max-content|fit-content|auto`,
		min_width: `<length>|<percentage>|min-content|max-content|fit-content|auto`,
		max_width: `<length>|<percentage>|min-content|max-content|fit-content|auto|none`,
		min_height: `<length>|<percentage>|min-content|max-content|fit-content|auto`,
		max_height: `<length>|<percentage>|min-content|max-content|fit-content|auto|none`,

	/* https://www.w3.org/TR/2018/REC-css-color-3-20180619 */
		color: `<color>`,
		opacity: `<alphavalue>`,

	/* https://www.w3.org/TR/css-backgrounds-3/ */
		background_color: `<color>`,
		background_image: `<bg_image>#`,
		background_repeat: `<repeat_style>#`,
		background_attachment: `scroll|fixed|local`,
		background_position: `[<percentage>|<length>]{1,2}|[top|center|bottom]||[left|center|right]`,
		background_clip: `<box>#`,
		background_origin: `<box>#`,
		background_size: `<bg_size>#`,
		background: `[<bg_layer>#,]?<final_bg_layer>`,
		border_color: `<color>{1,4}`,
		border_top_color: `<color>`,
		border_right_color: `<color>`,
		border_bottom_color: `<color>`,
		border_left_color: `<color>`,

		border_top_width: `<line_width>`,
		border_right_width: `<line_width>`,
		border_bottom_width: `<line_width>`,
		border_left_width: `<line_width>`,
		border_width: `<line_width>{1,4}`,

		border_style: `<line_style>{1,4}`,
		border_top_style: `<line_style>`,
		border_right_style: `<line_style>`,
		border_bottom_style: `<line_style>`,
		border_left_style: `<line_style>`,

		border_top: `<line_width>||<line_style>||<color>`,
		border_right: `<line_width>||<line_style>||<color>`,
		border_bottom: `<line_width>||<line_style>||<color>`,
		border_left: `<line_width>||<line_style>||<color>`,

		border_radius: `<length_percentage>{1,4}[ / <length_percentage>{1,4}]?`,
		border_top_left_radius: `<length_percentage>{1,2}`,
		border_top_right_radius: `<length_percentage>{1,2}`,
		border_bottom_right_radius: `<length_percentage>{1,2}`,
		border_bottom_left_radius: `<length_percentage>{1,2}`,

		border: `<line_width>||<line_style>||<color>`,

		border_image: `<border_image_source>||<border_image_slice>[/<border_image_width>|/<border_image_width>?/<border_image_outset>]?||<border_image_repeat>`,
		border_image_source: `none|<image>`,
		border_image_slice: `[<number>|<percentage>]{1,4}&&fill?`,
		border_image_width: `[<length_percentage>|<number>|auto]{1,4}`,
		border_image_outset: `[<length>|<number>]{1,4}`,
		border_image_repeat: `[stretch|repeat|round|space]{1,2}`,
		box_shadow: `none|<shadow>#`,
		line_height: `normal|<percentage>|<length>|<number>`,
		overflow: 'visible|hidden|scroll|auto',

	/* https://www.w3.org/TR/css-fonts-4 */
		font_display: "auto|block|swap|fallback|optional",
		font_family: `[[<generic_family>|<family_name>],]*[<generic_family>|<family_name>]`,
		font_language_override:"normal|<string>",
		font: `[[<font_style>||<font_variant>||<font_weight>]?<font_size>[/<line_height>]?<font_family>]|caption|icon|menu|message-box|small-caption|status-bar`,
		font_max_size: `<absolute_size>|<relative_size>|<length>|<percentage>|infinity`,
		font_min_size: `<absolute_size>|<relative_size>|<length>|<percentage>`,
		font_optical_sizing: `auto|none`,
		font_pallette: `normal|light|dark|<identifier>`,
		font_size: `<absolute_size>|<relative_size>|<length>|<percentage>`,
		font_stretch:"<percentage>|normal|ultra-condensed|extra-condensed|condensed|semi-condensed|semi-expanded|expanded|extra-expanded|ultra-expanded",
		font_style: `normal|italic|oblique<angle>?`,
		font_synthesis:"none|[weight||style]",
		font_synthesis_small_caps:"auto|none",
		font_synthesis_style:"auto|none",
		font_synthesis_weight:"auto|none",
		font_variant_alternates:"normal|[stylistic(<feature-value-name>)||historical-forms||styleset(<feature-value-name>#)||character-variant(<feature-value-name>#)||swash(<feature-value-name>)||ornaments(<feature-value-name>)||annotation(<feature-value-name>)]",
		font_variant_emoji:"auto|text|emoji|unicode",
		font_variation_settings:" normal|[<string><number>]#",
		font_size_adjust: `<number>|none`,
		
		font_weight: `normal|bold|bolder|lighter|100|200|300|400|500|600|700|800|900`,

	/* https://www.w3.org/TR/css-fonts-3/ */
		font_kerning: ` auto | normal | none`,
		font_variant: `normal|none|[<common-lig-values>||<discretionary-lig-values>||<historical-lig-values>||<contextual-alt-values>||[small-caps|all-small-caps|petite-caps|all-petite-caps|unicase|titling-caps]||<numeric-figure-values>||<numeric-spacing-values>||<numeric-fraction-values>||ordinal||slashed-zero||<east-asian-variant-values>||<east-asian-width-values>||ruby||[sub|super]]`,
		font_variant_ligatures:`normal|none|[<common-lig-values>||<discretionary-lig-values>||<historical-lig-values>||<contextual-alt-values> ]`,
		font_variant_position:`normal|sub|super`,
		font_variant_caps:`normal|small-caps|all-small-caps|petite-caps|all-petite-caps|unicase|titling-caps`,
		font_variant_numeric: "normal | [ <numeric-figure-values> || <numeric-spacing-values> || <numeric-fraction-values> || ordinal || slashed-zero ]",
		font_variant_east_asian:" normal | [ <east-asian-variant-values> || <east-asian-width-values> || ruby ]",

	/* https://drafts.csswg.org/css-text-3 */
		hanging_punctuation : "none|[first||[force-end|allow-end]||last]",
		hyphens : "none|manual|auto",
		letter_spacing: `normal|<length>`,
		line_break : "auto|loose|normal|strict|anywhere",
		overflow_wrap : "normal|break-word|anywhere",
		tab_size : "<length>|<number>",
		text_align : "start|end|left|right|center|justify|match-parent|justify-all",
		text_align_all : "start|end|left|right|center|justify|match-parent",
		text_align_last : "auto|start|end|left|right|center|justify|match-parent",
		text_indent : "[[<length>|<percentage>]&&hanging?&&each-line?]",
		text_justify : "auto|none|inter-word|inter-character",
		text_transform : "none|[capitalize|uppercase|lowercase]||full-width||full-size-kana",
		white_space : "normal|pre|nowrap|pre-wrap|break-spaces|pre-line",
		word_break : " normal|keep-all|break-all|break-word",
		word_spacing : "normal|<length>",
		word_wrap : "  normal | break-word | anywhere",

	/* https://drafts.csswg.org/css-text-decor-3 */
		text_decoration: "<text-decoration-line>||<text-decoration-style>||<color>",
		text_decoration_color:"<color>",
		text_decoration_line:"none|[underline||overline||line-through||blink]",
		text_decoration_style:"solid|double|dotted|dashed|wavy",
		text_emphasis:"<text-emphasis-style>||<text-emphasis-color>",
		text_emphasis_color:"<color>",
		text_emphasis_position:"[over|under]&&[right|left]?",
		text_emphasis_style:"none|[[filled|open]||[dot|circle|double-circle|triangle|sesame]]|<string>",
		text_shadow:"none|[<color>?&&<length>{2,3}]#",
		text_underline_position:"auto|[under||[left|right]]",

	/* Flex Box https://www.w3.org/TR/css-flexbox-1/ */
		align_content: `flex-start | flex-end | center | space-between | space-around | stretch`,
		align_items: `flex-start | flex-end | center | baseline | stretch`,
		align_self: `auto | flex-start | flex-end | center | baseline | stretch`,
		flex:`none|[<flex-grow> <flex-shrink>?||<flex-basis>]`,
		flex_basis:`content|<width>`,
		flex_direction:`row | row-reverse | column | column-reverse`,
		flex_flow:`<flex-direction>||<flex-wrap>`,
		flex_grow:`<number>`,
		flex_shrink:`<number>`,
		flex_wrap:`nowrap|wrap|wrap-reverse`,
		justify_content :"flex-start | flex-end | center | space-between | space-around",
		order:`<integer>`,

	/* https://drafts.csswg.org/css-transitions-1/ */
		transition: `<single_transition>#`,
		transition_delay: `<time>#`,
		transition_duration: `<time>#`,
		transition_property: `none|<single_transition_property>#`,
		transition_timing_function: `<timing_function>#`,

	/* CSS3 Animation https://drafts.csswg.org/css-animations-1/ */
		animation: `<single_animation>#`,
		animation_name: `[none|<keyframes_name>]#`,
		animation_duration: `<time>#`,
		animation_timing_function: `<timing_function>#`,
		animation_iteration_count: `<single_animation_iteration_count>#`,
		animation_direction: `<single_animation_direction>#`,
		animation_play_state: `<single_animation_play_state>#`,
		animation_delayed: `<time>#`,
		animation_fill_mode: `<single_animation_fill_mode>#`,

	/* https://svgwg.org/svg2-draft/interact.html#PointerEventsProperty */
		pointer_events : `visiblePainted|visibleFill|visibleStroke|visible|painted|fill|stroke|all|none|auto`,

	/* https://drafts.csswg.org/css-ui-3 */
		caret_color :"auto|<color>",
		cursor:"[[<url> [<number><number>]?,]*[auto|default|none|context-menu|help|pointer|progress|wait|cell|crosshair|text|vertical-text|alias|copy|move|no-drop|not-allowed|grab|grabbing|e-resize|n-resize|ne-resize|nw-resize|s-resize|se-resize|sw-resize|w-resize|ew-resize|ns-resize|nesw-resize|nwse-resize|col-resize|row-resize|all-scroll|zoom-in|zoom-out]]",
		outline:"[<outline-color>||<outline-style>||<outline-width>]",
		outline_color:"<color>|invert",
		outline_offset:"<length>",
		outline_style:"auto|<border-style>",
		outline_width:"<line-width>",
		resize:"none|both|horizontal|vertical",
		text_overflow:"clip|ellipsis",

	/* https://drafts.csswg.org/css-content-3/ */
		bookmark_label:"<content-list>",
		bookmark_level:"none|<integer>",
		bookmark_state:"open|closed",
		content:"normal|none|[<content-replacement>|<content-list>][/<string>]?",
		quotes:"none|[<string><string>]+",
		string_set:"none|[<custom-ident><string>+]#",
	
	/*https://www.w3.org/TR/CSS22/tables.html*/
		caption_side:"top|bottom",
		table_layout:"auto|fixed",
		border_collapse:"collapse|separate",
		border_spacing:"<length><length>?",
		empty_cells:"show|hide",

	/* https://www.w3.org/TR/CSS2/page.html */
		page_break_before:"auto|always|avoid|left|right",
		page_break_after:"auto|always|avoid|left|right",
		page_break_inside:"auto|avoid|left|right",
		orphans:"<integer>",
		widows:"<integer>",

	/* https://drafts.csswg.org/css-lists-3 */
		counter_increment:"[<custom-ident> <integer>?]+ | none",
		counter_reset:"[<custom-ident> <integer>?]+|none",
		counter_set:"[<custom-ident> <integer>?]+|none",
		list_style:"<list-style-type>||<list-style-position>||<list-style-image>",
		list_style_image:"<url>|none",
		list_style_position:"inside|outside",
		list_style_type:"<counter-style>|<string>|none",
		marker_side:"list-item|list-container",


	vertical_align: `baseline|sub|super|top|text-top|middle|bottom|text-bottom|<percentage>|<length>`,

	/* Visual Effects */
	clip: '<shape>|auto',
	visibility: `visible|hidden|collapse`,
	content: `normal|none|[<string>|<uri>|<counter>|attr(<identifier>)|open-quote|close-quote|no-open-quote|no-close-quote]+`,
	quotas: `[<string><string>]+|none`,
	counter_reset: `[<identifier><integer>?]+|none`,
	counter_increment: `[<identifier><integer>?]+|none`,
};

/* Properties that are not directly accessible by CSS prop creator */

const virtual_property_definitions = {
    /* https://drafts.csswg.org/css-counter-styles-3 */
        /*system:`cyclic|numeric|alphabetic|symbolic|additive|[fixed<integer>?]|[extends<counter-style-name>]`,
        negative:`<symbol><symbol>?`,
        prefix:`<symbol>`,
        suffix:`<symbol>`,
        range:`[[<integer>|infinite]{2}]#|auto`,
        pad:`<integer>&&<symbol>`,
        fallback:`<counter-style-name>`
        symbols:`<symbol>+`,*/

        counter_style:`<numeric_counter_style>|<alphabetic_counter_style>|<symbolic_counter_style>|<japanese_counter_style>|<korean_counter_style>|<chinese_counter_style>|ethiopic-numeric`,
        numeric_counter_style:`decimal|decimal-leading-zero|arabic-indic|armenian|upper-armenian|lower-armenian|bengali|cambodian|khmer|cjk-decimal|devanagari|georgian|gujarati|gurmukhi|hebrew|kannada|lao|malayalam|mongolian|myanmar|oriya|persian|lower-roman|upper-roman|tamil|telugu|thai|tibetan`,
        symbolic_counter_style:`disc|circle|square|disclosure-open|disclosure-closed`,
        alphabetic_counter_style:`lower-alpha|lower-latin|upper-alpha|upper-latin|cjk-earthly-branch|cjk-heavenly-stem|lower-greek|hiragana|hiragana-iroha|katakana|katakana-iroha`,
        japanese_counter_style:`japanese-informal|japanese-formal`,
        korean_counter_style:`korean-hangul-formal|korean-hanja-informal|and korean-hanja-formal`,
        chinese_counter_style:`simp-chinese-informal|simp-chinese-formal|trad-chinese-informal|and trad-chinese-formal`,

	/* https://drafts.csswg.org/css-content-3/ */
		content_list:"[<string>|contents|<image>|<quote>|<target>|<leader()>]+",
		content_replacement:"<image>",

	/* https://drafts.csswg.org/css-values-4 */
		custom_ident:"<identifier>",
		position:"[[left|center|right]||[top|center|bottom]|[left|center|right|<length-percentage>][top|center|bottom|<length-percentage>]?|[[left|right]<length-percentage>]&&[[top|bottom]<length-percentage>]]",
	
	/* https://drafts.csswg.org/css-lists-3 */

	east_asian_variant_values:"[jis78|jis83|jis90|jis04|simplified|traditional]",

	alphavalue: '<number>',

	box: `border-box|padding-box|content-box`,

	/*Font-Size: www.w3.org/TR/CSS2/fonts.html#propdef-font-size */
	absolute_size: `xx-small|x-small|small|medium|large|x-large|xx-large`,
	relative_size: `larger|smaller`,

	/*https://www.w3.org/TR/css-backgrounds-3/*/

	bg_layer: `<bg_image>||<bg_position>[/<bg_size>]?||<repeat_style>||<attachment>||<box>||<box>`,
	final_bg_layer: `<background_color>||<bg_image>||<bg_position>[/<bg_size>]?||<repeat_style>||<attachment>||<box>||<box>`,
	bg_image: `<url>|<gradient>|none`,
	repeat_style: `repeat-x|repeat-y|[repeat|space|round|no-repeat]{1,2}`,
	background_attachment: `<attachment>#`,
	bg_size: `<length_percentage>|auto]{1,2}|cover|contain`,
	bg_position: `[[left|center|right|top|bottom|<length_percentage>]|[left|center|right|<length_percentage>][top|center|bottom|<length_percentage>]|[center|[left|right]<length_percentage>?]&&[center|[top|bottom]<length_percentage>?]]`,
	attachment: `scroll|fixed|local`,
	line_style: `none|hidden|dotted|dashed|solid|double|groove|ridge|inset|outset`,
	line_width: `thin|medium|thick|<length>`,
	shadow: `inset?&&<length>{2,4}&&<color>?`,

	/* Font https://www.w3.org/TR/css-fonts-4/#family-name-value */
	
	family_name: `<fontname>`,
	generic_family: `serif|sans-serif|cursive|fantasy|monospace`,
	
	/* Identifier https://drafts.csswg.org/css-values-4/ */

	identifier: `<id>`,
	custom_ident: `<id>`,

	/* https://drafts.csswg.org/css-timing-1/#typedef-timing-function */

	timing_function: `linear|<cubic_bezier_timing_function>|<step_timing_function>|<frames_timing_function>`,
	cubic_bezier_timing_function: `<cubic_bezier>`,
	step_timing_function: `step-start|step-end|'steps()'`,
	frames_timing_function: `'frames()'`,

	/* https://drafts.csswg.org/css-transitions-1/ */

	single_animation_fill_mode: `none|forwards|backwards|both`,
	single_animation_play_state: `running|paused`,
	single_animation_direction: `normal|reverse|alternate|alternate-reverse`,
	single_animation_iteration_count: `infinite|<number>`,
	single_transition_property: `all|<custom_ident>`,
	single_transition: `[none|<single_transition_property>]||<time>||<timing_function>||<time>`,

	/* CSS3 Animation https://drafts.csswg.org/css-animations-1/ */

	single_animation: `<time>||<timing_function>||<time>||<single_animation_iteration_count>||<single_animation_direction>||<single_animation_fill_mode>||<single_animation_play_state>||[none|<keyframes_name>]`,
	keyframes_name: `<string>`,

	/* CSS3 Stuff */
	length_percentage: `<length>|<percentage>`,
	frequency_percentage: `<frequency>|<percentage>`,
	angle_percentage: `<angle>|<percentage>`,
	time_percentage: `<time>|<percentage>`,
	number_percentage: `<number>|<percentage>`,

	/*CSS Clipping https://www.w3.org/TR/css-masking-1/#clipping */
	clip_path: `<clip_source>|[<basic_shape>||<geometry_box>]|none`,
	clip_source: `<url>`,
	shape_box: `<box>|margin-box`,
	geometry_box: `<shape_box>|fill-box|stroke-box|view-box`,
	basic_shape: `<CSS_Shape>`,
	ratio: `<integer>/<integer>`,

	/* https://www.w3.org/TR/css-fonts-3/*/
	common_lig_values        : `[ common-ligatures | no-common-ligatures ]`,
	discretionary_lig_values : `[ discretionary-ligatures | no-discretionary-ligatures ]`,
	historical_lig_values    : `[ historical-ligatures | no-historical-ligatures ]`,
	contextual_alt_values    : `[ contextual | no-contextual ]`,

	//Display
	display_outside  : `block | inline | run-in`,
	display_inside   : `flow | flow-root | table | flex | grid | ruby`,
	display_listitem : `<display_outside>? && [ flow | flow-root ]? && list-item`,
	display_internal : `table-row-group | table-header-group | table-footer-group | table-row | table-cell | table-column-group | table-column | table-caption | ruby-base | ruby-text | ruby-base-container | ruby-text-container`,
	display_box      : `contents | none`,
	display_legacy   : `inline-block | inline-table | inline-flex | inline-grid`,
};

function checkDefaults(lx) {
    const tx = lx.tx;
    /* https://drafts.csswg.org/css-cascade/#inherited-property */
    switch (lx.tx) {
        case "initial": //intentional
        case "inherit": //intentional
        case "unset": //intentional
        case "revert": //intentional
            if (!lx.pk.pk.END) // These values should be the only ones present. Failure otherwise.
                return 0; // Default value present among other values. Invalid
            return 1; // Default value present only. Valid
    }    return 2; // Default value not present. Ignore
}

class JUX { /* Juxtaposition */

    constructor() {
        this.id = JUX.step++;
        this.r = [NaN, NaN];
        this.terms = [];
        this.HAS_PROP = false;
        this.name = "";
        this.virtual = false;
        this.REQUIRE_COMMA = false;
    }
    mergeValues(existing_v, new_v) {
        if (existing_v)
            if (existing_v.v) {
                if (Array.isArray(existing_v.v))
                    existing_v.v.push(new_v.v);
                else {
                    existing_v.v = [existing_v.v, new_v.v];
                }
            } else
                existing_v.v = new_v.v;
    }

    seal() {

    }

    sp(value, out_val) { /* Set Property */
        if (this.HAS_PROP) {
            if (value)
                if (Array.isArray(value) && value.length === 1 && Array.isArray(value[0]))
                    out_val[0] = value[0];
                else
                    out_val[0] = value;
        }
    }

    isRepeating() {
        return !(isNaN(this.r[0]) && isNaN(this.r[1]));
    }

    parse(data){
        const prop_data = [];

        this.parseLVL1(data instanceof whind$1.constructor ? data : whind$1(data + ""), prop_data);

        return prop_data;
    }



    parseLVL1(lx, out_val = [], ROOT = true) {
            
        if (typeof(lx) == "string")
            lx = whind$1(lx);

        let bool = false;

        if (ROOT) {
            switch (checkDefaults(lx)) {
                case 1:
                    this.sp(lx.tx, out_val);
                    return true;
                case 0:
                    return false;
            }
            bool = this.parseLVL2(lx, out_val, this.start, this.end);
        } else
            bool = this.parseLVL2(lx, out_val, this.start, this.end);

        return bool;
    }

    checkForComma(lx) {
        if (this.REQUIRE_COMMA) {
            if (lx.ch == ",")
                lx.next();
            else return false;
        }
        return true;
    }

    parseLVL2(lx, out_val, start, end) {

        let bool = false;

        repeat:
            for (let j = 0; j < end && !lx.END; j++) {

                const copy = lx.copy();

                const temp = [];

                for (let i = 0, l = this.terms.length; i < l; i++) {

                    const term = this.terms[i];
                    
                    if (!term.parseLVL1(copy, temp, false)) {
                        if (!term.OPTIONAL) {
                            break repeat;
                        }
                    }
                }

                out_val.push(...temp);

                lx.sync(copy);

                bool = true;

                if (!this.checkForComma(lx))
                    break;
            }

        return bool;
    }

    get start() {
        return isNaN(this.r[0]) ? 1 : this.r[0];
    }
    set start(e) {}

    get end() {
        return isNaN(this.r[1]) ? 1 : this.r[1];
    }
    set end(e) {}

    get OPTIONAL() { return this.r[0] === 0 }
    set OPTIONAL(a) {}
}
JUX.step = 0;
class AND extends JUX {
    parseLVL2(lx, out_val, start, end) {

        const
            PROTO = new Array(this.terms.length),
            l = this.terms.length;

        let bool = false;

        repeat:
            for (let j = 0; j < end && !lx.END; j++) {

                const
                    HIT = PROTO.fill(0),
                    copy = lx.copy();
                    //temp_r = [];

                and:
                    while (true) {



                        for (let i = 0; i < l; i++) {

                            if (HIT[i] === 2) continue;

                            let term = this.terms[i];

                            const temp = [];

                            if (!term.parseLVL1(copy, temp, false)) {
                                if (term.OPTIONAL)
                                    HIT[i] = 1;
                            } else {
                                out_val.push(...temp);
                                HIT[i] = 2;
                                continue and;
                            }
                        }

                        if (HIT.reduce((a, v) => a * v, 1) === 0)
                            break repeat;

                        break
                    }



                lx.sync(copy);

                // if (temp_r.length > 0)
                //     r.push(...temp);

                bool = true;

                if (!this.checkForComma(lx))
                    break;
            }

        return bool;
    }
}

class OR extends JUX {
    parseLVL2(lx, out_val, start, end) {

        const
            PROTO = new Array(this.terms.length),
            l = this.terms.length;

        let
            bool = false,
            NO_HIT = true;

        repeat:
            for (let j = 0; j < end && !lx.END; j++) {

                const HIT = PROTO.fill(0);
                let copy = lx.copy();

                or:
                    while (true) {
                        for (let i = 0; i < l; i++) {

                            if (HIT[i] === 2) continue;

                            let term = this.terms[i];

                            if (term.parseLVL1(copy, out_val, false)) {
                                NO_HIT = false;
                                HIT[i] = 2;
                                continue or;
                            }
                        }

                        if (NO_HIT) break repeat;

                        break;
                    }

                lx.sync(copy);

                //if (temp_r.v)
                //    this.mergeValues(r, temp_r)

                bool = true;

                if (!this.checkForComma(lx))
                    break;
            }

        return bool;
    }
}

OR.step = 0;

class ONE_OF extends JUX {
    parseLVL2(lx, out_val, start, end) {

        let BOOL = false;

        for (let j = 0; j < end && !lx.END; j++) {

            const  
                copy = lx.copy();
            
            let bool = false;

            for (let i = 0, l = this.terms.length; i < l; i++) {
                if (this.terms[i].parseLVL1(copy, out_val, false)) {
                    bool = true;
                    break;
                }
            }

            if (!bool)
                break;

            lx.sync(copy);

            BOOL = true;

            if (!this.checkForComma(lx))
                break;
        }

        return BOOL;
    }
}

ONE_OF.step = 0;

class LiteralTerm{

    constructor(value, type) {
        
        if(type == whind$1.types.string)
            value = value.slice(1,-1);

        this.value = value;
        this.HAS_PROP = false;
    }

    seal(){}

    parse(data){
        const prop_data = [];

        this.parseLVL1(data instanceof whind$1.constructor ? data : whind$1(data + ""), prop_data);

        return prop_data;
    }

    parseLVL1(l, r, root = true) {

        if (typeof(l) == "string")
            l = whind$1(l);

        if (root) {
            switch(checkDefaults(l)){
                case 1:
                rule.push(l.tx);
                return true;
                case 0:
                return false;
            }
        }

        let v = l.tx;
        
        if (v == this.value) {
            l.next();
            r.push(v);
            //if (this.HAS_PROP  && !this.virtual && root)
            //    rule[0] = v;

            return true;
        }
        return false;
    }

    get OPTIONAL (){ return false }
    set OPTIONAL (a){}
}

class ValueTerm extends LiteralTerm{

    constructor(value, getPropertyParser, definitions, productions) {
        
        super(value);

        if(value instanceof JUX)
            return value;

        this.value = null;

        const IS_VIRTUAL = { is: false };
        
        if(typeof(value) == "string")
            var u_value = value.replace(/\-/g,"_");

        if (!(this.value = types$2[u_value]))
            this.value = getPropertyParser(u_value, IS_VIRTUAL, definitions, productions);

        if (!this.value)
            return new LiteralTerm(value);

        if(this.value instanceof JUX){

            if (IS_VIRTUAL.is)
                this.value.virtual = true;

            return this.value;
        }
    }

    parseLVL1(l, r, ROOT = true) {
        if (typeof(l) == "string")
            l = whind$1(l);

        if (ROOT) {
            switch(checkDefaults(l)){
                case 1:
                r.push(l.tx);
                return true;
                case 0:
                return false;
            }
        }

        //const rn = [];

        const v = this.value.parse(l);

        /*if (rn.length > 0) {
            
           // r.push(...rn);

            // if (this.HAS_PROP && !this.virtual)
            //     rule[0] = rn.v;

            return true;

        } else */if (v) {

            r.push(v);

            //if (this.HAS_PROP && !this.virtual && ROOT)
            //    rule[0] = v;

            return true;
        } else
            return false;
    }
}



class SymbolTerm extends LiteralTerm {
    parseLVL1(l, rule, r) {
        if (typeof(l) == "string")
            l = whind$1(l);

        if (l.tx == this.value) {
            l.next();
            rule.push(this.value);
            return true;
        }

        return false;
    }
}

//import util from "util"
const standard_productions = {
    JUX,
    AND,
    OR,
    ONE_OF,
    LiteralTerm,
    ValueTerm,
    SymbolTerm
};

function getExtendedIdentifier(l) {
    let pk = l.pk;

    let id = "";

    while (!pk.END && (pk.ty & (whind$1.types.id | whind$1.types.num)) || pk.tx == "-" || pk.tx == "_") { pk.next(); }

    id = pk.slice(l);

    l.sync();

    l.tl = 0;

    return id;
}

function getPropertyParser(property_name, IS_VIRTUAL = { is: false }, definitions = null, productions = standard_productions) {

    let parser_val = definitions[property_name];

    if (parser_val) {

        if (typeof(parser_val) == "string") {
            parser_val = definitions[property_name] = CreatePropertyParser(parser_val, property_name, definitions, productions);
        }
        parser_val.name = property_name;
        return parser_val;
    }

    if (!definitions.__virtual)
        definitions.__virtual = Object.assign({}, virtual_property_definitions);

    parser_val = definitions.__virtual[property_name];

    if (parser_val) {

        IS_VIRTUAL.is = true;

        if (typeof(parser_val) == "string") {
            parser_val = definitions.__virtual[property_name] = CreatePropertyParser(parser_val, "", definitions, productions);
            parser_val.virtual = true;
            parser_val.name = property_name;
        }

        return parser_val;
    }

    return null;
}


function CreatePropertyParser(notation, name, definitions, productions) {

    const l = whind$1(notation);
    l.useExtendedId();
    
    const important = { is: false };

    let n = d(l, definitions, productions);

    n.seal();

    //if (n instanceof productions.JUX && n.terms.length == 1 && n.r[1] < 2)
    //    n = n.terms[0];

    n.HAS_PROP = true;
    n.IMP = important.is;

    /*//******** DEV 
    console.log("")
    console.log("")
    console.log(util.inspect(n, { showHidden: false, depth: null })) 
    //********** END Dev*/

    return n;
}

function d(l, definitions, productions, super_term = false, oneof_group = false, or_group = false, and_group = false, important = null) {
    let term, nt, v;
    const { JUX, AND, OR, ONE_OF, LiteralTerm, ValueTerm, SymbolTerm } = productions;

    while (!l.END) {

        switch (l.ch) {
            case "]":
                return term;
                break;
            case "[":

                v = d(l.next(), definitions, productions, true);
                l.assert("]");
                v = checkExtensions(l, v, productions);

                if (term) {
                    if (term instanceof JUX && term.isRepeating()) term = foldIntoProduction(productions, new JUX, term);
                    term = foldIntoProduction(productions, term, v);
                } else
                    term = v;
                break;

            case "<":
                let id = getExtendedIdentifier(l.next());

                v = new ValueTerm(id, getPropertyParser, definitions, productions);

                l.next().assert(">");

                v = checkExtensions(l, v, productions);

                if (term) {
                    if (term instanceof JUX /*&& term.isRepeating()*/ ) term = foldIntoProduction(productions, new JUX, term);
                    term = foldIntoProduction(productions, term, v);
                } else {
                    term = v;
                }
                break;

            case "&":

                if (l.pk.ch == "&") {

                    if (and_group)
                        return term;

                    nt = new AND();

                    if (!term) throw new Error("missing term!");

                    nt.terms.push(term);

                    l.sync().next();

                    while (!l.END) {
                        nt.terms.push(d(l, definitions, productions, super_term, oneof_group, or_group, true, important));
                        if (l.ch !== "&" || l.pk.ch !== "&") break;
                        l.a("&").a("&");
                    }

                    return nt;
                }
                break;
            case "|":

                {
                    if (l.pk.ch == "|") {

                        if (or_group || and_group)
                            return term;

                        nt = new OR();

                        nt.terms.push(term);

                        l.sync().next();

                        while (!l.END) {
                            nt.terms.push(d(l, definitions, productions, super_term, oneof_group, true, and_group, important));
                            if (l.ch !== "|" || l.pk.ch !== "|") break;
                            l.a("|").a("|");
                        }

                        return nt;

                    } else {

                        if (oneof_group || or_group || and_group)
                            return term;

                        nt = new ONE_OF();

                        nt.terms.push(term);

                        l.next();

                        while (!l.END) {
                            nt.terms.push(d(l, definitions, productions, super_term, true, or_group, and_group, important));
                            if (l.ch !== "|") break;
                            l.a("|");
                        }

                        return nt;
                    }
                }
                break;
            default:

                v = (l.ty == l.types.symbol) ? new SymbolTerm(l.tx) : new LiteralTerm(l.tx, l.ty);
                l.next();
                v = checkExtensions(l, v, productions);

                if (term) {
                    if (term instanceof JUX /*&& (term.isRepeating() || term instanceof ONE_OF)*/ ) term = foldIntoProduction(productions, new JUX, term);
                    term = foldIntoProduction(productions, term, v);
                } else {
                    term = v;
                }
        }
    }

    return term;
}

function checkExtensions(l, term, productions) {
    outer: while (true) {

        switch (l.ch) {
            case "!":
                /* https://www.w3.org/TR/CSS21/cascade.html#important-rules */
                term.IMPORTANT = true;
                l.next();
                continue outer;
            case "{":
                term = foldIntoProduction(productions, term);
                term.r[0] = parseInt(l.next().tx);
                if (l.next().ch == ",") {
                    l.next();
                    if (l.pk.ch == "}") {

                        term.r[1] = parseInt(l.tx);
                        l.next();
                    } else {
                        term.r[1] = Infinity;
                    }
                } else
                    term.r[1] = term.r[0];
                l.a("}");
                break;
            case "*":
                term = foldIntoProduction(productions, term);
                term.r[0] = 0;
                term.r[1] = Infinity;
                l.next();
                break;
            case "+":
                term = foldIntoProduction(productions, term);
                term.r[0] = 1;
                term.r[1] = Infinity;
                l.next();
                break;
            case "?":
                term = foldIntoProduction(productions, term);
                term.r[0] = 0;
                term.r[1] = 1;
                l.next();
                break;
            case "#":
                term = foldIntoProduction(productions, term);
                term.terms.push(new SymbolTerm(","));
                term.r[0] = 1;
                term.r[1] = Infinity;
                term.REQUIRE_COMMA = true;
                l.next();
                if (l.ch == "{") {
                    term.r[0] = parseInt(l.next().tx);
                    term.r[1] = parseInt(l.next().a(",").tx);
                    l.next().a("}");
                }
                break;
        }
        break;
    }
    return term;
}

function foldIntoProduction(productions, term, new_term = null) {
    if (term) {
        if (!(term instanceof productions.JUX)) {
            let nr = new productions.JUX();
            nr.terms.push(term);
            term = nr;
        }
        if (new_term) {
            term.seal();
            term.terms.push(new_term);
        }
        return term;
    }
    return new_term;
}

const observer_mixin_symbol = Symbol("observer_mixin_symbol");

const observer_mixin = function(calling_name, prototype) {

    const observer_identifier = Symbol("observer_array_reference");

    prototype[observer_mixin_symbol] = observer_identifier;

    //Adds an observer to the object instance. Applies a property to the observer that references the object instance.
    //Creates new observers array if one does not already exist.
    prototype.addObserver = function(...observer_list) {
        let observers = this[observer_identifier];

        if (!observers)
            observers = this[observer_identifier] = [];

        for (const observer of observer_list) {

            if (observer[observer_identifier] == this)
                return

            if (observer[observer_identifier])
                observer[observer_identifier].removeObserver(observer);

            observers.push(observer);

            observer[observer_identifier] = this;
        }
    };

    //Removes an observer from the object instance. 
    prototype.removeObserver = function(...observer_list) {

        const observers = this[observer_identifier];

        for (const observer of observer_list)
            for (let i = 0, l = observers.length; i < l; i++)
                if (observers[i] == observer) return (observer[observer_identifier] = null, observers.splice(i, 1));

    };


    prototype.updateObservers = function() {
        const observers = this[observer_identifier];

        if (observers)
            observers.forEach(obj => obj[calling_name](this));
    };
};

//Properly destructs this observers object on the object instance.
observer_mixin.destroy = function(observer_mixin_instance) {

    const symbol = observer_mixin_instance.constructor.prototype[observer_mixin_symbol];

    if (symbol) {
        if (observer_mixin_instance[symbol])
            observer_mixin_instance[symbol].forEach(observer=>observer[symbol] = null);

        observer_mixin_instance[symbol].length = 0;
        
        observer_mixin_instance[symbol] = null;
    }
};

observer_mixin.mixin_symbol = observer_mixin_symbol;

Object.freeze(observer_mixin);

class styleprop {
    
	constructor(name, original_value, val){
		this.val = val;
        this.name = name.replace(/\-/g, "_");
        this.original_value = original_value;
        this.rule = null;
        this.ver = 0;
	}

    destroy(){
        this.val = null;
        this.name = "";
        this.original_value = "";
        this.rule = null;
        observer_mixin.destroy(this);
    }
    
    get css_type(){
        return "styleprop"
    }

    updated() {
        this.updateObservers();

        if(this.parent)
            this.parent.update();
    }

    get value(){
        return this.val.length > 1 ? this.val : this.val[0];
    }

    get value_string(){
        return this.val.join(" ");        
    }

    toString(offset = 0){
        const  
            off = ("    ").repeat(offset);

        return `${off+this.name.replace(/\_/g, "-")}:${this.value_string}`;
    }

    setValueFromString(value){
        let val = parseDeclaration([this.name, null, value]);
        if(val)
            this.setValue(...val.val);
    }

    setValue(...values){

        let i = 0;

        for(const value of values){
            const own_val = this.val[i];


            if(own_val && value instanceof own_val.constructor)
                this.val[i] = value;
            else
                this.val[i] = value;
            i++;
        }

        this.val.length = values.length;

        this.ver++;

        this.updated();
    }
}

observer_mixin("updatedCSSStyleProperty", styleprop.prototype);

function parseDeclaration(sym) {
    if(sym.length == 0)
        return null;

    let rule_name = sym[0];
    let body_data = sym[2];
    let important = sym[3] ? true : false;
    let prop = null;

    const IS_VIRTUAL = { is: false };

    const parser = getPropertyParser(rule_name.replace(/\-/g, "_"), IS_VIRTUAL, property_definitions);

    if (parser && !IS_VIRTUAL.is) {

        prop = parser.parse(whind$1(body_data).useExtendedId());

    } else
        //Need to know what properties have not been defined
        console.warn(`Unable to get parser for CSS property ${rule_name}`);

    return new styleprop(rule_name, body_data, prop);
}

function setParent(array, parent) {
    for (const prop of array)
        prop.parent = parent;
}

/*
 * Holds a set of css style properties.
 */
class stylerule {

    constructor(selectors = [], props = []) {
        this.selectors = selectors;
        this.properties = new Map;

        this.addProp(props);

        //Versioning
        this.ver = 0;

        this.parent = null;

        setParent(this.selectors, this);
        setParent(this.properties.values(), this);

        this.props = new Proxy(this, this);
        this.addProperty = this.addProp;
        this.addProps = this.addProp;
        this.UPDATE_LOOP_GAURD = false;
    }
    
    get css_type(){
        return "stylerule"
    }

    destroy(){
        
        for(const prop of this.properties.values())
            prop.destroy();

        for(const selector of this.selectors)
            selector.destroy();

        this.parent = null;
        this.selectors = null;
        this.properties = null;

        observer_mixin.destroy(this);
    }

    /* sends an update signal up the hiearchy to allow style sheets to alert observers of new changes. */
    update() {
        this.ver++;

        //if(this.UPDATE_LOOP_GAURD) return;

        if (this.parent)
            this.parent.update();

        this.updateObservers();
    }

    get type() {
        return "stylerule"
    }

    get(obj, name) {
        let prop = obj.properties.get(name);
        //if (prop)
        //    prop.parent = this;
        return prop;
    }
    /*  
        Adds properties to the stylerule
        arg1 string - accepts a string of semicolon seperated css style rules.   
    */
    addProp(props) {
        if (typeof props == "string") {
            return this.addProps(
                props.split(";")
                .filter(e => e !== "")
                .map((e, a) => (a = e.split(":"), a.splice(1, 0, null), a))
                .map(parseDeclaration)
            )
        }

        if (props.type == "stylerule")
            props = props.properties.values();
        else
        if (!Array.isArray(props))
            props = [props];


       // this.UPDATE_LOOP_GAURD = true;
        for (const prop of props)
            if (prop) {
                if(this.properties.has(prop.name))
                    this.properties.get(prop.name).setValue(...prop.val);
                else
                    this.properties.set(prop.name, prop);
                
                prop.parent = this;
            }
        //this.UPDATE_LOOP_GAURD = false;

        this.ver++;

        this.update();

        return props;
    }

    match(element, window) {
        for (const selector of this.selectors)
            if (selector.match(element, window))
                return true;
        return false;
    }

    * getApplicableSelectors(element, window) {
        for (const selector of this.selectors)
            if (selector.match(element, window))
                yield selector;
    }

    * getApplicableRules(element, window) {
        if (this.match(element, window))
            yield this;
    }

    * iterateProps() {
        for (const prop of this.properties.values())
            yield prop;
    }

    toString(off = 0, rule = "") {

        let str = [];

        for (const prop of this.properties.values())
            str.push(prop.toString(off));

        return `${this.selectors.join("")}{${str.join(";")}}`;
    }

    merge(rule) {
        if(!rule) return;
        if (rule.type == "stylerule"){
            for (const prop of rule.properties.values()){
                if (prop) {
                    this.properties.set(prop.name, prop);
                }
            }
        }
                
    }

    get _wick_type_() { return 0; }

    set _wick_type_(v) {}
}

observer_mixin("updatedCSSStyleRule", stylerule.prototype);

class ruleset {
	constructor(asts, rules = []){
		this.rules = rules;

        rules.forEach(r=>r.parent = this);

        this.parent = null;
	}

    destroy(){
        for(const rule of this.rules)
            rule.destroy();
        this.rules = null;
        this.parent = null;
    }

    * getApplicableSelectors(element, win = window) {
        for(const rule of this.rules)
            yield * rule.getApplicableSelectors(element, win);
    }

	* getApplicableRules(element, win = window){
        for(const rule of this.rules)
            yield * rule.getApplicableRules(element, window);
    }

    /* sends an update signal up the hiearchy to allow style sheets to alert observers of new changes. */
    update(){
        if(this.parent)
            this.parent.updated();
    }

    getRule(string) {
        let r = null;
        for (let node = this.fch; node; node = this.getNextChild(node))
            r = node.getRule(string, r);
        return r;
    }

    toString(){
        return this.rules.join("\n");
    }
}

class stylesheet {

    constructor(sym) {
        this.ruleset = null;

        if (sym) {
            this.ruleset = sym[0];
        }else {
            this.ruleset = new ruleset();
        }
        this.ruleset.parent = this;

        this.parent = null;

        this.READY = true;
    }

    destroy(){
        
        this.ruleset.destroy();
        this.parent = null;
        this.READY = false;

        observer_mixin.destroy(this);
    }

    get css_type(){
        return "stylesheet"
    }

    /**
     * Creates a new instance of the object with same properties as the original.
     * @return     {CSSRootNode}  Copy of this object.
     * @public
     */
    clone() {
        let rn = new this.constructor();
        rn._selectors_ = this._selectors_;
        rn._sel_a_ = this._sel_a_;
        rn._media_ = this._media_;
        return rn;
    }

    merge(in_stylesheet) {
        if (in_stylesheet instanceof stylesheet) {

            let ruleset = in_stylesheet.ruleset;
            outer:
                for (let i = 0; i < children.length; i++) {
                    //determine if this child matches any existing selectors
                    let child = children[i];

                    for (let i = 0; i < this.children.length; i++) {
                        let own_child = this.children[i];

                        if (own_child.isSame(child)) {
                            own_child.merge(child);
                            continue outer;
                        }
                    }

                    this.children.push(child);
                }
        }
    }

    _resolveReady_(res, rej) {
        if (this.pending_build > 0) this.resolves.push(res);
        res(this);
    }

    _setREADY_() {
        if (this.pending_build < 1) {
            for (let i = 0, l = this.resolves; i < l; i++) this.resolves[i](this);
            this.resolves.length = 0;
            this.res = null;
        }
    }

    updated() {
        this.updateObservers();
    }

    * getApplicableSelectors(element, win = window) {
        yield * this.ruleset.getApplicableSelectors(element, window);
    }

    getApplicableRules(element, win = window, RETURN_ITERATOR = false, new_rule = new stylerule) {
        if(!(element instanceof HTMLElement))
            return new_rule;

        const iter = this.ruleset.getApplicableRules(element, win);
        if (RETURN_ITERATOR) {
            return iter
        } else
            for (const rule of iter) {
                new_rule.merge(rule);
            }
        return new_rule;
    }

    * getApplicableProperties(element, win = window){
        for(const rule of this.getApplicableRules(element, win, true))
            yield * rule.iterateProps();
    }

    getRule(string) {
        let r = null;
        for (let node = this.fch; node; node = this.getNextChild(node))
            r = node.getRule(string, r);
        return r;
    }

    toString() {
        return this.ruleset + "";
    }
}

observer_mixin("updatedCSS", stylesheet.prototype);

class compoundSelector {
    constructor(sym, env) {

        if(sym.length = 1)
            if(Array.isArray(sym[0]) && sym[0].length == 1)
                return sym[0][0]
            else
                return sym[0]

        this.subclass = null;
        this.tag = null;
        this.pseudo = null;


        if (sym[0].type == "type")
            this.tag = sym.shift();

        if (sym[0] && sym[0][0] && sym[0][0].type !== "pseudoElement")
            this.subclass = sym.shift();

        this.pseudo = sym[0];
    }

    get type() {
        return "compound"
    }

    matchReturnElement(element, win) {
        if (this.tag) {
            if (!this.tag.matchReturnElement(element, win))
                return null;
        }

        if (this.subclass) {
            for (const sel of this.subclass) {
                if (!sel.matchReturnElement(element, win))
                    return null;
            }
        }

        if (this.pseudo) {
            if (!this.subclass.matchReturnElement(element, win))
                return null;
        }

        return element;
    }

    toString() {
        const
            tag = this.tag ? this.tag + "" : "",
            subclass = this.subclass ? this.subclass.join("") + "" : "",
            pseudo = this.pseudo ? this.pseudo + "" : "";

        return `${tag + subclass + pseudo}`;
    }
}

class combination_selector_part {
    constructor(sym, env) {
        if (sym.length > 1) {
            this.op = sym[0];
            this.selector = sym[1];
        } else 
            return sym[0]
    }

    get type() {
        return "complex"
    }

    matchReturnElement(element, selector_array, selector = null, index = 0) {
        let ele;

        if ((ele = this.selector.matchReturnElement(element, selector_array))) {
            switch (this.op) {
                case ">":
                    return selector.match(ele.parentElement);
                case "+":
                    return selector.match(ele.previousElementSibling);
                case "~":
                    let children = ele.parentElement.children.slice(0, element.index);

                    for (const child of children) {
                        if (selector.match(child))
                            return child;
                    }
                    return null;
                default:
                    ele = ele.parentElement;
                    while (ele) {
                        if (selector.match(ele))
                            return ele;
                        ele = ele.parentElement;
                    }
            }
        }

        return null;
    }

    toString() {
        return this.op + this.selector + "";
    }
}

class selector {
    constructor(sym, env) {
        if (sym.length > 1)
            this.vals = [sym, ...sym[1]];
        else
            this.vals = sym;

        this.parent = null;
    }

    match(element, win = window) {

        for (const selector of this.vals.reverse()) {
            if (!(element = selector.matchReturnElement(element, win)))
                return false;
        }
        return true;
    }

    toString() {
        return this.vals.join(" ");
    }
}

class type_selector_part{
	constructor(sym){
		const val = sym[0];
		this.namespace = "";

		if(val.length > 1)
			this.namespace = val[0];
		this.val = ((val.length > 1) ? val[1] : val[0]).toLowerCase();
	}

	get type(){
		return "type"
	}

	matchReturnElement(element, win){
		return element.tagName.toLowerCase() == this.val ? element : null;
	}

	toString(){
		return  this.namespace + " " + this.val;
	}
}

class idSelector{
	constructor(sym,env){
		this.val = sym[1];
	}

	get type(){
		return "id"
	}

	matchReturnElement(element){
		return element.id == this.val ? element : null;
	}

	toString(){
		return "#"+ this.val;
	}
}

class classSelector{
	constructor(sym,env){
		this.val = sym[1];
	}

	get type(){
		return "class"
	}

	matchReturnElement(element, window){
		return element.classList.contains(this.val) ? element : null;
	}

	toString(){
		return "."+this.val;
	}
}

class attribSelector{
	constructor(sym,env){
		this.key = sym[1];
		this.val = "";
		this.op = "";
		this.mod = "";

		if(sym.length > 3){
			this.val = sym[3];
			this.op = sym[2];
			this.mod = sym.length > 5 ? sym[4] : "";
		}

	}

	get type(){
		return "attrib"
	}

	matchReturnElement(element, result){
		
		let attr = element.getAttribute(this.key);

		if(!attr)
			return null
		if(this.val && attr !== this.val)
			return null;
		
		return element;
	}

	toString(){
		return `[${this.key+this.op+this.val+this.mod}]`;
	}
}

class pseudoClassSelector{
	constructor(sym,env){
		this.val = sym[1];
	}

	get type(){
		return "pseudoClass"
	}

	matchReturnElement(element){
		return element;
	}

	toString(){

	}
}

class pseudoElementSelector{
	constructor(sym,env){
		this.val = sym[1].val;
	}

	get type(){
		return "pseudo-element"
	}

	matchReturnElement(element){
		return element;
	}

	toString(){

	}
}

const 
    CSS_Length$1 = types$2.length,
    CSS_Percentage$1 = types$2.percentage,
    CSS_Color$1 = types$2.color,
    CSS_Transform2D$1 = types$2.transform2D,
    CSS_Bezier$1 = types$2.cubic_bezier,

    Animation = (function anim() {

        var USE_TRANSFORM = false;

        const
            CSS_STYLE = 0,
            JS_OBJECT = 1,
            SVG = 3;

        function setType(obj) {
            if (obj instanceof HTMLElement) {
                if (obj.tagName == "SVG")
                    return SVG;
                return CSS_STYLE;
            }
            return JS_OBJECT;
        }

        const Linear = { getYatX: x => x, toString: () => "linear" };


        // Class to linearly interpolate number.
        class lerpNumber extends Number { lerp(to, t, from = 0) { return this + (to - this) * t; } copy(val) { return new lerpNumber(val); } }
        class lerpNonNumeric { constructor(v) { this.v = v; } lerp(to, t, from) { 
            return from.v 
        } copy(val) { return new lerpNonNumeric(val) } }


        // Store animation data for a single property on a single object. Hosts methods that can create CSS based interpolation and regular JS property animations. 
        class AnimProp {

            constructor(keys, obj, prop_name, type) {
                this.duration = 0;
                this.end = false;
                this.keys = [];
                this.current_val = null;

                const
                    IS_ARRAY = Array.isArray(keys),
                    k0 = IS_ARRAY ? keys[0] : keys,
                    k0_val = typeof(k0.value) !== "undefined" ? k0.value : k0.v;

                if (prop_name == "transform")
                    this.type = CSS_Transform2D$1;
                else {
                    this.type = this.getType(k0_val);
                }

                this.getValue(obj, prop_name, type, k0_val);

                let p = this.current_val;

                if (IS_ARRAY)
                    keys.forEach(k => p = this.addKey(k, p));
                else
                    this.addKey(keys, p);
            }

            destroy() {
                this.keys = null;
                this.type = null;
                this.current_val = null;
            }

            getValue(obj, prop_name, type, k0_val) {

                if (type == CSS_STYLE) {
                    let name = prop_name.replace(/[A-Z]/g, (match) => "-" + match.toLowerCase());
                    let cs = window.getComputedStyle(obj);

                    //Try to get computed value. If it does not exist, then get value from the style attribtute.
                    let value = cs.getPropertyValue(name);

                    if (!value)
                        value = obj.style[prop_name];


                    if (this.type == CSS_Percentage$1) {
                        if (obj.parentElement) {
                            let pcs = window.getComputedStyle(obj.parentElement);
                            let pvalue = pcs.getPropertyValue(name);
                            let ratio = parseFloat(value) / parseFloat(pvalue);
                            value = (ratio * 100);
                        }
                    }
                    this.current_val = (new this.type(value));

                } else {
                    this.current_val = new this.type(obj[prop_name]);
                }
            }

            getType(value) {

                switch (typeof(value)) {
                    case "number":
                        return lerpNumber;
                        break
                    case "string":
                        if (CSS_Length$1._verify_(value))
                            return CSS_Length$1;
                        if (CSS_Percentage$1._verify_(value))
                            return CSS_Percentage$1;
                        if (CSS_Color$1._verify_(value))
                            return CSS_Color$1;
                        //intentional
                    case "object":
                        return lerpNonNumeric;
                }
            }

            addKey(key, prev) {
                let
                    l = this.keys.length,
                    pkey = this.keys[l - 1],
                    v = (key.value !== undefined) ? key.value : key.v,
                    own_key = {
                        val: (prev) ? prev.copy(v) : new this.type(v) || 0,
                        dur: key.duration || key.dur || 0,
                        del: key.delay || key.del || 0,
                        ease: key.easing || key.e || ((pkey) ? pkey.ease : Linear),
                        len: 0
                    };

                own_key.len = own_key.dur + own_key.del;

                this.keys.push(own_key);

                this.duration += own_key.len;

                return own_key.val;
            }

            getValueAtTime(time = 0) {
                let val_start = this.current_val,
                    val_end = this.current_val,
                    key, val_out = val_start;


                for (let i = 0; i < this.keys.length; i++) {
                    key = this.keys[i];
                    val_end = key.val;
                    if (time < key.len) {
                        break;
                    } else
                        time -= key.len;
                    val_start = key.val;
                }


                if (key) {
                    if (time < key.len) {
                        if (time < key.del) {
                            val_out = val_start;
                        } else {
                            let x = (time - key.del) / key.dur;
                            let s = key.ease.getYatX(x);
                            val_out = val_start.lerp(val_end, s, val_start);
                        }
                    } else {
                        val_out = val_end;
                    }
                }
                
                return val_out;
            }

            run(obj, prop_name, time, type) {
                const val_out = this.getValueAtTime(time);
                this.setProp(obj, prop_name, val_out, type);
                return time < this.duration;
            }

            setProp(obj, prop_name, value, type) {
                if (type == CSS_STYLE) {
                    obj.style[prop_name] = value;
                } else
                    obj[prop_name] = value;
            }

            unsetProp(obj, prop_name) {
                this.setProp(obj, prop_name, "", CSS_STYLE);
            }

            toCSSString(time = 0, prop_name = "") {
                const value = this.getValueAtTime(time);
                return `${prop_name}:${value.toString()}`;
            }
        }

        // Stores animation data for a group of properties. Defines delay and repeat.
        class AnimSequence {
            constructor(obj, props) {

                this.duration = 0;
                this.time = 0;
                this.obj = null;
                this.type = setType(obj);
                this.DESTROYED = false;
                this.FINISHED = false;
                this.CSS_ANIMATING = false;
                this.events = {};
                this.SHUTTLE = false;
                this.REPEAT = 0;
                this.SCALE = 1;

                switch (this.type) {
                    case CSS_STYLE:
                        this.obj = obj;
                        break;
                    case SVG:
                    case JS_OBJECT:
                        this.obj = obj;
                        break;
                }

                this.props = {};

                this.setProps(props);
            }

            destroy() {
                for (let name in this.props)
                    if (this.props[name])
                        this.props[name].destroy();
                this.DESTROYED = true;
                this.duration = 0;
                this.obj = null;
                this.props = null;
                this.time = 0;
            }

            // Removes AnimProps based on object of keys that should be removed from this sequence.
            removeProps(props) {
                if (props instanceof AnimSequence)
                    props = props.props;

                for (let name in props) {
                    if (this.props[name])
                        this.props[name] = null;
                }
            }


            unsetProps(props) {
                for (let name in this.props)
                    this.props[name].unsetProp(this.obj, name);
            }

            setProps(props) {
                for (let name in this.props)
                    this.props[name].destroy();

                this.props = {};

                for (let name in props)
                    this.configureProp(name, props[name]);
            }

            configureProp(name, keys) {
                let prop;
                if (prop = this.props[name]) {
                    this.duration = Math.max(prop.duration || prop.dur, this.duration);
                } else {
                    prop = new AnimProp(keys, this.obj, name, this.type);
                    this.props[name] = prop;
                    this.duration = Math.max(prop.duration || prop.dur, this.duration);
                }
            }

            run(i) {

                for (let n in this.props) {
                    let prop = this.props[n];
                    if (prop)
                        prop.run(this.obj, n, i, this.type);
                }

                if (i >= this.duration || i <= 0)
                    return false;

                return true;
            }

            scheduledUpdate(a, t) {

                this.time += t * this.SCALE;
                if (this.run(this.time)) {
                    spark.queueUpdate(this);
                } else if (this.REPEAT) {
                    let scale = this.SCALE;

                    this.REPEAT--;

                    if (this.SHUTTLE)
                        scale = -scale;

                    let from = (scale > 0) ? 0 : this.duration;

                    this.play(scale, from);
                } else
                    this.issueEvent("stopped");

            }

            //TODO: use repeat to continually play back numation 
            repeat(count = 1) {
                this.REPEAT = Math.max(0, parseFloat(count));
                return this;
            }
            //TODO: allow scale to control playback speed and direction
            play(scale = 1, from = 0) {
                this.SCALE = scale;
                this.time = from;
                spark.queueUpdate(this);
                this.issueEvent("started");
                return this;
            }

            set(i = 0) {
                if (i >= 0)
                    this.run(i * this.duration);
                else
                    this.run(this.duration - i * this.duration);
            }


            shuttle(SHUTTLE = true) {
                this.SHUTTLE = !!SHUTTLE;
                return this;
            }

            addEventListener(event, listener) {
                if (typeof(listener) === "function") {
                    if (!this.events[event])
                        this.events[event] = [];
                    this.events[event].push(listener);
                }
            }

            removeEventListener(event, listener) {
                if (typeof(listener) === "function") {
                    let events = this.events[event];
                    if (events) {
                        for (let i = 0; i < events.length; i++)
                            if (events[i] === listener)
                                return e(vents.splice(i, 1), true);
                    }
                }
                return false;
            }

            issueEvent(event) {
                let events = this.events[event];

                if (events)
                    events.forEach(e => e(this));
            }

            toCSSString(keyfram_id) {

                const strings = [`.${keyfram_id}{animation:${keyfram_id} ${this.duration}ms ${Animation.ease_out.toString()}}`, `@keyframes ${keyfram_id}{`];

                // TODO: Use some function to determine the number of steps that should be taken
                // This should reflect the different keyframe variations that can occure between
                // properties.
                // For now, just us an arbitrary number

                const len = 2;
                const len_m_1 = len - 1;
                for (let i = 0; i < len; i++) {

                    strings.push(`${Math.round((i/len_m_1)*100)}%{`);

                    for (let name in this.props)
                        strings.push(this.props[name].toCSSString((i / len_m_1) * this.duration, name.replace(/([A-Z])/g, (match, p1) => "-" + match.toLowerCase())) + ";");

                    strings.push("}");
                }

                strings.push("}");

                return strings.join("\n");
            }

            beginCSSAnimation() {
                if (!this.CSS_ANIMATING) {

                    const anim_class = "class" + ((Math.random() * 10000) | 0);
                    this.CSS_ANIMATING = anim_class;

                    this.obj.classList.add(anim_class);
                    let style = document.createElement("style");
                    style.innerHTML = this.toCSSString(anim_class);
                    document.head.appendChild(style);
                    this.style = style;

                    setTimeout(this.endCSSAnimation.bind(this), this.duration);
                }
            }

            endCSSAnimation() {
                if (this.CSS_ANIMATING) {
                    this.obj.classList.remove(this.CSS_ANIMATING);
                    this.CSS_ANIMATING = "";
                    this.style.parentElement.removeChild(this.style);
                    this.style = null;
                }
            }
        }

        class AnimGroup {

            constructor() {
                this.seq = [];
                this.time = 0;
                this.duration = 0;
                this.SHUTTLE = false;
                this.REPEAT = 0;
                this.SCALE = 1;
                this.ANIM_COMPLETE_FUNCTION = null;
            }

            observeStop(fun) {
                if (typeof fun == "function")
                    return (new Promise((res=>this.ANIM_COMPLETE_FUNCTION = res))).then(fun);
                return this;
            }

            destroy() {
                this.seq.forEach(seq => seq.destroy());
                this.seq = null;
            }

            add(seq) {
                this.seq.push(seq);
                this.duration = Math.max(this.duration, seq.duration);
            }

            run(t) {
                for (let i = 0, l = this.seq.length; i < l; i++) {
                    let seq = this.seq[i];
                    seq.run(t);
                }

                if (t >= this.duration)
                    return false;

                return true;
            }

            scheduledUpdate(a, t) {
                this.time += t * this.SCALE;
                if (this.run(this.time))
                    spark.queueUpdate(this);
                else if (repeat) {
                    let scale = this.scale;

                    repeat--;

                    if (this.SHUTTLE)
                        scale = -scale;

                    let from = (scale > 0) ? 0 : this.duration;

                    this.play(scale, from);
                }
            }

            shuttle(SHUTTLE = true) {
                this.SHUTTLE = !!SHUTTLE;
                return this;
            }

            stop() {
                return this;
            }

            set(i = 0) {
                if (i >= 0)
                    this.run(i * this.duration);
                else
                    this.run(this.duration - i * this.duration);
            }

            //TODO: allow scale to control playback speed and direction
            play(scale = 1, from = 0) {
                this.SCALE = scale;
                this.time = from;
                spark.queueUpdate(this);
                return this;
            }
            //TODO: use repeat to continually play back numation 
            repeat(count = 0) {
                this.REPEAT = Math.max(0, parseInt(count));
                return this;
            }
        }

        const GlowFunction = function(...args) {

            if (args.length > 1) {

                let group = new AnimGroup();

                for (let i = 0; i < args.length; i++) {
                    let data = args[i];

                    let obj = data.obj;
                    let props = {};

                    Object.keys(data).forEach(k => { if (!(({ obj: true, match: true, delay: true })[k])) props[k] = data[k]; });

                    group.add(new AnimSequence(obj, props));
                }

                return group;

            } else {
                let data = args[0];

                let obj = data.obj;
                let props = {};

                Object.keys(data).forEach(k => { if (!(({ obj: true, match: true, delay: true })[k])) props[k] = data[k]; });

                let seq = new AnimSequence(obj, props);

                return seq;
            }
        };

        Object.assign(GlowFunction, {

            createSequence: GlowFunction,

            createGroup: function(...rest) {
                let group = new AnimGroup;
                rest.forEach(seq => group.add(seq));
                return group;
            },

            set USE_TRANSFORM(v) { USE_TRANSFORM = !!v; },
            get USE_TRANSFORM() { return USE_TRANSFORM; },

            linear: Linear,
            ease: new CSS_Bezier$1(0.25, 0.1, 0.25, 1),
            ease_in: new CSS_Bezier$1(0.42, 0, 1, 1),
            ease_out: new CSS_Bezier$1(0.2, 0.8, 0.3, 0.99),
            ease_in_out: new CSS_Bezier$1(0.42, 0, 0.58, 1),
            overshoot: new CSS_Bezier$1(0.2, 1.5, 0.2, 0.8),
            custom: (x1, y1, x2, y2) => new CSS_Bezier$1(x1, y1, x2, y2)
        });

        return GlowFunction;
    })();

function setTo(to, seq, duration, easing, from){

    const cs = window.getComputedStyle(to, null);
    const rect = to.getBoundingClientRect();
    const from_rect = from.getBoundingClientRect();

    let to_width = cs.getPropertyValue("width");
    let to_height = cs.getPropertyValue("height");
    let margin_left = parseFloat(cs.getPropertyValue("margin-left"));
    let to_bgc = cs.getPropertyValue("background-color");
    let to_c = cs.getPropertyValue("color");
    const pos = cs.getPropertyValue("position");

    /* USING TRANSFORM */

    //Use width and height a per

    {
        ////////////////////// LEFT ////////////////////// 

        const left = seq.props.left;
        let start_left = 0, final_left = 0, abs_diff = 0;

        abs_diff = (left.keys[0].val - rect.left);

        if(pos== "relative"){
            //get existing offset 
            const left = parseFloat(cs.getPropertyValue("left")) || 0;

            start_left = abs_diff +left;
            final_left = left;
        }else{
            start_left = to.offsetLeft + abs_diff;
            final_left = to.offsetLeft;
        }

        left.keys[0].val = new left.type(start_left, "px");
        left.keys[1].val = new left.type(final_left,"px");
        left.keys[1].dur = duration;
        left.keys[1].len = duration;
        left.keys[1].ease = easing;
        left.duration = duration;

        ////////////////////// TOP ////////////////////// 
        const top = seq.props.top;
        let start_top = 0, final_top = 0;

        abs_diff = (top.keys[0].val - rect.top);

        if(pos== "relative"){
             const top = parseFloat(cs.getPropertyValue("top")) || 0;
            start_top = abs_diff + top;
            final_top = top;
        }else{
            start_top = to.offsetTop + abs_diff;
            final_top = to.offsetTop;
        }

        top.keys[0].val = new top.type(start_top, "px");
        top.keys[1].val = new top.type(final_top,"px");
        top.keys[1].dur = duration;
        top.keys[1].len = duration;
        top.keys[1].ease = easing;
        top.duration = duration;

        ////////////////////// WIDTH ////////////////////// 

        seq.props.width.keys[0].val = new seq.props.width.type(to_width);
        seq.props.width.keys[0].dur = duration;
        seq.props.width.keys[0].len = duration;
        seq.props.width.keys[0].ease = easing;
        seq.props.width.duration = duration;

        ////////////////////// HEIGHT ////////////////////// 

        seq.props.height.keys[0].val = new seq.props.height.type(to_height);
        seq.props.height.keys[0].dur = duration;
        seq.props.height.keys[0].len = duration; 
        seq.props.height.keys[0].ease = easing; 
        seq.props.height.duration = duration;

    }
        to.style.transformOrigin = "top left";

    ////////////////////// BG COLOR ////////////////////// 

    seq.props.backgroundColor.keys[0].val = new seq.props.backgroundColor.type(to_bgc);
    seq.props.backgroundColor.keys[0].dur = duration; 
    seq.props.backgroundColor.keys[0].len = duration; 
    seq.props.backgroundColor.keys[0].ease = easing; 
    seq.props.backgroundColor.duration = duration;

    ////////////////////// COLOR ////////////////////// 

    seq.props.color.keys[0].val = new seq.props.color.type(to_c);
    seq.props.color.keys[0].dur = duration; 
    seq.props.color.keys[0].len = duration; 
    seq.props.color.keys[0].ease = easing; 
    seq.props.color.duration = duration;

    seq.obj = to;



    seq.addEventListener("stopped", ()=>{
        seq.unsetProps();
    });
}

/**
    Transform one element from another back to itself
    @alias module:wick~internals.TransformTo
*/
function TransformTo(element_from, element_to, duration = 500, easing = Animation.linear, HIDE_OTHER = false) {
    let rect = element_from.getBoundingClientRect();
    let cs = window.getComputedStyle(element_from, null);
    let margin_left = parseFloat(cs.getPropertyValue("margin"));

    let seq = Animation.createSequence({
        obj: element_from,
        // /transform: [{value:"translate(0,0)"},{value:"translate(0,0)"}],
        width: { value: "0px"},
        height: { value: "0px"},
        backgroundColor: { value: "rgb(1,1,1)"},
        color: { value: "rgb(1,1,1)"},
        left: [{value:rect.left+"px"},{ value: "0px"}],
        top: [{value:rect.top+"px"},{ value: "0px"}]
    });

    if (!element_to) {

        let a = (seq) => (element_to, duration = 500, easing = Animation.linear,  HIDE_OTHER = false) => {
            setTo(element_to, seq, duration, easing, element_from);
            seq.duration = duration;
        console.log(seq.toCSSString("MumboJumbo"));
            return seq;
        };

        return a(seq);
    }

    setTo(element_to, duration, easing, element_from);
    seq.duration = duration;
    return seq;
}

const Transitioneer = (function() {

    let obj_map = new Map();

    function $in(...data) {
        
        let
            seq = null,
            length = data.length,
            delay = 0;

        if (typeof(data[length - 1]) == "number")
            delay = data[length - 1], length--;

        for (let i = 0; i < length; i++) {
            let anim_data = data[i];

            if (typeof(anim_data) == "object") {

                if (anim_data.match && this.TT[anim_data.match]) {
                    let
                        duration = anim_data.duration,
                        easing = anim_data.easing;
                    seq = this.TT[anim_data.match](anim_data.obj, duration, easing);
                } else
                    seq = Animation.createSequence(anim_data);

                //Parse the object and convert into animation props. 
                if (seq) {
                    this.in_seq.push(seq);
                    this.in_duration = Math.max(this.in_duration, seq.duration);
                    if (this.OVERRIDE) {

                        if (obj_map.get(seq.obj)) {
                            let other_seq = obj_map.get(seq.obj);
                            other_seq.removeProps(seq);
                        }

                        obj_map.set(seq.obj, seq);
                    }
                }
            }
        }

        this.in_duration = Math.max(this.in_duration, parseInt(delay));

        return this.in;
    }


    function $out(...data) {
        //Every time an animating component is added to the Animation stack delay and duration need to be calculated.
        //The highest in_delay value will determine how much time is afforded before the animations for the in portion are started.
        let 
            length = data.length,
            delay = 0,
            in_delay = 0;

        if (typeof(data[length - 1]) == "number") {
            if (typeof(data[length - 2]) == "number") {
                in_delay = data[length - 2];
                delay = data[length - 1];
                length -= 2;
            } else
                delay = data[length - 1], length--;
        }

        for (let i = 0; i < length; i++) {
            let anim_data = data[i];

            if (typeof(anim_data) == "object") {

                if (anim_data.match) {
                    this.TT[anim_data.match] = TransformTo(anim_data.obj);
                } else {
                    let seq = Animation.createSequence(anim_data);
                    if (seq) {
                        this.out_seq.push(seq);
                        this.out_duration = Math.max(this.out_duration, seq.duration);
                        if (this.OVERRIDE) {

                            if (obj_map.get(seq.obj)) {
                                let other_seq = obj_map.get(seq.obj);
                                other_seq.removeProps(seq);
                            }

                            obj_map.set(seq.obj, seq);
                        }
                    }

                    this.in_delay = Math.max(this.in_delay, parseInt(delay));
                }
            }
        }
    }



    class Transition {
        constructor(override = true) {
            this.in_duration = 0;
            this.out_duration = 0;
            this.PLAY = true;

            this.reverse = false;

            this.time = 0;

            // If set to zero transitions for out and in will happen simultaneously.
            this.in_delay = 0;

            this.in_seq = [];
            this.out_seq = [];

            this.TT = {};

            this.out = $out.bind(this);
            this.in = $in.bind(this);

            Object.defineProperty(this.out, "out_duration", {
                get: () => this.out_duration
            });

            this.OVERRIDE = override;
        }

        destroy() {
            let removeProps = function(seq) {

                if (!seq.DESTROYED) {
                    if (obj_map.get(seq.obj) == seq)
                        obj_map.delete(seq.obj);
                }

                seq.destroy();
            };
            this.in_seq.forEach(removeProps);
            this.out_seq.forEach(removeProps);
            this.in_seq.length = 0;
            this.out_seq.length = 0;
            this.res = null;
            this.out = null;
            this.in = null;
        }

        get duration() {
            return Math.max(this.in_duration + this.in_delay, this.out_duration);
        }


        async start(time = 0, speed = 1, reverse = false) {

            for (let i = 0; i < this.in_seq.length; i++) {
                // let seq = this.in_seq[i];
                // seq.beginCSSAnimation()
            }

            this.time = time;
            this.speed = Math.abs(speed);
            this.reverse = reverse;

            if (this.reverse)
                this.speed = -this.speed;

            return new Promise((res, rej) => {
                
                if (this.duration > 0)
                    this.scheduledUpdate(0, 0);
                
                if (this.duration < 1)
                    return res();
                
                this.res = res;
            });
        }

        play(t) {


            this.PLAY = true;
            let time = this.duration * t;
            this.step(time);
            return time;
        }

        stop() {
            this.PLAY = false;
            //There may be a need to kill any existing CSS based animations
        }

        step(t) {

            for (let i = 0; i < this.out_seq.length; i++) {
                let seq = this.out_seq[i];
                if (!seq.run(t) && !seq.FINISHED) {
                    seq.issueEvent("stopped");
                    seq.FINISHED = true;
                }
            }

            t = Math.max(t - this.in_delay, 0);

            for (let i = 0; i < this.in_seq.length; i++) {
                let seq = this.in_seq[i];
                if (!seq.run(t) && !seq.FINISHED) {
                    seq.issueEvent("stopped");
                    seq.FINISHED = true;
                }
            }

        }

        scheduledUpdate(step, time) {
            if (!this.PLAY) return;

            this.time += time * this.speed;

            this.step(this.time);


            if (this.res && this.time >= this.in_delay + this.out_duration) {
                this.res();
                this.res = null;
            }

            if (this.reverse) {
                if (this.time > 0)
                    return spark.queueUpdate(this);
            } else {
                if (this.time < this.duration)
                    return spark.queueUpdate(this);
            }

            if (this.res){
                debugger
                this.res();
            }

            this.destroy();
        }
    }

    return { createTransition: (OVERRIDE) => new Transition(OVERRIDE) };
})();

Object.assign(Animation, {
	createTransition:(...args) => Transitioneer.createTransition(...args),
	transformTo:(...args) => TransformTo(...args)
});

const defaults$1 = {
    glow: Animation,
    wickNodeExpression: function(scope, id) {
        const out = scope.ast.presets.components[id].mount(null, scope, scope.ast.presets, undefined, undefined, true);
        return out;
    }
};

const root = typeof(global) == "object" ? global : window;

function GetOutGlobals(ast, presets) {
    const args = [];
    const ids = [];
    const arg_lu = new Set();

    JS.getClosureVariableNames(ast).forEach(out => {

        const name = out.name;
        if (out.parent &&
            out.type == types$1.identifier &&
            out.parent.type == types$1.assignment_expression &&
            out == out.parent.left
        ) ; else if (!arg_lu.has(name)) {
            arg_lu.add(name);

            const out_object = { name, val: null, IS_TAPPED: false, IS_ELEMENT: false };

            if (presets.custom[name])
                out_object.val = presets.custom[name];
            else if (presets[name])
                out_object.val = presets[name];
            else if (defaults$1[name]) {
                out_object.val = defaults$1[name];
            } else if (root[name]) {
                out_object.val = root[name];
            } else if (name[name.length - 1] == "$") {
                out_object.IS_ELEMENT = true;
            } else {
                out_object.IS_TAPPED = true;
            }
            args.push(out_object);
        }
        ids.push(out);
    });

    return { args, ids };
}

function AddEmit(ast, presets, ignore) {


    ast.forEach(node => {

        if (node.parent && node.parent.type == types$1.assignment_expression && node.type == types$1.identifier) {
            if (node == node.parent.left) {

                const assign = node.parent;

                const k = node.name;

                if ((root[k] && !(root[k] instanceof HTMLElement)) || presets.custom[k] || presets[k] || defaults$1[k] || ignore.includes(k))
                    return;

                node.replace(new member_expression(new identifier$1(["emit"]), node));
            }
        }
    });
}

const offset$1 =  "    ";

class ScriptNode extends ElementNode {

    constructor(env, tag, ast, attribs, presets) {
        super(env, "script", null, attribs, presets);
        this.function = null;
        this.args = null;
        this.ast = ast[0];
        this.READY = false;
        this.val = "";
        this.original_val = "";
        this.on = this.getAttrib("on").value;

        if (this.ast){
            this.original_val = this.ast.render();
            this.processJSAST(presets);
        }
    }

    loadAST(ast) {
        if (ast && !this.ast) {
            this.ast = ast;
            this.processJSAST(this.presets);
        }
    }

    processJSAST(presets = { custom: {} }) {
        const { args, ids } = GetOutGlobals(this.ast, presets);
        this.args = args;
        //console.log(args)
        AddEmit(ids, presets, this.args.reduce((r, a) => ((a.IS_TAPPED) ? null : r.push(a.name), r), []));
        this.val = this.ast + "";
    }

    finalize() {
        if (!this.ast) return this;


        {

            const
                args = this.args,
                names = args.map(a => a.name);

            // For the injected emit function
            names.push("emit");

            try {
                this.function = Function.apply(Function, names.concat([this.val]));
                this.READY = true;
                FUNCTION_CACHE.set(this.val, this.function);
            } catch (e) {
                throw error(error.SCRIPT_FUNCTION_CREATE_FAILURE, e, this);
            }

        }

        return this;
    }

    mount(element, scope, presets, slots, pinned) {
        if (this.READY) {
            const tap = this.on.bind(scope, null, null, this);
            new ScriptIO(scope, this, tap, this, {}, pinned);
        }
    }

    toString(off = 0) {

        var o = offset$1.repeat(off),
            str = `${o}<${this.tag}`;

        for (const attr of this.attribs.values()) {
            if (attr.name)
                str += ` ${attr.name}="${attr.value}"`;
        }

        str += ">\n";

        str += this.original_val; //this.ast.render();

        return str + `${o}</${this.tag}>\n`;
    }
}

class scp extends ElementNode {

    constructor(env, tag, children, attribs, presets) {

        super(env, "scope", children, attribs, presets);

        this.HAS_TAPS = false;
        this.tap_list = [];

        (this.getAttrib("put").value || "").split(" ").forEach(e => this.checkTapMethod("put", e));
        (this.getAttrib("export").value || "").split(" ").forEach(e => this.checkTapMethod("export", e));
        (this.getAttrib("import").value || "").split(" ").forEach(e => this.checkTapMethod("import", e));

        this.model_name = this.getAttrib("model").value;
        this.schema_name = this.getAttrib("scheme").value;

        if (this.schema_name)
            this.getAttrib("scheme").RENDER = false;

        if (this.model_name)
            this.getAttrib("model").RENDER = false;

        if (this.getAttrib("put"))
            this.getAttrib("put").RENDER = false;

        if (this.getAttrib("import"))
            this.getAttrib("import").RENDER = false;

        if (this.getAttrib("export"))
            this.getAttrib("export").RENDER = false;

        this.tag = this.getAttrib("element").value || "div";
    }


    getTap(tap_name) {

        this.HAS_TAPS = true;

        const l = this.tap_list.length;

        for (let i = 0; i < l; i++)
            if (this.tap_list[i].name == tap_name)
                return this.tap_list[i];

        const tap = {
            name: tap_name,
            id: l,
            modes: 0
        };

        this.tap_list.push(tap);

        return tap;
    }

    checkTapMethod(type, name) {

        if (!name) return;

        let tap_mode = KEEP;

        let SET_TAP_METHOD = false;

        switch (type) {
            case "import": // Imports data updates, messages - valid on scope and top level objects.
                SET_TAP_METHOD = true;
                tap_mode |= IMPORT;
                break;
            case "export": // Exports data updates, messages - valid on scopes and top level objects.
                SET_TAP_METHOD = true;
                tap_mode |= EXPORT;
                break;
            case "put": // Pushes updates to model
                SET_TAP_METHOD = true;
                tap_mode |= PUT;
        }


        if (SET_TAP_METHOD) {
            this.getTap(name).modes |= tap_mode;
            return true;
        }
    }

    createRuntimeTaplist(scope) {

        const tap_list = this.tap_list,
            taps = scope.taps;

        for (let i = 0, l = tap_list.length; i < l; i++) {
            const tap = tap_list[i],
                name = tap.name,
                bool = name == "update";

            if (scope.taps.has(name)) continue;

            scope.taps.set(name,
                bool ?
                (scope.update_tap = scope.taps[name],
                    new UpdateTap(scope, name, tap.modes)) :
                new Tap(scope, name, tap.modes)
            );
        }
    }

    createElement(scope) {
        if (!scope.ele || this.getAttribute("element")) {
            const ele = createElement(this.tag || "div");

            if (scope.ele) {
                appendChild(scope.ele, ele);
                scope.ele = ele;
            }

            return ele;
        }

        return scope.ele;
    }

    mount(own_element, outer_scope, presets = this.presets, slots = {}, pinned = {}) {

        const scope = new Scope(outer_scope, presets, own_element, this);
        
        if (this.HAS_TAPS)
            this.createRuntimeTaplist(scope);

        scope._model_name_ = this.model_name;
        scope._schema_name_ = this.schema_name;

        //Reset pinned
        pinned = {};

        return super.mount(null, scope, presets, slots, pinned);
    }

    toString() {
        const tag = this.tag;
        this.tag = "scope";
        const val = super.toString();
        this.tag = tag;
        return val;
    }
}

class a extends ElementNode{
	constructor(env, tag, children, attribs, presets){
		super(env, "a", children, attribs, presets);
	}

	createElement(){
        const element = document.createElement("a");
        this.presets.processLink(element);
        return element;
    }
}

function getColumnRow(index, offset, set_size) {
    const adjusted_index = index - offset * set_size;
    const row = Math.floor(adjusted_index / set_size);
    const col = (index) % (set_size);
    return { row, col };
}

/**
 * ScopeContainer provide the mechanisms for dealing with lists and sets of components. 
 *
 * @param      {Scope}  parent   The Scope parent object.
 * @param      {Object}  data     The data object hosting attribute properties from the HTML template. 
 * @param      {Object}  presets  The global presets object.
 * @param      {HTMLElement}  element  The element that the Scope will _bind_ to. 
 */
class ScopeContainer extends View {

    constructor(parent, presets, element) {

        super();

        this.ele = element;
        this.parent = null;
        this.activeScopes = [];
        this.dom_scopes = [];
        this.filters = [];
        this.ios = [];
        this.terms = [];
        this.scopes = [];
        this.range = null;
        this._SCHD_ = 0;
        this.prop = null;
        this.component = null;
        this.transition_in = 0;
        this.dom_dn = [];
        this.dom_up = [];
        this.trs_ascending = null;
        this.trs_descending = null;
        this.UPDATE_FILTER = false;
        this.dom_up_appended = false;
        this.dom_dn_appended = false;
        this.AUTO_SCRUB = false;
        this.root = 0;
        this.taps = {};

        this.scrub_velocity = 0;

        this.shift_amount = 1;
        this.limit = 0;
        this.offset = 0;
        this.offset_diff = 0;
        this.offset_fractional = 0;

        this.LOADED = false;

        parent.addTemplate(this);
    }

    get data() {}

    set data(container) {
        if (container instanceof ModelContainerBase) {
            container.pin();
            container.addObserver(this);
            return;
        } else {
            this.unsetModel();
        }

        if (!container) return;
        if (Array.isArray(container)) this.cull(container);
        else this.cull(container.data);

        this.loadAcknowledged();
    }

    update(container) {
        if (container instanceof ModelContainerBase) container = container.get();
        if (!container) return;
        //let results = container.get(this.getTerms());
        // if (container.length > 0) {
        if (Array.isArray(container)) this.cull(container);
        else this.cull(container.data);
        // }
    }

    loadAcknowledged() {
        if (!this.LOADED) {
            this.LOADED = true;
            this.parent.loadAcknowledged();
        }
    }


    /**
     * Called by Spark when a change is made to the Template HTML structure. 
     * 
     * @protected
     */
    scheduledUpdate() {

        if (this.SCRUBBING) {

            if (!this.AUTO_SCRUB) {
                this.SCRUBBING = false;
                return;
            }

            if (
                Math.abs(this.scrub_velocity) > 0.0001
            ) {
                if (this.scrub(this.scrub_velocity)) {

                    this.scrub_velocity *= (this.drag);

                    let pos = this.offset + this.scrub_velocity;

                    if (pos < 0 || pos > this.max)
                        this.scrub_velocity = 0;

                    spark.queueUpdate(this);
                }

            } else {
                this.scrub_velocity = 0;
                this.scrub(Infinity);
                this.SCRUBBING = false;
            }
        } else {

            // const offset_a = this.offset;

            //this.limitUpdate();

            //const offset_b = this.offset;

            //this.offset = offset_a;
            this.forceMount();
            this.arrange();
            //this.offset = offset_b;
            this.render();
            this.offset_diff = 0;
        }
    }

    forceMount() {
        const active_window_size = this.limit;
        const offset = this.offset;


        const min = Math.min(offset + this.offset_diff, offset) * this.shift_amount;
        const max = Math.max(offset + this.offset_diff, offset) * this.shift_amount + active_window_size;


        let i = min;

        this.ele.innerHTML = "";
        const output_length = this.activeScopes.length;
        this.dom_scopes.length = 0;

        while (i < max && i < output_length) {
            const node = this.activeScopes[i++];
            this.dom_scopes.push(node);
            node.appendToDOM(this.ele);
        }
    }

    /**
     * Scrub provides a mechanism to scroll through components of a container that have been limited through the limit filter.
     * @param  {Number} scrub_amount [description]
     */
    scrub(scrub_delta, SCRUBBING = true) {
        // scrub_delta is the relative ammunt of change from the previous offset. 

        if (!this.SCRUBBING)
            this.render(null, this.activeScopes, true);

        this.SCRUBBING = true;

        if (this.AUTO_SCRUB && !SCRUBBING && scrub_delta != Infinity) {
            this.scrub_velocity = 0;
            this.AUTO_SCRUB = false;
        }

        let delta_offset = scrub_delta + this.offset_fractional;
        if (scrub_delta !== Infinity) {

            if (Math.abs(delta_offset) > 1) {
                if (delta_offset > 1) {

                    delta_offset = delta_offset % 1;
                    this.offset_fractional = delta_offset;
                    this.scrub_velocity = scrub_delta;

                    if (this.offset < this.max)
                        this.trs_ascending.play(1);

                    this.offset++;
                    this.offset_diff = 1;
                    this.render(null, this.activeScopes, true).play(1);
                } else {
                    delta_offset = delta_offset % 1;
                    this.offset_fractional = delta_offset;
                    this.scrub_velocity = scrub_delta;

                    if (this.offset >= 1)
                        this.trs_descending.play(1);
                    this.offset--;
                    this.offset_diff = -1;

                    this.render(null, this.activeScopes, true).play(1);
                }

            }

            //Make Sure the the transition animation is completed before moving on to new animation sequences.

            if (delta_offset > 0) {

                if (this.offset + delta_offset >= this.max - 1) delta_offset = 0;

                if (!this.dom_up_appended) {

                    for (let i = 0; i < this.dom_up.length; i++) {
                        this.dom_up[i].appendToDOM(this.ele);
                        this.dom_up[i].index = -1;
                        this.dom_scopes.push(this.dom_up[i]);
                    }

                    this.dom_up_appended = true;
                }

                this.trs_ascending.play(delta_offset);
            } else {

                if (this.offset < 1) delta_offset = 0;

                if (!this.dom_dn_appended) {

                    for (let i = 0; i < this.dom_dn.length; i++) {
                        this.dom_dn[i].appendToDOM(this.ele, this.dom_scopes[0].ele);
                        this.dom_dn[i].index = -1;
                    }

                    this.dom_scopes = this.dom_dn.concat(this.dom_scopes);

                    this.dom_dn_appended = true;
                }

                this.trs_descending.play(-delta_offset);
            }

            this.offset_fractional = delta_offset;
            this.scrub_velocity = scrub_delta;

            return true;
        } else {

            if (Math.abs(this.scrub_velocity) > 0.0001) {
                const sign = Math.sign(this.scrub_velocity);

                if (Math.abs(this.scrub_velocity) < 0.1) this.scrub_velocity = 0.1 * sign;
                if (Math.abs(this.scrub_velocity) > 0.5) this.scrub_velocity = 0.5 * sign;

                this.AUTO_SCRUB = true;

                //Determine the distance traveled with normal drag decay of 0.5
                let dist = this.scrub_velocity * (1 / (-0.5 + 1));
                //get the distance to nearest page given the distance traveled
                let nearest = (this.offset + this.offset_fractional + dist);
                nearest = (this.scrub_velocity > 0) ? Math.min(this.max, Math.ceil(nearest)) : Math.max(0, Math.floor(nearest));
                //get the ratio of the distance from the current position and distance to the nearest 
                let nearest_dist = nearest - (this.offset + this.offset_fractional);
                let drag = Math.abs(1 - (1 / (nearest_dist / this.scrub_velocity)));

                this.drag = drag;
                this.scrub_velocity = this.scrub_velocity;
                this.SCRUBBING = true;
                spark.queueUpdate(this);
                return true;
            } else {
                this.offset += Math.round(this.offset_fractional);
                this.scrub_velocity = 0;
                this.offset_fractional = 0;
                this.render(null, this.activeScopes, true).play(1);
                this.SCRUBBING = false;
                return false;
            }
        }
    }

    arrange(output = this.activeScopes) {

        //Arranges active scopes according to their arrange handler.
        const
            limit = this.limit,
            offset = this.offset,
            transition = Animation.createTransition(),
            output_length = output.length,
            active_window_start = offset * this.shift_amount;



        let i = 0;

        //Scopes on the ascending edge of the transition window
        while (i < active_window_start && i < output_length)
            output[i].update({ trs_asc_out: { trs: transition.in, pos: getColumnRow(i, offset, this.shift_amount) } }), i++;

        //Scopes in the transtion window
        while (i < active_window_start + limit && i < output_length)
            output[i].update({ arrange: { trs: transition.in, pos: getColumnRow(i, offset, this.shift_amount) } }), i++;

        //Scopes on the descending edge of the transition window
        while (i < output_length)
            output[i].update({ trs_dec_out: { trs: transition.in, pos: getColumnRow(i, offset, this.shift_amount) } }), i++;

        transition.play(1);

    }

    render(transition, output = this.activeScopes, NO_TRANSITION = false) {


        let
            active_window_size = this.limit,
            offset = this.offset,
            j = 0,
            output_length = output.length,
            active_length = this.dom_scopes.length,
            direction = 1,
            OWN_TRANSITION = false;

        if (!transition) transition = Animation.createTransition(), OWN_TRANSITION = true;

        offset = Math.max(0, offset);

        const active_window_start = offset * this.shift_amount;

        direction = Math.sign(this.offset_diff);

        if (active_window_size > 0) {

            this.shift_amount = Math.max(1, Math.min(active_window_size, this.shift_amount));

            let
                i = 0,
                oa = 0,
                ein = [],
                shift_points = Math.ceil(output_length / this.shift_amount);

            this.max = shift_points - 1;
            this.offset = Math.max(0, Math.min(shift_points - 1, offset));

            //Two transitions to support scrubbing from an offset in either direction
            this.trs_ascending = Animation.createTransition(false);
            this.trs_descending = Animation.createTransition(false);

            this.dom_dn.length = 0;
            this.dom_up.length = 0;
            this.dom_up_appended = false;
            this.dom_dn_appended = false;

            //Scopes preceeding the transition window
            while (i < active_window_start - this.shift_amount) output[i++].index = -2;

            //Scopes entering the transition window ascending
            while (i < active_window_start) {
                this.dom_dn.push(output[i]);
                output[i].update({ trs_dec_in: { trs: this.trs_descending.in, pos: getColumnRow(i, this.offset - 1, this.shift_amount) } });
                output[i++].index = -2;
            }

            //Scopes in the transtion window
            while (i < active_window_start + active_window_size && i < output_length) {
                //Scopes on the descending edge of the transition window
                if (oa < this.shift_amount && ++oa) {
                    //console.log("pos",i, getColumnRow(i, this.offset+1, this.shift_amount), output[i].scopes[0].ele.style.transform)
                    output[i].update({ trs_asc_out: { trs: this.trs_ascending.out, pos: getColumnRow(i, this.offset + 1, this.shift_amount) } });
                } else
                    output[i].update({ arrange: { trs: this.trs_ascending.in, pos: getColumnRow(i, this.offset + 1, this.shift_amount) } });


                //Scopes on the ascending edge of the transition window
                if (i >= active_window_start + active_window_size - this.shift_amount)
                    output[i].update({ trs_dec_out: { trs: this.trs_descending.out, pos: getColumnRow(i, this.offset - 1, this.shift_amount) } });
                else
                    output[i].update({ arrange: { trs: this.trs_descending.in, pos: getColumnRow(i, this.offset - 1, this.shift_amount) } });


                output[i].index = i;
                ein.push(output[i++]);
            }

            //Scopes entering the transition window while offset is descending
            while (i < active_window_start + active_window_size + this.shift_amount && i < output_length) {
                this.dom_up.push(output[i]);
                output[i].update({
                    trs_asc_in: {
                        pos: getColumnRow(i, this.offset + 1, this.shift_amount),
                        trs: this.trs_ascending.in
                    }
                });
                output[i++].index = -3;
            }

            //Scopes following the transition window
            while (i < output_length) output[i++].index = -3;

            output = ein;
            output_length = ein.length;
        } else {
            this.max = 0;
            this.limit = 0;
        }

        let trs_in = { trs: transition.in, index: 0 };
        let trs_out = { trs: transition.out, index: 0 };

        for (let i = 0; i < output_length; i++) output[i].index = i;

        for (let i = 0; i < active_length; i++) {

            const as = this.dom_scopes[i];

            if (as.index > j) {
                while (j < as.index && j < output_length) {
                    const os = output[j];
                    os.index = -1;
                    trs_in.pos = getColumnRow(j, this.offset, this.shift_amount);

                    os.appendToDOM(this.ele, as.ele);
                    os.transitionIn(trs_in, (direction) ? "trs_asc_in" : "trs_dec_in");
                    j++;
                }
            } else if (as.index < 0) {

                trs_out.pos = getColumnRow(i, 0, this.shift_amount);

                if (!NO_TRANSITION) {
                    switch (as.index) {
                        case -2:
                        case -3:
                            as.transitionOut(trs_out, (direction > 0) ? "trs_asc_out" : "trs_dec_out");
                            break;
                        default:
                            {
                                as.transitionOut(trs_out);
                            }
                    }
                } else {
                    as.transitionOut();
                }

                continue;
            }
            trs_in.pos = getColumnRow(j++, 0, this.shift_amount);

            as.update({ arrange: trs_in }, null, false, { IMMEDIATE: true });

            as._TRANSITION_STATE_ = true;
            as.index = -1;
        }

        while (j < output.length) {
            output[j].appendToDOM(this.ele);
            output[j].index = -1;

            trs_in.pos = getColumnRow(j, this.offset, this.shift_amount);
            output[j].transitionIn(trs_in, (direction) ? "arrange" : "arrange");

            j++;
        }

        this.ele.style.position = this.ele.style.position;

        this.dom_scopes = output;   

        this.parent.update({
            "template_count_changed": {

                displayed: output_length,
                offset: offset,
                count: this.activeScopes.length,
                pages: this.max,
                ele: this.ele,
                template: this,
                trs: transition.in
            }
        });

        if (OWN_TRANSITION) {
            if (NO_TRANSITION)
                return transition;
            transition.start();
        }

        return transition;
    }

    /**
     * Filters stored Scopes with search terms and outputs the matching Scopes to the DOM.
     * 
     * @protected
     */
    filterUpdate() {

        let output = this.scopes.slice();

        if (output.length < 1) return;

        for (let i = 0, l = this.filters.length; i < l; i++) {
            const filter = this.filters[i];

            if (filter.ARRAY_ACTION)
                output = filter.action(output);
        }

        this.activeScopes = output;

        this.UPDATE_FILTER = false;

        return output;
    }

    filterExpressionUpdate(transition = Animation.createTransition()) {
        // Filter the current components. 
        this.filterUpdate();

        this.limitExpressionUpdate(transition);
    }

    limitExpressionUpdate(transition = Animation.createTransition()) {

        //Preset the positions of initial components. 
        this.arrange();

        this.render(transition);

        // If scrubbing is currently occuring, if the transition were to auto play then the results 
        // would interfere with the expected behavior of scrubbing. So the transition
        // is instead set to it's end state, and scrub is called to set intermittent 
        // position. 
        if (!this.SCRUBBING)
            transition.start();
    }

    /**
     * Removes stored Scopes that do not match the ModelContainer contents. 
     *
     * @param      {Array}  new_items  Array of Models that are currently stored in the ModelContainer. 
     * 
     * @protected
     */
    cull(new_items = []) {

        const transition = Animation.createTransition();

        if (new_items.length == 0) {

            const sl = this.scopes.length;

            for (let i = 0; i < sl; i++) this.scopes[i].transitionOut(transition, "", true);

            this.scopes.length = 0;
            this.activeScopes.length = 0;
            this.parent.upImport("template_count_changed", {
                displayed: 0,
                offset: 0,
                count: 0,
                pages: 0,
                ele: this.ele,
                template: this,
                trs: transition.in
            });

            if (!this.SCRUBBING)
                transition.start();

        } else {

            const
                exists = new Map(new_items.map(e => [e, true])),
                out = [];

            for (let i = 0, l = this.activeScopes.length; i < l; i++)
                if (exists.has(this.activeScopes[i].model))
                    exists.set(this.activeScopes[i].model, false);


            for (let i = 0, l = this.scopes.length; i < l; i++)
                if (!exists.has(this.scopes[i].model)) {
                    this.scopes[i].transitionOut(transition, "dismounting", true);
                    this.scopes[i].index = -1;
                    this.scopes.splice(i, 1);
                    l--;
                    i--;
                } else
                    exists.set(this.scopes[i].model, false);

            exists.forEach((v, k) => { if (v) out.push(k); });

            if (out.length > 0) {
                // Wrap models into components
                this.added(out, transition);

            } else {
                for (let i = 0, j = 0, l = this.activeScopes.length; i < l; i++, j++) {

                    if (this.activeScopes[i]._TRANSITION_STATE_) {
                        if (j !== i) {
                            this.activeScopes[i].update({
                                arrange: {
                                    pos: getColumnRow(i, this.offset, this.shift_amount),
                                    trs: transition.in
                                }
                            });
                        }
                    } else
                        this.activeScopes.splice(i, 1), i--, l--;
                }
            }

            this.filterExpressionUpdate(transition);
        }
    }
    /**
     * Called by the ModelContainer when Models have been removed from its set.
     *
     * @param      {Array}  items   An array of items no longer stored in the ModelContainer. 
     */
    removed(items, transition = Animation.createTransition()) {
        for (let i = 0; i < items.length; i++) {
            let item = items[i];
            for (let j = 0; j < this.scopes.length; j++) {
                let Scope = this.scopes[j];
                if (Scope.model == item) {
                    this.scopes.splice(j, 1);
                    Scope.transitionOut(transition, "", true);
                    break;
                }
            }
        }

        this.filterExpressionUpdate(transition);
    }
    /**
     * Called by the ModelContainer when Models have been added to its set.
     *
     * @param      {Array}  items   An array of new items now stored in the ModelContainer. 
     */
    added(items, transition) {
        let OWN_TRANSITION = false;

        if (!transition)
            transition = Animation.createTransition(), OWN_TRANSITION = true;

        for (let i = 0; i < items.length; i++) {
            const scope = this.component.mount(null, items[i]);

            //TODO: Make sure both of there references are removed when the scope is destroyed.
            this.scopes.push(scope);
            this.parent.addScope(scope);

            scope.update({ loaded: true });
        }



        if (OWN_TRANSITION)
            this.filterExpressionUpdate(transition);
    }

    revise() {
        if (this.cache) this.update(this.cache);
    }

    getTerms() {
        const out_terms = [];

        for (let i = 0, l = this.terms.length; i < l; i++) {

            const term = this.terms[i].term;

            if (term) out_terms.push(term);
        }
        if (out_terms.length == 0) return null;
        return out_terms;
    }

    get() {
        if (this.model instanceof MultiIndexedContainer) {
            if (this.data.index) {
                const index = this.data.index,
                    query = {};
                query[index] = this.getTerms();
                return this.model.get(query)[index];
            } else console.warn("No index value provided for MultiIndexedContainer!");
        } else {

            const scope = this.model.scope,
                terms = this.getTerms();
            if (scope) {
                this.model.destroy();
                const model = scope.get(terms, null);
                model.pin();
                model.addObserver(this);
            }
            return this.model.get(terms);
        }
        return [];
    }

    down(data, changed_values) {
        for (let i = 0, l = this.activeScopes.length; i < l; i++) this.activeScopes[i].down(data, changed_values);
    }
}

ScopeContainer.prototype.removeIO = Tap.prototype.removeIO;
ScopeContainer.prototype.addIO = Tap.prototype.addIO;

class d$1 {
    // Compiles the component to a HTML file. 
    // Returns a string representing the file data.
    compileToHTML(bound_data_object) {

    }

    // Compiles the component to a JS file
    // Returns a string representing the file data.
    compileToJS(bound_data_object) {

    }

    //Registers the component as a Web Component.
    //Herafter the Web Component API will be used to mount this component. 
    register(bound_data_object) {

        if (!this.name)
            throw new Error("This component has not been defined with a name. Unable to register it as a Web Component.");

        if (customElements.get(this.name))
            console.trace(`Web Component for name ${this.name} has already been defined. It is now being redefined.`);

        customElements.define(
            this.name,
            d$1.web_component_constructor(this, bound_data_object), {}
        );
    }

    //Mounts component data to new HTMLElement object.
    async mount(HTMLElement_, data_object, USE_SHADOW) {

        if (this.READY !== true) {
            if (!this.__pending)
                this.__pending = [];

            return new Promise(res =>this.__pending.push([HTMLElement_, data_object, USE_SHADOW, res]));
        }

        return this.nonAsyncMount(HTMLElement_, data_object, USE_SHADOW);
    }

    nonAsyncMount(HTMLElement_, data_object = null, USE_SHADOW){
        let element = HTMLElement_;

        if(USE_SHADOW == undefined)
            USE_SHADOW = this.ast.presets.options.USE_SHADOW;

        if ((HTMLElement_ instanceof HTMLElement) && USE_SHADOW) {
            //throw new Error("HTMLElement_ argument is not an instance of HTMLElement. Cannot mount component");

            element = HTMLElement_.attachShadow({ mode: 'open' });
        }

        const scope = this.ast.mount(element);

        scope.load(data_object);

        return scope;
    }

    connect(h, b) { return this.mount(h, b) }
}

d$1.web_component_constructor = function(wick_component, bound_data) {
    return class extends HTMLElement {
        constructor() {
            super();
            wick_component.mount(this, bound_data);
        }
    };
};

/******************** Expressions **********************/

class ExpressionIO extends ScriptIO {

    constructor(ele, scope, errors, tap, binding, lex, pinned) {
        super(scope, errors, tap, binding, lex, pinned);
        this.ele = ele;
        this.old_val = null;
        this._SCHD_ = 0;
        this.ACTIVE = true;
    }

    updateProp(io, val) {
        super.updateProp(io, val);
        this.down();
    }

    scheduledUpdate() {

        this.val = super.scheduledUpdate();

        if(this.val !== this.old_val){
            this.old_val = this.val;
            this.ele.data = this.val;
        }
    }
}

/******************** Expressions **********************/

class ContainerIO extends ScriptIO {
    constructor(container, scope, node, tap, binding, lex, pinned) {
        super(scope, node, tap, binding, lex, pinned);

        this.container = container;

        //Reference to function that is called to modify the host container. 
        this.action = null;

        this.ARRAY_ACTION = false;
    }

    bindToContainer(type, container) {
        this.container = container;

        const STATIC = this.IO_ACTIVATIONS == 0;

        switch (type) {
            case "sort":
                this.ARRAY_ACTION = true;
                container.filters.push(this);
                this.action = this.sort;
                return;
            case "filter":
                this.ARRAY_ACTION = true;
                container.filters.push(this);
                this.action = this.filter;
                return;
            case "scrub":
                this.action = this.scrub;
                break;
            case "offset":
                this.action = this.offset;
                break;
            case "limit":
                this.action = this.limit;
                break;
            case "shift_amount":
                this.action = this.shift_amount;
                break;
        }
        
        if (STATIC)
            this.down();
    }

    destroy() {
        this.container = null;
        super.destroy();
    }

    updateProp(io, val) {
        super.updateProp(io, val);
        this.down();
    }

    setValue(value) {
        if (Array.isArray(value)) {
            value.forEach((v, i) => this.arg_props[i] = v);
            this.active_IOS = this.IO_ACTIVATIONS;
        } else if (typeof(value) == "object") {
            //Distribute iterable properties amongst the IO_Script's own props.
            for (const a in value) {
                if (this.arg_ios[a])
                    this.arg_ios[a].down(value[a]);
            }
        } else {
            if (this.TAP_BINDING !== -1)
                this.arg_props[this.TAP_BINDING] = value;
        }
    }

    scheduledUpdate() {
        const old = this.val;

        this.val = super.scheduledUpdate();

        if (this.ARRAY_ACTION) {
            this.container.filterExpressionUpdate();
        } else if (this.val !== undefined && this.val !== old) {
            this.action();
            this.container.limitExpressionUpdate();
        }
    }

    filter(array) {
        return array.filter((a) => (this.setValue([a]), super.scheduledUpdate()));
    }

    sort(array) {
        return array.sort((a, b) => (this.setValue([a, b]), super.scheduledUpdate()));
    }

    scrub() {
        this.container.scrub = this.val;
    }

    offset() {
        this.container.offset_diff = this.val - this.container.offset;
        this.container.offset = this.val;
    }

    limit() {
        this.container.limit = this.val;
    }

    shift_amount() {
        this.container.shift_amount = this.val;
    }
}

const EXPRESSION = 5;
const IDENTIFIER = 6;
const CONTAINER = 7;

class Binding {

    constructor(exprA, exprB, env, lex) {

        this.lex = lex.copy();
        this.lex.sl = lex.off - 3;
        this.lex.off = env.start;

        this.METHOD = IDENTIFIER;

        this.ast = exprA;
        this.ast_other = exprB;

        this.function = null;
        this.args = null;
        this.READY = false;

        this.origin_url = env.url;

        this.origin_val = this.ast + "";
        this.val = this.ast + "";

        if (this.ast && !(this.ast instanceof identifier$1))
            this.processJSAST(env.presets);

    }

    toString() {

        if (this.ast_other)
            return `((${this.origin_val + ""})(${this.ast_other + ""}))`;
        else
            return `((${this.origin_val + ""}))`;
    }

    processJSAST(presets = { custom: {} }) {
        const { args, ids } = GetOutGlobals(this.ast, presets);

        this.args = args;

        AddEmit(ids, presets);

        const r = new return_statement([]);
        r.vals[0] = this.ast;
        this.ast = r;
        this.val = r + "";
        this.METHOD = EXPRESSION;

        ScriptNode.prototype.finalize.call(this);
    }

    setForContainer(presets) {

        if (this.METHOD == IDENTIFIER)
            this.processJSAST(presets);

        this.METHOD = CONTAINER;
    }

    bind(scope, element, pinned, node = this) {
        if (this.ast) {
            if (this.METHOD == EXPRESSION) {
                return new ExpressionIO(element, scope, node, scope, this, this.lex, pinned);
            } else if (this.METHOD == CONTAINER)
                return new ContainerIO(element, scope, node, scope, this, this.lex, pinned);
            else
                return scope.getTap(this.val);
        }
        return null;
    }
}

Binding.type = {
    Attribute: 0,
    TextNode: 1,
    Style: 2
};

class fltr extends ElementNode {
    constructor(env, tag, children, attribs, presets) {
        super(env, "f", null, attribs, presets);

        this.type = 0;

        for (const attr of this.attribs.values()) 
            if (attr.value.setForContainer)
                attr.value.setForContainer(presets);
    }

    mount(scope, container) {
        for (const attr of this.attribs.values()){

            if(attr.value instanceof Binding){
                attr.value.bind(scope, null, null, this).bindToContainer(attr.name, container);
            }else{
                const val  = parseFloat(attr.value) || 0;
                switch(attr.name){
                    case "limit":
                        container.limit = val;
                    break;
                    case "scrub":
                        container.scrub = val;
                    break;
                    case "shift":
                        container.shift_amount = val;
                    break;
                }
            }
        }
    }
}

const offset$2 = "";

class TextNode {

    constructor(sym, env) {
        this.data = sym[0] || "";
        this.IS_BINDING = (this.data instanceof Binding);
        this.tag = "text";
    }

    toString(off = 0) {
        return `${offset$2.repeat(off)} ${this.data.toString()}\n`;
    }

    finalize(){
        return this;
    }

    get IS_WHITESPACE(){
        return !this.IS_BINDING && (!this.data.toString().trim());
    }

    mount(element, scope, presets, statics, pinned, ele = document.createTextNode("")) {
        const IS_TEXT_NODE = ele instanceof Text;
        if (IS_TEXT_NODE)
            element.appendChild(ele);

        if (this.IS_BINDING)
            return new (IS_TEXT_NODE ? TextNodeIO : DataNodeIO)(scope, this.data.bind(scope, null, pinned), ele, this.data.exprb);
        else
            ele.data = this.data;
    }
}

function BaseComponent(ast, presets) {
    this.ast = ast;
    this.READY = true;
    this.presets = presets;
    //Reference to the component name. Used with the Web Component API
    this.name = "";
}

Object.assign(BaseComponent.prototype,d$1.prototype);
BaseComponent.prototype.mount = d$1.prototype.nonAsyncMount;

class ctr extends ElementNode {
    
    constructor(env, tag, children, attribs, presets) {
        super(env, "container", children, attribs, presets);

        this.filters = null;
        this.property_bind = null;
        this.scope_children = null;

        //Tag name of HTMLElement the container will create;
        this.element = this.getAttribute("element") || "ul";

        this.filters = null;
        this.nodes = null;
        this.binds = null;
    }

    finalize(slots = {}){
        super.finalize(slots);

        const children = this.children;

        this.filters = children.reduce((r, c) => { if (c instanceof fltr) r.push(c); return r }, []);
        this.nodes = children.reduce((r, c) => { if (c instanceof ElementNode && !(c instanceof fltr)) r.push(c); return r }, []);
        this.binds = children.reduce((r, c) => { if (c instanceof TextNode && c.IS_BINDING) r.push(c); return r }, []);

        //Keep in mind slots!;
        this.component_constructor = (this.nodes.length > 0) ? new BaseComponent(this.nodes[0], this.presets) : null;

        return this;
    }

    merge(node) {
        const merged_node = super.merge(node);
        merged_node.filters = this.filters;
        merged_node.nodes = this.filters;
        merged_node.binds = this.binds;
        merged_node.MERGED = true;
        return merged_node;
    }

    mount(element, scope, presets, slots, pinned) {
        
        scope = scope || new Scope(null, presets, element, this);

        const
            ele = createElement(this.element),
            container = new ScopeContainer(scope, presets, ele);

        appendChild(element, ele);

        this.class.split(" ").map(c => c ? ele.classList.add(c) : {});

        if(this.component_constructor)
            container.component = this.component_constructor;

        for (let i = 0; i < this.filters.length; i++)
            this.filters[i].mount(scope, container);

        for (let i = 0, l = this.attribs.length; i < l; i++)
            this.attribs[i].bind(ele, scope, pinned);

        if (this.binds.length > 0) {
            for (let i = 0; i < this.binds.length; i++)
                this.binds[i].mount(null, scope, presets, slots, pinned, container);
        }else{ 
            //If there is no binding, then there is no potential to have ModelContainer borne components.
            //Instead, load any existing children as component entries for the container element. 
            for (let i = 0; i < this.nodes.length; i++)
                container.scopes.push(this.nodes[i].mount(null, null, presets, slots));
            container.filterUpdate();
            container.render();
        }

        return scope;
    }
}

class sty extends ElementNode{
	constructor(env, tag, children, attribs, presets){
		super(env, "style", children, attribs, presets);	
	}

	get data(){return this.children[0]}

	finalize(){return this}

	render(){}

	mount(element, scope, presets){

		if(presets.options.USE_SHADOWED_STYLE){

			const own_element = this.createElement(scope);

			own_element.innerHTML = this.data.toString();

			appendChild(element, own_element);
		}

		else
			scope.css.push(this.data);
	}
}

class v extends ElementNode{
	constructor(env, tag, children, attribs, presets){
		super(env, tag, children, attribs, presets);
	}
}

class svg extends ElementNode{
	constructor(env, tag, children, attribs, presets){
		super(env, "svg", children, attribs, presets);
	}
}

class slt extends ElementNode{
	finalize(){
		this.name = this.getAttribute("name");
		return this;
	}

	mount(element, scope, presets, slots, pinned){
		if(slots && slots[this.name]){
			let ele = slots[this.name];
			slots[this.name] = null;
			ele(element, scope, presets, slots, pinned);
		}
	}
}

class pre extends ElementNode{
	constructor(env, tag, children, attribs, presets){
		super(env, "pre", children, attribs, presets);
	}
}

class Import extends ElementNode{

	constructor(env, tag, children, attribs, presets){
		super(env, "import", null, attribs, presets);
	}
	
	loadAST(){/*intentional*/return;}
		
	loadURL(){/*intentional*/return;}
}

function es(tag, attribs, children, env, lex, meta = 0) {    

    const
        FULL = !!children;

    attribs = attribs || [];
    children = (Array.isArray(children)) ? children : children ? [children] : [];

    const presets = env.presets;

    let node = null,
        Constructor = null,
        USE_PENDING_LOAD = "";

    switch (tag) {
        case "text":
            break;
        case "filter":
        case "f":
            Constructor = fltr;
            break;
        case "a":
            Constructor = a;
            break;
            /** void elements **/
        case "template":
            Constructor = v;
            break;
        case "css":
        case "style":
            Constructor = sty;
            break;
        case "script":
        case "js":
            Constructor = ScriptNode;
            break;
        case "svg":
        case "path":
            Constructor = svg;
            break;
        case "container":
            Constructor = ctr;
            break;
        case "scope":
            Constructor = scp;
            break;
        case "slot":
            Constructor = slt;
            break;
        case "link":
        case "import":
            Constructor = Import;
            break;
            //Elements that should not be parsed for binding points.
        case "pre":
            Constructor = pre;
            break;
        case "img":
            USE_PENDING_LOAD = "src";
            /* intentional */
        case "code":
        default:
            Constructor = ElementNode;
            break;
    }

    node = new Constructor(env, tag, children, attribs, presets, USE_PENDING_LOAD);

    node.wickup = meta || false;

    node.SINGLE = !FULL;


    return node;
}

//import EventIO from "../component/io/event_io.js"

class Attribute {

    constructor(sym) {

        const
            HAS_VALUE = sym.length > 1,
            name = sym[0],
            val = (HAS_VALUE) ? sym[2] : null;

        this.name = name;
        this.value = val;
        this.io_constr = AttribIO;
        this.isBINDING = false;
        this.RENDER = true;

        if (this.value instanceof Binding)
            this.isBINDING = true;
    }

    link(element) {
        const tag = element.tag;

        if (this.isBINDING) {

            if (this.name.slice(0, 2) == "on"){
                this.io_constr = EventIO;
            }

            else

            if (this.name == "value" && (tag == "input" || tag == "textarea"))
                this.io_constr = InputIO;
        }

    }

    bind(element, scope, pinned) {
        if (this.RENDER)
            if (!this.isBINDING)

            {   
                if(this.name == "class")
                   this.value.split(" ").map(c => c ? element.classList.add(c) : {});
                else    
                    element.setAttribute(this.name, this.value);
            }

            else 

            {
                const bind = this.value.bind(scope, pinned);
                new this.io_constr(scope, this, bind, this.name, element, this.value.ast_other);
            }
    }
}

class js_wick_node{

	constructor(element){

		this.node = element;

		this.root = true;
		
		this._id = "comp"+((Math.random()*1236584)|0);

		var presets = this.node.presets;
		
		this.node.presets.components[this._id] = this.node;
	}

	* traverseDepthFirst(){
		yield this;
	}


	getRootIds(ids, closure) {
		ids.add("wickNodeExpression");	
	}

	get name(){
		return "wickNodeExpression";
	}

	get type(){
		return types$1.identifier;
	}

	get val() { return "wickNodeExpression" }

	render(){
		return `wickNodeExpression(this,"${this._id}")`;
	}
}

//*


function create_ordered_list(sym, offset = 0, level = -1, env, lex) {

    for (let i = offset; i < sym.length; i++) {
        const s = sym[i],
            lvl = (s.lvl) ? s.lvl.length : 0,
            li = s.li;

        if (lvl > level) {
            create_ordered_list(sym, i, lvl, env);
        } else if (lvl < level) {
            sym[offset] = es("ul", null, sym.splice(offset, i - offset), env);
            return;
        } else
            sym[i] = li;
    }

    return sym[offset] = es("span", null, sym.splice(offset, sym.length - offset), env);
}

const env = {
    table: {},
    ASI: true,
    functions: {
        //HTML
        element_selector: es,
        attribute: Attribute,
        wick_binding: Binding,
        text: TextNode,
        js_wick_node: js_wick_node,

        //CSS
        compoundSelector,
        comboSelector: combination_selector_part,
        selector,
        idSelector,
        classSelector,
        typeselector: type_selector_part,
        attribSelector,
        pseudoClassSelector,
        pseudoElementSelector,
        parseDeclaration,
        stylesheet,
        stylerule,
        ruleset,

        //*        //JS
        super_literal,
        lexical_expression,
        add_expression,
        and_expression,
        argument_list,
        array_literal,
        for_of_statement,
        arrow: arrow_function_declaration,
        arrow_function_declaration,
        assignment_expression,
        await_expression,
        binding,
        bit_and_expression: bitwise_and_espression,
        bit_or_expression: bitwise_or_espression,
        bit_xor_expression: bitwise_xor_espression,
        block_statement,
        bool_literal,
        break_statement,
        call_expression,
        case_statement,
        catch_statement,
        class_declaration,
        class_method,
        condition_expression,
        continue_statement,
        debugger_statement,
        default_case_statement,
        default_import,
        delete_expression,
        divide_expression,
        empty_statement,
        equality_expression,
        exponent_expression: equality_expression$1,
        export_clause,
        export_declaration,
        export_specifier,
        expression_list,
        expression_statement,
        for_statement,
        function_declaration,
        identifier: identifier$1,
        if_statement,
        import_clause,
        import_declaration,
        import_specifier,
        in_expression,
        instanceof_expression,
        label_statement,
        left_shift_expression,
        lexical: lexical_declaration,
        member_expression,
        module: module$1,
        modulo_expression,
        multiply_expression,
        name_space_import,
        named_imports,
        negate_expression,
        new_expression,
        null_literal,
        numeric_literal,
        object_literal,
        or_expression,
        parenthasized: argument_list$1,
        plus_expression,
        post_decrement_expression,
        post_increment_expression,
        pre_decrement_expression,
        pre_increment_expression,
        property_binding,
        return_statement,
        right_shift_expression,
        right_shift_fill_expression,
        script,
        spread_element,
        statements,
        string: string$2,
        string_literal: string$2,
        subtract_expression,
        switch_statement,
        template,
        template_head,
        template_middle,
        template_tail,
        this_literal,
        throw_statement,
        try_statement,
        typeof_expression,
        unary_not_expression,
        unary_or_expression,
        unary_xor_expression,
        variable_statement: variable_declaration,
        void_expression,
        //*/
        //MARKDOWN
        create_ordered_list,

        while_stmt: function(sym) {
            this.bool = sym[1];
            this.body = sym[3];
        },
        var_stmt: function(sym) { this.declarations = sym[1]; },

        label_stmt: function(sym) {
            this.label = sym[0];
            this.stmt = sym[1];
        },

        defaultError: (tk, env, output, lex, prv_lex, ss, lu) => {
            if (lex.tx == "//" || lex.tx == "/*") {
                if (lex.tx == "//")
                    while (!lex.END && lex.ty !== lex.types.nl)
                        lex.next();

                if (lex.tx == "/*")
                    while (!lex.END && lex.tx !== "*/")
                        lex.next();

                lex.next();

                return lu(lex);
            }

            /*USED for ASI*/
            if (env.ASI && lex.tx !== ")" && !lex.END) {

                if (lex.tx == "</") // As in "<script> script body => (</)script>"
                    return lu({ tx: ";" });

                let ENCOUNTERED_END_CHAR = (lex.tx == "}" || lex.END || lex.tx == "</");

                while (!ENCOUNTERED_END_CHAR && !prv_lex.END && prv_lex.off < lex.off) {
                    prv_lex.next();
                    if (prv_lex.ty == prv_lex.types.nl)
                        ENCOUNTERED_END_CHAR = true;
                }

                if (ENCOUNTERED_END_CHAR) {
                    lex.tl = 0;
                    return lu({ tx: ";" });
                }
            }

            if (lex.END) {
                lex.tl = 0;
                return lu({ tx: ";" });
            }
        }
    },

    prst: [],
    pushPresets(prst) {
        env.prst.push(prst);
    },
    popPresets() {
        return env.prst.pop();
    },
    get presets() {
        return env.prst[env.prst.length - 1] || null;
    },

    options: {
        integrate: false,
        onstart: () => {
            env.table = {};
            env.ASI = true;
        }
    }
};

function processJSComponent(url){
    const stmts = ast.statements;

    //Find import and export statements and remove from them AST. Replace with there children
    let REPLACE = null;

    for(const node of ast.traverseDepthFirst()){
        
        if(REPLACE) 
        	REPLACE(node);

        if(node.type == types$1.export_declaration)
        	REPLACE = (n)=>(node.replace(n), REPLACE = null);
    }

    //Extract the template string from the classes. Use the wick compiler to turn this into a component ast. 

    //The Classes 

}

const

    default_presets = new Presets,

    compile = async (component_data, presets, compiler_env) => {

            var
                ast = null,
                string_data = "";

            switch (typeof component_data) {

                case "string":

                    /* Need to determine if string is:
                           URL to component resource
                           HTML data
                           JS data
                           or incompatible data that should throw.
                    */

                    string_data = component_data;
                    const first_char = component_data[0];
                    var url, IS_POTENTIAL_URL = (
                        (first_char !== "<" &&
                            first_char !== " ") || (
                            first_char == "/" ||
                            first_char == "."
                        )
                    );

                    //Not sure if the string is a URL, but we can try fetching as a resource, and suppress erros if it comes up short.
                    if (IS_POTENTIAL_URL && (url = URL.resolveRelative(component_data, ""))) {
                        try {
                            if (url.ext == "mjs" || url.ext == "js") {

                                const module = await new Promise(function (resolve) { resolve(_interopNamespace(require(url + ""))); });

                                let comp = null;

                                if (module.default)
                                    comp = await (new module.default(presets).pending);

                                return comp;
                            }

                            string_data = await url.fetchText();

                        } catch (e) {
                            console.log(e);
                        }
                    }

                    break;

                case "object":
                    if (component_data instanceof URL) {
                        string_data = await url.fetchText();
                    } else if (component_data instanceof HTMLElement) {

                        if (component_data.tagName == "TEMPLATE")
                            if (component_data.tagName == "TEMPLATE") {
                                const temp = document.createElement("div");
                                temp.appendChild(component_data.content);
                                component_data = temp;
                            }

                        string_data = component_data.innerHTML;
                    }
                    // Extract properties from the object that relate to wick component attributes. 
                    break;
            }



            try {

                return await (new Promise(res => {

                    compiler_env.pending++;

                    compiler_env.pendingResolvedFunction = () => { res(ast); };

                    ast = parser(whind$1(string_data), compiler_env);

                    if (ast instanceof module$1)
                        ast = processJSComponent(ast);

                    compiler_env.resolve();
                }));

            } catch (e) {
                throw error(error.COMPONENT_PARSE_FAILURE, e, compiler_env);
            }
        },


        // This is a variadic function that accepts objects, string, and urls, 
        //  and compiles data from the argument sources into a wick component. 
        Component = function(...data) {

            // The presets object provides global values to this component
            // and all its derivatives and descendents. 
            let presets = default_presets;

            if (data.length > 1)
                presets = (data[1] instanceof Presets) ? data[1] : new Presets(data[1]);

            if (data.length === 0)
                throw new Error("This function requires arguments. Please refer to wick docs on what arguments may be passed to this function.");

            const component_data = data[0];

            // If this function is an operand of the new operator, run an alternative 
            // compiler on the calling object.
            if (new.target) {

                this.ast = null;

                this.READY = false;

                this.presets = data[1] || default_presets;

                //Reference to the component name. Used with the Web Component API
                this.name = "";

                

                this.pending = ((async () => {

                    const
                        compiler_env = new CompilerEnvironment(presets, env),
                        obj = await compile(component_data, presets, compiler_env),
                        return_obj = this;



                    if (obj instanceof d$1) {

                        this.ast = obj.ast;

                        if (!this.name)
                            this.name = obj.name;

                        integrate(this, this, presets, compiler_env);

                    } else {

                        const ast = obj;

                        const constructor_name = this.constructor.name;

                        if (constructor_name !== "default" || constructor_name !== "Anonymous") 
                            presets.components[constructor_name] = ast;
                        
                        this.ast = ast;
                        this.ast.finalize();

                        if (!this.name)
                            this.name = this.ast.getAttrib("component").value || "undefined-component";

                        integrate(this, this, presets, compiler_env);
                    }

                    this.READY = true;

                    if (this.__pending) {
                        this.__pending.forEach(e => e[3](this.mount(...e.slice(0, 3))));
                        this.__pending = null;
                    }

                    return return_obj;
                })());

            } else
                return new Component(...data);
        },

        // If compilation fails, failure component is generated that provides 
        // error information. Should be fancy though.
        integrate = function(this_obj, from_obj = this_obj, presets, env) {

            if (this_obj.ast && from_obj.constructor.prototype !== Component.prototype) {

                //Go through prototype chain and extract functions that have names starting with $. Add them to the ast.

                for (const a of Object.getOwnPropertyNames(from_obj.constructor.prototype)) {
                    if (a == "constructor") continue;

                    const r = from_obj.constructor.prototype[a];

                    if (typeof r == "function") {

                        //extract and process function information. 

                        const
                            js_ast = parser(whind$1("function " + r.toString().trim() + ";"), env),
                            func_ast = JS.getFirst(js_ast, types$1.function_declaration),
                            binding = new Binding(func_ast.id, undefined, env, whind$1("whin")),
                            attrib = new Attribute(["on", null, binding], presets),
                            stmt = func_ast.body;

                        const script = new ScriptNode({}, "script", [stmt], [attrib], presets);

                        script.finalize();

                        this_obj.ast.children.push(script);
                    }
                }
            }
        };

Component.prototype = d$1.prototype;

//TODO: Fancy schmancy to string method.
Component.toString = function() {
    return "WICK 2019";
};

/**
 *   This is used by Model to create custom property getter and setters on non-ModelContainerBase and non-Model properties of the Model constructor.
 *   @protected
 *   @memberof module:wick~internals.model
 */
function CreateSchemedProperty(object, scheme, schema_name, index) {
    if (object[schema_name])
        return;

    Object.defineProperty(object, schema_name, {
        configurable: false,
        enumerable: true,
        get: function() {
            return this.getHook(schema_name, this.prop_array[index]);
        },
        set: function(value) {

            let result = { valid: false };

            let val = scheme.parse(value);

            scheme.verify(val, result);

            if (result.valid && this.prop_array[index] != val) {
                this.prop_array[index] = this.setHook(schema_name, val);
                this.scheduleUpdate(schema_name);
                this._changed_ = true;
            }
        }
    });
}

/**
    This is used by Model to create custom property getter and setters on Model properties of the Model constructor.
    @protected
    @memberof module:wick~internals.model
*/
function CreateModelProperty(object, model, schema_name, index) {

    Object.defineProperty(object, schema_name, {
        configurable: false,
        enumerable: true,
        get: function() {

            let m = this.prop_array[index];

            if (!m) {
                let address = this.address.slice();
                address.push(index);
                m = new model(null, this.root, address);
                m.par = this;
                m.prop_name = schema_name;
                m.MUTATION_ID = this.MUTATION_ID;
                this.prop_array[index] = m;
            }

            return this.getHook(schema_name, m);
        }
    });
}

class SchemedModel extends ModelBase {

    constructor(data, root = null, address = [], _schema_ = null) {

        super(root, address);

        if (this.constructor === SchemedModel)
            this.constructor = (class extends SchemedModel {});

        if (!this.schema) {

            let schema = this.constructor.schema || _schema_;

            this.constructor.schema = schema;

            if (schema) {

                let __FinalConstructor__ = schema.__FinalConstructor__;

                let constructor = this.constructor;
                let prototype = constructor.prototype;

                if (!__FinalConstructor__) {
                    let count = 0;
                    let look_up = {};

                    for (let schema_name in schema) {
                        let scheme = schema[schema_name];

                        if (schema_name == "self" && Array.isArray(scheme)) 
                            return new SchemedContainer(schema, root, address);
                        

                        if (schema_name == "getHook") {
                            prototype.getHook = scheme;
                            continue;
                        }

                        if (schema_name == "setHook") {
                            prototype.setHook = scheme;
                            continue;
                        }

                        if (schema_name == "proto") {
                            for (let name in schema.proto)
                                _SealedProperty_(prototype, name, schema.proto[name]);
                            continue;
                        }

                        if (typeof(scheme) == "function") {
                            CreateModelProperty(prototype, scheme, schema_name, count);
                        } else if (typeof(scheme) == "object") {
                            if (Array.isArray(scheme)) {
                                if (scheme[0] && scheme[0].container && scheme[0].schema)
                                    CreateModelProperty(prototype, scheme[0], schema_name, count);
                                else if (scheme[0] instanceof ModelContainerBase)
                                    CreateModelProperty(prototype, scheme[0].constructor, schema_name, count);
                                else
                                    CreateModelProperty(prototype, Model, schema_name, count);
                            } else if (scheme instanceof SchemeConstructor)
                                CreateSchemedProperty(prototype, scheme, schema_name, count);
                            else {
                                CreateModelProperty(prototype, scheme.constructor, schema_name, count);
                            }
                        } else {
                            console.warn(`Could not create property ${schema_name}.`);

                            continue;
                        }

                        look_up[schema_name] = count;
                        count++;
                    }

                    _SealedProperty_(prototype, "prop_offset", count);
                    _SealedProperty_(prototype, "look_up", look_up);
                    _SealedProperty_(prototype, "changed", false);

                    Object.seal(constructor);

                    schema.__FinalConstructor__ = constructor;
                    //_FrozenProperty_(schema, "__FinalConstructor__", constructor);

                    //Start the process over with a newly minted Model that has the properties defined in the Schema
                    return new schema.__FinalConstructor__(data, root, address);
                }

                _FrozenProperty_(prototype, "schema", schema);
            } else
                return new Model(data, root, address);
        }

        Object.defineProperty(this, "prop_array", { value: new Array(this.prop_offset), enumerable: false, configurable: false, writable: true });

        if (data)
            this.set(data, true);
    }

    destroy() { this.root = null; }

    set(data, FROM_ROOT = false) {

        if (!FROM_ROOT)
            return this._deferUpdateToRoot_(data).set(data, true);

        if (!data)
            return false;

        this._changed_ = false;

        for (let prop_name in data) {

            let data_prop = data[prop_name];

            let index = this.look_up[prop_name];

            if (index !== undefined) {

                let prop = this[prop_name];

                if (typeof(prop) == "object") {

                    if (prop.MUTATION_ID !== this.MUTATION_ID) {
                        prop = prop.clone();
                        prop.MUTATION_ID = this.MUTATION_ID;
                        this.prop_array[index] = prop;
                    }

                    if (prop.set(data_prop, true))
                        this.scheduleUpdate(prop_name);

                } else {
                    this[prop_name] = data_prop;
                }
            }
        }

        return this._changed_;
    }

    createProp() {}
}
SchemedModel.prototype.toJSON = Model.prototype.toJSON;

class SchemedContainer extends ArrayModelContainer {
    
    constructor(schema, root, address) {

        super(schema.self, root, address);

        if (schema.proto)
            for (let name in schema.proto)
                _SealedProperty_(this, name, schema.proto[name]);
    }
}

const wick = Component;




const model = (data, schema) => new SchemedModel(data, undefined, undefined, schema);
model.scheme = Object.assign((s, scheme) => (scheme = class extends SchemedModel {}, scheme.schema = s, scheme), schemes);
model.constr = SchemedModel;
model.any = (data) => new Model(data);
model.any.constr = Model;
model.container = {
    multi: MultiIndexedContainer,
    array: ArrayModelContainer,
    btree: BTreeModelContainer,
    constr: ModelContainerBase
};
model.store = (data) => new Store(data);
wick.scheme = model.scheme;
wick.model = model;
wick.presets = d=>new Presets(d);
wick.astCompiler = function(string){
	return parser(whind$1(string), CompilerEnvironment);
};

wick.compiler_environment = CompilerEnvironment;

exports.default = wick;
