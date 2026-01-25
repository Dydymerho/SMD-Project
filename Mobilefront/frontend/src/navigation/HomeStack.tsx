import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import HomeScreen from "../screens/Home/HomeScreen";
import SubjectDetailScreen from "../screens/SubjectDetail/SubjectDetailScreen";

export type HomeStackParamList = {
    Home: undefined;
    SubjectDetail: {
        code: string;
        name: string;
    };
};

const Stack = createNativeStackNavigator<HomeStackParamList>();
export default function HomeStack() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="SubjectDetail" component={SubjectDetailScreen} />
        </Stack.Navigator>
    );
}