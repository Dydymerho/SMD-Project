import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, View } from 'react-native';
import BottomTabNavigator from './BottomTabNavigator';
import SubjectDetailScreen from '../screens/SubjectDetail/SubjectDetailScreen';
import LoginScreen from '../screens/Login/LoginScreen';
import { useAuth } from '../../../backend/Contexts/AuthContext';

export type RootStackParamList = {
    Login: undefined;
    Tabs: undefined;
    SubjectDetail: { title: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
    const { isLoggedIn, isLoading } = useAuth();

    // Hiển thị loading khi đang kiểm tra auth status
    if (isLoading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#2563eb" />
            </View>
        );
    }

    return (
        <Stack.Navigator>
            {!isLoggedIn ? (
                <Stack.Screen
                    name="Login"
                    component={LoginScreen}
                    options={{ headerShown: false }}
                />
            ) : (
                <>
                    {/* Bottom Tab */}
                    <Stack.Screen
                        name="Tabs"
                        component={BottomTabNavigator}
                        options={{ headerShown: false }}
                    />

                    {/* Subject Detail */}
                    <Stack.Screen name="SubjectDetail" component={SubjectDetailScreen} />
                </>
            )}
        </Stack.Navigator>
    );
}
