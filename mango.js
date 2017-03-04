var Lexer = require('./lexer')
var Parser = require('./parser')
//var Executor = require('executor')

var code = 'var a = 1111 XOR 222 + 333 - new Date;';

var lexer = new Lexer(code);
var lexems = [];
try {
    lexems = lexer.parse();

} catch (e) {
    console.log(e);
}

//console.log(lexems);

if (lexems.length == 0) {
    return;
}

var parser = new Parser(lexems);
var commands = [];

try {
    commands = parser.parse();

} catch (e) {
    console.log(e);
}

console.log (commands);