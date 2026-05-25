import { Tabs } from 'expo-router';

export default function TabsLayout() {
  return (
    <Tabs screenOptions={{ tabBarHideOnKeyboard: true }}>
      <Tabs.Screen name="index" options={{ title: 'Home' }} />
      <Tabs.Screen name="categories" options={{ title: 'Produkty' }} />
      <Tabs.Screen name="cart" options={{ title: 'Koszyk' }} />
      <Tabs.Screen name="account" options={{ title: 'Konto' }} />
    </Tabs>
  );
}
