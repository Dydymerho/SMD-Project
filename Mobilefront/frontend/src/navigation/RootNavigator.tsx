import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, View, StatusBar } from 'react-native';
import BottomTabNavigator from './BottomTabNavigator';
import SubjectDetailScreen from '../screens/SubjectDetail/SubjectDetailScreen';
import LoginScreen from '../screens/Login/LoginScreen';
import { useAuth } from '../../../backend/Contexts/AuthContext';

export type RootStackParamList = {
    Login: undefined;
    Tabs: undefined;
    SubjectDetail: { code: string; name: string; };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
    const { isLoggedIn, isLoading } = useAuth();

    if (isLoading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFFFFF' }}>
                <ActivityIndicator size="large" color="#15803d" />
            </View>
        );
    }

    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: false,
                animation: 'slide_from_right', // Hiệu ứng trượt mượt mà
                contentStyle: { backgroundColor: '#F8FAFC' },
            }}
        >
            {!isLoggedIn ? (
                <Stack.Screen
                    name="Login"
                    component={LoginScreen}
                    options={{ animation: 'fade' }}
                />
            ) : (
                <>
                    <Stack.Screen
                        name="Tabs"
                        component={BottomTabNavigator}
                        options={{ animation: 'fade' }}
                    />
                    <Stack.Screen
                        name="SubjectDetail"
                        component={SubjectDetailScreen}
                    />
                </>
            )}
        </Stack.Navigator>
    );
}