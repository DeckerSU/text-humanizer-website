/**
 * Standalone version of humanize-ai-lib
 * Inspired by: https://github.com/Nordth/humanize-ai-lib (c) Nordth
 *
 * (с) Manus AI & Decker, 2025
 * Licensed under the MIT license
 */

(function(global) {
    'use strict';

    // Default options
    const DefaultOptions = {
        transformHidden: true,
        transformTrailingWhitespace: true,
        transformNbs: true,
        transformDashes: true,
        transformQuotes: true,
        transformOther: true,
        keyboardOnly: false,
    };

    // Unicode constants for ignorable symbols (expanded from original)
    const IGNORABLE_SYMBOLS = [
        '\u00AD', '\u180E', '\u200B', '\u200C', '\u200D', '\u200E', '\u200F',
        '\u202A', '\u202B', '\u202C', '\u202D', '\u202E', '\u2060', '\u2066', 
        '\u2067', '\u2068', '\u2069', '\uFEFF'
    ].join('');

    /**
     * Humanize AI-generated text by removing common AI markers
     * @param {string} text - Input text to humanize
     * @param {Object} options - Transform options
     * @returns {Object} - Result with text and count of changes
     */
    function humanizeString(text, options) {
        if (typeof text !== 'string') {
            throw new Error('Input must be a string');
        }

        const useOptions = { ...DefaultOptions, ...(options || {}) };
        let count = 0;
        let resultText = text;

        // Define patterns for different transformations (matching original library)
        const patterns = [
            // Transform hidden symbols (expanded Unicode range)
            {
                condition: 'transformHidden',
                regex: new RegExp(`[${IGNORABLE_SYMBOLS}]`, 'g'),
                replacement: ''
            },
            // Transform trailing whitespace (includes tabs, form feeds)
            {
                condition: 'transformTrailingWhitespace',
                regex: /[ \t\x0B\f]+$/gm,
                replacement: ''
            },
            // Transform non-breaking spaces
            {
                condition: 'transformNbs',
                regex: /[\u00A0]/g,
                replacement: ' '
            },
            // Transform dashes (all types: em-dash, en-dash, figure dash)
            {
                condition: 'transformDashes',
                regex: /[——–]/g,
                replacement: '-'
            },
            // Transform quotes (all curly quote types including guillemets)
            {
                condition: 'transformQuotes',
                regex: /[“”«»„]/g,
                replacement: '"'
            },
            // Transform apostrophes (all curly apostrophe types)
            {
                condition: 'transformQuotes',
                regex: /[‘’ʼ]/g,
                replacement: "'"
            },
            // Transform other symbols (ellipsis to three dots)
            {
                condition: 'transformOther',
                regex: /[…]/g,
                replacement: '...'
            }
        ];

        // Apply transformations
        for (const pattern of patterns) {
            if (useOptions[pattern.condition]) {
                const matches = resultText.match(pattern.regex);
                if (matches) {
                    count += matches.length;
                    resultText = resultText.replace(pattern.regex, pattern.replacement);
                }
            }
        }

        // Keyboard-only transformation (removes all non-keyboard typeable symbols)
        if (useOptions.keyboardOnly) {
            // Allow: letters, numbers, basic punctuation, whitespace, emojis
            const keyboardOnlyRegex = /[^\x20-\x7E\n\r\t\p{L}\p{N}\p{Emoji}\u00A0-\u00FF]/gu;
            const matches = resultText.match(keyboardOnlyRegex);
            if (matches) {
                count += matches.length;
                resultText = resultText.replace(keyboardOnlyRegex, '');
            }
        }

        return {
            text: resultText,
            count: count
        };
    }

    // Export to global scope
    if (typeof module !== 'undefined' && module.exports) {
        // Node.js
        module.exports = { humanizeString };
    } else {
        // Browser
        global.humanizeString = humanizeString;
    }

})(typeof window !== 'undefined' ? window : this);

