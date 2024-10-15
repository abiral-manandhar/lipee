import { createNativeStackNavigator } from '@react-navigation/native-stack';
import * as React from 'react';
import { Button, Text, View } from 'react-native';

import Canvas from './canvas';
import GreetScreen from './greet';
import PractiseScreen from './practise';
import ResultScreen from './result';


const Screen = createNativeStackNavigator();



export default function ScreenStack(){
    return(
        <Screen.Navigator>

            <Screen.Screen name="Canvas" component={Canvas} options={{ headerShown: false }}/>
            <Screen.Screen name="Greet" component={GreetScreen}/>
            <Screen.Screen name="Practise" component={PractiseScreen}/>
            <Screen.Screen name="Result" component={ResultScreen}/>
        

        </Screen.Navigator>
    )
}