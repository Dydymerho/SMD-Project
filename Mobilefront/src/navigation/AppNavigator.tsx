import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from 'react-native-vector-icons/Ionicons';

import HomeScreen from '../screens/Home/HomeScreen';
import Header from '../screens/Home/components/Header';

const Tab = createBottomTabNavigator();

const getHeaderTitle = (routeName: string) => {
    switch (routeName) {
        case 'Home':
            return 'Trang chủ';
        case 'Search':
            return 'Tìm kiếm';
        case 'Subjects':
            return 'Môn học';
        case 'Follow':
            return 'Theo dõi';
        case 'Profile':
            return 'Cá nhân';
        default:
            return '';
    }
};

const BottomTabNavigator = () => {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                header: () => (
                    <Header title={getHeaderTitle(route.name)} />
                ),

                tabBarIcon: ({ focused }) => {
                    let iconName = 'home-outline';

                    switch (route.name) {
                        case 'Home':
                            iconName = focused ? 'home' : 'home-outline';
                            break;
                        case 'Search':
                            iconName = focused ? 'search' : 'search-outline';
                            break;
                        case 'Subjects':
                            iconName = focused ? 'book' : 'book-outline';
                            break;
                        case 'Follow':
                            iconName = focused ? 'heart' : 'heart-outline';
                            break;
                        case 'Profile':
                            iconName = focused ? 'person' : 'person-outline';
                            break;
                    }

                    return (
                        <Ionicons
                            name={iconName}
                            size={22}
                            color={focused ? '#2563EB' : '#9CA3AF'}
                        />
                    );
                },

                tabBarStyle: {
                    height: 80,
                    margin: 20,
                    paddingTop: 10,
                },
            })}
        >
            <Tab.Screen name="Home" component={HomeScreen} />
            <Tab.Screen name="Search" component={HomeScreen} />
            <Tab.Screen name="Subjects" component={HomeScreen} />
            <Tab.Screen name="Follow" component={HomeScreen} />
            <Tab.Screen name="Profile" component={HomeScreen} />
        </Tab.Navigator>
    );
};

export default BottomTabNavigator;
