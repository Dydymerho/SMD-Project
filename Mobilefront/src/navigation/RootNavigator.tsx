import React, { useState } from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import BottomTabNavigator from './BottomTabNavigator'
import SubjectDetailScreen from '../screens/SubjectDetail/SubjectDetailScreen'
//import Header from '../screens/Home/components/Header'
import LoginScreen from '../screens/Login/LoginScreen'
export type RootStackParamList = {
    Login: undefined
    Tabs: undefined
    SubjectDetail: { title: string }
}

const Stack = createNativeStackNavigator<RootStackParamList>()

export default function RootNavigator() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    // Truyền hàm setIsLoggedIn cho LoginScreen qua props
    return (
        <Stack.Navigator
            screenOptions={({ route }) => ({
                // header: () => (
                //     // <Header
                //     //     title={route.params?.title ?? ''}
                //     //     showRightIcon={route.name === 'SubjectDetail'}
                //     // />
                // ),
            })}
        >
            {!isLoggedIn ? (
                <Stack.Screen
                    name="Login"
                    // Truyền setIsLoggedIn cho LoginScreen
                    children={() => <LoginScreen setIsLoggedIn={setIsLoggedIn} />}
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
                    <Stack.Screen
                        name="SubjectDetail"
                        component={SubjectDetailScreen}
                    />
                </>
            )}
        </Stack.Navigator>
    )
}
