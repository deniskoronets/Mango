function Lexer(code) {

    this.code = code
    this.pointer = 0;
    this.result = [];

    this.line = 1;

    this.keywords = [
        'int', 'if', 'while', 'for', 'foreach', 'else',
        'echo', 'toInt', 'var',
    ];

    this.operators = [
        '=', '"', '\'', '(', ')', '}',
        '{', '-', '+', '->', '>', '$', '[', ']', '[]', ';', '.', '||', '&&', 'OR', 'AND', 'XOR',
        ',', '<-', '|', '&', '/', '*', '!',
    ];
}

Lexer.prototype.move = function() {
    this.pointer++;
}

Lexer.prototype.current = function() {

    if (this.eof()) {
        throw 'eof';
    }

    return this.code[this.pointer];
}

Lexer.prototype.eof = function() {
    return this.pointer >= this.code.length;
}

Lexer.prototype.isLetter = function() {
    return this.current() >= 'a' && this.current() <= 'z' || this.current() >= 'A' && this.current() <= 'Z';
}

Lexer.prototype.isNumeric = function() {
    return this.current() >= '0' && this.current() <= '9';
}

Lexer.prototype.isSpace = function() {

    if (this.current() == "\n") {
        this.line++;
    }

    return this.current() == ' ' || this.current() == "\n" || this.current() == "\t";
}

Lexer.prototype.isOperator = function(str) {
    return this.operators.indexOf(str) !== -1;
}

Lexer.prototype.isKeyword = function(str) {
    return this.keywords.indexOf(str) !== -1;
}

Lexer.prototype.tryNumber = function() {
    if (!this.isNumeric(this.current())) {
        return false;
    }

    var result = '';

    while (this.isNumeric()) {
        result += this.current();
        this.move();
    }

    if (!this.isSpace() && !this.isOperator(this.current())) {
        throw {error: 'Unexpected value: ' + this.current() + ' at line ' + this.line};
    }

    this.result.push({
        type: 'numeric',
        content: result,
        line: this.line,
    });

    return true;
}

Lexer.prototype.tryAlpha = function() {
    var result = '';

    if (!this.isLetter()) {
        return false;
    }

    while (this.isLetter() || this.isNumeric() || this.current() == '_') {
        result += this.current();
        this.move();
    }

    var type = 'alphanumeric';

    if (this.isKeyword(result)) {
        type = 'keyword';

    } else if (this.isOperator(result)) {
        type = 'operator';
    }

    this.result.push({
        type: type,
        content: result,
        line: this.line,
    })

    return true;
}

Lexer.prototype.tryOperator = function() {

    var result = '';

    if (!this.isOperator(this.current())) {
        return false;
    }

    while (!this.eof() && this.isOperator(result + this.current())) {
        result += this.current();
        this.move();
    }

    this.result.push({
        type: 'operator',
        content: result,
        line: this.line,
    })

    return true;
}

Lexer.prototype.parse = function() {

    try {
        while (!this.eof()) {

            while (this.isSpace(this.current())) {

                if (this.current() == "\n") {
                    this.line++;
                }

                this.move();
                continue;
            }

            if (this.tryNumber()) {
                continue;
            }

            if (this.tryAlpha()) {
                continue;
            }

            if (this.tryOperator()) {
                continue;
            }

            throw {error: 'Unexpected value: ' + this.current() + ' at line ' + this.line};
        }
    } catch (e) {
        if (e != 'eof') {
            throw e;
        }
    }

    return this.result;
}

module.exports = Lexer;