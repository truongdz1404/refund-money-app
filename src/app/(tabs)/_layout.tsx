import { Ionicons } from '@expo/vector-icons';
import { Redirect, Tabs } from 'expo-router';

import { colors } from '@/design/tokens';
import { useAuth } from '@/lib/authStore';

export default function TabsLayout() {
  const { token } = useAuth();

  if (!token) {
    return <Redirect href="/login" />;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.brand,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle: { fontSize: 10, fontWeight: '700' },
        tabBarIconStyle: { marginTop: 2 },
        tabBarStyle: {
          height: 58,
          paddingTop: 4,
          borderTopWidth: 1,
          borderTopColor: colors.hairline,
          backgroundColor: colors.card,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => <Ionicons name="home-outline" size={size - 2} color={color} />,
        }}
      />
      <Tabs.Screen
        name="wallet"
        options={{
          href: null,
          title: 'Thanh toán',
          tabBarIcon: ({ color, size }) => <Ionicons name="cash-outline" size={size - 2} color={color} />,
        }}
      />
      <Tabs.Screen
        name="link"
        options={{
          title: 'Tạo link',
          tabBarIcon: ({ color, size }) => <Ionicons name="bag-add-outline" size={size - 2} color={color} />,
        }}
      />
      <Tabs.Screen
        name="orders"
        options={{
          title: 'Đơn hàng',
          tabBarIcon: ({ color, size }) => <Ionicons name="cart-outline" size={size - 2} color={color} />,
        }}
      />
      <Tabs.Screen
        name="campaigns"
        options={{
          title: 'Sự kiện',
          tabBarIcon: ({ color, size }) => <Ionicons name="gift-outline" size={size - 2} color={color} />,
        }}
      />
      <Tabs.Screen
        name="more"
        options={{
          title: 'Tôi',
          tabBarIcon: ({ color, size }) => <Ionicons name="person-outline" size={size - 2} color={color} />,
        }}
      />
    </Tabs>
  );
}
