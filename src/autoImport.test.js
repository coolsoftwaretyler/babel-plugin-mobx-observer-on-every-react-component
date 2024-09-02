import { expect, test, describe } from "bun:test";
import { transform } from "@babel/core";
import pluginSyntaxJsx from "@babel/plugin-syntax-jsx";
import pluginTransReactJsx from "@babel/plugin-transform-react-jsx";
import autoObserverPlugin from "./index.ts";

const runTransform = (input) => {
  return transform(input, {
    plugins: [pluginSyntaxJsx, pluginTransReactJsx, autoObserverPlugin],
  });
};

describe("Mobx Observer Babel Plugin", () => {
  describe("observer imports", () => {
    describe("when there is no observer import", () => {
      describe("and no react components", () => {
        test("it does nothing", () => {
          const source = `function MyFunctionDeclaration() { return 0 }`;
          const out = runTransform(source);

          expect(out.code).toMatchSnapshot();
        });
      });
      describe("and there are react components", () => {
        test("it adds an observer import", () => {
          const source = `function MyComponentDeclaration() { return <div>Hello World</div>; }`;
          const out = runTransform(source);

          expect(out.code).toMatchSnapshot();
        });
      });
      describe('and we have other imports from mobx-react', () => {
        test('it adds the observer import', () => {
          const source = `import { inject } from "mobx-react"; function MyComponentDeclaration() { return <div>Hello World</div>; }`;
          const out = runTransform(source);

          expect(out.code).toMatchSnapshot();
        })
      })
    });
    describe("when there is already an observer import", () => {
      describe("and no react components", () => {
        test("it does nothing", () => {
          const source = `import { observer } from "mobx-react"; function MyFunctionDeclaration() { return 0 }`;
          const out = runTransform(source);

          expect(out.code).toMatchSnapshot();
        });
      });
      describe("and react components but unwrapped", () => {
        test("it does not add the import, but wraps the component", () => {
          const source = `import { observer } from "mobx-react"; function MyComponentDeclaration() { return <div>Hello World</div>; }`;
          const out = runTransform(source);

          expect(out.code).toMatchSnapshot();
        });
      });
      describe("and react components wrapped", () => {
        test("it takes no action", () => {
            const source = `import { observer } from "mobx-react"; function MyComponentDeclaration() { return <div>Hello World</div>; }`;
            const out = runTransform(source);
    
            expect(out.code).toMatchSnapshot();
        })
      })
      describe('and we have other imports from mobx-react', () => {
        test('it does not add the observer import', () => {
          const source = `import { observer, inject } from "mobx-react"; function MyComponentDeclaration() { return <div>Hello World</div>; }`;
          const out = runTransform(source);

          expect(out.code).toMatchSnapshot();
        })
      })
    });
  });
});
