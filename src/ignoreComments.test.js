import { expect, test, describe } from "bun:test";
import { transform } from "@babel/core";
import pluginSyntaxJsx from "@babel/plugin-syntax-jsx";
import pluginTransReactJsx from "@babel/plugin-transform-react-jsx";
import pluginSyntaxDecorators from "@babel/plugin-syntax-decorators";
import pluginSyntaxDecoratorsLegacy from "@babel/plugin-proposal-decorators";
import autoObserverPlugin from "./index.ts";

const runTransform = (input) => {
    return transform(input, {
        plugins: [pluginSyntaxJsx, pluginTransReactJsx, [pluginSyntaxDecorators, { version: "2018-09", decoratorsBeforeExport: false }], autoObserverPlugin],
    });
};

const runTransformLegacy = (input) => {
    return transform(input, {
        plugins: [pluginSyntaxJsx, pluginTransReactJsx, [pluginSyntaxDecoratorsLegacy, { legacy: true }], autoObserverPlugin],
    });
};

describe("Mobx Observer Babel Plugin", () => {
    describe("ignoreComments", () => {
        describe("when the comment is to ignore the full file", () => {
            test("ignores everything in the file", () => {
                const source = `
          // @auto-observer-ignore-file
          class MyComponentClassDeclaration { render() { return <div>Hello World</div>; } }
          const MyArrowObserver = () => <div>Hello World</div>
          const MyComponentClassExpression = class MyComponent { render() { return <div>Hello World</div>; } }
          function MyComponentDeclaration() { return <div>Hello World</div>; }
          const MyComponentExpression = function MyComponentExpression() { return <div>Hello World</div>; }
          `;
                const out = runTransform(source);

                expect(out.code).toMatchSnapshot();
            });
        });
        describe("when the comment is to ignore a specific block", () => {
            test("ignores the specific block", () => {
                const source = `
        // @auto-observer-ignore-block
        class MyComponentClassDeclaration { render() { return <div>Hello World</div>; } }
        const MyArrowObserver = () => <div>Hello World</div>
        const MyComponentClassExpression = class MyComponent { render() { return <div>Hello World</div>; } }
        function MyComponentDeclaration() { return <div>Hello World</div>; }
        const MyComponentExpression = function MyComponentExpression() { return <div>Hello World</div>; }
        `;
                const out = runTransform(source);

                expect(out.code).toMatchSnapshot();
            });
        });
    });
});
