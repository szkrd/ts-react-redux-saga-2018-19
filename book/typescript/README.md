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

## Where to put metadata

Pure typescript metadata (interfaces, enums, types) may be connected to certain functions (like a `UserStore` type to a reducer), in that case we decided to put the metadata next to the code, this is simple.

Where to put metadata that is repeated throughout the code? Honestly, _I don't know_.

In typescript enums, const enums, constants, classes, interfaces and types usually overlap somewhat...
even models are not that simple, since we have ApiModels (like `ApiUser`) and frontend models (like `User`).

All I can say is that if you keep the code **discoverable** then at least you can always find these files, no matter where they are.

In the end we had _constants_, _enums_, _models_ for these things. It was not perfect, but it did not hurt enough to come up with something better.

## Classes vs. Interfaces

Typescript differentiates through shapes only (unlike a "real" language), so an _interface_ with `A: string`, `B: string`, `C: string` will be the "same" as a _class_ with the same A, B and C properties for typescript's compiler.

This means that where one would use an interface it's possible to use a class, which is much more flexible (except for "mixing" items, since TS doesn't have multiple inheritance):

- a class can immediately be instanciated (no need to write an interface and a default object (as `INITIAL_STATE`) for a reducer)
- classes can have a default value AND a type definition
- classes can have implicit types (`name = ''`)
- classes can have visibility (_private_ and _protected_ props)
- classes can have static methods

While I'm not a fan of huge, single instance classes (file contains `class FooBar`, exports `new FooBar()`), using _private_ and _protected_ immediately tells the developer that a method is not meant to be called externally. I know, this is pretty easy to achieve with closures, but one _may_ decide to go for the expressive power of these keywords.

I usually keep these "interface-like" classes as simple as possible (no constructor, no methods, just metadata and default values) - especially with reducer stores, where one would never expect a function property (keeping your redux store serializable is always a good thing). But then one wonders, where lies the boundary between JS objects, JS "classes", TS classes and TS interfaces - who knows?
