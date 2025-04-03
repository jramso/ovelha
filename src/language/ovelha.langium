grammar Ovelha

entry Model:
    (classes+=Classe)+;

Classe:
    'class' name=ID '{'
        features+= Feature*
    '}';

Feature:
    Attribute;

Attribute:
    type = Type name=ID;

// Method:
//     type = Type name=ID '(' parameters=ParemeterList? ')';

// ParemeterList:
//     parameters+=Parameter (',' parameters+=Parameter)*; //

// Parameter:
//     type = Type name=ID;

Type returns string:('int' | 'string' | 'boolean' | 'float' | 'double');

// Visibility:
//   '-' |'+'|'#';

hidden terminal WS: /\s+/;
terminal ID: /[_a-zA-Z][\w_]*/;
terminal INT returns number: /[0-9]+/;
terminal STRING: /"(\\.|[^"\\])*"|'(\\.|[^'\\])*'/;
//terminal BOOLEAN: /""/

hidden terminal ML_COMMENT: /\/\*[\s\S]*?\*\//;
hidden terminal SL_COMMENT: /\/\/[^\n\r]*/;
