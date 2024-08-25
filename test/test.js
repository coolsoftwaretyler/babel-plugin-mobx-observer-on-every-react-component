import { transform } from "@babel/core";
import pluginSyntaxJsx from "@babel/plugin-syntax-jsx";
import pluginTransReactJsx from "@babel/plugin-transform-react-jsx";
import { plugin } from '../src/index.js'

const str = `
const Simple = () => <div>check</div>;
// PURE
const Company = () => {
  // check
  if ('check' === true) {
    return null;
  }
  return <div>check</div>;
}
`;

const out = transform(str, {
  plugins: [pluginSyntaxJsx, pluginTransReactJsx, plugin]
});

console.log(out)