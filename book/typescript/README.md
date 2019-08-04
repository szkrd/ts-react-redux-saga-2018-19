# Typescript

## Typescript is not javascript

> “Any fool can write code that a computer can understand.  
> Good programmers write code that humans can understand.”  
> _Martin Fowler_ 

Before I started working on this project, I thought that you can just add typescript to a javascript project and then sooner or later you will have a typescript project. Unfortunately writing typescript requires a rather different mindset than writing javascript.

1. Write boring code. No magic.
2. Think like the typescript compiler.
   Know when type hinting is needed and when it isn't.
3. Think like your IDE: code discoverability and usage detection is a life saver (and great help for refactoring).
4. Avoid typecasting (`as Foobar`) and `any` - they will mess up dependency detection real bad.
5. Use the TS builtin `keyof` and `typeof`. TS typeof is NOT the same as JS typeof! 

## Libraries without typescript definitions

You can fallback to the [Definitely Typed](http://definitelytyped.org/) site to add extra type definitions, BUT there is no guarantee that the 3rd party types will be in sync with the library you are using!

In fact I rarely managed to find a `@types` definition that had the same version as the library I tried to use it with.

It is better to copy-paste JS code from Stackoverflow and rewrite it to TS, than installing a dependency without its very own type definition.

## Using objectGet, pick and similar helpers

Don't. TS 3.7 [might support](https://github.com/microsoft/TypeScript/issues/16) the "elvis operator" (aka. safe navigation, null coalescence).

```ts
const x = { y: { z: null, q: undefined } };
console.log(x?.y?.z?.foo);
```

Until then... I don't know. `Object.get`, `_.get`, `oGet`, `objectGet` and others will break code discoverability.

If `X` interface has A, B, C props and `Y` interface has A and B then even if you write a `pick` function with proper type hinting, picking A & B from `X` will **not** magically convert it to interface `Y`.

If you want to pick interface properties to create a type, you can use the [Pick utility-type](https://www.typescriptlang.org/docs/handbook/utility-types.html#picktk) but probably that's not what you are looking for.
