import React, { useState } from 'react';
import { View, StyleSheet, Dimensions, TouchableOpacity, Text, Image } from 'react-native';
import { Svg, Path } from 'react-native-svg';
import { svgPathProperties } from 'svg-path-properties';
import { useFonts } from 'expo-font';

const { height, width } = Dimensions.get('window');
const STROKE_INFO = require('../../assets/strokes.json');

const LENGTH_MIN_MATCH = 20.00;
const TOTAL_MIN_MATCH = 5.50;
const result = [];
let x = 0
function catmullRom2bezier(points) {
  if (points.length < 2) return '';

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

function getBoundingBox(pathData) {
  const properties = new svgPathProperties(pathData);
  const length = properties.getTotalLength();

  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

  for (let i = 0; i <= length; i++) {
    const point = properties.getPointAtLength(i);
    minX = Math.min(minX, point.x);
    minY = Math.min(minY, point.y);
    maxX = Math.max(maxX, point.x);
    maxY = Math.max(maxY, point.y);
  }

  return { minX, minY, maxX, maxY };
}

function boxesIntersect(box1, box2) {
  return !(box2.minX > box1.maxX ||
           box2.maxX < box1.minX ||
           box2.minY > box1.maxY ||
           box2.maxY < box1.minY);
}

function checkForIntersection(userPathPoints, overlayPaths) {
  console.log(result[x])
  console.log(overlayPaths)
  const userPathBoundingBox = getBoundingBox(result[x]);
  const overlayBoundingBox = getBoundingBox(overlayPath[x]);

x+=1;
  
    
    if (boxesIntersect(userPathBoundingBox, overlayBoundingBox)) {
      return true; // Intersection detected
    }
  
  
  return false; // No intersections
}

function calculateLengthDifference(pathData1, pathData2) {
  const properties1 = new svgPathProperties(pathData1);
  const properties2 = new svgPathProperties(pathData2);

  const length1 = properties1.getTotalLength();
  const length2 = properties2.getTotalLength();

  return Math.abs(length1 - length2);
}

function centerAndScale(points) {
  const minX = Math.min(...points.map(p => p[0]));
  const maxX = Math.max(...points.map(p => p[0]));
  const minY = Math.min(...points.map(p => p[1]));
  const maxY = Math.max(...points.map(p => p[1]));

  const width = maxX - minX;
  const height = maxY - minY;
  const scale = Math.max(width, height);

  return points.map(p => ([
    (p[0] - minX) / scale,
    (p[1] - minY) / scale
  ]));
}

function calculateTotalError(points1, points2) {
  if (points1.length !== points2.length) {
    throw new Error("Point arrays must have the same length.");
  }

  let totalError = 0;
  for (let i = 0; i < points1.length; i++) {
    const dx = points1[i][0] - points2[i][0];
    const dy = points1[i][1] - points2[i][1];
    totalError += Math.sqrt(dx * dx + dy * dy);
  }

  return totalError;
}

function approximateEvenly(pathData, numPoints = 100) {
  const properties = new svgPathProperties(pathData);
  const totalLength = properties.getTotalLength();
  const points = [];

  for (let i = 0; i <= numPoints; i++) {
    const point = properties.getPointAtLength((i / numPoints) * totalLength);
    points.push([point.x, point.y]);
  }

  return points;
}

function comparePaths(pathData1, pathData2, numPoints = 100) {
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
  const [allPoints, setAllPoints] = useState([]);

  const [loaded, error] = useFonts({
    'poppins': require('../../assets/fonts/Poppins-Black.ttf'),
  });

  const overlayPaths = [
    "M 20 70 L 40 10 L 60 70", // Outer lines of A
    "M 30 50 L 50 50",         // Horizontal bar
    "M 40 10 L 20 70"          // Right side of A
  ];

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

      // Check if the user's path intersects with the overlay paths
      const intersected = checkForIntersection(allPoints, overlayPaths);
      if (intersected) {
        console.log("Paths intersect with overlay paths");
      }

      const res = comparePaths(checkPaths[strokeCount], currentPath[0]);

      if (res[0] <= LENGTH_MIN_MATCH && res[1] <= TOTAL_MIN_MATCH) {
        console.log(strokeCount, "PASSED WITH: ", res, "| continuing");
        setStrokeCount(strokeCount + 1);
      } else {
        console.log(strokeCount, "FAILED WITH: ", res, "| resetting");
        setStrokeCount(0);
        setPaths([]);
        setCurrentPath([]);
        setAllPoints([]);
      }
    }

    if (strokeCount === STROKE_INFO[letter]["n"]) {
      console.log("GOOD JOB!");
    }
  };

  const handleClearButtonClick = () => {
    setStrokeCount(0);
    setPaths([]);
    setCurrentPath([]);
    setAllPoints([]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.svgWrapper}>
        <View style={styles.svgContainer} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}>
          <Svg>
            <Path
              d={paths.join(' ')}
              stroke="#f49209"
              fill={'transparent'}
              strokeWidth={7}
              strokeLinejoin={'round'}
              strokeLinecap={'round'}
            />
            {currentPath.length > 0 && (
              <Path
                d={currentPath.join(' ')}
                stroke="#f49209"
                fill={'transparent'}
                strokeWidth={7}
                strokeLinejoin={'round'}
                strokeLinecap={'round'}
              />
            )}
          </Svg>
        </View>
        <View style={styles.overlayContainer}>
          <Svg style={styles.overlay} width="80" height="80" viewBox="0 0 80 80">
            {overlayPaths.map((path, index) => (
              <Path key={index} d={path} stroke="blue" fill="none" strokeWidth="7" />
            ))}
          </Svg>
        </View>
      </View>

      <View style={styles.info}>
        <View style={styles.iconContainer}>
          <TouchableOpacity onPress={handleClearButtonClick}>
            <Image source={require('../../assets/icons/recycle-bin.png')} style={styles.icon} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => console.log("Tutorial Clicked")}>
            <Image source={require('../../assets/icons/refresh.png')} style={styles.icon} />
          </TouchableOpacity>
        </View>
        <View style={styles.infoSection}>
          <Text style={styles.unicodeText}>
            Character: 𑐮
          </Text>
          <Text style={styles.infoText}>
            Lipi: Ranjana  
          </Text>
        </View>
        <View style={styles.animateSVG}>
          <Text style={styles.unicodeText}>
            Animate guidance 
          </Text>
          <Text style={styles.infoText}>
            here 
          </Text>
        </View>
      </View>
    </View>
  );
};







const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#eadbc9',
    flexDirection: 'column',
  },
  svgWrapper: {
    flex: 0.7,
    position: 'relative',
  },
  svgContainer: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  overlayContainer: {   
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlay: {
    height: 110,
    width: 100,
    backgroundColor:'transparent',
  },
  iconContainer: {
    backgroundColor: '#eadbc9',
    width: '100%',
    top: 0,
    left: 0,
    flexDirection: 'row',
    paddingLeft: 10,
    paddingBottom: 10,
    height: 40,
    
  },
  icon: {
    width: 30,
    height: 30,
    marginHorizontal: 15,
  },
  info: {
    flex: 1,
    backgroundColor: '#101c31',
    alignItems: 'flex-start',
  },
  infoSection: {
    padding: 10,
    flex: 0.2,
    width: '100%',
  },
  infoText: {
    fontSize: 16,
    color: '#f49209',
    marginBottom: 0,
    textAlign: 'left',
    fontFamily: 'poppins',
  },
  unicodeText: {
    fontSize: 22,
    color: '#f49209',
    textAlign: 'left',
    marginBottom: 0,
    fontFamily: 'poppins',
  },
  animateSVG: {
    flex: 0.8,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
});