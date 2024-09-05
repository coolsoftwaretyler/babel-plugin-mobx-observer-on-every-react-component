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
    describe("function expression default export", () => {
        test("it wraps the component in observer", () => {
            const source = `
      
      import React from 'react';

function FunctionDeclaration() {
  return (
    <div>
      <h1>Function Declaration Component</h1>
      <p>This is an example of a React component using a function declaration.</p>
    </div>
  );
}

export default FunctionDeclaration;
      `
            const out = runTransform(source);

            expect(out.code).toMatchSnapshot();
        });
    });
});
