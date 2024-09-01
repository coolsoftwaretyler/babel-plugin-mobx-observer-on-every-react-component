import { expect, test, describe } from "bun:test";
import { transform } from "@babel/core";
import pluginSyntaxJsx from "@babel/plugin-syntax-jsx";
import pluginTransReactJsx from "@babel/plugin-transform-react-jsx";
import pluginSyntaxDecoratorsLegacy from "@babel/plugin-proposal-decorators";
import { autoObserverPlugin } from "./index.mjs";

const runTransformLegacy = (input) => {
    return transform(input, {
        plugins: [pluginSyntaxJsx, pluginTransReactJsx, [pluginSyntaxDecoratorsLegacy, { legacy: true }], autoObserverPlugin],
    });
};

describe("Mobx Observer Babel Plugin", () => {
    describe('legacy decorators', () => {
        test('do not get double wrapped', () => {
            const { code } = runTransformLegacy(`var _class;
let MyComponent = observer(_class = class MyComponent {
  render() {
    return /*#__PURE__*/React.createElement("div", null, "Hello World");
  }
}) || _class;`)
            expect(code).toMatchSnapshot()
        })

    })
});



