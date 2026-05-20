import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import PassengerDashboard from './src/screens/PassengerDashboard';
import DriverDashboard from './src/screens/DriverDashboard';
import AdminDashboard from './src/screens/AdminDashboard';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator 
        initialRouteName="Login"
        screenOptions={{
          // Se simplifican las opciones para evitar que el navegador web colapse
          headerStyle: { backgroundColor: '#1e272e' },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: 'bold' },
        }}
      >
        {/* Pantallas principales con cabeceras ocultas para renderizado nativo limpio */}
        <Stack.Screen 
          name="Login" 
          component={LoginScreen} 
          options={{ headerShown: false }} 
        />
        <Stack.Screen 
          name="RegisterScreen" 
          component={RegisterScreen} 
          options={{ headerShown: false }} 
        />

        {/* Paneles de Control */}
        <Stack.Screen 
          name="PassengerDashboard" 
          component={PassengerDashboard} 
          options={{ title: 'Portal Pasajero - PayBus' }} 
        />
        <Stack.Screen 
          name="DriverDashboard" 
          component={DriverDashboard} 
          options={{ title: 'Terminal de Ruta (Chofer)', headerLeft: () => null }} 
        />
        <Stack.Screen 
          name="AdminDashboard" 
          component={AdminDashboard} 
          options={{ title: 'Panel de Regulación Municipal', headerLeft: () => null }} 
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}