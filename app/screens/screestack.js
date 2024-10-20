import { createNativeStackNavigator } from '@react-navigation/native-stack';
import * as React from 'react';

import Canvas from './canvas';
import GreetScreen from './greet';
import PractiseScreen from './practise';
import ResultScreen from './result';
import ScoreScreen from './score';


const Screen = createNativeStackNavigator();

export default function ScreenStack(){
    return(
    <Screen.Navigator screenOptions={{headerShown: false}}>
                <Screen.Screen name="Greet" component={GreetScreen}/>
        <Screen.Screen name="Canvas" component={Canvas}/>
        <Screen.Screen name="Practise" component={PractiseScreen}/>
        <Screen.Screen name="Result" component={ResultScreen}/>
        <Screen.Screen name="Score" component={ScoreScreen}/>
        
    </Screen.Navigator>
    )
}