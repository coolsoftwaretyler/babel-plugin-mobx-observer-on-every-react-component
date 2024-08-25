import { expect, test, describe } from "bun:test";
import { transform } from "@babel/core";
import pluginSyntaxJsx from "@babel/plugin-syntax-jsx";
import pluginTransReactJsx from "@babel/plugin-transform-react-jsx";
import { plugin } from '../src/index.js'


describe("Mobx Observer Babel Plugin", () => {
  test("single simple component without import", () => {
    const simpleReactComponent = `const Simple = () => <div>check</div>;`;
    const out = transform(simpleReactComponent, {
      plugins: [pluginSyntaxJsx, pluginTransReactJsx, plugin]
    });

    expect(out.code).toMatchSnapshot();
  })

  test("single simple component with import", () => {
    const simpleReactComponent = `import { observer } from "mobx-react";
    const Simple = observer(() => <div>check</div>);`;
    const out = transform(simpleReactComponent, {
      plugins: [pluginSyntaxJsx, pluginTransReactJsx, plugin]
    });

    expect(out.code).toMatchSnapshot();
  })
});