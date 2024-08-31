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
  describe("function expression", () => {
    describe("when it is not a React component", () => {
      test("it does nothing", () => {
        const source = `const MyFunctionExpression = function() { return 0 }`;
        const out = runTransform(source);

        expect(out.code).toMatchSnapshot();
      });
    });
    describe("when the component is already wrapped in observer", () => {
      test("it does nothing", () => {
        const source = `observer(function MyComponentExpression() { return <div>Hello World</div>; })`;
        const out = runTransform(source);

        expect(out.code).toMatchSnapshot();
      });
      describe("when the function is anonymous", () => {
        test("it does nothing", () => {
          const source = `const MyAnonymousObserver = observer(function() { return <div>Hello World</div>; })`;
          const out = runTransform(source);

          expect(out.code).toMatchSnapshot();
        });
      });
      describe("when the function is an arrow function", () => {
        test("it does nothing", () => {
          const source = `const MyArrowObserver = observer(() => <div>Hello World</div>)`;
          const out = runTransform(source);

          expect(out.code).toMatchSnapshot();
        });
      });
      describe("when the function is named", () => {
        test("it does nothing", () => {
          const source = `const MyNamedObserver = observer(function MyNamedFunction() { return <div>Hello World</div>; })`;
          const out = runTransform(source);

          expect(out.code).toMatchSnapshot();
        });
      });
    });
    describe("when the component is not wrapped in observer", () => {
      describe("when the function is anonymous", () => {
        test("it wraps the component in observer", () => {
          const source = `const MyAnonymousObserver = function() { return <div>Hello World</div>; }`;
          const out = runTransform(source);

          expect(out.code).toMatchSnapshot();
        });
      });

      describe("when the function is named", () => {
        test("it wraps the component in observer", () => {
          const source = `const MyNamedObserver = function MyNamedFunction() { return <div>Hello World</div>; }`;
          const out = runTransform(source);

          expect(out.code).toMatchSnapshot();
        });
      });
    });
  });
});
