import * as React from 'react';

import { Text, View, StyleSheet, Button } from 'react-native';

export default function ChooseScreen({navigation}) {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Choose screen</Text>
  
      <Button
        title="Go to Greet"
        onPress={() => navigation.navigate('Greet')}
      />
  
  
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