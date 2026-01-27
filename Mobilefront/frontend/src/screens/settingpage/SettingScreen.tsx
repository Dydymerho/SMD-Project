import type React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  Switch,
  RefreshControl
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Bell,
  Info,
  FileText,
  ChevronRight,
  LogOut,
} from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import styles from './Setting.styles';
import { useAuth } from '../../../../backend/Contexts/AuthContext';
import type { SettingStackParamList } from './SettingStackNavigation';
import { Profile } from "../../../../backend/types/Profile";
import { ProfileApi } from "../../../../backend/api/ProfileApi";
import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage'; // ✅ Thêm import này

// --- TYPE ---
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
};

// --- COMPONENT CON ---
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
}: SettingItemProps) => (
  <TouchableOpacity
    style={[styles.settingItem, isLast && styles.settingItemLast]}
    onPress={isSwitch ? undefined : onPress} // Nếu là switch thì không click được cả dòng
    activeOpacity={isSwitch ? 1 : 0.7}
  >
    <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
      <View
        style={[
          styles.settingIconBox,
          isDestructive && styles.destructiveIconBox,
        ]}
      >
        {icon}
      </View>
      <Text
        style={[styles.settingLabel, isDestructive && styles.destructiveLabel]}
      >
        {label}
      </Text>
    </View>
    {isSwitch ? (
      <Switch
        trackColor={{ false: '#767577', true: '#2563EB' }}
        thumbColor={switchValue ? '#f4f3f4' : '#f4f3f4'}
        ios_backgroundColor="#3e3e3e"
        onValueChange={onSwitchChange}
        value={switchValue}
      />
    ) : (
      <>
        {value && <Text style={styles.settingValue}>{value}</Text>}
        <ChevronRight size={18} color={isDestructive ? '#EF4444' : '#94A3B8'} />
      </>
    )}
  </TouchableOpacity>
);

// --- MAIN SCREEN ---
export default function SettingScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<SettingStackParamList>>();
  const { logout } = useAuth();

  // State
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isNotificationEnabled, setIsNotificationEnabled] = useState(true); // ✅ State thông báo

  const loadSettings = async () => {
    try {
      const value = await AsyncStorage.getItem('notification_enabled');
      if (value !== null) {
        setIsNotificationEnabled(JSON.parse(value));
      }
    } catch (e) {
      console.error('Failed to load settings');
    }
  };

  const fetchProfile = async () => {
    try {
      const res: any = await ProfileApi.getMyProfile();
      if (res && res.user) {
        setProfile({ ...res.user });
      } else {
        setProfile(res);
      }
    } catch (error) {
      console.error("Lỗi lấy Profile:", error);
    }
  };

  const loadAllData = async () => {
    try {
      await Promise.all([
        fetchProfile(),
        loadSettings() // ✅ Gọi hàm load settings
      ]);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  //Toggle Switch
  const toggleNotification = async (value: boolean) => {
    try {
      setIsNotificationEnabled(value);
      await AsyncStorage.setItem('notification_enabled', JSON.stringify(value));
      // Tại đây có thể gọi thêm API cập nhật lên server nếu cần
    } catch (e) {
      console.error('Failed to save settings');
    }
  };

  //Refresh 
  const onRefresh = () => {
    setRefreshing(true);
    loadAllData();
  };

  const handleLogout = async () => {
    Alert.alert('Đăng xuất', 'Bạn có chắc chắn muốn đăng xuất?', [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Đăng xuất',
        style: 'destructive',
        onPress: async () => {
          try {
            await logout();
          } catch (error) {
            console.error('Logout error:', error);
            Alert.alert('Lỗi', 'Không thể đăng xuất. Vui lòng thử lại.');
          }
        },
      },
    ]);
  };

  // Helper lấy chữ cái đầu tên user
  const getAvatarLetter = () => {
    if (profile?.fullName) {
      return profile.fullName.charAt(0).toUpperCase();
    }
    return "U";
  };

  return (
    <View style={styles.container}>
      <SafeAreaView edges={['bottom']} style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#2563EB']} />
          }
        >
          {/* PROFILE SECTION */}
          <View style={styles.profileSection}>
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarText}>{getAvatarLetter()}</Text>
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{profile?.fullName || "Người dùng"}</Text>
              <Text style={styles.profileEmail}>{profile?.email || "Đang tải..."}</Text>
            </View>
          </View>

          {/* SYSTEM SECTION */}
          <View style={[styles.section, { marginTop: 24 }]}>
            <Text style={styles.sectionTitle}>Hệ thống</Text>
            <SettingItem
              icon={<Bell size={20} color="#2563EB" />}
              label="Thông báo"
              isSwitch={true}
              switchValue={isNotificationEnabled}
              onSwitchChange={toggleNotification}
            />
          </View>

          {/* SUPPORT SECTION */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Hỗ trợ</Text>
            <SettingItem
              icon={<Info size={20} color="#2563EB" />}
              label="Giới thiệu"
              onPress={() => navigation.navigate('About')}
            />
            <SettingItem
              icon={<FileText size={20} color="#2563EB" />}
              label="Điều khoản sử dụng"
              onPress={() => navigation.navigate('Terms')}
            />
          </View>

          {/* ACCOUNT SECTION */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Tài khoản</Text>
            <SettingItem
              icon={<LogOut size={20} color="#EF4444" />}
              label="Đăng xuất"
              isLast
              isDestructive
              onPress={handleLogout}
            />
          </View>
          {/* APP INFO */}
          <View style={styles.appInfo}>
            <Text style={styles.appVersion}>Phiên bản 1.0.0</Text>
            <Text style={styles.appCopyright}>© 2025 University App</Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}