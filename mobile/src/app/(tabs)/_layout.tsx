import { Tabs } from 'expo-router';

import { Storefront } from '@/constants/theme';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShadowVisible: false,
        headerStyle: { backgroundColor: Storefront.colors.canvas },
        headerTitleStyle: { fontWeight: '700' },
        sceneStyle: { backgroundColor: Storefront.colors.canvas },
        tabBarActiveTintColor: Storefront.colors.primary,
        tabBarInactiveTintColor: Storefront.colors.muted,
        tabBarHideOnKeyboard: true,
        tabBarStyle: {
          height: 66,
          paddingTop: 8,
          backgroundColor: Storefront.colors.surface,
          borderTopColor: Storefront.colors.border,
        },
        tabBarLabelStyle: { fontWeight: '700' },
      }}>
      <Tabs.Screen name="index" options={{ title: 'Start' }} />
      <Tabs.Screen name="categories" options={{ title: 'Produkty' }} />
      <Tabs.Screen name="cart" options={{ title: 'Koszyk' }} />
      <Tabs.Screen name="account" options={{ title: 'Konto' }} />
    </Tabs>
  );
}
