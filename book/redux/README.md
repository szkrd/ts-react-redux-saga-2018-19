# Redux

## Payloads, actions, actionCreators

Writing actions with TS is a major pain. We decided to keep the **action name** + **payload interface** + **action interface** + **action creator** "packs" together (most tutorials keep them separated in groups by type):

```ts
// getChannelPage action
// ---------------------

export const GET_CHANNEL_PAGE = 'channel/GET_CHANNEL_PAGE'

export interface IGetChannelPagePayload {
  userId: string
}

export interface GetChannelPageAction {
  type: typeof GET_CHANNEL_PAGE
  payload: IGetChannelPagePayload
}

export const getChannelPageActionCreator = (
  payload: IGetChannelPagePayload
): GetChannelPageAction => ({ type: GET_CHANNEL_PAGE, payload })
```

- see how the `typeof` (TS) operator helps
- the action's name is not just a string, but a constant
- action creators are easier to use both in sagas and in components (containers), than dispatching a payload and and an event name (action type, in redux terms) 

## IDE help for writing actions

Writing an **action name** + **payload interface** + **action interface** + **action creator** "pack" is painful, but most of it can be automated with snippets (live templates in WebStorm):

### actionvoid (action without payload)

```text
// $NAME$ action
// -------------------------------
export const $NAME_SCREAMINGSNAKE$ = '$PATH$$NAME_SCREAMINGSNAKE$'
export interface $NAME_PASCAL$Action {
    type: typeof $NAME_SCREAMINGSNAKE$
}
export const $NAME$Action$CREATOR$ =
    (): $NAME_PASCAL$Action => ({ type: $NAME_SCREAMINGSNAKE$ })
```

| Name                | Expression                    | Default value | Skip if defined |
|---------------------|-------------------------------|---------------|-----------------|
| NAME                |                               | "fooBar"      | [ ]             |
| PATH                |                               |               | [ ]             |
| NAME_PASCAL         | capitalize(NAME)              |               | [x]             |
| NAME_SCREAMINGSNAKE | capitalizeAndUnderscore(NAME) |               | [x]             |
| CREATOR             |                               | "Creator"     | [ ]             |

### actionpay (action with payload)

```text
// $NAME$ action
// -------------------------------
export const $NAME_SCREAMINGSNAKE$ = '$PATH$$NAME_SCREAMINGSNAKE$'
export interface $PAYLOAD$ {
    $PAYLOAD_EXAMPLE$
}
export interface $NAME_PASCAL$Action {
    type: typeof $NAME_SCREAMINGSNAKE$
    payload: $PAYLOAD$
}
export const $NAME$Action$CREATOR$ =
    (payload: $PAYLOAD$): $NAME_PASCAL$Action => ({ type: $NAME_SCREAMINGSNAKE$, payload })
```

| Name                | Expression                             | Default value | Skip if defined |
|---------------------|----------------------------------------|---------------|-----------------|
| NAME                |                                        | "fooBar"      | [ ]             |
| PATH                |                                        | "Qux/"        | [ ]             |
| CREATOR             |                                        | "Creator"     | [ ]             |
| PAYLOAD             | concat("I",capitalize(NAME),"Payload") |               | [x]             |
| NAME_PASCAL         | capitalize(NAME)                       |               | [x]             |
| NAME_SCREAMINGSNAKE | capitalizeAndUnderscore(NAME)          |               | [x]             |
| PAYLOAD_EXAMPLE     |                                        | "baz: string" | [ ]             |

## Exported action types

At the end of the file we export the list of actions:

```ts
export type TChannelPageActions =
  | GetChannelPageAction
  | LeaveChannelPageAction
  | ...
```

You can add "other" actions (from other stores) here, but probably it's better to use them in the reducer with the type parameter:

```ts
const channelPageReducer: Reducer<ChannelPageState> = (
  state = INITIAL_STATE,
  action: TChannelPageActions | TVideoPageActions
): ChannelPageState => {
```

## Reducer switch-case

Context in switch case structures is tricky, we prefer plain old conditionals, where the variable scope is clear and there is no fallthrough:

```ts
if (action.type === CHANNEL_PAGE_DONATE_SUCCESS) {
  const { isOwnPage, creditsRaised } = state
  const { amount } = action.payload
  if (isOwnPage) {
    return state
  }
  return {
    ...state,
    creditsRaised: creditsRaised + amount * DONATION_MULTIPLIER
  }
}
```

In this example the `amount` variable is tied to the conditional's block scope (with switch case it would be on the level of the enclosing switch).

## Initial state

Using a `class` type to define a store's initial state makes life easier, since we won't need another interface for the structure definition:

```ts
class IPlayerState {
  distributionId?: string = ''
  source?: string = ''
  videoId?: string = ''
  fatalError?: boolean = false
}

const INITIAL_STATE = new IPlayerState()

const playerReducer: Reducer<IPlayerState> = (
  state: IPlayerState = INITIAL_STATE,
  action: TPlayerAction | TVideoPageAction | TFeedAction
): IPlayerState => {
```

## Reducer usage

Redux will "run" all the reducers, so if you place anything above the switch/case (or the first conditional) block that will **always** be executed.

It's very easy to do an `action.payload.foobar` check, which in turn will break (unless all your actions throughout the app has a foobar payload item, but I doubt that).

```ts
const creditsReducer: Reducer<ICreditsState> = (
  state: ICreditsState = INITIAL_STATE,
  action: TCreditsAction
): ICreditsState => {

  // DANGER ZONE
  // don't try to do anything clever here
  
  switch (action.type) {
    case GET_USER_REQUEST:
```

## Flushing all the stores

On logout you probably want to reset the full store. Listening to a LOGOUT event in every reducer is [not needed](https://twitter.com/dan_abramov/status/703035591831773184):

```ts
const reducer = (state: IState, action) => {
  if (action.type === LOGOUT_FINISHED) {
    state = undefined
  }
}

export default reducer
```

## Simpler connect

🚧 TODO: autoconnect

## Dispatch events, subscribe to values

🚧 TODO: hook implementation

🚧 TODO: example
