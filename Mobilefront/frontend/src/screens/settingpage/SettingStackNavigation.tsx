import { createNativeStackNavigator } from "@react-navigation/native-stack"
import SettingScreen from "./SettingScreen"
import TermsScreen from "./components/Term/TermsScreen"
import AboutScreen from "./components/About/AboutScreen"

// Định nghĩa param list cho toàn bộ Stack
export type SettingStackParamList = {
    SettingMain: undefined
    Terms: undefined
    About: undefined
}
export type SettingStackProps = {
    setIsLoggedIn: (value: boolean) => void
}

const Stack = createNativeStackNavigator<SettingStackParamList>()

export default function SettingStackNavigator() {
    return (
        <Stack.Navigator
            initialRouteName="SettingMain"
            screenOptions={{
                headerShown: true,
                headerStyle: { backgroundColor: '#ffffff' },
                headerTintColor: '#1e293b',
                headerTitleStyle: { fontWeight: '600' },
            }}
        >
            <Stack.Screen
                name="SettingMain"
                component={SettingScreen}
                options={{ title: 'Cài đặt' }}
            />
            <Stack.Screen
                name="Terms"
                component={TermsScreen}
                options={{ title: 'Điều khoản sử dụng' }}
            />
            <Stack.Screen
                name="About"
                component={AboutScreen}
                options={{ title: 'Giới thiệu' }}
            />
        </Stack.Navigator>
    )
}