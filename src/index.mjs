export const autoObserverPlugin = function (babel) {
  const t = babel.types;
  return {
    name: "babel-plugin-mobx-observer-on-every-react-component",
    visitor: {
      Program(path, state) {
        const filename = state.file.opts.filename;

        if (filename && filename.includes('node_modules')) {
          return;
        }

        let hasReactComponent = false;

        path.traverse({
          'ArrowFunctionExpression|FunctionDeclaration|FunctionExpression|ClassDeclaration|ClassExpression'(path) {
            if (isReactComponent(path)) {
              hasReactComponent = true;
              // Check to see if we have imported observer from mobx-react
              const hasObserverImport = path.hub.file.code.includes('import { observer } from "mobx-react"');
              if (!hasObserverImport) {
                console.log('no observer import in this file, adding one', path.hub.file.opts.filename);
                // Add the import statement
                const importStatement = t.importDeclaration(
                  [t.importSpecifier(t.identifier('observer'), t.identifier('observer'))],
                  t.stringLiteral('mobx-react')
                );

                path.hub.file.path.node.body.unshift(importStatement);
              } else {
                console.log('has observer import in this file', path.hub.file.opts.filename);
              }
            }
          }
        });

        if (!hasReactComponent) {
          console.log('no react components in this file', path.hub.file.opts.filename);
        }
      },

      ArrowFunctionExpression(path, state) {
        const filename = state.file.opts.filename;

        if (filename && filename.includes("node_modules")) {
          return;
        }

        console.log("arrow function expression", path.hub.file.opts.filename);

        if (isReactComponent(path)) {
          console.log("is react component");
          // Check to see if this is already wrapped in observer
          if (
            path.parentPath.node.type === "CallExpression" &&
            path.parentPath.node.callee.name === "observer"
          ) {
            console.log("already wrapped in observer");
            return;
          } else {
            console.log("not wrapped in observer");
            // Wrap the ArrowFunctionExpression with observer()
            const observerFunction = t.callExpression(
              t.identifier("observer"),
              [path.node]
            );

            // Replace the ArrowFunctionExpression with the observer() wrapped version
            path.replaceWith(observerFunction);
          }
        } else {
          console.log("not a react component");
        }
      },
      ClassDeclaration(path, state) {
        const filename = state.file.opts.filename;

        if (filename && filename.includes("node_modules")) {
          return;
        }

        if (isReactComponent(path)) {
          console.log("hasReactComponent class", path.node.id?.name ?? 'Anonymous');
          // Check to see if this is already wrapped in observer
          if (
            path.parentPath.node.type === "CallExpression" &&
            path.parentPath.node.callee.name === "observer"
          ) {
            console.log("already wrapped in observer", path.node.id?.name ?? 'Anonymous');
            return;
          } else {
            console.log("not wrapped in observer", path.node.id?.name ?? 'Anonymous');
            const classExpression = t.classExpression(
              path.node.id,
              path.node.superClass,
              path.node.body,
              path.node.decorators
            );
            // Wrap the ClassDeclaration with observer()
            const observerFunction = t.callExpression(
              t.identifier("observer"),
              [classExpression]
            );

            // Replace the ClassDeclaration with the observer() wrapped version
            path.replaceWith(observerFunction);
          }
        } else {
          console.log("not a react component class", path.node.id?.name ?? 'Anonymous')
        }
      },
      ClassExpression(path, state) {
        const filename = state.file.opts.filename;

        if (filename && filename.includes('node_modules')) {
          return;
        }
        if (isReactComponent(path)) {
          console.log('hasReactComponent class expression', path.hub.file.opts.filename);

        // Check to see if this is already wrapped in observer
        if (
          path.parentPath.node.type === "CallExpression" &&
          path.parentPath.node.callee.name === "observer"
        ) {
          console.log("already wrapped in observer", path.node.id?.name ?? 'Anonymous');
          return;
        } else {
          console.log("not wrapped in observer", path.node.id?.name ?? 'Anonymous');
          const classExpression = t.classExpression(
            path.node.id,
            path.node.superClass,
            path.node.body,
            path.node.decorators
          );
          // Wrap the ClassDeclaration with observer()
          const observerFunction = t.callExpression(
            t.identifier("observer"),
            [classExpression]
          );

          // Replace the ClassDeclaration with the observer() wrapped version
          path.replaceWith(observerFunction);
        }; 
        } else {
          console.log('not a react component class expression', path.hub.file.opts.filename);
        }
      },
      FunctionDeclaration(path, state) {
        const filename = state.file.opts.filename;

        if (filename && filename.includes("node_modules")) {
          console.log("This is a node module", filename);
          return;
        }

        console.log("checking function declaration", path.node.id.name);

        if (isReactComponent(path)) {
          console.log(
            "hasReactComponent function declaration",
            path.node.id.name
          );

          /**
           * A react Function Declaration specifically won't have an observer wrapper. If it did, it would be a function expression. So let's update it to be like
           * observer(function MyComponent() { return <div>Hello World</div>; });
           */
          // Convert the FunctionDeclaration to a FunctionExpression
          const functionExpression = t.functionExpression(
            path.node.id,
            path.node.params,
            path.node.body,
            path.node.generator,
            path.node.async
          );

          // Wrap the FunctionExpression with observer()
          const observerFunction = t.callExpression(t.identifier("observer"), [
            functionExpression,
          ]);

          path.replaceWith(observerFunction);
        } else {
          console.log("not a react component", path.node.id.name);
        }
      },
      FunctionExpression(path, state) {
        const filename = state.file.opts.filename;

        if (filename && filename.includes("node_modules")) {
          return;
        }

        console.log(
          "checking function expression",
          path.node.id?.name ?? "Anonymous"
        );

        if (isReactComponent(path)) {
          console.log(
            "hasReactComponent function expression",
            path.node.id?.name ?? "Anonymous"
          );

          // Check to see if this is already wrapped in observer
          if (
            path.parentPath.node.type === "CallExpression" &&
            path.parentPath.node.callee.name === "observer"
          ) {
            console.log(
              "already wrapped in observer",
              path.node.id?.name ?? "Anonymous"
            );
            return;
          } else {
            console.log(
              "not wrapped in observer",
              path.node.id?.name ?? "Anonymous"
            );
            // Wrap the FunctionExpression with observer()
            const observerFunction = t.callExpression(
              t.identifier("observer"),
              [path.node]
            );

            // Replace the FunctionExpression with the observer() wrapped version
            path.replaceWith(observerFunction);
          }
        } else {
          console.log(
            "not a react component",
            path.node.id?.name ?? "Anonymous"
          );
        }
      },
    },
  };
};

function isReactComponent(path) {
  console.log("isReactComponent: path node type", path.node.type);
  if (path.node.type === "ArrowFunctionExpression") {
    return doesReturnJSX(path.node.body);
  }
  if (path.node.type === "FunctionDeclaration") {
    return doesReturnJSX(path.node.body);
  }
  if (path.node.type === "FunctionExpression") {
    return doesReturnJSX(path.node.body);
  }
  if (path.node.type === "ClassDeclaration") {
    return classHasRenderMethod(path);
  }
  if (path.node.type === "ClassExpression") {
    return classHasRenderMethod(path);
  }

  return false;
}

function doesReturnJSX(body) {
  if (!body) return false;
  if (body.type === "JSXElement") {
    return true;
  }

  var block = body.body;
  if (block && block.length) {
    var lastBlock = block.slice(0).pop();

    if (lastBlock.type === "ReturnStatement") {
      return (
        lastBlock.argument !== null && lastBlock.argument.type === "JSXElement"
      );
    }
  }

  return false;
}

function classHasRenderMethod(path) {
  if (!path.node.body) {
    return false;
  }
  var members = path.node.body.body;
  for (var i = 0; i < members.length; i++) {
    if (members[i].type === "ClassMethod" && members[i].key.name === "render") {
      return true;
    }
  }

  return false;
}

export default autoObserverPlugin;
