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
  describe("class declarations", () => {
    describe("when it is not a React component", () => {
      test("it does nothing", () => {
        const source = `class MyComponentClass {}`;
        const out = runTransform(source);

        expect(out.code).toMatchSnapshot();
      });
    });
    describe("when it is a React component", () => {
      describe("and it is already wrapped in observer", () => {
        test("it does nothing", () => {
          const source = `observer(class MyComponent { render() { return <div>Hello World</div>; } })`;
          const out = runTransform(source);

          expect(out.code).toMatchSnapshot();
        });
      });
      describe('and it is decorated with @observer', () => {
        describe('modern', () => {
          test('it does nothing', () => {
            const source = `@observer class MyComponent { render() { return <div>Hello World</div>; } }`;
            const out = runTransform(source);

            console.log(out.code);

            expect(out.code).toMatchSnapshot();
          });
        })
        
        describe('legacy', () => {
          test('it does nothing', () => {
            const source = `@observer class MyComponent { render() { return <div>Hello World</div>; } }`;
            const out = runTransformLegacy(source);

            expect(out.code).toMatchSnapshot();
          });
        });
      });
      describe("and it is not wrapped in observer", () => {
        test("it wraps the component in observer", () => {
          const source = `class MyComponent { render() { return <div>Hello World</div>; } }`;
          const out = runTransform(source);

          expect(out.code).toMatchSnapshot();
        });
      });
    });
  });
});
