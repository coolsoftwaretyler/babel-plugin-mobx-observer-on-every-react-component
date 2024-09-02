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
  describe("arrow function expression", () => {
    describe("when the function is not a react component", () => {
      test("it does not wrap the component in observer", () => {
        const source = `const MyArrow = () => 0`;
        const out = runTransform(source);

        expect(out.code).toMatchSnapshot();
      });
    });
    describe("when the function is already wrapped", () => {
      test("it does not wrap the component in observer", () => {
        const source = `const MyArrowObserver = observer(() => <div>Hello World</div>)`;
        const out = runTransform(source);

        expect(out.code).toMatchSnapshot();
      });
    });
    describe("when the function is not already wrapped", () => {
      test("it wraps the component in observer", () => {
        const source = `const MyArrowObserver = () => <div>Hello World</div>`;
        const out = runTransform(source);

        expect(out.code).toMatchSnapshot();
      });
    });
  });
});
