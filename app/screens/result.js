import { Text, View, StyleSheet, Button, TouchableOpacity } from 'react-native';
import * as React from 'react';

export default function ResultScreen({route,navigation}) {


  console.log(route.params?.status)
if (!route.params?.status) {  
    return (
      <View style={styles.container}>
        <Text style={styles.wrong}>CONGRATS YOU FUCKING FAILED</Text>
            
      <TouchableOpacity style={styles.scoresButton} onPress={()=>{
      navigation.navigate("Canvas")
      
      }}
      
      
      >
        <Text style={styles.scoresButtonText}>Retry</Text>
      </TouchableOpacity>
      </View>
    );
  } else {
    return (
      <View style={styles.container}>
        <Text style={styles.correct}>YOOO POGCHAMP W LIPI</Text>

        
      <TouchableOpacity style={styles.scoresButton} onPress={()=>{
      navigation.navigate("Canvas")

      }}
      
      
      >
        <Text style={styles.scoresButtonText}>Next</Text>
      </TouchableOpacity>

      </View>
    );
  }
  
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

  correct:{
    color: 'green'
  },
wrong:{
    color: 'red'
    
  },
  scoresButton: {
    position: 'absolute',
    left: 10,
    bottom: 20,
    backgroundColor: '#101c31',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  scoresButtonText: {
    color: '#eadbc9',
    fontSize: 16,
  },

})