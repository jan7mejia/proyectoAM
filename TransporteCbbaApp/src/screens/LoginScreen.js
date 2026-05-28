import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ActivityIndicator, Alert, Dimensions } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
// CORRECCIÓN CRÍTICA: Los imports deben ir siempre en la raíz superior externa
// Subimos un nivel con '../' para salir de src/screens y encontrar config.js en la raíz del proyecto
import { BASE_URL } from '../../config';

const { width } = Dimensions.get('window');

export default function LoginScreen({ navigation }) {
  const [loginInput, setLoginInput] = useState('');
  const [password, setPassword] = useState('');
  const [secureTextEntry, setSecureTextEntry] = useState(true);
  const [loading, setLoading] = useState(false);

  // Configuración de la URL de la API de PayBus
  const API_URL = `${BASE_URL}/api/login`;
  
  const handleRealLogin = async () => {
    if (!loginInput || !password) {
      Alert.alert('Campos vacíos', 'Por favor ingresa tus credenciales.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ loginInput, password }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        const userRol = data.user.rol;
        
        // Verificación estricta de roles retornados por tu Backend en Python
        if (userRol === 'pasajero') {
          navigation.navigate('PassengerDashboard', { user: data.user });
        } else if (userRol === 'chofer') {
          navigation.navigate('DriverDashboard', { user: data.user });
        } else if (userRol === 'admin') {
          navigation.navigate('AdminDashboard', { user: data.user });
        } else {
          Alert.alert('Error de Rol', 'El rol asignado a este usuario no es válido.');
        }
      } else {
        Alert.alert('Acceso Denegado', data.error || 'Credenciales incorrectas');
      }
    } catch (error) {
      Alert.alert('Error de Red', 'No se pudo establecer comunicación con el servidor ngrok.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.topCircle} />

      <View style={styles.headerContainer}>
        <View style={styles.logoBadge}>
          <MaterialIcons name="directions-bus" size={48} color="#fff" />
        </View>
        <Text style={styles.title}>PayBus</Text>
        <Text style={styles.subtitle}>CERCADO • COCHABAMBA</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardHeader}>¡Bienvenido de vuelta!</Text>
        
        <View style={styles.inputLabelContainer}>
          <Text style={styles.inputLabel}>Identificación</Text>
          <View style={styles.inputContainer}>
            <MaterialIcons name="assignment-ind" size={20} color="#3498db" style={styles.inputIcon} />
            <TextInput 
              style={styles.input} 
              placeholder="Nro. de Carnet o Correo" 
              placeholderTextColor="#475569"
              value={loginInput}
              onChangeText={setLoginInput}
              autoCapitalize="none"
            />
          </View>
        </View>

        <View style={styles.inputLabelContainer}>
          <Text style={styles.inputLabel}>Contraseña de Acceso</Text>
          <View style={styles.inputContainer}>
            <MaterialIcons name="lock" size={20} color="#3498db" style={styles.inputIcon} />
            <TextInput 
              style={styles.input} 
              placeholder="••••••••••••" 
              placeholderTextColor="#475569"
              secureTextEntry={secureTextEntry}
              value={password}
              onChangeText={setPassword}
            />
            <TouchableOpacity onPress={() => setSecureTextEntry(!secureTextEntry)} style={styles.eyeIcon}>
              <MaterialIcons name={secureTextEntry ? "visibility-off" : "visibility"} size={20} color="#64748b" />
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity style={styles.button} onPress={handleRealLogin} disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Iniciar Sesión</Text>
          )}
        </TouchableOpacity>

        <View style={styles.registerContainer}>
          <Text style={styles.registerText}>¿Eres nuevo pasajero? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('RegisterScreen')}>
            <Text style={styles.registerLink}>Regístrate aquí</Text>
          </TouchableOpacity>
        </View>
      </View>

      <Text style={styles.footerText}>Transporte Urbano Inteligente © 2026</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#090d16', justifyContent: 'center', padding: 24 },
  topCircle: { position: 'absolute', width: width * 1.2, height: width * 1.2, borderRadius: width * 0.6, backgroundColor: '#1e293b', top: -width * 0.5, left: -width * 0.1, opacity: 0.3 },
  headerContainer: { alignItems: 'center', marginBottom: 35 },
  logoBadge: { backgroundColor: '#3498db', padding: 14, borderRadius: 20, marginBottom: 15 },
  title: { fontSize: 36, fontWeight: '900', color: '#fff', letterSpacing: 1.5 },
  subtitle: { fontSize: 11, color: '#64748b', fontWeight: '800', marginTop: 4, letterSpacing: 3 },
  card: { backgroundColor: '#111827', padding: 26, borderRadius: 28, borderWidth: 1, borderColor: '#1f2937', elevation: 10 },
  cardHeader: { color: '#fff', fontSize: 18, fontWeight: '700', marginBottom: 20, textAlign: 'center' },
  inputLabelContainer: { marginBottom: 16 },
  inputLabel: { color: '#94a3b8', fontSize: 12, fontWeight: '600', marginBottom: 6, marginLeft: 2 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#030712', borderRadius: 14, paddingHorizontal: 14, borderWidth: 1, borderColor: '#1f2937', height: 54 },
  inputIcon: { marginRight: 12 },
  input: { flex: 1, color: '#fff', fontSize: 15 },
  eyeIcon: { padding: 4 },
  button: { backgroundColor: '#3498db', height: 54, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginTop: 12 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '700', letterSpacing: 0.5 },
  registerContainer: { flexDirection: 'row', justifyContent: 'center', marginTop: 22, alignItems: 'center' },
  registerText: { color: '#64748b', fontSize: 13 },
  registerLink: { color: '#3498db', fontSize: 13, fontWeight: '700' },
  footerText: { color: '#334155', fontSize: 11, textAlign: 'center', marginTop: 40, fontWeight: '600', letterSpacing: 0.5 }
});