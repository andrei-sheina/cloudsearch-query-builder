'use strict';

const assert = require('assert');
const builder = require('../');

describe('simple tests (not nested)', function() {

    it('and', function() {
        const term = builder.term('foo', 'bar');
        const comparison = builder.and([term]);
        assert.equal(comparison, '(and (term field=bar \'foo\'))');
    });

    it('or', function() {
        const term = builder.term('foo', 'bar');
        const comparison = builder.or([term]);
        assert.equal(comparison, '(or (term field=bar \'foo\'))');
    });

    it('not', function() {
        const term = builder.term('foo', 'bar');
        const comparison = builder.not([term]);
        assert.equal(comparison, '(not (term field=bar \'foo\'))');
    });


    it('range', function() {
        const comparison = builder.range('foo', 0, 10);
        assert.equal(comparison, '(range field=foo [0,10])');
    });

    it('near', function() {
        const comparison = builder.near('foo', 'bar', 2);
        assert.equal(comparison, '(near field=bar distance=2 \'foo\')');
    });

    it('term', function() {
        const comparison = builder.term('foo', 'bar');
        assert.equal(comparison, '(term field=bar \'foo\')');
    });

    it('prefix', function() {
        const comparison = builder.prefix('foo', 'bar');
        assert.equal(comparison, '(prefix field=bar \'foo\')');
    });

    it('matchall', function() {
        assert.equal(builder.matchall(), 'matchall');
    });
});