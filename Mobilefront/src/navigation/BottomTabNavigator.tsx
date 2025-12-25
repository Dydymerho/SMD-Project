import React from 'react'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import Ionicons from 'react-native-vector-icons/Ionicons'
import HomeScreen from '../screens/Home/HomeScreen'
import SearchScreen from '../screens/Search/SearchScreen'
// import ProfileScreen from '../screens/Profile/ProfileScreen'
import Header from '../screens/Home/components/Header'
import SubjectDetailScreen from '../screens/SubjectDetail/SubjectDetailScreen'

export type TabParamList = {
    Home: undefined
    Search: undefined
    Profile: undefined
    Setting: undefined
}

const Tab = createBottomTabNavigator<TabParamList>()

const TAB_TITLES: Record<keyof TabParamList, string> = {
    Home: 'Trang chủ',
    Search: 'Tìm kiếm',
    Profile: 'Cá nhân',
    Setting: 'Cài đặt',
}

export default function BottomTabNavigator() {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                header: () => (
                    <Header title={TAB_TITLES[route.name]} />
                ),

                tabBarIcon: ({ focused, color }) => {
                    const ICONS: Record<string, string> = {
                        Home: focused ? 'home' : 'home-outline',
                        Search: focused ? 'search' : 'search-outline',
                        Profile: focused ? 'person' : 'person-outline',
                    }

                    return (
                        <Ionicons
                            name={ICONS[route.name]}
                            size={22}
                            color={color}
                        />
                    )
                },

                tabBarActiveTintColor: '#2563EB',
                tabBarInactiveTintColor: '#9CA3AF',

                tabBarStyle: {
                    height: 80,
                    marginHorizontal: 20,
                    marginBottom: 12,
                    borderRadius: 20,
                    paddingTop: 10,
                    position: 'absolute',
                },
            })}
        >
            <Tab.Screen name="Home" component={HomeScreen} />
            <Tab.Screen name="Search" component={SearchScreen} />
            <Tab.Screen name="Profile" component={HomeScreen} />
            <Tab.Screen name="Setting" component={SubjectDetailScreen} />
        </Tab.Navigator>
    )
}
