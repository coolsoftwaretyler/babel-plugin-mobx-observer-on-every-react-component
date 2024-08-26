export const autoObserverPlugin = function(babel) {
  const t = babel.types;
  return {
    visitor: {
      Program: {
        exit(path) {
          // Check if any React component exists in the program
          const hasReactComponent = path.node.body.some(node => {
            if (t.isFunctionDeclaration(node) || t.isClassDeclaration(node)) {
              return isReactComponent(path.get(`body.${path.node.body.indexOf(node)}`));
            } else if (t.isVariableDeclaration(node)) {
              return node.declarations.some((decl, index) => 
                t.isVariableDeclarator(decl) && 
                isReactComponentOrObserved(path.get(`body.${path.node.body.indexOf(node)}.declarations.${index}.init`))
              );
            }
            return false;
          });

          if (hasReactComponent) {
            const observerImport = path.node.body.find(node => 
              t.isImportDeclaration(node) &&
              node.source.value === 'mobx-react' &&
              node.specifiers.some(specifier => 
                t.isImportSpecifier(specifier) && 
                specifier.imported.name === 'observer'
              )
            );

            if (!observerImport) {
              const importDeclaration = t.importDeclaration(
                [t.importSpecifier(t.identifier('observer'), t.identifier('observer'))],
                t.stringLiteral('mobx-react')
              );
              path.unshiftContainer('body', importDeclaration);
            }
          }
        }
      },
      FunctionDeclaration(path) {
        wrapWithObserver(path, t);
      },
      FunctionExpression(path) {
        wrapWithObserver(path, t);
      },
      ArrowFunctionExpression(path) {
        wrapWithObserver(path, t);
      },
      ClassDeclaration(path) {
        wrapWithObserver(path, t);
      }
    }
  };
};

function wrapWithObserver(path, t) {
  if (isReactComponent(path) && !isAlreadyWrapped(path, t)) {
    let componentNode = path.node;
    let componentName = componentNode.id ? componentNode.id.name : 'AnonymousComponent';

    if (path.isFunctionDeclaration()) {
      // For function declarations
      const functionExpression = t.functionExpression(
        t.identifier(componentName),
        componentNode.params,
        componentNode.body,
        componentNode.generator,
        componentNode.async
      );

      // Remove TypeScript-specific properties
      delete functionExpression.typeParameters;
      delete functionExpression.returnType;

      const observerCall = t.callExpression(
        t.identifier('observer'),
        [functionExpression]
      );

      path.replaceWith(
        t.variableDeclaration('const', [
          t.variableDeclarator(
            t.identifier(componentName),
            observerCall
          )
        ])
      );
    } else if (path.isClassDeclaration()) {
      // For class declarations
      const classExpression = t.classExpression(
        t.identifier(componentName),
        componentNode.superClass,
        componentNode.body,
        componentNode.decorators
      );

      // Remove TypeScript-specific properties
      delete classExpression.typeParameters;
      delete classExpression.superTypeParameters;
      delete classExpression.implements;

      const observerCall = t.callExpression(
        t.identifier('observer'),
        [classExpression]
      );

      path.replaceWith(
        t.variableDeclaration('const', [
          t.variableDeclarator(
            t.identifier(componentName),
            observerCall
          )
        ])
      );
    } else {
      // Existing logic for other component types
      const observerCall = t.callExpression(
        t.identifier('observer'),
        [componentNode]
      );

      // Remove TypeScript-specific properties
      delete observerCall.arguments[0].typeParameters;
      delete observerCall.arguments[0].returnType;

      if (path.parentPath.isVariableDeclarator()) {
        path.replaceWith(observerCall);
      } else if (path.parentPath.isExportDefaultDeclaration() || path.parentPath.isExportNamedDeclaration()) {
        path.replaceWith(observerCall);
      } else {
        path.replaceWith(
          t.variableDeclaration('const', [
            t.variableDeclarator(
              t.identifier(componentName),
              observerCall
            )
          ])
        );
      }
    }

    path.skip();
  }
}

function isAlreadyWrapped(path, t) {
  return (
    path.parent &&
    t.isCallExpression(path.parent) &&
    t.isIdentifier(path.parent.callee) &&
    path.parent.callee.name === 'observer'
  );
}

function isReactComponent(path) {
  // Check if it's a function that returns JSX
  if (path.isFunctionDeclaration() || path.isFunctionExpression() || path.isArrowFunctionExpression()) {
    const body = path.get("body");
    if (body.isBlockStatement()) {
      const returnStatement = body.get("body").find(p => p.isReturnStatement());
      if (returnStatement && isJSXOrReactCreateElement(returnStatement.get("argument"))) {
        return true;
      }
    } else if (isJSXOrReactCreateElement(body)) {
      return true;
    }
  }

  // Check if it's a class that extends React.Component or Component
  if (path.isClassDeclaration() || path.isClassExpression()) {
    const superClass = path.get("superClass");
    if (superClass.isIdentifier({ name: "Component" }) || 
        (superClass.isMemberExpression() && superClass.get("object").isIdentifier({ name: "React" }) && superClass.get("property").isIdentifier({ name: "Component" }))) {
      return true;
    }

    // Check for render method returning JSX
    const methods = path.get("body.body");
    const renderMethod = methods.find(p => p.isClassMethod() && p.node.key.name === "render");
    if (renderMethod && renderMethod.get("body").isBlockStatement()) {
      const returnStatement = renderMethod.get("body.body").find(p => p.isReturnStatement());
      if (returnStatement && isJSXOrReactCreateElement(returnStatement.get("argument"))) {
        return true;
      }
    }
  }

  return false;
}

function isJSXOrReactCreateElement(path) {
  return path.isJSXElement() || 
         (path.isCallExpression() && 
          path.get("callee").isMemberExpression() && 
          path.get("callee.object").isIdentifier({ name: "React" }) && 
          path.get("callee.property").isIdentifier({ name: "createElement" }));
}

function isReactComponentOrObserved(path) {
  if (path.isCallExpression() && path.get('callee').isIdentifier({ name: 'observer' })) {
    return true;
  }
  return isReactComponent(path);
}

export default autoObserverPlugin;