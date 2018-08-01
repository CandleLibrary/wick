const jump_table = [
    0, // NULL  0;
    8, // START_OF_HEADER  1;
    8, // START_OF_TEXT  2;
    8, // END_OF_TXT  3;
    8, // END_OF_TRANSMISSION  4;
    8, // ENQUIRY  5;
    8, // ACKNOWLEDGE  6;
    8, // BELL  7;
    8, // BACKSPACE  8;
    11, // HORIZONTAL_TAB  9;
    10, // LINE_FEED  10;
    8, // VERTICAL_TAB  11;
    8, // FORM_FEED  12;
    9, // CARRIAGE_RETURN  13;
    8, // SHIFT_OUT  14;
    8, // SHIFT_IN  15;
    8, // DATA_LINK_ESCAPE  16;
    8, // DEVICE_CTRL_1  17;
    8, // DEVICE_CTRL_2  18;
    8, // DEVICE_CTRL_3  19;
    8, // DEVICE_CTRL_4  20;
    8, // NEGATIVE_ACKNOWLEDGE  21;
    8, // SYNCH_IDLE  22;
    8, // END_OF_TRANSMISSION_BLOCK  23;
    8, // CANCEL  24;
    8, // END_OF_MEDIUM  25;
    8, // SUBSTITUTE  26;
    8, // ESCAPE  27;
    8, // FILE_SEPERATOR  28;
    8, // GROUP_SEPERATOR  29;
    8, // RECORD_SEPERATOR  30;
    8, // UNIT_SEPERATOR  31;
    4, // SPACE  32;
    7, // EXCLAMATION  33;
    2, // DOUBLE_QUOTE  34;
    8, // HASH  35;
    8, // DOLLAR  36;
    7, // PERCENT  37;
    7, // AMPERSAND  38;
    3, // QUOTE  39;
    5, // OPEN_PARENTH  40;
    6, // CLOSE_PARENTH  41;
    7, // ASTERISK  42;
    7, // PLUS  43;
    8, // COMMA  44;
    8, // HYPHEN  45;
    8, // PERIOD  46;
    8, // FORWARD_SLASH  47;
    0, // ZERO  48;
    0, // ONE  49;
    0, // TWO  50;
    0, // THREE  51;
    0, // FOUR  52;
    0, // FIVE  53;
    0, // SIX  54;
    0, // SEVEN  55;
    0, // EIGHT  56;
    0, // NINE  57;
    7, // COLEN  58;
    8, // SEMICOLON  59;
    7, // LESS_THAN  60;
    7, // EQUAL  61;
    7, // GREATER_THAN  62;
    8, // QMARK  63;
    8, // AT  64;
    1, // A  65;
    1, // B  66;
    1, // C  67;
    1, // D  68;
    1, // E  69;
    1, // F  70;
    1, // G  71;
    1, // H  72;
    1, // I  73;
    1, // J  74;
    1, // K  75;
    1, // L  76;
    1, // M  77;
    1, // N  78;
    1, // O  79;
    1, // P  80;
    1, // Q  81;
    1, // R  82;
    1, // S  83;
    1, // T  84;
    1, // U  85;
    1, // V  86;
    1, // W  87;
    1, // X  88;
    1, // Y  89;
    1, // Z  90;
    5, // OPEN_SQUARE  91;
    0, // BACKSLASH  92;
    6, // CLOSE_SQUARE  93;
    0, // CARET  94;
    0, // UNDER_SCORE  95;
    0, // GRAVE  96;
    1, // a  97;
    1, // b  98;
    1, // c  99;
    1, // d  100;
    1, // e  101;
    1, // f  102;
    1, // g  103;
    1, // h  104;
    1, // i  105;
    1, // j  106;
    1, // k  107;
    1, // l  108;
    1, // m  109;
    1, // n  110;
    1, // o  111;
    1, // p  112;
    1, // q  113;
    1, // r  114;
    1, // s  115;
    1, // t  116;
    1, // u  117;
    1, // v  118;
    1, // w  119;
    1, // x  120;
    1, // y  121;
    1, // z  122;
    5, // OPEN_CURLY  123;
    0, // VERTICAL_BAR  124;
    6, // CLOSE_CURLY  125;
    0, // TILDE  126;
    0 // DELETE  127;
]

/*
 * 8 = In set of `ids` and `numbers`.
 * 4 = In set of `numbers` only.
 * 2 = In set of `ids` only.
 * ID MASK = 10;
 * NUMBER MASK = 12;
 */
const num_id = [
    0, // NULL  0;
    0, // START_OF_HEADER  1;
    0, // START_OF_TEXT  2;
    0, // END_OF_TXT  3;
    0, // END_OF_TRANSMISSION  4;
    0, // ENQUIRY  5;
    0, // ACKNOWLEDGE  6;
    0, // BELL  7;
    0, // BACKSPACE  8;
    0, // HORIZONTAL_TAB  9;
    0, // LINE_FEED  10;
    0, // VERTICAL_TAB  11;
    0, // FORM_FEED  12;
    0, // CARRIAGE_RETURN  13;
    0, // SHIFT_OUT  14;
    0, // SHIFT_IN  15;
    0, // DATA_LINK_ESCAPE  16;
    0, // DEVICE_CTRL_1  17;
    0, // DEVICE_CTRL_2  18;
    0, // DEVICE_CTRL_3  19;
    0, // DEVICE_CTRL_4  20;
    0, // NEGATIVE_ACKNOWLEDGE  21;
    0, // SYNCH_IDLE  22;
    0, // END_OF_TRANSMISSION_BLOCK  23;
    0, // CANCEL  24;
    0, // END_OF_MEDIUM  25;
    0, // SUBSTITUTE  26;
    0, // ESCAPE  27;
    0, // FILE_SEPERATOR  28;
    0, // GROUP_SEPERATOR  29;
    0, // RECORD_SEPERATOR  30;
    0, // UNIT_SEPERATOR  31;
    0, // SPACE  32;
    0, // EXCLAMATION  33;
    0, // DOUBLE_QUOTE  34;
    0, // HASH  35;
    8, // DOLLAR  36;
    0, // PERCENT  37;
    0, // AMPERSAND  38;
    0, // QUOTE  39;
    0, // OPEN_PARENTH  40;
    0, // CLOSE_PARENTH  41;
    0, // ASTERISK  42;
    0, // PLUS  43;
    0, // COMMA  44;
    0, // HYPHEN  45;
    4, // PERIOD  46;
    0, // FORWARD_SLASH  47;
    2, // ZERO  48;
    2, // ONE  49;
    2, // TWO  50;
    2, // THREE  51;
    2, // FOUR  52;
    2, // FIVE  53;
    2, // SIX  54;
    2, // SEVEN  55;
    2, // EIGHT  56;
    2, // NINE  57;
    2, // COLEN  58;
    0, // SEMICOLON  59;
    0, // LESS_THAN  60;
    0, // EQUAL  61;
    0, // GREATER_THAN  62;
    0, // QMARK  63;
    0, // AT  64;
    2, // A  65;
    8, // B  66;
    2, // C  67;
    2, // D  68;
    8, // E  69;
    2, // F  70;
    2, // G  71;
    2, // H  72;
    2, // I  73;
    2, // J  74;
    2, // K  75;
    2, // L  76;
    2, // M  77;
    2, // N  78;
    8, // O  79;
    2, // P  80;
    2, // Q  81;
    2, // R  82;
    2, // S  83;
    2, // T  84;
    2, // U  85;
    2, // V  86;
    2, // W  87;
    8, // X  88;
    2, // Y  89;
    2, // Z  90;
    0, // OPEN_SQUARE  91;
    0, // BACKSLASH  92;
    0, // CLOSE_SQUARE  93;
    0, // CARET  94;
    0, // UNDER_SCORE  95;
    0, // GRAVE  96;
    2, // a  97;
    8, // b  98;
    2, // c  99;
    2, // d  100;
    8, // e  101;
    2, // f  102;
    2, // g  103;
    2, // h  104;
    2, // i  105;
    2, // j  106;
    2, // k  107;
    2, // l  108;
    2, // m  109;
    2, // n  110;
    8, // o  111;
    2, // p  112;
    2, // q  113;
    2, // r  114;
    2, // s  115;
    2, // t  116;
    2, // u  117;
    2, // v  118;
    2, // w  119;
    8, // x  120;
    2, // y  121;
    2, // z  122;
    0, // OPEN_CURLY  123;
    0, // VERTICAL_BAR  124;
    0, // CLOSE_CURLY  125;
    0, // TILDE  126;
    0 // DELETE  127;
]