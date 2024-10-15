import React, { useState } from 'react';
import { View, StyleSheet, Dimensions, TouchableOpacity, Text, Image } from 'react-native';
import { Svg, Path } from 'react-native-svg';
import { svgPathProperties } from 'svg-path-properties';
import { useFonts } from 'expo-font';

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

function checkPathIntersection(svgPath, drawnPath) {
  const svgProps = new svgPathProperties(svgPath);
  const drawnProps = new svgPathProperties(drawnPath);
  const svgLength = svgProps.getTotalLength();
  const drawnLength = drawnProps.getTotalLength();

  // Check if any point in the drawn path intersects with the SVG path
  for (let i = 0; i <= drawnLength; i++) {
    const point = drawnProps.getPointAtLength(i);
    const isInside = svgProps.getPointAtLength(0).x <= point.x && point.x <= svgProps.getPointAtLength(svgLength).x &&
                     svgProps.getPointAtLength(0).y <= point.y && point.y <= svgProps.getPointAtLength(svgLength).y;

    if (isInside) return true;
  }
  return false;
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
      const drawnPath = currentPath.join('');
      const inside = checkPaths.some(svgPath => checkPathIntersection(svgPath, drawnPath));

      if (inside) {
        console.log("Drawn path is inside the SVG paths");
      } else {
        console.log("Drawn path is outside the SVG paths");
      }

      setPaths([...paths, drawnPath]);
      setCurrentPath([]);
      setAllPoints([]);
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
      <View style={styles.svgContainer} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}>
        <Svg height={height * 0.7} width={width}>
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
          {/* Overlay SVG Paths */}
          <Path d="M10,100 L50,10" stroke="blue" fill="none" strokeWidth="2" />
          <Path d="M50,10 L90,100" stroke="red" fill="none" strokeWidth="2" />
          <Path d="M30,70 L70,70" stroke="green" fill="none" strokeWidth="2" />
        </Svg>
        <View style={styles.iconContainer}>
          <TouchableOpacity onPress={handleClearButtonClick}>
            <Image source={require('../../assets/icons/recycle-bin.png')} style={styles.icon} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => console.log("Tutorial Clicked")}>
            <Image source={require('../../assets/icons/refresh.png')} style={styles.icon} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.info}>
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
  svgContainer: {
    flex: 0.9,
    width,
    position: 'relative',
  },
  iconContainer: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: 100,
  },
  icon: {
    width: 30,
    height: 30,
    marginHorizontal: 5,
  },
  info: {
    flex: 1,
    backgroundColor: '#101c31', 
    padding: 10,
    alignItems: 'flex-start', 
  },
  infoSection: {
    flex: .2,
    width: '100%'
  },
  infoText: {
    fontSize: 16, 
    color: '#f49209', 
    marginBottom: 0,
    textAlign: 'left',
    fontFamily: "poppins"
  },
  unicodeText: {
    fontSize: 22, 
    color: '#f49209', 
    textAlign: 'left', 
    marginBottom: 0, 
    fontFamily: "poppins"
  },
  animateSVG: {
    flex: .8,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center'
  }
});
