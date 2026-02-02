import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  Switch,
  RefreshControl,
  StatusBar
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {
  Bell,
  Info,
  FileText,
  ChevronRight,
  LogOut,
  Shield,
  Moon
} from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';

import styles from './Setting.styles';
import { useAuth } from '../../../../backend/Contexts/AuthContext';
import type { SettingStackParamList } from './SettingStackNavigation';
import { Profile } from "../../../../backend/types/Profile";
import { ProfileApi } from "../../../../backend/api/ProfileApi";

/* --- COMPONENT ITEM --- */
type SettingItemProps = {
  icon: React.ReactNode;
  label: string;
  value?: string;
  isLast?: boolean;
  onPress?: () => void;
  isDestructive?: boolean;
  isSwitch?: boolean;
  switchValue?: boolean;
  onSwitchChange?: (val: boolean) => void;
  iconBgColor?: string; // Màu nền cho icon
};

const SettingItem = ({
  icon,
  label,
  value,
  isLast,
  onPress,
  isDestructive = false,
  isSwitch = false,
  switchValue,
  onSwitchChange,
  iconBgColor = "#F1F5F9"
}: SettingItemProps) => (
  <TouchableOpacity
    style={[styles.settingItem, isLast && styles.settingItemLast]}
    onPress={isSwitch ? undefined : onPress}
    activeOpacity={isSwitch ? 1 : 0.7}
    disabled={isSwitch}
  >
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      <View style={[
        styles.iconContainer,
        isDestructive ? styles.destructiveIcon : { backgroundColor: iconBgColor }
      ]}>
        {icon}
      </View>
      <Text style={[styles.itemLabel, isDestructive && styles.destructiveLabel]}>
        {label}
      </Text>
    </View>

    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      {isSwitch ? (
        <Switch
          trackColor={{ false: '#E2E8F0', true: '#3B82F6' }}
          thumbColor={'#FFFFFF'}
          ios_backgroundColor="#E2E8F0"
          onValueChange={onSwitchChange}
          value={switchValue}
        />
      ) : (
        <>
          {value && <Text style={styles.itemValue}>{value}</Text>}
          <ChevronRight size={18} color={isDestructive ? '#EF4444' : '#CBD5E1'} />
        </>
      )}
    </View>
  </TouchableOpacity>
);

/* --- MAIN SCREEN --- */
export default function SettingScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<SettingStackParamList>>();
  const { logout } = useAuth();

  // State
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isNotificationEnabled, setIsNotificationEnabled] = useState(true);

  // Load settings & profile
  const loadAllData = async () => {
    try {
      const [profileRes, notiSetting] = await Promise.all([
        ProfileApi.getMyProfile(),
        AsyncStorage.getItem('notification_enabled')
      ]);

      if (profileRes) {
        const p: any = profileRes;
        setProfile(p.user ? { ...p.user } : p);
      }

      if (notiSetting !== null) {
        setIsNotificationEnabled(JSON.parse(notiSetting));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { loadAllData(); }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadAllData();
  };

  const toggleNotification = async (value: boolean) => {
    setIsNotificationEnabled(value);
    await AsyncStorage.setItem('notification_enabled', JSON.stringify(value));
  };

  const handleLogout = () => {
    Alert.alert('Đăng xuất', 'Bạn có chắc chắn muốn đăng xuất?', [
      { text: 'Hủy', style: 'cancel' },
      { text: 'Đăng xuất', style: 'destructive', onPress: logout },
    ]);
  };

  const getAvatarLetter = () => profile?.fullName ? profile.fullName.charAt(0).toUpperCase() : "U";

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* 1. HEADER GRADIENT */}
      <LinearGradient colors={["#32502a", "#20331b"]} style={styles.headerGradient}>
        <Text style={styles.headerTitle}>Cài đặt</Text>
      </LinearGradient>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#3B82F6" colors={['#3B82F6']} />
        }
      >
        {/* 2. MINI PROFILE CARD */}
        <View style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarText}>{getAvatarLetter()}</Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName} numberOfLines={1}>{profile?.fullName || "Người dùng"}</Text>
            <Text style={styles.profileEmail} numberOfLines={1}>{profile?.email || "Đang tải..."}</Text>
          </View>
        </View>

        {/* 3. SETTINGS GROUPS */}

        {/* Hệ thống */}
        <View>
          <Text style={styles.sectionTitle}>Hệ thống</Text>
          <View style={styles.section}>
            <SettingItem
              icon={<Bell size={20} color="#3B82F6" />}
              iconBgColor="#EFF6FF" // Blue-50
              label="Thông báo"
              isSwitch
              switchValue={isNotificationEnabled}
              onSwitchChange={toggleNotification}
            />
            <SettingItem
              icon={<Moon size={20} color="#6366F1" />}
              iconBgColor="#EEF2FF" // Indigo-50
              label="Chế độ tối (Dark Mode)"
              isSwitch
              switchValue={false} // Placeholder
              onSwitchChange={() => Alert.alert("Thông báo", "Tính năng đang phát triển")}
              isLast
            />
          </View>
        </View>

        {/* Hỗ trợ */}
        <View>
          <Text style={styles.sectionTitle}>Hỗ trợ & Pháp lý</Text>
          <View style={styles.section}>
            <SettingItem
              icon={<Info size={20} color="#F59E0B" />} // Amber
              iconBgColor="#FFFBEB"
              label="Giới thiệu"
              onPress={() => navigation.navigate('About')}
            />
            <SettingItem
              icon={<FileText size={20} color="#8B5CF6" />} // Violet
              iconBgColor="#F5F3FF"
              label="Điều khoản sử dụng"
              onPress={() => navigation.navigate('Terms')}
              isLast
            />
          </View>
        </View>

        {/* Tài khoản */}
        <View>
          <Text style={styles.sectionTitle}>Tài khoản</Text>
          <View style={styles.section}>
            <SettingItem
              icon={<LogOut size={20} color="#EF4444" />}
              label="Đăng xuất"
              isDestructive
              onPress={handleLogout}
              isLast
            />
          </View>
        </View>

        {/* App Info Footer */}
        <View style={styles.appInfo}>
          <Text style={styles.appVersion}>Phiên bản 1.0.2</Text>
          <Text style={styles.appCopyright}>© 2025 University App Platform</Text>
        </View>

      </ScrollView>
    </View>
  );
}