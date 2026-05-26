import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import { useColorScheme } from 'react-native';

import { Storefront } from '@/constants/theme';
import { ApiProvider } from '@/providers/api-provider';
import { AuthProvider } from '@/providers/auth-provider';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const stackOptions = {
    headerTintColor: Storefront.colors.ink,
    headerTitleStyle: { fontWeight: '700' as const },
    headerShadowVisible: false,
    headerStyle: { backgroundColor: Storefront.colors.canvas },
    contentStyle: { backgroundColor: Storefront.colors.canvas },
  };

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <ApiProvider>
        <AuthProvider>
          <Stack screenOptions={stackOptions}>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="products/[slug]" options={{ title: 'Produkt' }} />
            <Stack.Screen name="checkout/index" options={{ title: 'Checkout' }} />
            <Stack.Screen name="checkout/pending" options={{ title: 'Płatność' }} />
            <Stack.Screen name="search/index" options={{ title: 'Szukaj' }} />
            <Stack.Screen name="account/orders/[reference]" options={{ title: 'Zamówienie' }} />
            <Stack.Screen name="account/wishlist" options={{ title: 'Wishlist' }} />
            <Stack.Screen name="blog/index" options={{ title: 'Blog' }} />
            <Stack.Screen name="blog/[slug]" options={{ title: 'Artykuł' }} />
            <Stack.Screen name="stores/index" options={{ title: 'Sklepy' }} />
            <Stack.Screen name="newsletter/index" options={{ title: 'Newsletter' }} />
            <Stack.Screen name="pages/[...slug]" options={{ title: 'Strona' }} />
          </Stack>
        </AuthProvider>
      </ApiProvider>
    </ThemeProvider>
  );
}
