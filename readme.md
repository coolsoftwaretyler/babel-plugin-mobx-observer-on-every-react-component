# babel-plugin-mobx-observer-on-every-react-component

## What does this Babel plugin do?

This plugin will wrap literally every React component in a [MobX observer](https://mobx.js.org/react-integration.html#react-integration) higher order component.

## Why would you want to do this?

When using [MobX](https://mobx.js.org/README.html), [MobX-State-Tree](https://mobx-state-tree.js.org/), or any other library in the MobX ecosystem, you may find yourself in one of two scenarios:

1. You sometimes waste a lot of time debugging why a component isn't updating even though you think it should, only to realize that you forgot to wrap a component in an observer.
2. You just really dislike the way it looks to import `observer` from `mobx-react` or `@observer` from `mobx-react-lite` in every single file and wrap your components. This is something that seems to [come up](https://github.com/mobxjs/mobx/discussions/2566) [again](https://github.com/mobxjs/mobx-react/issues/800) and [again](https://github.com/mobxjs/mobx-react/issues/786).

The typical recommendation from MobX is to just use the `@observer` decorator or the `observer` HOC and accept that you'll have to import it and use it in every file. This plugin doesn't actually change that requirement, it just makes it so that you don't have to manually do that. You may find value in this plugin if you either hate having to remember that, or if you just don't like the way it looks.

## What are the downsides of using this plugin?

1. This plugin is currently in early development, so there will probably be bugs. As more people try and adopt it, we will clean up whatever doesn't work. If we get enough adoption and stability, we will mark this library as v1 and remove this bullet point. But for now, use at your own risk!
1. If you're not already using [Babel](https://babeljs.io/), you'll have to add it to your tool chain.
1. It will make your Babel build take a little longer, although we can improve that over time with performance enhancements.
1. You may pick up some convenience, but it also adds a little [magic](https://en.wikipedia.org/wiki/Magic_(programming)#:~:text=In%20the%20context%20of%20computer,to%20present%20a%20simple%20interface.) to your project. You or your coworkers may sort of "forget" about the observer HOC and not realize that it's not actually being applied. That could lead to hard-to-debug issues in your own codebase, or just a general degradation of your own mental model of how your code works.

## Are there any runtime performance concerns?

Not that we have evidence for. The MobX docs specifically recommend [wrapping every component in an observer](https://mobx.js.org/react-integration.html#always-read-observables-inside-observer-components), saying:

> observer only enhances the component you are decorating, not the components called by it. So usually all your components should be wrapped by observer. Don't worry, this is not inefficient. On the contrary, more observer components make rendering more efficient as updates become more fine-grained.

We don't actually have benchmarks to share, so it's always possible there's some small cost, but it's likely to be negligible. If you disagree, send us some benchmarks and we'll update this section!

## Install

```bash
# npm
npm install --save-dev babel-plugin-mobx-observer-on-every-react-component
# yarn
yarn add --dev babel-plugin-mobx-observer-on-every-react-component
# pnpm
pnpm add --dev babel-plugin-mobx-observer-on-every-react-component
# bun
bun add --dev babel-plugin-mobx-observer-on-every-react-component
```

## Usage

Add the plugin to your `.babelrc` file:

```json
{
  "plugins": [
    ["babel-plugin-mobx-observer-on-every-react-component"]
  ]
}
```

If you prefer using a JavaScript configuration file, you can add the plugin to your `babel.config.js`:

```js
module.exports = function(api) {
  api.cache(true);

  return {
    plugins: [
      'babel-plugin-mobx-observer-on-every-react-component'
    ]
  };
};
```

### Options

You can pass an optional object to the plugin to configure the behavior of the plugin. Options look like this:

```ts
/**
 * Options for the plugin
 */
interface PluginOptions {
  // Default false, controls if we log debug statements during plugin execution. Mostly intended for plugin developers.
  debugEnabled?: boolean; 
}
```

#### More options on the way

Here are some options we'll eventually add:

1. Array of files to ignore
1. Some kind of pattern matching to ignore certain files
1. Allow transformation of node_modules (right now we have it hardcoded to skip node_modules)
1. We are open to suggestions! Please open an issue or discussion if you have ideas.

### Ignore files/lines

**Coming soon**: eventually we'll have a syntax to ignore entire files or lines of code if you prefer to opt-out of plugin transformation.

## Examples

### Local Example with Vite

```
cd example
bun install
bun dev
```

Then check out the Vite app that starts.

### Babel REPL

You can see the plugin in action with different starting points using the [Babel REPL](https://babeljs.io/repl#?browsers=defaults%2C%20not%20ie%2011%2C%20not%20ie_mob%2011&build=&builtIns=false&corejs=3.21&spec=false&loose=false&code_lz=PTAEDkHsBcEsGMCmoCG1TQBbOpADqALSgDuyKArrobALZ6QBO6kARgM6KMBuXoAZk1ABPSBQB0AKEkhQAFUyx2AigDt4cSKtJaA5OgDmidCUYo8eRABMANKHax1yWNF3KAVhXboUoRogMKABsURlBIIN0VdU1VSX41DVgtVCsrAAoUG1YASlAAb0lQP2MKRm1fAGpQVkkAX2lZBSVw1WQSWCCguwcnUBcS6DLVZQApAGUADXjE2NAAWWEAMVnk1RQggGFIei1EVWh0vMLi_yHy0HSi4tAAHitYbgA-AAlELsg7AElQeBRtNicHg4RSqAzsW7AB7Pa7FHL1RpgACCqisqAqjEYkBI0SSWgAXJJ4FpvAthEjMdjtrs2gdQABeS55elPO7Qp4UrE4wFcXiMACEkPZiNAAHVMGhUKwxD5cXNEAAPPD-dgOLREknoRYrGJrACiSpVau0jISupS2tWWgNysQqrWRwK1zOw0usLZjyeOrx2kVtvtWjsrCooFoKAA1s4WBxeYhBVDPe74Q0ZGBRUxw8oUvAQqrQFZEDnQmg1uwibnlItNhXqQxaehFdB9lZlAAlRAoDTiWt7OknEqoriO_unUoXdL3T3NZR_AEx4EYUHg-Ps-HFBop2QotFFvN-o2ljUjLXCasoVU9-s2sKM3eV081nZ1_bQa-gRvNtsdruXl9O0eDoww7ui646Ts806tMgs6oEE7CQOE858oujjgkKnprqAG4iqKiC6F0oBBB2vD9D4QR7KQ2BtMhogULB_goFYwigF4yA8sCjCEsSx6gEiQQMUxADySF2gyiFAny6SOiyHrPD8KC0PRHZMei4mxgK6HPJhNw6bpen6XpkhAA&debug=false&forceAllTransforms=false&modules=false&shippedProposals=false&evaluate=false&fileSize=false&timeTravel=false&sourceType=module&lineWrap=true&presets=env%2Creact%2Cstage-2&prettier=false&targets=&version=7.25.6&externalPlugins=babel-plugin-mobx-observer-on-every-react-component%40latest&assumptions=%7B%7D). This is also a great way to provide us with reproducible examples for bug reports.

## Contributing

We'd love to have any help. Please open an issue or discussion if you want to get started.

### Resources for Babel Plugin development

Here are some resources we've used to learn how to develop Babel plugins:

1. [Babel Plugin Handbook](https://github.com/jamiebuilds/babel-handbook/blob/master/translations/en/plugin-handbook.md)
1. [Build your own Babel plugin](https://www.learnwithjason.dev/build-your-own-babel-plugin/)

### Development environment

We use [Bun](https://bun.sh/) for package management, running tests, and building the project (sort of - we are actually using tsc under the hood with Bun as a task runner for this).

1. Clone the repo
2. Make sure you have the most recent version of Bun installed (check their website for instructions)
3. Install dependencies with `bun install`
4. Make sure tests are passing with `bun test`
5. Hop into the example folder and also install dependencies with `cd example && bun install`
6. Once in the example folder, you can run `bun dev` to start the dev server and see a [Vite](https://vitejs.dev/guide/) app that points to a local build of this package.
7. To update the build of this package that the example is pointing to, run `bun run build` in the root of the project and restart the dev server in the example folder.
8. To build your changes, run `bun run build` in the root of the project.