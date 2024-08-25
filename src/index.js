export const plugin = function(babel) {
  const t = babel.types;
  return {
    visitor: {
      Program: {
        enter(path) {
          const importDeclaration = t.importDeclaration(
            [t.importSpecifier(t.identifier('observer'), t.identifier('observer'))],
            t.stringLiteral('mobx-react')
          );
          path.unshiftContainer('body', importDeclaration);
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
    console.log('Wrapping React Component:', path.node.id ? path.node.id.name : 'Anonymous');

    const observerCall = t.callExpression(
      t.identifier('observer'),
      [path.node]
    );

    if (path.parentPath.isVariableDeclarator()) {
      path.replaceWith(observerCall);
    } else if (path.parentPath.isExportDefaultDeclaration() || path.parentPath.isExportNamedDeclaration()) {
      path.replaceWith(observerCall);
    } else {
      path.replaceWith(
        t.variableDeclaration('const', [
          t.variableDeclarator(
            path.node.id || t.identifier('AnonymousComponent'),
            observerCall
          )
        ])
      );
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