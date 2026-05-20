import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

export default function RegisterScreen({ navigation }) {
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [ci, setCi] = useState('');
  const [correo, setCorreo] = useState('');
  const [telefono, setTelefono] = useState('');
  const [password, setPassword] = useState('');
  
  const [rol, setRol] = useState('pasajero'); 
  const [categoria, setCategoria] = useState('universitario'); 
  
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [apiSuccess, setApiSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const API_URL = 'http://192.168.20.10:5000/api/register'; 

  const handleRegister = async () => {
    setErrors({});
    setApiError('');
    setApiSuccess('');
    
    let localErrors = {};

    if (!nombre || !nombre.trim()) localErrors.nombre = 'El nombre es obligatorio.';
    if (!apellido || !apellido.trim()) localErrors.apellido = 'El apellido es obligatorio.';
    if (!ci || !ci.trim()) localErrors.ci = 'El documento C.I. es obligatorio.';
    if (!correo || !correo.trim()) {
      localErrors.correo = 'El correo electrónico es obligatorio.';
    } else if (!/\S+@\S+\.\S+/.test(correo)) {
      localErrors.correo = 'El formato de correo no es válido.';
    }
    if (!password || !password.trim()) {
      localErrors.password = 'Debes definir una contraseña.';
    } else if (password.trim().length < 6) {
      localErrors.password = 'La contraseña debe tener mínimo 6 caracteres.';
    }

    if (Object.keys(localErrors).length > 0) {
      setErrors(localErrors);
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          nombre: nombre.trim(), 
          apellido: apellido.trim(), 
          ci: ci.trim(), 
          correo: correo.trim(), 
          telefono: telefono ? telefono.trim() : '', 
          password: password.trim(),
          rol,
          categoria: rol === 'pasajero' ? categoria : '' 
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setApiSuccess(`¡Registro Exitoso! Cuenta de ${rol.toUpperCase()} creada.`);
        setTimeout(() => {
          navigation.navigate('Login');
        }, 2000);
      } else {
        setApiError(data.error || 'Ocurrió un error inesperado en el servidor.');
      }
    } catch (error) {
      setApiError('Error de red: No se pudo conectar con la API de Python.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.title}>Crear Cuenta</Text>
        <Text style={styles.subtitle}>SISTEMA DE REGULACIÓN MULTI-ROL PAYBUS</Text>
      </View>

      <View style={styles.card}>
        
        {/* BANNER DE NOTIFICACIONES DE LA API */}
        {apiError ? <View style={styles.errorBanner}><Text style={styles.errorTextBanner}>{apiError}</Text></View> : null}
        {apiSuccess ? <View style={styles.successBanner}><Text style={styles.successTextBanner}>{apiSuccess}</Text></View> : null}

        {/* SELECTOR DE ROL */}
        <Text style={styles.labelTitle}>Tipo de Usuario</Text>
        <View style={styles.selectorRow}>
          <TouchableOpacity 
            style={[styles.selectorButton, rol === 'pasajero' && styles.selectorActive]} 
            onPress={() => { setRol('pasajero'); setApiError(''); }}
          >
            <MaterialIcons name="directions-walk" size={18} color={rol === 'pasajero' ? '#fff' : '#64748b'} />
            <Text style={[styles.selectorText, rol === 'pasajero' && styles.textActive]}>Pasajero</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.selectorButton, rol === 'chofer' && styles.selectorActive]} 
            onPress={() => { setRol('chofer'); setApiError(''); }}
          >
            <MaterialIcons name="airline-seat-recline-normal" size={18} color={rol === 'chofer' ? '#fff' : '#64748b'} />
            <Text style={[styles.selectorText, rol === 'chofer' && styles.textActive]}>Chofer</Text>
          </TouchableOpacity>
        </View>

        {/* SELECTOR DE CATEGORÍA (SOLO PASAJEROS) */}
        {rol === 'pasajero' && (
          <View style={{ marginBottom: 16 }}>
            <Text style={styles.labelTitle}>Categoría de Tarifa (Cercado)</Text>
            <View style={styles.gridSelector}>
              {['estudiante', 'universitario', 'adulto', 'adulto_mayor'].map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[styles.gridButton, categoria === cat && styles.gridActive]}
                  onPress={() => setCategoria(cat)}
                >
                  <Text style={[styles.gridText, categoria === cat && styles.textActive]}>
                    {cat.replace('_', ' ').toUpperCase()}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* FORMULARIO DE ENTRADA */}
        <View style={styles.row}>
          <View style={[styles.inputGroup, { marginRight: 10 }]}>
            <Text style={styles.label}>Nombre</Text>
            <TextInput style={styles.input} placeholder="Ej. Jan" placeholderTextColor="#475569" value={nombre} onChangeText={setNombre} />
            {errors.nombre && <Text style={styles.fieldError}>{errors.nombre}</Text>}
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Apellido</Text>
            <TextInput style={styles.input} placeholder="Ej. Mejia" placeholderTextColor="#475569" value={apellido} onChangeText={setApellido} />
            {errors.apellido && <Text style={styles.fieldError}>{errors.apellido}</Text>}
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Carnet de Identidad (C.I.)</Text>
          <TextInput style={styles.input} placeholder="Nro. de Documento de Identidad" placeholderTextColor="#475569" value={ci} onChangeText={setCi} />
          {errors.ci && <Text style={styles.fieldError}>{errors.ci}</Text>}
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Correo Electrónico</Text>
          <TextInput style={styles.input} placeholder="correo@paybus.com" placeholderTextColor="#475569" keyboardType="email-address" autoCapitalize="none" value={correo} onChangeText={setCorreo} />
          {errors.correo && <Text style={styles.fieldError}>{errors.correo}</Text>}
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Número Telefónico (Opcional)</Text>
          <TextInput style={styles.input} placeholder="Ej. 71234567" placeholderTextColor="#475569" value={telefono} onChangeText={setTelefono} />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Definir Contraseña</Text>
          <TextInput style={styles.input} placeholder="Mínimo 6 dígitos" placeholderTextColor="#475569" secureTextEntry value={password} onChangeText={setPassword} />
          {errors.password && <Text style={styles.fieldError}>{errors.password}</Text>}
        </View>

        <TouchableOpacity style={styles.button} onPress={handleRegister} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Registrar en Base de Datos</Text>}
        </TouchableOpacity>

        <TouchableOpacity style={styles.backButton} onPress={() => navigation.navigate('Login')}>
          <Text style={styles.backButtonText}>Volver al Inicio de Sesión</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: '#090d16', justifyContent: 'center', padding: 24 },
  headerContainer: { alignItems: 'center', marginBottom: 20 },
  title: { fontSize: 32, fontWeight: '900', color: '#fff' },
  subtitle: { fontSize: 10, color: '#64748b', fontWeight: '800', marginTop: 4, letterSpacing: 1.5 },
  card: { backgroundColor: '#111827', padding: 22, borderRadius: 24, borderWidth: 1, borderColor: '#1f2937' },
  labelTitle: { color: '#3498db', fontSize: 13, fontWeight: '700', marginBottom: 8 },
  selectorRow: { flexDirection: 'row', backgroundColor: '#030712', borderRadius: 12, padding: 4, marginBottom: 16, borderWidth: 1, borderColor: '#1f2937' },
  selectorButton: { flex: 1, flexDirection: 'row', height: 40, justifyContent: 'center', alignItems: 'center', borderRadius: 8 },
  selectorActive: { backgroundColor: '#3498db' },
  selectorText: { color: '#64748b', fontSize: 14, fontWeight: '600', marginLeft: 6 },
  gridSelector: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, backgroundColor: '#030712', padding: 6, borderRadius: 12, borderWidth: 1, borderColor: '#1f2937' },
  gridButton: { flex: 1, minWidth: '45%', height: 36, justifyContent: 'center', alignItems: 'center', borderRadius: 8, backgroundColor: '#111827' },
  gridActive: { backgroundColor: '#1e293b', borderWidth: 1, borderColor: '#3498db' },
  gridText: { color: '#64748b', fontSize: 11, fontWeight: '700' },
  textActive: { color: '#fff' },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  inputGroup: { flex: 1, marginBottom: 14 },
  label: { color: '#94a3b8', fontSize: 12, fontWeight: '600', marginBottom: 6 },
  input: { backgroundColor: '#030712', borderRadius: 12, paddingHorizontal: 14, borderWidth: 1, borderColor: '#1f2937', height: 46, color: '#fff', fontSize: 14 },
  fieldError: { color: '#ef4444', fontSize: 11, marginTop: 4, fontWeight: '600', marginLeft: 2 },
  errorBanner: { backgroundColor: '#ef444422', padding: 12, borderRadius: 12, borderWidth: 1, borderColor: '#ef4444', marginBottom: 16 },
  errorTextBanner: { color: '#f87171', fontSize: 13, fontWeight: '600', textAlign: 'center' },
  successBanner: { backgroundColor: '#10b98122', padding: 12, borderRadius: 12, borderWidth: 1, borderColor: '#10b981', marginBottom: 16 },
  successTextBanner: { color: '#34d399', fontSize: 13, fontWeight: '600', textAlign: 'center' },
  button: { backgroundColor: '#3498db', height: 50, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginTop: 14 },
  buttonText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  backButton: { marginTop: 16, alignItems: 'center' },
  backButtonText: { color: '#64748b', fontSize: 13, textDecorationLine: 'underline' }
});