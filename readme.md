# babel-plugin-mobx-observer-on-every-react-component

Wrap literally every React component in an MobX observer higher order component.

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

## Run the example

```
cd example
bun install
bun dev
```

Then check out the Vite app that starts.

## License

MIT