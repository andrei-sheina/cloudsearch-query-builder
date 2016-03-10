'use strict';

function quote(value) {
    if (typeof value === 'string') {
        return `'${value}'`;
    }

    return '' + value;
}

function isUndefined(value) {
    return typeof value === 'undefined';
}

function objectToQuery(obj) {
    if (!obj) return '';

    const strings = Object.keys(obj).map(function(key) {
        const value = obj[key];
        if (typeof value === 'string') {
            return `${key}="${obj[key]}"`;
        }
        return `${key}=${obj[key]}`;
    });

    return strings.join(' ');
}

function toExpression(operator, field, value, options) {
    if (isUndefined(field)) {
        return `(${operator} ${objectToQuery(options)}`.trim() + ` ${value})`;
    }

    return `(${operator} field=${field} ${objectToQuery(options)}`.trim() + ` ${value})`;
}

module.exports = {

    /**
     * AND's together 1..* queries (expressions).
     *
     * and([near('kast kaalikas', 'model', 3), prefix('gam', 'model')], {boost:2});
     *      >>>     (and boost=2 (near field=model distance=3 'kast kaalikas') (prefix field=model 'gam'))
     *
     * @param expressions REQUIRED object or array. Simple queries to AND together (can be single object or array)
     * @param options OPTIONAL object. Any additional properties you want to add to the query (for example {boost:3})
     */
    and: function(expressions, options) {
        return toExpression('and', undefined, expressions.join(' '), options);
    },

    /**
     * OR's together 1..* queries (expressions).
     *
     * or([near('kast kaalikas', 'model', 3), prefix('gam', 'model')], {boost:2});
     *      >>>     (or boost=2 (near field=model distance=3 'kast kaalikas') (prefix field=model 'gam'))
     *
     * @param expressions REQUIRED object or array. Simple queries to AND together (can be single object or array)
     * @param options OPTIONAL object. Any additional properties you want to add to the query (for example {boost:3})
     */
    or: function(expressions, options) {
        return toExpression('or', undefined, expressions.join(' '), options);
    },

    /**
     * Inverts the truth value of a single expression. Doesn't support an array of queries.
     *
     *      not(prefix('gam', 'model'), {boost:2});     >>>     (not boost=2 (prefix field=model 'gam'))
     *
     * @param expression single query to invert
     * @param options OPTIONAL object. Any additional properties you want to add to the query (for example {boost:3})
     */
    not: function(expression, options) {
        return toExpression('not', undefined, expression, options);
    },

    /**
     * Constructs a simple range query (an expression). Can be used alone or part of a bigger complex query.
     *
     * Range searches for a range of values. Must have at least 1 bound (upper or lower).
     * Can be used to search on numeric, date and text fields.
     *
     *      range('created_at', '1972-10-14T14:43:54Z', '1988-10-14T14:43:54Z');
     *          >>>     (range field=created_at ['1972-10-14T14:43:54Z','1988-10-14T14:43:54Z'])
     *
     * @param field REQUIRED string. Name of a single field where to search on
     * @lowerBound OPTIONAL (at least 1 bound required). Lower bound of the range
     * @upperBound OPTIONAL (at least 1 bound required). Upper bound of the range
     * @param options OPTIONAL object. Any additional properties you want to add to the query (for example {boost:3})
     * @returns string simple range query
     */
    range: function(field, lowerBound, upperBound, options) {
        if (isUndefined(field)) throw new Error('Field must be defined in range');
        if (isUndefined(lowerBound) && isUndefined(upperBound)) throw new Error('must have at least 1 bound!');

        let expression;
        if (isUndefined(lowerBound)) {
            expression = `{,${quote(upperBound)}]`;
        } else if (isUndefined(upperBound)) {
            expression = `[${quote(lowerBound)},}`;
        } else {
            if (typeof upperBound !== typeof lowerBound) throw new Error('Both bounds must be same type!');
            expression = `[${quote(lowerBound)},${quote(upperBound)}]`;
        }

        return toExpression('range', field, expression, options);
    },

    /**
     * Constructs a simple term query (an expression). Can be used alone or part of a bigger complex query.
     *
     * Term searches for a sequence of words (words are separated by whitespace).
     * Can be used to search on all field types.
     *
     *      term('apple', 'identifier', {boost:4});    >>>     (term field=identifier boost=4 'apple')
     *      term('apple');                             >>>     (term 'apple')
     *
     * @param value REQUIRED string. Value of the sequence of words to search for
     * @param field OPTIONAL string. Name of a single field. If omitted then searches on all text fields. If present
     * then searches on that single field only
     * @param options OPTIONAL object. Any additional properties you want to add to the query (for example {boost:3})
     * @returns string simple term query
     */
    term: function(value, field, options) {
        if (isUndefined(value)) throw new Error('Value must be defined');

        return toExpression('term', field, quote(value), options);
    },

    /**
     * Returns the string literal 'matchall'. Matches everything.
     *
     * For example this query matches everything because it OR's 'matchall'
     *
     *      (or (phrase field=model 'kast vaal') matchall)
     *
     * @returns 'matchall'
     */
    matchall: function() {
        return 'matchall';
    },

    /**
     * Constructs a simple near query (an expression). Can be used alone or part of a bigger complex query.
     *
     * Near searches for a list of words that must be present in a field (words are separated by whitespace).
     * Distance specifies how far the words can be apart from one another to still get a match.
     * You can search on literal fields but it must match exactly to get a hit.
     *
     *      near('let be', 'model', 1);    >>>     (near field=model distance=1 'let be')
     *
     * @param value REQUIRED string. List of words to search for
     * @param field OPTIONAL string. Name of a single field. If omitted then searches on all text fields. If present
     * then searches on that single field only
     * @param options OPTIONAL object. Any additional properties you want to add to the query (for example {boost:3})
     * @returns string simple near query
     */
    near: function(value, field, distance, options) {
        if (isUndefined(value)) throw new Error('Value must be defined');

        options = Object.assign({distance:distance}, options);
        return toExpression('near', field, quote(value), options);
    },

    /**
     * Constructs a simple phrase query (an expression). Can be used alone or part of a bigger complex query.
     *
     * Phrase searches for a sequence of words (words are separated by whitespace).
     * Can be used to search on all field types.
     *
     *      phrase('apple', 'identifier', {boost:4});    >>>     (phrase field=identifier boost=4 'apple')
     *      phrase('apple');                             >>>     (phrase 'apple')
     *
     * @param value REQUIRED string. Value of the sequence of words to search for
     * @param field OPTIONAL string. Name of a single field. If omitted then searches on all text fields. If present
     * then searches on that single field only
     * @param options OPTIONAL object. Any additional properties you want to add to the query (for example {boost:3})
     * @returns string simple phrase query
     */
    phrase: function(value, field, options) {
        if (isUndefined(value)) throw new Error('Value must be defined');

        return toExpression('phrase', field, quote(value), options);
    },

    /**
     * Constructs a simple prefix query (an expression). Can be used alone or part of a bigger complex query.
     *
     * Prefix searches for the prefix or the first characters in front of the whole string.
     * Can be used to search over text and literal fields only (and text-array and literal-array).
     * Trying to search over numeric fields with prefix will give you error from CloudSearch.
     *
     *      prefix('apple', 'identifier', {boost:4});    >>>     (prefix field=identifier boost=4 'apple')
     *      prefix('apple')                             >>>     (prefix 'apple')
     *
     * @param value REQUIRED string. Value of the prefix to search for
     * @param field OPTIONAL string. Name of a single field. If omitted then searches on all text fields
     * If present then searches only on that single field only
     * @param options OPTIONAL object. Any additional properties you want to add to the query (for example {boost:3})
     * @returns string simple prefix query
     */
    prefix: function(value, field, options) {
        if (isUndefined(value)) throw new Error('Value must be defined');

        return toExpression('prefix', field, quote(value), options);
    }
};
