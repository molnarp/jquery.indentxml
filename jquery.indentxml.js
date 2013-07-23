/*!
 * jquery.indentxml v0.0.1
 * https://github.com/molnarp/jquery.indentxml/
 *
 * Copyright 2013 Peter Molnar
 * Released under the Apache License, Version 2.0
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Date: 2013-07-16T16:22Z
 */
(function ( $ ) {
    
    // States:     
    var 
    BASE = 0, 
    IN_ELEMENT = 1, 
    IN_OPEN_ELEMENT = 2, 
    IN_SELF_CLOSED_ELEMENT = 3, 
    IN_CLOSE_ELEMENT = 4, 
    DOUBLE_QUOTE = 5, 
    SINGLE_QUOTE = 6,
    COMMENT = 7;
    
    /**
     * Indents XML code.
     * 
     * @param String input The input code as text.
     * @returns The reindented XML code.
     */
    $.indentxml = function(/*String*/ input) {
        var formatted = "";
        var tab = "  ";
        var nextLevel = 0, currentLevel = 0, levelStack = 0;
        var state = BASE, stack = BASE;

        $.each(input.split("\n"), function(index, line) {
            // Save previously computed level
            currentLevel = nextLevel;

            // Parse current line and compute level of next line        
            var pos = 0;
            var c = "";
            while (pos < line.length) {

                // Get next character, quoted characters are parsed as a whole
                c = readChar(line, pos);
                pos += c.length;

                switch (state) {
                    case 0: // BASE
                        if (c === "&lt;") {
                            state = IN_ELEMENT;
                            nextLevel += 2; // continuation, open
                        }
                        break;
                    case 1: // IN_ELEMENT
                        if (c === "/") {
                            state = IN_CLOSE_ELEMENT;
                            currentLevel -= 1;
                            nextLevel -= 1;
                        }
                        else if (c === "!") {
                            state = COMMENT;
                        }
                        else {
                            state = IN_OPEN_ELEMENT;
                        }
                        break;
                    case 2: // IN_OPEN_ELEMENT
                        if (c === "\"") {
                            stack = state;       
                            levelStack = nextLevel;

                            nextLevel = 0;
                            state = DOUBLE_QUOTE;                        
                        }
                        else if (c === "'") {
                            stack = state;
                            levelStack = nextLevel;

                            nextLevel = 0;
                            state = SINGLE_QUOTE;
                        }
                        else if (c === "/") {
                            state = IN_SELF_CLOSED_ELEMENT;
                            nextLevel -= 1; // stop
                        }
                        else if (c === "&gt;") {
                            state = BASE;
                            nextLevel -= 1; // continuation
                        }
                        break;
                    case 3: // IN_SELF_CLOSED_ELEMENT
                        if (c === "&gt;") {
                            state = BASE;
                            nextLevel -= 1; // continuation, close
                        }
                        break;
                    case 4: // IN_CLOSE_ELEMENT
                        if (c === "&gt;") {
                            state = BASE;
                            nextLevel -= 2; // continuation, close
                        }
                        break;
                    case 5:  // DOUBLE_QUOTE
                        if (c === "\"") {
                            state = stack;
                            nextLevel = levelStack;
                        }
                        break;
                    case 6: // SINGLE_QUOTE
                        if (c === "'") {
                            state = stack;
                            nextLevel = levelStack;
                        }
                        break;
                    case 7: // COMMENT
                        if (c === "&gt;") {
                            state = BASE;
                            nextLevel -= 2;
                            
                        }
                        break;
                }
            }

            // Append current line with indentation from the last line
            var i;
            for (i = 0; i < currentLevel; ++i) {
                formatted += tab;
            }
            formatted += $.trim(line);
            formatted += "\n";        
        });

        return formatted;
    };

    function readChar(input, pos) {
        var c = input.charAt(pos);
        if (c !== '&') {
            return c;
        }

        var i;
        for (i = 1; i < (input.length - pos); ++i) {
            c += input.charAt(pos + i);
            if (input.charAt(pos + i) === ';') {
                break;
            }
        }

        return c;

    };
    
} ( jQuery ));
