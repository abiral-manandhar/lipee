import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import ScreenStack from './screens/screestack';
import { StyleSheet, View } from 'react-native';

export default function App() {
  return (
    <ScreenStack />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#101c30',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
