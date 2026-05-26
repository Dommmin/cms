import { SymbolView } from 'expo-symbols';
import { Tabs } from 'expo-router';
import type { ColorValue } from 'react-native';

import { ComparisonBar } from '@/components/comparison-bar';
import { Storefront } from '@/constants/theme';

type TabIconName = {
  ios: 'house' | 'square.grid.2x2' | 'cart' | 'person.circle';
  android: 'home' | 'category' | 'shopping_cart' | 'person';
  web: 'home' | 'category' | 'shopping_cart' | 'person';
};

function TabIcon({ color, name, size }: { color: ColorValue; name: TabIconName; size: number }) {
  return <SymbolView name={name} size={size} weight="semibold" tintColor={color} />;
}

export default function TabsLayout() {
  return (
    <>
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
        <Tabs.Screen
          name="index"
          options={{
            title: 'Start',
            tabBarIcon: ({ color, size }) => <TabIcon color={color} name={{ ios: 'house', android: 'home', web: 'home' }} size={size} />,
          }}
        />
        <Tabs.Screen
          name="categories"
          options={{
            title: 'Produkty',
            tabBarIcon: ({ color, size }) => (
              <TabIcon color={color} name={{ ios: 'square.grid.2x2', android: 'category', web: 'category' }} size={size} />
            ),
          }}
        />
        <Tabs.Screen
          name="cart"
          options={{
            title: 'Koszyk',
            tabBarIcon: ({ color, size }) => (
              <TabIcon color={color} name={{ ios: 'cart', android: 'shopping_cart', web: 'shopping_cart' }} size={size} />
            ),
          }}
        />
        <Tabs.Screen
          name="account"
          options={{
            title: 'Konto',
            tabBarIcon: ({ color, size }) => (
              <TabIcon color={color} name={{ ios: 'person.circle', android: 'person', web: 'person' }} size={size} />
            ),
          }}
        />
      </Tabs>
      <ComparisonBar />
    </>
  );
}
