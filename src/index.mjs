export const autoObserverPlugin = function (babel) {
  const t = babel.types;
  return {
    name: "babel-plugin-mobx-observer-on-every-react-component",
    visitor: {
      Program(path, state) {
        if (isInNodeModules(state)) {
          return;
        }

        let hasReactComponent = false;

        path.traverse({
          "ArrowFunctionExpression|FunctionDeclaration|FunctionExpression|ClassDeclaration|ClassExpression"(
            path
          ) {
            if (isReactComponent(path)) {
              hasReactComponent = true;
              // Check to see if we have imported observer from mobx-react
              const hasObserverImport = path.hub.file.code.includes(
                'import { observer } from "mobx-react"'
              );
              if (!hasObserverImport) {
                console.log(
                  "no observer import in this file, adding one",
                  path.hub.file.opts.filename
                );
                // Add the import statement
                const importStatement = t.importDeclaration(
                  [
                    t.importSpecifier(
                      t.identifier("observer"),
                      t.identifier("observer")
                    ),
                  ],
                  t.stringLiteral("mobx-react")
                );

                path.hub.file.path.node.body.unshift(importStatement);
              } else {
                console.log(
                  "has observer import in this file",
                  path.hub.file.opts.filename
                );
              }
            }
          },
        });

        if (!hasReactComponent) {
          console.log(
            "no react components in this file",
            path.hub.file.opts.filename
          );
        }
      },

      ArrowFunctionExpression(path, state) {
        if (isInNodeModules(state)) {
          return;
        }

        console.log("arrow function expression", path.hub.file.opts.filename);

        if (isReactComponent(path)) {
          console.log("is react component");
          // Check to see if this is already wrapped in observer
          if (isWrappedInObserver(path)) {
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
        if (isInNodeModules(state)) {
          return;
        }

        if (isReactComponent(path)) {
          console.log(
            "hasReactComponent class",
            path.node.id?.name ?? "Anonymous"
          );
          // Check to see if this is already wrapped in observer
          if (isWrappedInObserver(path)) {
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

            wrapClassInObserver(path, t);
          }
        } else {
          console.log(
            "not a react component class",
            path.node.id?.name ?? "Anonymous"
          );
        }
      },
      ClassExpression(path, state) {
        if (isInNodeModules(state)) {
          return;
        }

        if (isReactComponent(path)) {
          console.log(
            "hasReactComponent class expression",
            path.hub.file.opts.filename
          );

          // Check to see if this is already wrapped in observer
          if (isWrappedInObserver(path)) {
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

            wrapClassInObserver(path, t);
          }
        } else {
          console.log(
            "not a react component class expression",
            path.hub.file.opts.filename
          );
        }
      },
      FunctionDeclaration(path, state) {
        if (isInNodeModules(state)) {
          return;
        }

        console.log("checking function declaration", path.node.id.name);

        if (isReactComponent(path)) {
          console.log(
            "hasReactComponent function declaration",
            path.node.id.name
          );

          if (isWrappedInObserver(path)) {
            console.log("already wrapped in observer", path.node.id?.name ?? "Anonymous");
            return;
          }

          const functionId = path.node.id;

          // Create a FunctionExpression with the same name, params, and body
          const functionExpression = t.functionExpression(
            functionId,
            path.node.params,
            path.node.body,
            path.node.generator,
            path.node.async
          );

          // Wrap the FunctionExpression with observer()
          const observerFunction = t.callExpression(t.identifier("observer"), [
            functionExpression,
          ]);

          // Create a new FunctionDeclaration with the same id and the observer-wrapped body
          const newFunctionDeclaration = t.functionDeclaration(
            functionId,
            path.node.params,
            t.blockStatement([t.returnStatement(observerFunction)]),
            path.node.generator,
            path.node.async
          );

          // Replace the old function declaration with the new one
          path.replaceWith(newFunctionDeclaration);
        } else {
          console.log("not a react component", path.node.id.name);
        }
      },
      FunctionExpression(path, state) {
        if (isInNodeModules(state)) {
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
          if (isWrappedInObserver(path)) {
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

function isInNodeModules(state) {
  const filename = state.file.opts.filename;
  return filename && filename.includes("node_modules");
}

function isWrappedInObserver(path) {
  return (
    path.parentPath.node.type === "CallExpression" &&
    path.parentPath.node.callee.name === "observer"
  );
}

function wrapClassInObserver(path, t) {
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
