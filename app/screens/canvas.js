import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Dimensions, TouchableOpacity, Text, Image } from 'react-native';
import { useSprings, animated } from 'react-spring';
import { Svg, Path } from 'react-native-svg';
import { svgPathProperties } from 'svg-path-properties';
import { useFonts } from 'expo-font';

const { height, width } = Dimensions.get('window');
const STROKE_INFO = require('../../assets/strokes.json');

const LENGTH_MIN_MATCH = 20.00;
const TOTAL_MIN_MATCH = 5.50;


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

const INTERSECTION_THRESHOLD = 10;

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

function normalizeUserPoints(userPoints, svgBounds) {
  const { minX, minY, maxX, maxY, width, height } = svgBounds;
  return userPoints.map(([x, y]) => {
    const normalizedX = (x - minX) / width; // Scale to [0, 1]
    const normalizedY = (y - minY) / height; // Scale to [0, 1]
    return [normalizedX, normalizedY];
  });
}

function checkForIntersection(userPoints, overlayPaths) {
  const overlayPoints = overlayPaths.map(pathData => approximateEvenly(pathData, 100)).flat();
  
  const normalizedOverlayPoints = overlayPoints.map(point => [point.x, point.y]);

  for (let i = 0; i < userPoints.length; i++) {
    for (let j = 0; j < normalizedOverlayPoints.length; j++) {
      const dx = userPoints[i][0] - normalizedOverlayPoints[j][0];
      const dy = userPoints[i][1] - normalizedOverlayPoints[j][1];
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance <= INTERSECTION_THRESHOLD) {
        return true; 
      }
    }
  }
  return false; 
}

function scalePath(path, widthFactor, heightFactor) {
  widthFactor /= 100;
  heightFactor /= 100;

  console.log(path);

  return path.replace(/([MLZHVCSQTA])([^MLZHVCSQTA]*)/g, (match, command, coords) => {
    const coordsArray = coords.trim().split(/[\s,]+/);

    const scaledCoords = coordsArray.map((num, index) => {
      const number = parseFloat(num);
      if (command === 'M' || command === 'L' || command === 'C' || command === 'Q' || command === 'T') {
        return index % 2 === 0 ? (number * widthFactor).toFixed(2) : (number * heightFactor).toFixed(2);
      }
      return number;
    });

    return `${command} ${scaledCoords.join(' ')}`;
  });
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

const AnimatedPath = animated(Path);

export default Canvas = () => {
  const [paths, setPaths] = useState([]);
  const [currentPath, setCurrentPath] = useState([]);
  const [letter, setLetter] = useState("A");
  const [strokeCount, setStrokeCount] = useState(0);
  const [checkPaths, setCheckPaths] = useState(STROKE_INFO[letter]["strokes"]);
  const [allPoints, setAllPoints] = useState([]);
  const [hasAnimated, setHasAnimated] = useState(false);
  const [show, setShow] = useState(false);

  const [loaded, error] = useFonts({
    'poppins': require('../../assets/fonts/Poppins-Black.ttf'),
  });

  const overlayPaths = checkPaths; 

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

      const intersected = checkForIntersection(allPoints, overlayPaths);

      if (intersected) {
        console.log("Path intersected with overlay paths!");
      } else {
        console.log("No intersection with overlay paths.");
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
    } if ((strokeCount + 1) == STROKE_INFO[letter]["n"]) {
      console.log("GOOD JOB!");
    }
  };

  const handleClearButtonClick = () => {
    setStrokeCount(0);
    setPaths([]);
    setCurrentPath([]);
    setAllPoints([]);
  };

  const animateStrokes = () => {
    if (!(hasAnimated && isAnimating)) {
      setShow(true);
    }

    setAnimating(!isAnimating);
    setHasAnimated(true);

    setTimeout(() => { setAnimating(false); }, checkPaths.length * 800);
    
    if (hasAnimated) {
      setShow(true);
    }
  }

  const [isAnimating, setAnimating] = useState(false);

  const springs = useSprings(
    checkPaths.length,
    checkPaths.map((_, index) => ({
      strokeDasharray: 1000,
      strokeDashoffset:  show ? 0 : 1000, 
      delay: index * 800,
      config: { duration: 1200 }
    }))
  );

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
          <Svg style={styles.overlay}>
            <Path d="M50,10 L10,100" stroke="blue" fill="none" strokeWidth="7" />
            <Path d="M50,10 L90,100" stroke="red" fill="none" strokeWidth="7" />
            <Path d="M30,70 L70,70" stroke="green" fill="none" strokeWidth="7" />
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
          <Text style={styles.infoText}>
            Character:  <Text style={styles.unicodeText}>𑐮</Text>            |            Lipi: Ranjana  
          </Text>
        </View>
        <View style={styles.animateSVG}> 
        <Svg 
          height={(height / 100) * 35} 
          width={(width / 100) * 70} 
          viewBox={`0 0 ${(width / 100) * 70} ${(height / 100) * 35}`} 
          preserveAspectRatio="xMidYMid meet"
        >
          {(show) && (springs.map((spring, index) => (
            <AnimatedPath
              key={index}
              d={scalePath(checkPaths[index], (width / 100) * 70, (height / 100) * 35)}
              stroke="white"
              strokeWidth="4"
              fill="none"
              style={spring}
            />
          )))
          }

        </Svg>
          <TouchableOpacity onPress={() => animateStrokes()}>
            <Text>{isAnimating ? "Stop" : "Start"}</Text>
          </TouchableOpacity>
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
    padding: 0,
    margin: 0,
    width: '100%',
    alignItems: "center",
    justifyContent: "center"
  },
  infoText: {
    padding: 0,
    margin: 0,
    fontSize: 16, 
    color: '#f49209', 
    marginBottom: 0,
    textAlign: 'center',
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
    flex: 0.9,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    display: 'flex'
  },
});
