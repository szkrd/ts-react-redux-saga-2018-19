# Saga

## Yield return types

TS can't "return" types for interim yields, there are [hacks](https://github.com/redux-saga/redux-saga/issues/884) of course.

I usually use [JSDoc](https://jsdoc.app/tags-returns.html) to indicate a return type so that the IDE can help me.

```ts
/**
 * executes the get user saga, returns only the token string
 * @returns {string}
 */
export default function* getUserTokenSaga() {
  const user: CurrentUserState = yield getUserSaga()
  const token: string = user.token || ''
  return token
}
```

Using inline docs (`ctrl + Q`) in WebStorm:

![use jsdoc helpers](./images/webstorm-saga-yield-value.png)

## Selector types

Store selector paths through yield has no type information.

The IDE will show you proper types on hover, so it's easy to copy-paste that:

![copy paste select type](./images/webstorm-yield-select-type.png)
