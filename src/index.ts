import { declare } from "@babel/helper-plugin-utils";
import { Decorator } from '@babel/types';
import { NodePath } from '@babel/core';
import * as t from '@babel/types';
import { PluginPass } from '@babel/core';

/**
 * Options for the plugin
 */
interface PluginOptions {
  // Default false, controls if we log debug statements during plugin execution. Mostly intended for plugin developers.
  debugEnabled?: boolean; 
}

type BabelTypes = typeof import('@babel/types');

export default declare((api, options?: PluginOptions ) => {
  const debugEnabled = options?.debugEnabled ?? false;
  const t = api.types;
  let ignoreFile = false;

  return {
    name: "babel-plugin-mobx-observer-on-every-react-component",
    visitor: {
      Program(path, state) {
        if (isInNodeModules(state)) {
          return;
        }
        

        let hasReactComponent = false;
        let observerImported = false;
        ignoreFile = false; // Reset ignoreFile flag for each file

        const comments: Array<t.Comment> = []

        if (path.node.leadingComments) comments.push(...path.node.leadingComments);
        if (path.node.innerComments) comments.push(...path.node.innerComments);
        if (path.node.trailingComments) comments.push(...path.node.trailingComments);
      
        path.traverse({
          enter(path) {
            const node = path.node;
            if (node.leadingComments) comments.push(...node.leadingComments);
            if (node.innerComments) comments.push(...node.innerComments);
            if (node.trailingComments) comments.push(...node.trailingComments);

            // If the file is set to be ignored, do not process it
            if (comments.some(comment => comment.value.includes('@auto-observer-ignore-file'))) {
              ignoreFile = true;
              debug(`ignoring file ${state.filename}`, debugEnabled);
              return;
            }
          },
          ImportDeclaration(path) {
            if (ignoreFile) {
              return;
            }

            if (path.node.source.value === 'mobx-react') {
              const specifiers = path.node.specifiers;
              observerImported = specifiers.some(spec => 
                t.isImportSpecifier(spec) && 
                (spec.imported.type === 'Identifier' && spec.imported.name === 'observer')
              );
            }
          },
          "ArrowFunctionExpression|FunctionDeclaration|FunctionExpression|ClassDeclaration|ClassExpression"(
            path
          ) {
            if (isReactComponent(path as NodePath<t.ArrowFunctionExpression | t.FunctionDeclaration | t.FunctionExpression | t.ClassDeclaration | t.ClassExpression>)) {
              hasReactComponent = true;
            }
          },
        });

        if (hasReactComponent && !observerImported && !ignoreFile) {
          const existingImport = path.node.body.find(node => 
            t.isImportDeclaration(node) && node.source.value === 'mobx-react'
          );
          if (existingImport && t.isImportDeclaration(existingImport)) {
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
            `no react components in this file ${state.filename}`,
            debugEnabled
          );
        }
      },

      ArrowFunctionExpression(path, state) {
        if (isInNodeModules(state) || ignoreFile) {
          return;
        }

        debug(`arrow function expression ${state.filename}`, debugEnabled);

        if (isReactComponent(path)) {
          debug("is react component", debugEnabled);
          // Check to see if this is already wrapped in observer
          if (isWrappedInObserver(path as NodePath<t.ArrowFunctionExpression>)) {
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
        if (isInNodeModules(state) || ignoreFile) {
          return;
        }

        if (isReactComponent(path)) {
          debug(
            `hasReactComponent class ${path.node.id?.name ?? "Anonymous"}`,
            debugEnabled
          );
          // Check to see if this is already wrapped in observer
          if (isWrappedInObserver(path as NodePath<t.ClassDeclaration>)) {
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
        if (isInNodeModules(state) || ignoreFile) {
          return;
        }

        if (isReactComponent(path)) {
          debug(
            `hasReactComponent class expression ${path.node.id?.name ?? "Anonymous"}`,
            debugEnabled
          );

          // Check to see if this is already wrapped in observer
          if (isWrappedInObserver(path as NodePath<t.ClassExpression>)) {
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
        if (isInNodeModules(state) || ignoreFile) {
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
        if (isInNodeModules(state) || ignoreFile) {
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

function isInNodeModules(state: PluginPass): boolean {
  const filename = state.filename;
  return !!(filename && filename.includes("node_modules"))
}

function isWrappedInObserver(path: NodePath<t.ArrowFunctionExpression | t.FunctionDeclaration | t.FunctionExpression | t.ClassDeclaration | t.ClassExpression>): boolean {
  const parent = path.parentPath;
  if (parent && t.isAssignmentExpression(parent.node)) {
    const grandParent = parent.parentPath;
    if (grandParent && t.isCallExpression(grandParent.node) && t.isIdentifier(grandParent.node.callee) && grandParent.node.callee.name === 'observer') {
      return true;
    }
  }

  return (
    t.isCallExpression(parent?.node) &&
    t.isIdentifier(parent.node.callee) &&
    parent.node.callee.name === 'observer'
  );
}

function isDecoratedWithObserver(path: NodePath<t.ClassDeclaration | t.ClassExpression>): boolean {
  return !!(
    path.node.decorators &&
    path.node.decorators.length > 0 &&
    path.node.decorators.some((decorator: Decorator) => 
      decorator.expression.type === 'Identifier' && 
      decorator.expression.name === 'observer'
    )
  );
}

function wrapClassDeclarationInObserver(path: NodePath<t.ClassDeclaration>, t: BabelTypes) {
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
      t.variableDeclarator(path.node.id as t.Identifier, observerFunction)
    ]);
  
  
    // Replace the ClassDeclaration with the observer() wrapped version
    path.replaceWith(variableDeclaration);
  }

function wrapClassExpressionInObserver(path: NodePath<t.ClassExpression>, t: BabelTypes) {
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

  // Replace the ClassDeclaration with the observer() wrapped version
  path.replaceWith(observerFunction);
}


function isReactComponent(path: NodePath<t.ArrowFunctionExpression | t.FunctionDeclaration | t.FunctionExpression | t.ClassDeclaration | t.ClassExpression>): boolean {
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
    return classHasRenderMethod(path as NodePath<t.ClassDeclaration>);
  }
  if (path.node.type === "ClassExpression") {
    return classHasRenderMethod(path as NodePath<t.ClassExpression>);
  }

  return false;
}

function doesReturnJSX(body: t.BlockStatement | t.Expression): boolean {
  if (!body) return false;
  if (t.isJSXElement(body) || t.isJSXFragment(body)) {
    return true;
  }

  if (t.isBlockStatement(body)) {
    const statements = body.body;
    if (statements.length > 0) {
      const lastStatement = statements[statements.length - 1];
      if (t.isReturnStatement(lastStatement) && lastStatement.argument) {
        return t.isJSXElement(lastStatement.argument) || t.isJSXFragment(lastStatement.argument);
      }
    }
  }

  return false;
}

function classHasRenderMethod(path: NodePath<t.ClassDeclaration | t.ClassExpression>): boolean {
  if (!path.node.body) {
    return false;
  }
  const members = path.node.body.body;
  for (const member of members) {
    if (t.isClassMethod(member) && t.isIdentifier(member.key) && member.key.name === "render") {
      return true;
    }
  }

  return false;
}

function debug(message: string, debugEnabled: boolean): void {
  if (debugEnabled) {
    console.log(message);
  }
}