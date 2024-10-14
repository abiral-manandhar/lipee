import React, { useState } from 'react';
import { View, StyleSheet, Dimensions, TouchableOpacity, Text } from 'react-native';
import { Svg, Path } from 'react-native-svg';

const { height, width } = Dimensions.get('window');

function catmullRom2bezier(points) {
  if (points.length < 2) return '';

  const result = [];
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i - 1] || points[i];
    const p1 = points[i]; 
    const p2 = points[i + 1]; 
    const p3 = points[i + 2] || p2; 


    const cp1X = p1[0] + (p2[0] - p0[0]) / 6;
    const cp1Y = p1[1] + (p2[1] - p0[1]) / 6;

    const cp2X = p2[0] - (p3[0] - p1[0]) / 6;
    const cp2Y = p2[1] - (p3[1] - p1[1]) / 6;

    result.push(`C${cp1X},${cp1Y} ${cp2X},${cp2Y} ${p2[0]},${p2[1]}`);
  }
  return result.join(' ');
}

export default ChooseScreen = () => {
  const [paths, setPaths] = useState([]);
  const [currentPath, setCurrentPath] = useState([]);
  const [allPoints, setAllPoints] = useState([]);
  const [isClearButtonClicked, setClearButtonClicked] = useState(false);

  const onTouchMove = (event) => {
    const locationX = event.nativeEvent.locationX;
    const locationY = event.nativeEvent.locationY;

    const newPoint = [locationX, locationY];
    const updatedPoints = [...allPoints, newPoint];
    setAllPoints(updatedPoints);

    if (updatedPoints.length > 2) {
      const newPath = catmullRom2bezier(updatedPoints);
      setCurrentPath([`M${updatedPoints[0][0]},${updatedPoints[0][1]} ${newPath}`]);
    } else {
      setCurrentPath([`M${locationX},${locationY}`]);
    }
  };

  const onTouchEnd = () => {
    if (currentPath.length > 0) {
      setPaths([...paths, currentPath.join('')]);
      setCurrentPath([]);
      setAllPoints([]);
    }
  };

  const handleClearButtonClick = () => {
    setPaths([]); 
    setCurrentPath([]); 
    setAllPoints([]);
    setClearButtonClicked(false); 
  };

  return (
    <View style={styles.container}>
      <View style={styles.svgContainer} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}>
        <Svg height={height * 0.7} width={width}>
          <Path
            d={paths.join(' ')}
            stroke={isClearButtonClicked ? 'transparent' : 'red'}
            fill={'transparent'}
            strokeWidth={3}
            strokeLinejoin={'round'}
            strokeLinecap={'round'}
          />
          {currentPath.length > 0 && (
            <Path
              d={currentPath.join(' ')}
              stroke={isClearButtonClicked ? 'transparent' : 'red'}
              fill={'transparent'}
              strokeWidth={2}
              strokeLinejoin={'round'}
              strokeLinecap={'round'}
            />
          )}
        </Svg>
      </View>
      <TouchableOpacity style={styles.clearButton} onPress={handleClearButtonClick}>
        <Text style={styles.clearButtonText}>Clear</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  svgContainer: {
    height: height * 0.7,
    width,
    borderColor: 'black',
    backgroundColor: 'white',
    borderWidth: 1,
  },
  clearButton: {
    marginTop: 10,
    backgroundColor: 'black',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  clearButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
