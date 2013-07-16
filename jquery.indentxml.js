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
    SINGLE_QUOTE = 6;
    
    /**
     * Indents XML code.
     * 
     * @param String input The input code as text.
     * @returns The reindented XML code.
     */
    $.indentxml = function(/*String*/ input) {
        var formatted = "";
        var tab = "  ";
        var level = 0, prevLevel = 0, levelStack = 0;
        var state = BASE, stack = BASE;

        $.each(input.split("\n"), function(index, line) {
            // Save previously computed level
            prevLevel = level;

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
                            level += 2; // continuation, open
                        }
                        break;
                    case 1: // IN_ELEMENT
                        if (c === "/") {
                            state = IN_CLOSE_ELEMENT;
                            prevLevel -= 1;
                            level -= 1;
                        }
                        else {
                            state = IN_OPEN_ELEMENT;
                        }
                        break;
                    case 2: // IN_OPEN_ELEMENT
                        if (c === "\"") {
                            stack = state;       
                            levelStack = level;

                            level = 0;
                            state = DOUBLE_QUOTE;                        
                        }
                        else if (c === "'") {
                            stack = state;
                            levelStack = level;

                            level = 0;
                            state = SINGLE_QUOTE;
                        }
                        else if (c === "/") {
                            state = IN_SELF_CLOSED_ELEMENT;
                            level -= 1; // stop
                        }
                        else if (c === "&gt;") {
                            state = BASE;
                            level -= 1; // continuation
                        }
                        break;
                    case 3: // IN_SELF_CLOSED_ELEMENT
                        if (c === "&gt;") {
                            state = BASE;
                            level -= 1; // continuation, close
                        }
                        break;
                    case 4: // IN_CLOSE_ELEMENT
                        if (c === "&gt;") {
                            state = BASE;
                            level -= 2; // continuation, close
                        }
                        break;
                    case 5:  // DOUBLE_QUOTE
                        if (c === "\"") {
                            state = stack;
                            level = levelStack;
                        }
                        break;
                    case 6: // SINGLE_QUOTE
                        if (c === "'") {
                            state = stack;
                            level = levelStack;
                        }
                        break;
                }
            }

            // Append current line with indentation from the last line
            var i;
            for (i = 0; i < prevLevel; ++i) {
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
