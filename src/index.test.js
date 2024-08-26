import { expect, test, describe } from "bun:test";
import { transform } from "@babel/core";
import pluginSyntaxJsx from "@babel/plugin-syntax-jsx";
import pluginTransReactJsx from "@babel/plugin-transform-react-jsx";
import { autoObserverPlugin } from './index.mjs'

const runTransform = (input) => {
  return transform(input, {
    plugins: [pluginSyntaxJsx, pluginTransReactJsx, autoObserverPlugin]
  });
};

describe("Mobx Observer Babel Plugin", () => {
  describe('when there is no mobx-react import', () => {
    describe('for a single arrow function component', () => {
      test('it imports observer and wraps the component', () => {
        const testinput = `const Simple = () => <div>check</div>;`
        const out = runTransform(testinput);

        expect(out.code).toMatchSnapshot();
      })
    })

    describe('for multiple arrow function components', () => {
      test('it imports observer and wraps both components', () => {
        const testinput = `const Simple = () => <div>check</div>;
        const Simple2 = () => <div>check</div>;`
        const out = runTransform(testinput);

        expect(out.code).toMatchSnapshot();
      })
    })

    describe('for a single functional declaration', () => {
      test('it imports observer and wraps the component', () => {
        const testinput = `function Simple() { return <div>check</div>; }`
        const out = runTransform(testinput);

        expect(out.code).toMatchSnapshot();
      })
    })

    describe('for multiple functional declarations', () => {
      test('it imports observer and wraps both components', () => {
        const testinput = `function Simple() { return <div>check</div>; }
        function Simple2() { return <div>check</div>; }`
        const out = runTransform(testinput);

        expect(out.code).toMatchSnapshot();
      })
    })

    describe('for a single function expression', () => {
      test('it imports observer and wraps the component', () => {
        const testinput = `const Simple = function() { return <div>check</div>; }`
        const out = runTransform(testinput);

        expect(out.code).toMatchSnapshot();
      })
    })

    describe('for multiple function expressions', () => {
      test('it imports observer and wraps both components', () => {
        const testinput = `const Simple = function() { return <div>check</div>; }
        const Simple2 = function() { return <div>check</div>; }`
        const out = runTransform(testinput);

        expect(out.code).toMatchSnapshot();
      })
    })

    describe('for a single class declaration', () => {
      test('it imports observer and wraps the component', () => {
        const testinput = `class Simple extends React.Component { render() { return <div>check</div>; } }`
        const out = runTransform(testinput);

        expect(out.code).toMatchSnapshot();
      })
    })

    describe('for multiple class declarations', () => {
      test('it imports observer and wraps both components', () => {
          const testinput = `class Simple extends React.Component { render() { return <div>check</div>; } }
        class Simple2 extends React.Component { render() { return <div>check</div>; } }`
        const out = runTransform(testinput);

        expect(out.code).toMatchSnapshot();
      })
    })

    describe('when there are additional imports', () => {
      test('it leaves the other imports alone', () => {
        const testinput = `import { types } from "mobx-state-tree";
        const Simple = () => <div>check</div>;`
        const out = runTransform(testinput);

        expect(out.code).toMatchSnapshot();
      })
    })

    describe('when there is no react component at all', () => {
        test('it leaves the code unchanged', () => {
            const testinput = `const Simple = (a, b) => a + b
            const obj = {
                a: 1,
                b: 2,
                c: 3
            }
            `
            const out = runTransform(testinput);

            expect(out.code).toMatchSnapshot();
        })
    })
  })
  describe('when there is a mobx-react import', () => {
    describe('for a single arrow function component', () => {
      test('it leaves the import alone and wraps the component', () => {
        const testinput = `import { observer } from "mobx-react";
        const Simple = () => <div>check</div>;`
        const out = runTransform(testinput);

        expect(out.code).toMatchSnapshot();
      })      
    })

    describe('for multiple arrow function components', () => {
      test('it imports observer and wraps both components', () => {
        const testinput = `import { observer } from "mobx-react";
        const Simple = () => <div>check</div>;
        const Simple2 = () => <div>check</div>;`
        const out = runTransform(testinput);

        expect(out.code).toMatchSnapshot();
      })
    })

    describe('for a single functional declaration', () => {
      test('it imports observer and wraps the component', () => {
        const testinput = `import { observer } from "mobx-react";
        function Simple() { return <div>check</div>; }`
        const out = runTransform(testinput);

        expect(out.code).toMatchSnapshot();
      })
    })

    describe('for multiple functional declarations', () => {
      test('it imports observer and wraps both components', () => {
        const testinput = `import { observer } from "mobx-react";
        function Simple() { return <div>check</div>; }
        function Simple2() { return <div>check</div>; }`
        const out = runTransform(testinput);

        expect(out.code).toMatchSnapshot();
      })
    })

    describe('for a single function expression', () => {
      test('it imports observer and wraps the component', () => {
        const testinput = `import { observer } from "mobx-react";
        const Simple = function() { return <div>check</div>; }`
        const out = runTransform(testinput);

        expect(out.code).toMatchSnapshot();
      })
    })

    describe('for multiple function expressions', () => {
      test('it imports observer and wraps both components', () => {
        const testinput = `import { observer } from "mobx-react";
        const Simple = function() { return <div>check</div>; }
        const Simple2 = function() { return <div>check</div>; }`
        const out = runTransform(testinput);

        expect(out.code).toMatchSnapshot();
      })
    })

    describe('for a single class declaration', () => {
      test('it imports observer and wraps the component', () => {
        const testinput = `import { observer } from "mobx-react";
        class Simple extends React.Component { render() { return <div>check</div>; } }`
        const out = runTransform(testinput);

        expect(out.code).toMatchSnapshot();
      })
    })

    describe('for multiple class declarations', () => {
      test('it imports observer and wraps both components', () => {
        const testinput = `import { observer } from "mobx-react";
        class Simple extends React.Component { render() { return <div>check</div>; } }
        class Simple2 extends React.Component { render() { return <div>check</div>; } }`
        const out = runTransform(testinput);

        expect(out.code).toMatchSnapshot();
      })
    })

    describe('when there are additional imports', () => {
      test('it leaves the other imports alone', () => {
        const testinput = `import { types } from "mobx-state-tree";
        import { observer } from "mobx-react";
        const Simple = () => <div>check</div>;`
        const out = runTransform(testinput);

        expect(out.code).toMatchSnapshot();
      })
    })
  })
});