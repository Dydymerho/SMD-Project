// backend/Contexts/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

type AuthContextType = {
    isLoggedIn: boolean;
    login: (token: string) => Promise<void>;
    logout: () => Promise<void>;
    isLoading: boolean;
};

// Tạo context với giá trị mặc định
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        checkAuthStatus();
    }, []);

    const checkAuthStatus = async () => {
        try {
            const token = await AsyncStorage.getItem("AUTH_TOKEN");
            setIsLoggedIn(!!token);
        } catch (error) {
            console.error("Error checking auth status:", error);
            setIsLoggedIn(false);
        } finally {
            setIsLoading(false);
        }
    };

    const login = async (token: string) => {
        try {
            await AsyncStorage.setItem("AUTH_TOKEN", token);
            setIsLoggedIn(true);
        } catch (error) {
            console.error("Error saving token:", error);
            throw error;
        }
    };

    const logout = async () => {
        try {
            console.log("Logging out...");
            await AsyncStorage.removeItem("AUTH_TOKEN");
            setIsLoggedIn(false);
            console.log("Logout successful");
        } catch (error) {
            console.error("Error during logout:", error);
            throw error;
        }
    };

    const value = {
        isLoggedIn,
        login,
        logout,
        isLoading
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

// Hook useAuth với check context
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};