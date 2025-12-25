import React from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import BottomTabNavigator from './BottomTabNavigator'
import SubjectDetailScreen from '../screens/SubjectDetail/SubjectDetailScreen'
import Header from '../screens/Home/components/Header'

export type RootStackParamList = {
    Tabs: undefined
    SubjectDetail: { title: string }
}

const Stack = createNativeStackNavigator<RootStackParamList>()

export default function RootNavigator() {
    return (
        <Stack.Navigator
            screenOptions={({ route }) => ({
                header: () => (
                    <Header
                        title={route.params?.title ?? ''}
                        showRightIcon={route.name === 'SubjectDetail'}
                    />
                ),
            })}
        >
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
        </Stack.Navigator>
    )
}
