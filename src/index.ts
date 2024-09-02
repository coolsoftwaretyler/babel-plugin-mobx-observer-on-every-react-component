import { declare } from "@babel/helper-plugin-utils";

interface PluginOptions {
  debugEnabled?: boolean;
}

export default declare((api, options?: PluginOptions ) => {
  const debugEnabled = options?.debugEnabled ?? false;
  const t = api.types;
  
  return {
    name: "babel-plugin-mobx-observer-on-every-react-component",
    visitor: {
      Program(path, state) {
        if (isInNodeModules(state)) {
          return;
        }

        let hasReactComponent = false;
        let observerImported = false;

        path.traverse({
          ImportDeclaration(path) {
            if (path.node.source.value === 'mobx-react') {
              const specifiers = path.node.specifiers;
              observerImported = specifiers.some(spec => 
                // @ts-expect-error
                t.isImportSpecifier(spec) && spec.imported.name === 'observer'
              );
            }
          },
          "ArrowFunctionExpression|FunctionDeclaration|FunctionExpression|ClassDeclaration|ClassExpression"(
            path
          ) {
            if (isReactComponent(path)) {
              hasReactComponent = true;
            }
          },
        });

        if (hasReactComponent && !observerImported) {
          const existingImport = path.node.body.find(node => 
            t.isImportDeclaration(node) && node.source.value === 'mobx-react'
          );

          if (existingImport) {
            // @ts-expect-error
            existingImport.specifiers.push(
              t.importSpecifier(t.identifier('observer'), t.identifier('observer'))
            );
          } else {
            const importStatement = t.importDeclaration(
              [t.importSpecifier(t.identifier('observer'), t.identifier('observer'))],
              t.stringLiteral('mobx-react')
            );
            path.node.body.unshift(importStatement);
          }
        }

        if (!hasReactComponent) {
          debug(
            // @ts-expect-error
            `no react components in this file ${path.hub.file.opts.filename}`,
            debugEnabled
          );
        }
      },

      ArrowFunctionExpression(path, state) {
        if (isInNodeModules(state)) {
          return;
        }

        // @ts-expect-error
        debug(`arrow function expression ${path.hub.file.opts.filename}`, debugEnabled);

        if (isReactComponent(path)) {
          debug("is react component", debugEnabled);
          // Check to see if this is already wrapped in observer
          if (isWrappedInObserver(path)) {
            debug("already wrapped in observer", debugEnabled);
            return;
          } else {
            debug("not wrapped in observer", debugEnabled);
            // Wrap the ArrowFunctionExpression with observer()
            const observerFunction = t.callExpression(
              t.identifier("observer"),
              [path.node]
            );

            // Replace the ArrowFunctionExpression with the observer() wrapped version
            path.replaceWith(observerFunction);
          }
        } else {
          debug("not a react component", debugEnabled);
        }
      },
      ClassDeclaration(path, state) {
        if (isInNodeModules(state)) {
          return;
        }

        if (isReactComponent(path)) {
          debug(
            `hasReactComponent class ${path.node.id?.name ?? "Anonymous"}`,
            debugEnabled
          );
          // Check to see if this is already wrapped in observer
          if (isWrappedInObserver(path)) {
            debug(
              `already wrapped in observer ${path.node.id?.name ?? "Anonymous"}`,
              debugEnabled
            );
            return;
          } 
          else if (isDecoratedWithObserver(path)) {
            debug(
              `decorated with @observer ${path.node.id?.name ?? "Anonymous"}`,
              debugEnabled
            );
            return;
          }
          else {
            debug(
              `not wrapped in observer ${path.node.id?.name ?? "Anonymous"}`,
              debugEnabled
            );

            wrapClassDeclarationInObserver(path, t);
          }
        } else {
          debug(
            `not a react component class ${path.node.id?.name ?? "Anonymous"}`,
            debugEnabled
          );
        }
      },
      ClassExpression(path, state) {
        if (isInNodeModules(state)) {
          return;
        }

        if (isReactComponent(path)) {
          debug(
            `hasReactComponent class expression ${path.node.id?.name ?? "Anonymous"}`,
            debugEnabled
          );

          // Check to see if this is already wrapped in observer
          if (isWrappedInObserver(path)) {
            debug(
              `already wrapped in observer ${path.node.id?.name ?? "Anonymous"}`,
              debugEnabled
            );
            return;
          } else {
            debug(
              `not wrapped in observer ${path.node.id?.name ?? "Anonymous"}`,
              debugEnabled
            );

            wrapClassExpressionInObserver(path, t);
          }
        } else {
          debug(
            `not a react component class expression ${path.node.id?.name ?? "Anonymous"}`,
            debugEnabled
          );
        }
      },
      FunctionDeclaration(path, state) {
        if (isInNodeModules(state)) {
          return;
        }

        debug(`checking function declaration ${path.node.id?.name ?? "Anonymous"}`, debugEnabled);

        if (isReactComponent(path)) {
          debug(
            `hasReactComponent function declaration ${path.node.id?.name ?? "Anonymous"}`,
            debugEnabled
          );

          if (isWrappedInObserver(path)) {
            debug(
              `already wrapped in observer ${path.node.id?.name ?? "Anonymous"}`,
              debugEnabled
            );
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
          debug(
            `not a react component ${path.node.id?.name ?? "Anonymous"}`,
            debugEnabled
          );
        }
      },
      FunctionExpression(path, state) {
        if (isInNodeModules(state)) {
          return;
        }

        debug(`checking function expression ${path.node.id?.name ?? "Anonymous"}`, debugEnabled);

        if (isReactComponent(path)) {
          debug(
            `hasReactComponent function expression ${path.node.id?.name ?? "Anonymous"}`,
            debugEnabled
          );

          // Check to see if this is already wrapped in observer
          if (isWrappedInObserver(path)) {
            debug(
              `already wrapped in observer ${path.node.id?.name ?? "Anonymous"}`,
              debugEnabled
            );
            return;
          } else {
            debug(
              `not wrapped in observer ${path.node.id?.name ?? "Anonymous"}`,
              debugEnabled
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
          debug(
            `not a react component ${path.node.id?.name ?? "Anonymous"}`,
            debugEnabled
          );
        }
      },
    },
  };
});

function isInNodeModules(state: any) {
  const filename = state.file.opts.filename;
  return filename && filename.includes("node_modules");
}

function isWrappedInObserver(path: any) {
  // If this class is on the right hand side of an assignment expression,
  // check to see if that assignment expression is a call expression to observer
  // which we can know from the parent of the parentPath

  if (path.parentPath.node.type === "AssignmentExpression") {
    if (path.parentPath.parentPath.node.type === "CallExpression" && path.parentPath.parentPath.node.callee.name === "observer") {
      return true
    }
  }


  return (
    path.parentPath.node.type === "CallExpression" &&
    path.parentPath.node.callee.name === "observer"
  );
}

function isDecoratedWithObserver(path: any) {
  return (
    path.node.decorators &&
    path.node.decorators.length > 0 &&
    // @ts-expect-errork
    path.node.decorators.some(decorator => 
      decorator.expression.type === 'Identifier' && 
      decorator.expression.name === 'observer'
    )
  );
}

// @ts-expect-error
function wrapClassDeclarationInObserver(path, t) {
    const classExpression = t.classExpression(
      path.node.id,
      path.node.superClass,
      path.node.body,
      path.node.decorators
    );
  
    // Wrap the ClassExpression with observer()
    const observerFunction = t.callExpression(
      t.identifier("observer"),
      [classExpression]
    );
  
    // Create a variable declaration with the observer-wrapped class
    const variableDeclaration = t.variableDeclaration("const", [
      t.variableDeclarator(path.node.id, observerFunction)
    ]);
  
  
    // Replace the ClassDeclaration with the observer() wrapped version
    path.replaceWith(variableDeclaration);
  }

// @ts-expect-error
function wrapClassExpressionInObserver(path, t) {
  const classExpression = t.classExpression(
    path.node.id,
    path.node.superClass,
    path.node.body,
    path.node.decorators
  );

  // Wrap the ClassExpression with observer()
  const observerFunction = t.callExpression(
    t.identifier("observer"),
    [classExpression]
  );

  // Create a variable declaration with the observer-wrapped class
  const variableDeclaration = t.variableDeclaration("const", [
    t.variableDeclarator(path.node.id, observerFunction)
  ]);


  // Replace the ClassDeclaration with the observer() wrapped version
  path.replaceWith(observerFunction);
}


// @ts-expect-error
function isReactComponent(path ) {
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

// @ts-expect-error
function doesReturnJSX(body) {
  if (!body) return false;
  if (body.type === "JSXElement" || body.type === "JSXFragment") {
    return true;
  }

  var block = body.body;
  if (block && block.length) {
    var lastBlock = block.slice(0).pop();

    if (lastBlock.type === "ReturnStatement") {
      return (
        lastBlock.argument !== null && 
        (lastBlock.argument.type === "JSXElement" || lastBlock.argument.type === "JSXFragment")
      );
    }
  }

  return false;
}

// @ts-expect-error
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

function debug(message: string, debugEnabled: boolean) {
  if (debugEnabled) {
    console.log(message);
  }
}