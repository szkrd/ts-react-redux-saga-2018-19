# Xmlhttp requests

## Token storage

## Ajax calls

We have been using [axios](https://github.com/axios/axios) for the ajax calls, but handling the jwt token (and other things) are integrated in an axios wrapper.

What should such a wrapper do?

- setup logging (`interceptors.request.use`, `interceptors.response.use`)
- wrap parameter handling, so all of these should be valid:
  - `api.get('/foo', token)`
  - `api.get('/foo/:id/bar', { id: 123 }, token)`
  - `api.get('/foo', token)`
  - `api.post('/foo', { bar: 1 }, token)`
- parse response headers (in the `then`) and append them to the returned object
  (like pagination, location etc. - while array and blob responses shall remain as is)
- catch early token errors (in the `catch`), like
  - invalid token responses
  - unilateral token expiry on the server side (DB change, migration, etc.)
  - an unrecoverable token error must trigger a forced logout
    (note: having logout as a route (`/logout`) is always a good idea)
  - create a common throwable error (from response,
    like `response.message`, `response.code` etc.) and then throw it, so that
    the saga catch can deal with it

## Calling api urls in a discoverable way

Since backend uses swagger to create documentation it was possible for us to parse the _openapi.json_ and generate (via scripts in _package.json_) a list of functions:

```ts
export const apiUrlDeleteDistributions = ({ distribution }) => `distributions/${distribution}`
export const apiUrlDeleteFollowsIds = ({ user }) => `follows-ids/${user}`
export const apiUrlGetCategoryFeed = ({ category }) => `category-feed/${category}`
export const apiUrlGetCountries = () => `countries`
export const apiUrlGetCountriesStates = ({ country }) => `countries/${country}/states`
// ...
```

- by generating individual functions, treeshaking may throw the unused ones out from the build
- parameter names are taken from _openapi.json_ unmodified (so while backend uses the `user`, we might use `{user: userId}` but I didn't want to write a map for that)
- any unused function will be highlighted by the IDE
- any url (from console) is immediately discoverable throughout the code (unlike string urls hardcoded)
- adding a `prettier-ignore-start` header to the file may be a good idea (though prettier ignored it)

## Swagger and generating metadata

Depending on how the backend uses swagger it's possible to extract metadata from _openapi.json_, why this didn't work for us?

- enums were missing from the docs (but that might have been our fault)
- access levels are not indicated in the json, meaning:
  - we have an elevation process (a user can upgrade his or her token and be granted admin, moderator or finance rights)
    there is no way to indicate certain properties are only valid for certain rights
  - logged in user may get a broader list of properties on an endpoint than a logged out one
  - the current user's "user object" has more information than other users' (but essentially they are the same object types)
