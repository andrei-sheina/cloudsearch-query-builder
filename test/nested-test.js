'use strict';

const assert = require('assert');
const builder = require('../');

describe('nested tests', function() {

    it('and + or', function() {
        const term = builder.term('foo', 'bar');
        const term2 = builder.term('foo2', 'bar2');
        const and = builder.and([term, term2]);

        const comparison = builder.or([and, term2]);

        assert.equal(comparison, '(or (and (term field=bar \'foo\') (term field=bar2 \'foo2\')) (term field=bar2 \'foo2\'))');
    });

    it('and + not', function() {
        const term = builder.term('foo', 'bar');
        const term2 = builder.not(builder.term('foo2', 'bar2'));
        const comparison = builder.and([term, term2]);

        assert.equal(comparison, '(and (term field=bar \'foo\') (not (term field=bar2 \'foo2\')))');
    });

    it('and + or + options', function() {
        const term = builder.term('foo', 'bar');
        const term2 = builder.term('foo2', 'bar2');
        const or1 = builder.or([term, term2]);
        const or2 = builder.or([term2, term]);
        const comparison = builder.and([or1, or2], {boost:5});

        assert.equal(comparison, '(and boost=5 (or (term field=bar \'foo\') (term field=bar2 \'foo2\')) (or (term field=bar2 \'foo2\') (term field=bar \'foo\')))');
    });

});