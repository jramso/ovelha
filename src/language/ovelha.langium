grammar Ovelha

entry Model:
    (classes+=Classe)+;

Classe:
    'class' name=ID '{'
        features+= Feature*
    '}';

Feature:
    Attribute | Method;

Attribute:
    type = Type name=ID;

Method:
    type = Type name=ID '(' (parameters= ParemeterList)? ')';

ParemeterList:
    parameters+=Parameter (',' parameters+=Parameter)*; //

Parameter:
    type = Type name=ID;

//type = tipos primitivos + String (String é do java.lang que é nativo mas nao primitivo)
Type returns string:
    ('int' | 'String' | 'boolean' | 'float' | 'double' | 'char' | 'byte' | 'short' | 'long');

hidden terminal WS: /\s+/;
terminal ID: /[_a-zA-Z][\w_]*/;
terminal INT returns number: /[0-9]+/;
terminal STRING: /"(\\.|[^"\\])*"|'(\\.|[^'\\])*'/;
terminal BOOLEAN: /true|false/;
terminal FLOAT: /-?\d+\.\d+/;
terminal DOUBLE: /-?\d+\.\d+([eE][-+]?\d+)?/;

hidden terminal ML_COMMENT: /\/\*[\s\S]*?\*\//;
hidden terminal SL_COMMENT: /\/\/[^\n\r]*/;
