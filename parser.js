function Parser(lexems) {

    this.lexems = lexems;
    this.pointer = 0;
    this.commands = [];

    this.keywordsHandlers = {
        'if': 'ifParser',
        'var': 'varParser',
    }
}

Parser.prototype.ifParser = function() {
    var result = {
        type: 'if',
        condition: '',
        content: '',
        elseContent: '',
    }

    this.expect('keyword', 'if')
        .expect('operator', '(')
        .valueParser(function(cont) {
            result.condition = cont;
        })
        .expect('operator', ')')
        .bracketsParser(function(content) {
            result.content = new Parser(content).parse();
        })
        .expectIf('keyword', 'else', function() {
            this.bracketsParser(function(content) {
                result.elseContent = new Parser(content).parse();
            })
        })

    this.commands.push(result);
}

Parser.prototype.bracketsParser = function(callback) {
    var nesting = 1;
    var content = [];

    this.expect('operator', '{');

    while (!this.eof(true)) {

        if (this.current().content == '{') {
            nesting++;

        } else if (this.current().content == '}') {
            nesting--;
        }

        if (nesting == 0) {
            callback(content);
            break;
        }

        content.push(this.current());
        this.move();
    }

    this.expect('operator', '}');

    return this;
}

Parser.prototype.varParser = function() {

    var result = {
        type: 'var_declare',
        name: '',
        content: '',
    }

    this.expect('keyword', 'var')
        .expect('alphanumeric', '*', function(cont) {
            result.name = cont;
        })
        .expect('operator', '=')
        .valueParser(function(cont) {
            result.content = cont;
        })
        .expect('operator', ';');

    this.commands.push(result);
}

Parser.prototype.valueParser = function(callback) {
    var result = [];

    while (!this.eof(true) && [';', ')'].indexOf(this.current().content) === -1) {
        result.push(this.current());
        this.move();
    }

    callback(result);

    return this;
}

Parser.prototype.expectIf = function(type, content, callback) {

    if (this.eof()) {
        return;
    }

    if (this.current().type != type) {
        return;
    }

    if (content != '*' && this.current().content != content) {
        return;
    }

    this.move();

    if (callback) {
        callback.call(this, this.current().content);
    }

    return this;
}

Parser.prototype.expect = function(type, content, callback) {

    if (this.current().type != type) {
        throw {error: 'Unexpected type ' + this.current().type + '. Expected ' + type + ' - ' + content + ', value `' + this.current().content + '` on line ' + this.current().line};
    }

    if (content != '*' && this.current().content != content) {
        throw {error: 'Unexpected command ' + this.current().content + '. Expected ' + content + ' on line ' + this.current().line};
    }

    if (callback) {
        callback(this.current().content);
    }

    this.move();

    return this;
}

Parser.prototype.current = function() {
    return this.lexems[this.pointer];
}

Parser.prototype.move = function() {
    this.pointer++;
    return this;
}

Parser.prototype.unexpectedEof = function() {
    throw {error: 'Unexpected end of file at ' + this.current().content + ', line: ' + this.current().line};
}

Parser.prototype.eoc = function() {
    return this.current().content == ';';
}

Parser.prototype.eof = function(dieOnTrue) {
    var tmp = this.pointer >= this.lexems.length;

    if (tmp && dieOnTrue) {
        this.unexpectedEof();
    }

    return tmp;
}

Parser.prototype.parse = function() {
    while (!this.eof()) {
        var handler = this.keywordsHandlers[this.current().content];

        if (!handler) {
            throw {error: 'Unexpected ' + this.current().content + ', line: ' + this.current().line};
        }

        this[handler].call(this)
    }

    return this.commands;
}

module.exports = Parser;