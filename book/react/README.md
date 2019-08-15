# React

## Prop drilling

My greatest problem with the project I started working with was _"prop drilling"_ (letting props propagate down to their destination through a series of unrelated components). The layout was fairly conservative: top level components get their props from the store (through connect) and they pass down what's needed to where it's needed.

1. props sometimes travelled as deep as 5-6 levels
2. most of the time whole state objects were passed down
   - state objects (`this.props.state`) and `this.state` were terribly confusing
   - while these objects are comfortable with their clearly defined interfaces
     it was pretty hard to see the input and the output of components
   - tracking down event dispatches (via callbacks) and props were a real pain 

It was perfectly clear that prop drilling is painful and encapsulated prop packages are a pain.

## Presentational and container components?

The react community fairly early on realized that something needs to be done. [Abramov's article](https://medium.com/@dan_abramov/smart-and-dumb-components-7ca2f9a7c7d0) tried to elaborate on the dumb and connected component ideas.

Since our connectors happened to be (conservatively enough) on the topmost levels (apart from a small minority of components) it was rather easy to split them into containers and components.

1. this made the project much easier to navigate
2. using "connect" (especially with ownProps) with typescript is a real pain:
   the amount of code a connector requires is truly terrifying
3. splitting the project to containers and components seemed at times rather "unintuitive"
   and refactoring a component to a container or vice versa became rather dreadful.

## Composition and context?

Context ended up something rather cumbersome - even a [single value](https://reactjs.org/docs/context.html#when-to-use-context) context felt out of place: we had a way of avoiding prop drilling, yet it was so uncomfortable, that using it for more than a single property was out of the question.

The react documentation proposes [composition](https://reactjs.org/docs/composition-vs-inheritance.html) for these scenarios, but trying to compose components deeper than a single level is a real mess (messy cart before a sad horse). 

## Hybrid approach to avoid prop drilling

In the end what helped (somewhat) was a mixed approach with a bit of a laissez faires attitude:

1. I simplified the `connect` process with a connect helper (see the [redux](../redux/README.md) section)
2. I Created a simple `dispatcher` and `subscriber` hook through a single channel dedicated event bus
   (now possible with Redux [since version 7.1](https://react-redux.js.org/next/api/hooks))
3. Allowed ad-hoc connections:
   - no more container vs component distinction
   - if a connection is complicated it may go next to the original component: _Foo.tsx_ and _ConnectedFoo.tsx_
   - simple connections may be done at the end of a file: `export default Foo`, `export const ConnectedFoo = ...`

## Component hierarchy

With mixing components and containers we followed these rules:

1. reusable/dumb/presentational (and effectively _reused_) components should go the top of the component directory
2. non reusable components (connected or using subscribe/dispatch) should be under their parent component's folder
3. logical grouping components into subfolders is rare, but allowed (for example the "buy product" flow contained 5
   "pages", so they ended up under _buyProduct_)
4. follow the _foo.scss_ + _Foo.tsx_ naming convention
5. if a component has a top level element then it should have a dash cased class name: _FooBarPage.tsx_ = `foo-bar-page`
6. connectors may happen inside the end of a file or in another file (_ConnectedFoo.tsx_)
7. connectors should avoid using ownProps (unfortunately this is kinda hard to do nicely)
8. connectors may prep props freely and if they feel necessary, they can return null (avoid rendering the encapsulated component) - yes, if a component doesn't exist, then it should not be "alive" (even if it is a connector), but sometimes this really made life easier
9. avoid anon functions (even with the connector HOC)
10. top level routed item must end with the _Page_ suffix, an app level modal should end with the _Modal_ suffix
11. do try to use unique component names to help navigating inside the code (do NOT abbreviate, if a component name is long, then so be it)
12. components must always be inside their folder on the top level, below that they may be next to their parent 

### Example

```text
📁 src
  📁 components
    📁 aboutUsModal ◁────────────────── a modal that appears in App.tsx
      📄 aboutUsModal.scss
      📄 AboutUsModal.tsx ◁──────────── top level className is "about-us-modal"
      📄 ConnectedAboutUsModal.tsx ◁─── external connector 
    📁 button ◁──────────────────────── a component clearly intended for reuse
      📄 button.scss
      📄 Button.tsx
    📁 buyCredits ◁──────────────────── logical grouping of pages (rare)
      📁 buyCreditsBillingPage
      📁 buyCreditsCongratsPage
      📁 buyCreditsProductSelectorPage
      📁 buyCreditsSummaryPage
    📁 channelPage ◁─────────────────── highly complex page with lots of components
      📁 channelCoverImageModal ◁────── this modal appears only here, on the channel page
      📁 channelPasswordModal
      📁 channelCoverImageModal
      📁 channelDonatePanel
      📁 channelImagesHeader
      📁 channelTab ◁────────────────── has 4 sub components and a standalone connector
      📁 channelUserInfo ◁───────────── lots of components in max 3 depth
      📄 channelPage.scss
      📄 ChannelPage.tsx ◁───────────── simplified connector is in the end of the file
    📁 creditsHistoryPage
      📁 historyDatePicker
      📁 historyTable
      📄 creditsHistoryPage.scss
      📄 CreditsHistoryPage.tsx ◁────── has an internal connector: `export const ConnectedHistoryPage = autoConnect(...`
    📁 icon ◁────────────────────────── another common reusable (dumb) component
    📁 loader
    📄 app.scss
    📄 App.tsx ◁─────────────────────── the top level application
    📄 routes.ts ◁───────────────────── list of routes in a highly visible place
```

## Higher order components (HOCs)

I don't really like HOCs: I find them unintuitive and in the react debugger they really mess up the component hierarchy.

They seemed to be an early silver bullet for code reuse and composition, but I find them superseded by the [hook system](https://reactjs.org/docs/hooks-intro.html) and I try to avoid them if possible.

## React Router

I really am not a great fan of React Router's wrapper/HOC approach, because it's awfully hard to find components that react to route changes.

It's very easy to have route strings scattered around the application, which seems to be a bad idea.

- move all top level routes (for page level components) into a dedicated file, like _routes.ts_
- create a ts or json file with all the routes, use a `getRoute` function to "use" these routes and __never__ hardcode route urls as strings
- try to avoid nested routes (see below)

```ts
export const reactRouterRoutes = {
  payoutUrl: '/payout',
  payoutWithUserUrl: '/payout/:userId',
  adminExportsUrl: '/admin/exports',
  adminExportsDownloadUrl: '/admin/exports/:name/download',
  buyCreditsUrl: '/buy-credits',
  // ...
}
```

Our `getRoute` function had a key param (`key: keyof typeof reactRouterRoutes`) and arbitrary number of params for the routes themselves (`...routeParams: (string | number)[]`), for example to replace ":userId" in "/payout/:userId" (remove the placeholder in case nothing given, replace double slashes with single ones). Probably using named routes would be nicer.

### Child routes (aka. nested routes)

As far as I know, React Router [has no inherent nested route support](https://stackoverflow.com/questions/41474134/nested-routes-with-react-router-v4-v5#comment78351524_43311025), this means various components can react to route changes and act as child routes, but the whole render cycle will be triggered on every history state change (pathname, hash, search, state etc.). The solutions we tried:

1. detect rerenders triggered by route changes and stop component update with `shouldComponentUpdate` (functional components would require the `React.memo` memoization wrapper though, which makes things even more complicated than they should be).
2. ditch nested routes, just reload/rerender the whole page component. This seemed to be the easiest thing to do and only a couple of pages suffered. I'm strongly against client app level cache logic, so it probably depends on how fast the data retrieval can be in the "parent" component.
3. allow visual rerenders, but use the stale data in the store for the parent
   - this way the vdom differ can still skip rerendering.
   - with `/foo/1/bar` and `/foo/1/qux` "1" is an id: the parent has to check if this id is in the store and stop asking for fresh data in its mount event (skip dispatch if storeUserId === routeUserId). While I did this checking in the component, it can also be done in the saga - but this of course eerily "resembles" cache-ing.
   - while on paper this sounds simple, in reality this adds substantial complexity to an already complex parent/page component.

### Redirection

We use [history](https://www.npmjs.com/package/history) for all programmatic navigation and react router's [Link](https://reacttraining.com/react-router/web/api/Link) tag. While there is a [Redirect](https://reacttraining.com/react-router/web/api/Redirect) tag, having a component with no "visible" output (just a huge side effect), feels kinda wrong, but that's how it is.

### History, history states

Always use the `history` package (or `Link` from React Router) to access, redirect, replace urls and their states.

For long flows (onboarding, product purchase) it's possible to pass history states through the "url" (html5 history states are invisible, though they will persist with page reloads). Passing this way is pretty much the same as using query params (location.search) or a custom hashBang format, but it's nicer with lots of fields.

I implemented a shadow history that piggybacked on `history` (the package) event hooks, stored the last 10 steps and it was possible to look up referrers, last state params etc. The problem with this approach is that if the user long presses the back or forward buttons, it's possible to jump multiple steps in the history - and detecting this would be a major pain.

Passing along the parameters _is_ painful, but at least it's predictable. Since we had no store persistance (syncing the redux store to session storage for example), wa had to put them "somewhere" and a shadow history seemed brittle and confusing. 

## Event emitter

Redux is a variation on the event command pattern and an event bus would muddle this holy source of truth - though if implemented carefully, it still is rather useful.

One can use nodejs' [EventEmitter class](https://nodejs.org/api/events.html#events_class_eventemitter), since webpack makes them available.

We used the event bus for simple fire and forget events:

- force update the UI (because of a safari render bug)
- trigger a _validation done_ event, so that a subscriber can scroll to the offending form fields
- signal the global, unique and single video player to stop (and later on to continue) if a very important happened (in our case a user donated money and a thank you modal had to be shown)

And that's ("mostly") it. We exported an enum for these events, so they remained trackable throughout the app.

## Hooks

- react hooks are a godsend in terms of code reusability
- `componentDidMount` can _roughly_ be translated to `useEffect(fn, [])` (the empty array is the dependency list)
- I find components with more than 3 or 4 useState "pairs" hard to grok and brittle
- classes became [second class citizens](https://reactjs.org/docs/hooks-intro.html#classes-confuse-both-people-and-machines) in the react world and I'm not sure if I like this (on the other hand ui components with class based inheritance is a huge no-no)
- react component lifecycle did not support a mixin system (like [Vue did](https://vuejs.org/v2/guide/mixins.html)), hooks do help tremendously
- as a rule of thumb I **avoid** rewriting classes that have "exotic" lifecycle trickery or a complicated internal state - componentDidMount, componentWillUnmount and event callbacks are fine

## BEM naming

[BEM](http://getbem.com/introduction/) is a popular way of writing (trying to write) reusable components, but writing pure and proper BEM is a real pain, finding a balance between BEM correctness and ease of use is not that easy:

1. use one or two levels for elements and not more; sometimes I use single level only (`video__controls` and `video__player` are both at level one, even though `controls` are inside the `player` section, so `video__player__controls` would be the other option).
2. use `className` component props as a last resort style override
3. use `theme` props (`theme: type 'foo' | 'bar' | 'baz'`) instead of overriding child elements' css from a parent
4. don't be afraid to use mixins (we have _layoutMixins, responsiveMixins, textMixins` etc.), gzipped rendered css will reduce code duplication and it's a smaller price than messing up everything with extends (try debug that in the inspector)
5. but component props are much easier to graps than mixins. I get proper code completion for react component props, but not for scss mixin named params for example.
