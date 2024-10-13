import { Text, View, StyleSheet } from 'react-native';
import React, { Component } from 'react';
import { Canvas, Circle, Group } from "@shopify/react-native-skia";
 
export default function ChooseScreen(){
  const width = 256;
  const height = 256;
  const r = width * 0.33;
  return (
    <Canvas style={{ width, height }}>
      <Group blendMode="multiply">
        <Circle cx={r} cy={r} r={r} color="cyan" />
        <Circle cx={width - r} cy={r} r={r} color="magenta" />
        <Circle cx={width / 2} cy={width - r} r={r} color="yellow" />
      </Group>
    </Canvas>
  );
};
 

// export default function ChooseScreen() {
//   return (
//       <Canvas/>

//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#25292e',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   text: {
//     color: '#fff',
//     marginBottom: 20,
//   },
// });
