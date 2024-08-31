import { expect, test, describe } from "bun:test";
import { transform } from "@babel/core";
import pluginSyntaxJsx from "@babel/plugin-syntax-jsx";
import pluginTransReactJsx from "@babel/plugin-transform-react-jsx";
import { autoObserverPlugin } from "./index.mjs";

const runTransform = (input) => {
  return transform(input, {
    plugins: [pluginSyntaxJsx, pluginTransReactJsx, autoObserverPlugin],
  });
};

describe("Mobx Observer Babel Plugin", () => {
  test("specific file", () => {
    const input = `
import * as React from 'react'
import { Screen } from '@components/common/Screen'
import hideTabBar from '@hooks/hideTabBar'
import UniversalToolHeader from '@components/common/UniversalToolHeader/UniversalToolHeader'
import WalterPicksErrorBoundary from '@components/common/WalterPicksErrorBoundary'
import { useNavigation } from '@react-navigation/native'
import WalterText from '@components/common/WalterText'
import { RebopConsole } from '@rebop/react-native-rebop-console'
import { View } from 'react-native'

export function PreviewDeployConsoleScreen() {
  hideTabBar()
  const navigation = useNavigation()

  const projectId = 'walterpicks-mobile-app'

  return (
    <Screen preset="fixed" safeAreaEdges={['top']} testID="PreviewDeployConsoleScreenScreen">
      <UniversalToolHeader title="Preview Deploys" />
      <WalterPicksErrorBoundary navigation={navigation}>
        <View
          style={{
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <WalterText style={{ marginLeft: 8 }}>sentinel value: Test 413-Brierwood</WalterText>
        </View>
        <RebopConsole projectId={projectId} />
      </WalterPicksErrorBoundary>
    </Screen>
  )
}

        
        `;

    const out = runTransform(input);

    expect(out.code).toMatchSnapshot();
  });
});
