'use client';
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  TouchableWithoutFeedback,
  Keyboard,
  StatusBar
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Mail, Lock, ArrowRight, Eye, EyeOff } from 'lucide-react-native';

/* --- IMPORTS --- */
import styles from './LoginStyle';
import { authApi } from '../../../../backend/api/authApi';
import { useAuth } from '../../../../backend/Contexts/AuthContext';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isFocused, setIsFocused] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Thông báo', 'Vui lòng nhập đầy đủ Email và Mật khẩu.');
      return;
    }

    setIsLoading(true);
    Keyboard.dismiss(); // Ẩn bàn phím khi bắt đầu xử lý

    try {
      const res = await authApi.login(email, password);
      console.log('API RESPONSE:', res);

      if (res.token) {
        await login(res.token);
      } else {
        throw new Error('Token không tồn tại trong response');
      }
    } catch (error: any) {
      console.log('Login error:', error);
      let errorMessage = 'Đã có lỗi xảy ra khi đăng nhập';
      if (error.response) {
        errorMessage = 'Sai tài khoản hoặc mật khẩu';
      } else if (error.request) {
        errorMessage = 'Lỗi kết nối server. Vui lòng kiểm tra mạng.';
      } else {
        errorMessage = error.message || errorMessage;
      }
      Alert.alert('Đăng nhập thất bại', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

        {/* 1. HEADER GRADIENT BACKGROUND */}
        <LinearGradient
          colors={['#0f172a', '#1e293b', '#334155']} // Màu xanh đen (Slate) chuyên nghiệp
          // Hoặc dùng màu xanh rêu nếu muốn đồng bộ Home: ['#32502a', '#20331b']
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.headerContainer}
        >
          <View style={styles.logoContainer}>
            <Text style={styles.logoText}>SMD</Text>
          </View>
          <Text style={styles.welcomeText}>Chào mừng trở lại!</Text>
        </LinearGradient>

        {/* 2. FORM CONTAINER (WHITE BOTTOM SHEET) */}
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.formContainer}
        >
          {/* EMAIL INPUT */}
          <Text style={styles.inputLabel}>Email</Text>
          <View
            style={[
              styles.inputWrapper,
              isFocused === 'email' && styles.inputFocused,
            ]}
          >
            <Mail
              size={20}
              color={isFocused === 'email' ? '#3b82f6' : '#94a3b8'}
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              placeholder="nhap@email.com"
              placeholderTextColor="#94a3b8"
              value={email}
              onChangeText={setEmail}
              onFocus={() => setIsFocused('email')}
              onBlur={() => setIsFocused(null)}
              keyboardType="email-address"
              autoCapitalize="none"
              editable={!isLoading}
            />
          </View>

          {/* PASSWORD INPUT */}
          <Text style={styles.inputLabel}>Mật khẩu</Text>
          <View
            style={[
              styles.inputWrapper,
              isFocused === 'password' && styles.inputFocused,
            ]}
          >
            <Lock
              size={20}
              color={isFocused === 'password' ? '#3b82f6' : '#94a3b8'}
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              placeholderTextColor="#94a3b8"
              value={password}
              onChangeText={setPassword}
              onFocus={() => setIsFocused('password')}
              onBlur={() => setIsFocused(null)}
              secureTextEntry={!isPasswordVisible}
              editable={!isLoading}
              onSubmitEditing={handleLogin}
            />
            <TouchableOpacity
              onPress={() => setIsPasswordVisible(!isPasswordVisible)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              {isPasswordVisible ? (
                <EyeOff size={20} color="#64748B" />
              ) : (
                <Eye size={20} color="#64748B" />
              )}
            </TouchableOpacity>
          </View>

          {/* LOGIN BUTTON */}
          <TouchableOpacity
            style={[styles.loginButton, isLoading && styles.loginButtonDisabled]}
            onPress={handleLogin}
            activeOpacity={0.9}
            disabled={isLoading}
          >
            <LinearGradient
              colors={['#3b82f6', '#2563eb']} // Gradient Xanh dương
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.gradientBtn}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <>
                  <Text style={styles.loginButtonText}>Đăng nhập</Text>
                  <ArrowRight size={20} color="#fff" strokeWidth={2.5} />
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>

        </KeyboardAvoidingView>
      </View>
    </TouchableWithoutFeedback>
  );
}