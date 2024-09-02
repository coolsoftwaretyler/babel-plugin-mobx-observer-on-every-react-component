import { expect, test, describe } from "bun:test";
import { transform } from "@babel/core";
import pluginSyntaxJsx from "@babel/plugin-syntax-jsx";
import pluginTransReactJsx from "@babel/plugin-transform-react-jsx";
import pluginSyntaxDecoratorsLegacy from "@babel/plugin-proposal-decorators";
import { autoObserverPlugin } from "./index.mjs";

const runTransformLegacy = (input) => {
    return transform(input, {
        plugins: [pluginSyntaxJsx, pluginTransReactJsx, [pluginSyntaxDecoratorsLegacy, { legacy: true }], autoObserverPlugin],
    });
};

describe("Mobx Observer Babel Plugin", () => {
    describe('legacy decorators', () => {
        test('do not get double wrapped', () => {
            const { code } = runTransformLegacy(`
import React, { Component } from 'react'
import { StyleSheet, View, TextInput, Text, SafeAreaView, TouchableOpacity, ScrollView } from 'react-native'
import { inject, observer } from 'mobx-react'

import { auth } from '@lib/firebase'
import Header from '@components/Onboarding/Header'
import sharedStyles from './styles/signup'

class ForgotPasswordScreen extends Component {
  constructor() {
    super()
    this.state = {
      email: '',
      password: '',
      errorMessage: '',
    }
  }

  onChangeEmail = (v) => {
    this.setState({
      email: v,
    })
  }

  sendPasswordResetEmail = async () => {
    const { navigation } = this.props
    const { email } = this.state
    try {
      await auth.sendPasswordResetEmail(email)
      navigation.goBack()
      alert('Password reset email has been sent. Please check your email to reset your password.')
    } catch (error) {
      const { errorCode, message } = error
      this.setState({ errorMessage: message })
    }
  }

  render() {
    const { email, password, errorMessage } = this.state

    const {
      rootStore: { userStore },
    } = this.props
    const { navigation } = this.props

    return (
      <View style={styles.container}>
        <SafeAreaView style={styles.content}>
          <Header onBack={() => navigation.navigate('HelloScreen')} />

          <View style={[styles.form]}>
            <View style={styles.formHeader}>
              <Text style={styles.formHeaderText}>Password Reset</Text>
              <Text style={styles.formSubheaderText}>Enter your email to reset your password</Text>
            </View>
            <View>
              <TextInput
                style={styles.input}
                onChangeText={this.onChangeEmail}
                value={email}
                placeholder="Email Address"
                placeholderTextColor="#000"
                keyboardType="email-address"
              />
              <ScrollView
                style={styles.error}
                contentContainerStyle={{
                  flexGrow: 1,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <Text style={styles.errorText}>{errorMessage}</Text>
              </ScrollView>
              <View style={[styles.buttonsContainer, { position: 'absolute', bottom: 0 }]}>
                <TouchableOpacity style={[styles.button, styles.forgotPassword]} onPress={this.sendPasswordResetEmail}>
                  <Text style={styles.buttonText}>Reset Password</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </SafeAreaView>
      </View>
    )
  }
}

ForgotPasswordScreen.navigationOptions = {
  header: null,
}

const styles = StyleSheet.create({
  ...sharedStyles,
})

export default ForgotPasswordScreen

 
`)
            expect(code).toMatchSnapshot()
        })

    })
});



