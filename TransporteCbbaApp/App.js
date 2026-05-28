import React from 'react';
import { Platform, SafeAreaView, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Importación de pantallas principales
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import PassengerDashboard from './src/screens/PassengerDashboard';
import DriverDashboard from './src/screens/DriverDashboard';
import AdminDashboard from './src/screens/AdminDashboard';

// Importación de las nuevas sub-pantallas del Pasajero
import ScanQRScreen from './src/screens/ScanQRScreen';
import RfidCardScreen from './src/screens/RfidCardScreen';
import RechargeScreen from './src/screens/RechargeScreen';
import TravelHistoryScreen from './src/screens/TravelHistoryScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  
  // Encapsulamos la navegación en un componente limpio
  const NavigationLayout = () => (
    <NavigationContainer>
      <Stack.Navigator 
        initialRouteName="LoginScreen" // Control estricto: Siempre arranca en el Login
        screenOptions={{
          // Se desactivan las animaciones pesadas en web para evitar el colapso de Metro
          animation: Platform.OS === 'web' ? 'none' : 'default',
          headerStyle: { backgroundColor: '#0f172a' },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: 'bold' },
        }}
      >
        {/* ========================================================= */}
        {/* PANTALLAS DE AUTENTICACIÓN                                */}
        {/* ========================================================= */}
        <Stack.Screen 
          name="LoginScreen" 
          component={LoginScreen} 
          options={{ headerShown: false }} 
        />
        <Stack.Screen 
          name="RegisterScreen" 
          component={RegisterScreen} 
          options={{ headerShown: false }} 
        />

        {/* ========================================================= */}
        {/* PANELES DE CONTROL PRINCIPALES                            */}
        {/* ========================================================= */}
        <Stack.Screen 
          name="PassengerDashboard" 
          component={PassengerDashboard} 
          options={{ headerShown: false }} // Ocultado para usar el Header personalizado azul oscuro
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

        {/* ========================================================= */}
        {/* SUB-MODULOS DEL PASAJERO (INTEGRACIÓN COMPLETA)           */}
        {/* ========================================================= */}
        <Stack.Screen 
          name="ScanQRScreen" 
          component={ScanQRScreen} 
          options={{ headerShown: false }} 
        />
        <Stack.Screen 
          name="RfidCardScreen" 
          component={RfidCardScreen} 
          options={{ headerShown: false }} 
        />
        <Stack.Screen 
          name="RechargeScreen" 
          component={RechargeScreen} 
          options={{ headerShown: false }} 
        />
        <Stack.Screen 
          name="TravelHistoryScreen" 
          component={TravelHistoryScreen} 
          options={{ headerShown: false }} 
        />

      </Stack.Navigator>
    </NavigationContainer>
  );

  // Si se ejecuta en la Web, envolvemos la App en un contenedor seguro para evitar pantallas en blanco
  if (Platform.OS === 'web') {
    return (
      <SafeAreaView style={styles.webContainer}>
        <NavigationLayout />
      </SafeAreaView>
    );
  }

  // Si se ejecuta en celular (Android/iOS), se renderiza normal
  return <NavigationLayout />;
}

const styles = StyleSheet.create({
  webContainer: {
    flex: 1,
    backgroundColor: '#090d16', // Mantiene el fondo oscuro oficial de PayBus en la laptop
  },
});