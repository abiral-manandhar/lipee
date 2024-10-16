import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import ScreenStack from './screens/screestack';
import { StyleSheet, View } from 'react-native';

export default function App() {
  return (
    <ScreenStack style={styles.container}/>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
top: 0,
left: 0,
right: 0,
bottom: 0,
width: '100%',
height: '100%'
  },
});
