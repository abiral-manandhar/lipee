import { Text, View, StyleSheet } from 'react-native';
import React from 'react';

export default function GreetScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Practise screen</Text>
 
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
    marginBottom: 20,
  },
  canvas: {
    flex: 1,
    width: '100%',
    backgroundColor: '#000',

  },
});
