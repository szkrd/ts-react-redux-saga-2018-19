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

🚧 TODO: ...mixing logic with presentation

🚧 TODO: child routes

🚧 TODO: redirection

## History

🚧 TODO: Link vs browserHistory push

## Shadow history

🚧 TODO: don't

🚧 TODO: do use history state

## Event emitter

🚧 TODO: command pattern vs redux vs event bus

## Hooks

- react hooks are a godsend in terms of code reusability
- `componentDidMount` can _roughly_ be translated to `useEffect(fn, [])` (the empty array is the dependency list)
- I find components with more than 3 or 4 variables hard to grok and brittle
- classes became [second class citizens](https://reactjs.org/docs/hooks-intro.html#classes-confuse-both-people-and-machines) in the react world and I'm not sure if I like this (on the other hand ui components with class based inheritance is a huge no-no)
- react component lifecycle did not support a mixin system (like [Vue did](https://vuejs.org/v2/guide/mixins.html)), hooks do help tremendously
- as a rule of thumb I **avoid** rewriting classes that have "exotic" lifecycle trickery or a complicated internal state - componentDidMount, componentWillUnmount and event callbacks are fine

## BEM naming

🚧 TODO: BEM levels and nesting

🚧 TODO: className props
