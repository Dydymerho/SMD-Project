import React, { useRef, useEffect } from 'react'
import { View, Platform, StyleSheet } from 'react-native'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import Ionicons from 'react-native-vector-icons/Ionicons'
import * as Animatable from 'react-native-animatable'

// Import Screens & Stacks
import HomeStack from './HomeStack'
import ProfileScreen from '../screens/Profile/ProfileScreen'
import NotificationScreen from '../screens/Notification/NotificationScreen'
import SettingStackNavigator from '../screens/settingpage/SettingStackNavigation'

export type TabParamList = {
    Home: undefined
    Profile: undefined
    Setting: undefined
    Notification: undefined
}

const Tab = createBottomTabNavigator<TabParamList>()

// --- COMPONENT ICON CÓ ANIMATION ---
const TabIcon = ({ name, focused, color }: { name: string, focused: boolean, color: string }) => {
    const viewRef = useRef<Animatable.View & View>(null);

    useEffect(() => {
        if (focused) {
            // Hiệu ứng "nảy" (rubberBand) khi chọn
            viewRef.current?.animate('rubberBand');
        }
    }, [focused]);

    return (
        <Animatable.View
            ref={viewRef}
            style={styles.iconContainer}
            duration={500}
        >
            <Ionicons name={name} size={24} color={color} />

            {/* Dấu chấm active */}
            {focused && (
                <Animatable.View
                    animation="zoomIn"
                    duration={300}
                    style={[styles.activeDot, { backgroundColor: color }]}
                />
            )}
        </Animatable.View>
    );
};

export default function BottomTabNavigator() {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarShowLabel: false,

                // --- MÀU SẮC THEME ---
                tabBarActiveTintColor: '#15803d', // Xanh Rêu đậm
                tabBarInactiveTintColor: '#94A3B8', // Xám

                // --- CĂN CHỈNH ITEM ---
                tabBarItemStyle: {
                    justifyContent: 'center',
                    alignItems: 'center',
                    paddingVertical: 0,
                },

                // Cấu hình Icon
                tabBarIcon: ({ focused, color }) => {
                    let iconName = '';
                    switch (route.name) {
                        case 'Home':
                            iconName = focused ? 'home' : 'home-outline';
                            break;
                        case 'Profile':
                            iconName = focused ? 'person' : 'person-outline';
                            break;
                        case 'Notification':
                            iconName = focused ? 'notifications' : 'notifications-outline';
                            break;
                        case 'Setting':
                            iconName = focused ? 'settings' : 'settings-outline';
                            break;
                    }
                    return <TabIcon name={iconName} focused={focused} color={color} />;
                },

                // Style thanh Tab Bar "Nổi"
                tabBarStyle: styles.tabBar,
            })}
        >
            <Tab.Screen name="Home" component={HomeStack} />
            <Tab.Screen name="Profile" component={ProfileScreen} />
            <Tab.Screen name="Notification" component={NotificationScreen} />
            <Tab.Screen name="Setting" component={SettingStackNavigator} />
        </Tab.Navigator>
    )
}

const styles = StyleSheet.create({
    tabBar: {
        margin: 10,
        bottom: 25,
        left: 20,
        right: 20,
        height: 64,
        borderRadius: 24,
        backgroundColor: '#ffffff',

        // --- SHADOW THEME ---
        elevation: 10,
        shadowColor: '#20331b', // Đổ bóng màu xanh rêu tối
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 12,

        borderTopWidth: 0,
    },
    iconContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        width: 50,
        height: 50,
        marginTop: 30
        // Đã xóa thuộc tính top để icon tự căn giữa
    },
    activeDot: {
        width: 5,
        height: 5,
        borderRadius: 2.5,
        marginTop: 4,
    }
});