# Debugging

## Logging

- always have loggers that can be turned on for every environment (even for production)
- use localstorage flags to enable individual loggers
- currently I use [loglevel](https://www.npmjs.com/package/loglevel) for setting the default loglevel in production to error only (still overridable with an ls flag)
- every log group has a unique icon or emoji (this really helps for filtering)
- I have a `/debug` route, where one can enable the various loggers:
  - LogRemote: _forward loglevel logs to remote debug listener_ (see below)
  - LogRedux: ♻ _log redux actions_ (before and payload)
  - LogAxios: 🖥 _log axios xhttp requests_ (with interceptor for up ↗ and down ↘)
  - LogEventBus: 🚌 _log event bus events_
  - LogHlsjs: 📹 _log hlsjs messages_
  - LogSocketIo: 🔌 _log socket.io events_ (with JSON parsing, which really help as opposed to using the vanilla view in the dev toolbar)
  - LogTimeStamp: _enable timestamp prefixes_ (this can be force enabled in the dev toolbar, but if you are redirecting logs for debugging, this can help)
  - LogLevel: _set loglevel verbosity to maximum (zero for info)_

## Testing on mobile

- [BrowserStack](https://www.browserstack.com/) is a tremendous help and a major pain in the back
- testing "ios stuff" from Windows is terrible, the most reliable way we've found was using [dnsmasq](https://wiki.debian.org/HowTo/dnsmasq) (one of our many docker containers), so the `foobar.host` would resolve as the developer's IP address.
- connecting an android phone on Windows (using Chrome) is a no brainer

### Remote logging

I wrote a tiny listener in node (port 80) which we could use to "insert" a "debug image" in the web app:

```typescript
const img = new Image()
// set uid and payload ...
img.src = `${REMOTE_DEBUG_URL}/${uid}.png?p=${payload}`
```

This passes the JSON stringified parameter from the client (from any domain, though sending full stores can not be done this way, the GET url size has a limit) and the live debug server can just print out the reformatted json to the terminal.

I admit I've only needed this method for a couple of times, mostly when BrowserStack did not help and I needed physical access to the iOS browser (like testing the custom video player).
