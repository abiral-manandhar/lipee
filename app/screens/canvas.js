import React, { useState } from 'react';
import { View, StyleSheet, Dimensions, TouchableOpacity, Text } from 'react-native';
import { Svg, Path } from 'react-native-svg';
import { svgPathProperties } from 'svg-path-properties';


const STROKE_INFO = require('../../assets/strokes.json');
const { height, width } = Dimensions.get('window');
const LENGTH_MIN_MATCH = 15.00;
const TOTAL_MIN_MATCH = 4.00;


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
    

function approximateEvenly(pathData, numPoints = 100) {
    const properties = new svgPathProperties(pathData);
    const totalLength = properties.getTotalLength();
    const points = [];

    for (let i = 0; i <= numPoints; i++) {
        const point = properties.getPointAtLength((i / numPoints) * totalLength);
        points.push(point);
    }

    return points;
}

function calculateLengthDifference(pathData1, pathData2) {
    const properties1 = new svgPathProperties(pathData1);
    const properties2 = new svgPathProperties(pathData2);

    const length1 = properties1.getTotalLength();
    const length2 = properties2.getTotalLength();

    return Math.abs(length1 - length2);
}

function centerAndScale(points) {
    const minX = Math.min(...points.map(p => p.x));
    const maxX = Math.max(...points.map(p => p.x));
    const minY = Math.min(...points.map(p => p.y));
    const maxY = Math.max(...points.map(p => p.y));

    const width = maxX - minX;
    const height = maxY - minY;
    const scale = Math.max(width, height);

    return points.map(p => ({
        x: (p.x - minX) / scale,
        y: (p.y - minY) / scale
    }));
}

function calculateTotalError(points1, points2) {
    if (points1.length !== points2.length) {
        throw new Error("Point arrays must have the same length.");
    }

    let totalError = 0;
    for (let i = 0; i < points1.length; i++) {
        const dx = points1[i].x - points2[i].x;
        const dy = points1[i].y - points2[i].y;
        totalError += Math.sqrt(dx * dx + dy * dy);
    }

    return totalError;
}

function comparePaths(pathData1, pathData2, numPoints = 100) {
  /* return: [length difference, total score] */

  const points1 = approximateEvenly(pathData1, numPoints);
  const points2 = approximateEvenly(pathData2, numPoints);

  const lengthDifference = calculateLengthDifference(pathData1, pathData2);

  const centeredPoints1 = centerAndScale(points1);
  const centeredPoints2 = centerAndScale(points2);

  const totalError = calculateTotalError(centeredPoints1, centeredPoints2);

  return [lengthDifference, totalError];
}


export default Canvas = () => {
  const [paths, setPaths] = useState([]);
  const [currentPath, setCurrentPath] = useState([]);

  const [letter, setLetter] = useState("A");
  const [strokeCount, setStrokeCount] = useState(0);
  const [checkPaths, setCheckPaths] = useState(STROKE_INFO[letter]["strokes"]);

  const [prevRes, setPrevRes] = useState([]);
  const [curRes, setCurRes] = useState([]);

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
    if (currentPath.length > 0 && strokeCount < STROKE_INFO[letter]["n"]) {
      setPaths([...paths, currentPath.join('')]);
      setCurrentPath([]);
      setAllPoints([]);

      res = comparePaths(checkPaths[strokeCount], currentPath[0]);

      if (res[0] <= LENGTH_MIN_MATCH && res[1] <= TOTAL_MIN_MATCH) {
        console.log(strokeCount, "PASSED WITH: ", res, "| continuing");
        setStrokeCount(strokeCount + 1);
        setPrevRes(res);
      } else {
        console.log(strokeCount, "FAILED WITH: ", res, "| resetting");
        setStrokeCount(0);
        setPaths([]); 
        setCurrentPath([]); 
        setAllPoints([]);
        setPrevRes(res);
      }
    } if (strokeCount == STROKE_INFO[letter]["n"]) {
      console.log("GOOD JOB!");
    }
  };

  const handleClearButtonClick = () => {
    setStrokeCount(0);
    setPaths([]); 
    setCurrentPath([]); 
    setAllPoints([]);
    setClearButtonClicked(false); 
    console.log("'", letter, "'", "set up: ", checkPaths);
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
      <View style={{display: 'flex', flexDirection: 'row', width: '100%', justifyContent: 'space-evenly', alignItems: 'center'}}>
      <TouchableOpacity style={styles.clearButton} onPress={handleClearButtonClick}>
        <Text style={styles.clearButtonText}>Clear</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.clearButton} onPress={handleClearButtonClick}>
        <Text style={styles.clearButtonText}>Tutorial</Text>
      </TouchableOpacity>
      <View style={{ flexDirection: 'column', width: "40%"}}>
        <Text style={{color: '#000'}}>Current Letter: {letter}</Text>
        <Text style={{color: '#000'}}>Stroke: {strokeCount}, Accuracy: {100-(Math.max(0, 100 * (1 - prevRes[0] / LENGTH_MIN_MATCH) * (1 - prevRes[1] / TOTAL_MIN_MATCH)))}</Text>
      </View>
      </View>
  
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
