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

## Examples

### Local Example with Vite

```
cd example
bun install
bun dev
```

Then check out the Vite app that starts.

### Check it out in the Babel REPL

[Babel REPL](https://babeljs.io/repl#?browsers=defaults%2C%20not%20ie%2011%2C%20not%20ie_mob%2011&build=&builtIns=false&corejs=3.21&spec=false&loose=false&code_lz=PTAEDkHsBcEsGMCmoCG1TQBbOpADqALSgDuyKArrobALZ6QBO6kARgM6KMBuXoAZk1ABPSBQB0AKEkhQAFUyx2AigDt4cSKtJaA5OgDmidCUYo8eRABMANKHax1yWNF3KAVhXboUoRogMKABsURlBIIN0VdU1VSX41DVgtVCsrAAoUG1YASlAAb0lQP2MKRm1fAGpQVkkAX2lZBSVw1WQSWCCguwcnUBcS6DLVZQApAGUADXjE2NAAWWEAMVnk1RQggGFIei1EVWh0vMLi_yHy0HSi4tAAHitYbgA-AAlELsg7AElQeBRtNicHg4RSqAzsW7AB7Pa7FHL1RpgACCqisqAqjEYkBI0SSWgAXJJ4FpvAthEjMdjtrs2gdQABeS55elPO7Qp4UrE4wFcXiMACEkPZiNAAHVMGhUKwxD5cXNEAAPPD-dgOLREknoRYrGJrACiSpVau0jISupS2tWWgNysQqrWRwK1zOw0usLZjyeOrx2kVtvtWjsrCooFoKAA1s4WBxeYhBVDPe74Q0ZGBRUxw8oUvAQqrQFZEDnQmg1uwibnlItNhXqQxaehFdB9lZlAAlRAoDTiWt7OknEqoriO_unUoXdL3T3NZR_AEx4EYUHg-Ps-HFBop2QotFFvN-o2ljUjLXCasoVU9-s2sKM3eV081nZ1_bQa-gRvNtsdruXl9O0eDoww7ui646Ts806tMgs6oEE7CQOE858oujjgkKnprqAG4iqKiC6F0oBBB2vD9D4QR7KQ2BtMhogULB_goFYwigF4yA8sCjCEsSx6gEiQQMUxADySF2gyiFAny6SOiyHrPD8KC0PRHZMei4mxgK6HPJhNw6bpen6XpkhAA&debug=false&forceAllTransforms=false&modules=false&shippedProposals=false&evaluate=false&fileSize=false&timeTravel=false&sourceType=module&lineWrap=true&presets=env%2Creact%2Cstage-2&prettier=false&targets=&version=7.25.6&externalPlugins=babel-plugin-mobx-observer-on-every-react-component%40latest&assumptions=%7B%7D)