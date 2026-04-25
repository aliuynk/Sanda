import { Tabs } from 'expo-router';
import { Home, Search, ShoppingBasket, Store, User } from 'lucide-react-native';

import { useSellerMode } from '../../src/features/role/use-seller-mode';

export default function TabsLayout() {
  const { isSellerMode } = useSellerMode();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#3a7725',
        tabBarInactiveTintColor: '#6b5837',
        tabBarStyle: { height: 62, paddingBottom: 8, paddingTop: 6 },
      }}
    >
      {isSellerMode ? (
        <>
          <Tabs.Screen
            name="index"
            options={{
              title: 'Panel',
              tabBarIcon: ({ color, size }) => <Store color={color} size={size} />,
            }}
          />
          <Tabs.Screen
            name="search"
            options={{
              title: 'Siparişler',
              tabBarIcon: ({ color, size }) => <ShoppingBasket color={color} size={size} />,
            }}
          />
          <Tabs.Screen
            name="cart"
            options={{ href: null }}
          />
          <Tabs.Screen
            name="account"
            options={{
              title: 'Hesabım',
              tabBarIcon: ({ color, size }) => <User color={color} size={size} />,
            }}
          />
        </>
      ) : (
        <>
          <Tabs.Screen
            name="index"
            options={{
              title: 'Ana sayfa',
              tabBarIcon: ({ color, size }) => <Home color={color} size={size} />,
            }}
          />
          <Tabs.Screen
            name="search"
            options={{
              title: 'Keşfet',
              tabBarIcon: ({ color, size }) => <Search color={color} size={size} />,
            }}
          />
          <Tabs.Screen
            name="cart"
            options={{
              title: 'Sepet',
              tabBarIcon: ({ color, size }) => <ShoppingBasket color={color} size={size} />,
            }}
          />
          <Tabs.Screen
            name="account"
            options={{
              title: 'Hesabım',
              tabBarIcon: ({ color, size }) => <User color={color} size={size} />,
            }}
          />
        </>
      )}
    </Tabs>
  );
}
