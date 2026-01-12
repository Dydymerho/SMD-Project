import React from 'react'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import Ionicons from 'react-native-vector-icons/Ionicons'
import SettingScreen from '../screens/settingpage/SettingScreen'
import AppHeader from '../components/AppHeader'
import HomeStack from './HomeStack'
import ProfileScreen from '../screens/Profile/ProfileScreen'
import SettingStackNavigator from '../screens/settingpage/SettingStackNavigation'
export type TabParamList = {
    Home: undefined
    Profile: undefined
    Setting: undefined
}

const Tab = createBottomTabNavigator<TabParamList>()

const TAB_TITLES: Record<keyof TabParamList, string> = {
    Home: 'Trang chủ',
    Profile: 'Cá nhân',
    Setting: 'Cài đặt',
}

export default function BottomTabNavigator() {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                header: () => (
                    <AppHeader title={TAB_TITLES[route.name]} />
                ),

                tabBarIcon: ({ focused, color }) => {
                    const ICONS: Record<string, string> = {
                        Home: focused ? 'home' : 'home-outline',
                        Setting: focused ? 'settings' : 'settings-outline',
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
                    flexDirection: "row",
                    borderWidth: 25,
                    borderColor: "rgba(255, 255, 255, 0.5)",
                    height: 60,
                    marginHorizontal: 20,
                    marginBottom: 15,
                    borderRadius: 20,
                    position: 'absolute',
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    justifyContent: 'center',   // 🔥 quan trọng
                    alignItems: 'center',       // 🔥 quan trọng
                    paddingVertical: 8,         // 🔥 giảm
                    elevation: 12,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 6 },
                    shadowOpacity: 0.15,
                    shadowRadius: 16,
                },
            })}
        >
            <Tab.Screen name="Home" component={HomeStack} />
            <Tab.Screen name="Profile" component={ProfileScreen} />
            <Tab.Screen name="Setting" component={SettingStackNavigator}
                options={{
                    headerShown: false,
                }} />

        </Tab.Navigator>
    )
}
