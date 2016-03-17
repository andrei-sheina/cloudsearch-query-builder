# CloudSearch Query Builder

[![Circle CI](https://img.shields.io/circleci/project/Testlio/cloudsearch-query-builder/master.svg)](https://circleci.com/gh/Testlio/cloudsearch-query-builder/tree/master) [![NPM Package](https://img.shields.io/npm/v/@testlio/cloudsearch-query-builder.svg)](https://www.npmjs.com/package/@testlio/cloudsearch-query-builder)

AWS CloudSearch supports searching over data/documents by using query strings, these query strings can contain compound query in a specific format/syntax. While this syntax is [well documented](http://docs.aws.amazon.com/cloudsearch/latest/developerguide/searching-compound-queries.html), creating this string in code can be error-prone. This is where query builder comes in, allowing queries to be built using a more functional approach, and ensuring the resulting string is in the correct format.

## Installation

```
npm install @testlio/cloudsearch-query-builder
```

## Getting Started

Query builder mirrors the available operators, [listed here](http://docs.aws.amazon.com/cloudsearch/latest/developerguide/searching-compound-queries.html), as functions that take arguments and produce a string. All of these functions are well-documented in the code itself, thus a few example cases here should do the trick.

```js
// Query for all Star Wars films released before the year 2000
builder.and([builder.phrase('star wars', 'title'), builder.range('year', undefined, 2000)]);
// -> (and (phrase field=star wars 'title') (range field=year {,2000]))
```

```js
// Query for all Star Wars films, boosting those released before year 2000
builder.and([builder.phrase('star wars', 'title'), builder.or([builder.range('year', undefined, 2000, { boost: 4 }), builder.range('year', 2000)])]);
// -> (and (phrase field=title 'star wars') (or (range field=year boost=4 {,2000]) (range field=year [2000,})))
```

```js
// Query for all Star Wars films that Harrison Ford stars in
builder.and([builder.term('Harrison Ford', 'actors'), builder.phrase('star wars', 'title')]);
// -> (and (term field=actors 'Harrison Ford') (phrase field=title 'star wars'))
```

With certain operators, you can also omit the field to search over all textual fields, for example:

```js
// Search for all films that contain term 'star' in any of their textual fields
builder.term('star');
// -> (term 'star')

// Search for all films released after year 2000 that mention Harrison Ford
builder.and([builder.phrase('Harrison Ford'), builder.range('year', 2000)]);
// -> (and (term 'star') (range field=year [2000,}))
```

The full API is documented inline, you can go over it [here](index.js).

## Interfacing with AWS SDK

The resulting string from query builder should be passed along to the `search` function of [CloudSearchDomain in AWS SDK for Node.js](http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/CloudSearchDomain.html#search-property). It is important to note that all strings that query builder returns rely on the `queryParser` parameter to be set to `structured`.

```js
// Obtain CloudSearchDomain, possibly via CloudSearch.describeDomains()
const cloudSearchDomain = ...;
const builder = require('@testlio/cloudsearch-query-builder');

// Create a query as explained above
const query = builder.and([builder.phrase('star wars', 'title'), builder.range('year', undefined, 2000)]);

// Conduct the search
cloudSearchDomain.search({
    query: query,
    queryParser: 'structured'
}, function(err, data) {
    // Handle the results
});
```

## Contributing

Contributions to cloudsearch-query-builder are very welcome! Please make sure to follow the [Contribution Guidelines](.github/CONTRIBUTING.MD). Areas that you could help out with include, but are not limited to:

1. Supporting other query parsers
2. Increasing test coverage
3. Documentation and providing further examples
