import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Button, Image } from 'react-native';

const GreetScreen = ({navigation}) => {
  const handleRanjanaLipiPress = () => {
    navigation.navigate("Canvas")
    console.log('Ranjana Lipi button pressed!');
  };

  const handleViewScoresPress = () => {
    console.log('View Scores button pressed!');
  };

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Text style={styles.logoText}>Lipee</Text>
      </View>

      <TouchableOpacity style={styles.button} onPress={handleRanjanaLipiPress}>
        <Text style={styles.buttonText}>Ranjana Lipi</Text>
      </TouchableOpacity>

      <Text style={styles.comingSoonText}>More scripts coming soon...</Text>

      <TouchableOpacity style={styles.scoresButton} onPress={handleViewScoresPress}>
      <Image source={require('../../assets/icons/scores.png')} style={styles.icon} />

      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#eadbc9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    marginBottom: 50,
  },
  logoText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#101c31', 
  },
  button: {
    backgroundColor: '#101c31',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 8,
    marginTop: 20,
  },
  buttonText: {
    color: '#eadbc9', 
    fontSize: 18,
    fontWeight: 'bold',
  },
  comingSoonText: {
    marginTop: 40,
    fontSize: 16,
    color: '#101c31',
  },
  scoresButton: {
    position: 'absolute',
    left: 10,
    bottom: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  scoresButtonText: {
    color: '#eadbc9',
    fontSize: 16,
  },
  icon:{

    height: 60,
    width: 60,
    
  }
});

export default GreetScreen;
