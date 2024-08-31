import { expect, test, describe} from "bun:test";
import { transform } from "@babel/core";
import pluginSyntaxJsx from "@babel/plugin-syntax-jsx";
import pluginTransReactJsx from "@babel/plugin-transform-react-jsx";
import { autoObserverPlugin } from "./index.mjs";

const runTransform = (input) => {
  return transform(input, {
    plugins: [pluginSyntaxJsx, pluginTransReactJsx, autoObserverPlugin],
  });
};

describe("Mobx Observer Babel Plugin", () => {
  describe("function declaration", () => {
    describe("when it is not a React component", () => {
      test("it does nothing", () => {
        const source = `function MyFunctionDeclaration() { return 0 }`;
        const out = runTransform(source);

        expect(out.code).toMatchSnapshot();
      });
    });
    describe("when it is a React component", () => {
      describe("when it is not wrapped in observer", () => {
        test("it wraps the component in observer", () => {
          const source = `function MyComponentDeclaration() { return <div>Hello World</div>; }`;
          const out = runTransform(source);

          expect(out.code).toMatchSnapshot();
        });
      });
    });
  });
});
