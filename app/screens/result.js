import { Text, View, StyleSheet, Button } from 'react-native';
import * as React from 'react';

export default function ResultScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Result screen</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#25292e',
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    color: '#fff',
  },
})