import { BASE_URL } from '../../config';
import React, { useState, useRef } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TextInput, 
  TouchableOpacity, 
  ActivityIndicator, 
  ScrollView, 
  KeyboardAvoidingView, 
  Platform,
  Modal
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';

export default function RegisterScreen({ navigation }) {
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [ci, setCi] = useState('');
  const [correo, setCorreo] = useState('');
  const [telefono, setTelefono] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false); // Estado para visibilidad de contraseña
  
  // Manejo de la Fecha de Nacimiento con Objeto Date
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isDateSelected, setIsDateSelected] = useState(false);
  
  const [rol, setRol] = useState('pasajero'); 
  const [categoria, setCategoria] = useState('universitario'); 
  
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [apiSuccess, setApiSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  // Estados para controlar el modal personalizado
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState('success'); 
  const [modalMessage, setModalMessage] = useState('');

  // Referencia para mover la pantalla hacia arriba si hay fallas
  const scrollViewRef = useRef(null);

  const API_URL = `${BASE_URL}/api/register`;

  const validateStandardEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateUniversityEmail = (email) => {
    const uniRegex = /^[^\s@]+@(umss\.edu\.bo|upds\.net\.bo|upds\.edu\.bo|[a-zA-Z0-9.-]+\.edu\.bo)$/i;
    return uniRegex.test(email);
  };

  // Función local para calcular la edad exacta en el cliente
  const obtenerEdad = (fechaNac) => {
    const hoy = new Date();
    let edadCalculada = hoy.getFullYear() - fechaNac.getFullYear();
    const diferenciaMeses = hoy.getMonth() - fechaNac.getMonth();
    if (diferenciaMeses < 0 || (diferenciaMeses === 0 && hoy.getDate() < fechaNac.getDate())) {
      edadCalculada--;
    }
    return edadCalculada;
  };

  // Manejador del DatePicker Nativo
  const onDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || date;
    setShowDatePicker(Platform.OS === 'ios');
    setDate(currentDate);
    setIsDateSelected(true);
    setErrors(prev => ({ ...prev, fechaNacimiento: null }));
  };

  // Formatear fecha visible en el botón (DD/MM/AAAA)
  const getFormattedDateLabel = () => {
    if (!isDateSelected) return "Seleccionar Fecha";
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // Formatear para enviar de forma compatible con la Base de Datos (YYYY-MM-DD)
  const getMysqlDateString = () => {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${year}-${month}-${day}`;
  };

  const triggerModal = (type, message) => {
    setModalType(type);
    setModalMessage(message);
    setModalVisible(true);
  };

  const handleCloseErrorModal = () => {
    setModalVisible(false);
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollTo({ y: 0, animated: true });
    }
  };

  const handleRegister = async () => {
    setErrors({});
    setApiError('');
    setApiSuccess('');
    
    let localErrors = {};
    const cleanNombre = nombre.trim();
    const cleanApellido = apellido.trim();
    const cleanCi = ci.trim();
    const cleanCorreo = correo.trim();
    const cleanTelefono = telefono.trim();
    const cleanPassword = password.trim();

    if (!cleanNombre) localErrors.nombre = 'El nombre es obligatorio.';
    if (!cleanApellido) localErrors.apellido = 'El apellido es obligatorio.';
    
    const ciRegex = /^\d+$/;
    if (!cleanCi) {
      localErrors.ci = 'El carnet C.I. es obligatorio.';
    } else if (!ciRegex.test(cleanCi)) {
      localErrors.ci = 'Solo números.';
    } else if (cleanCi.length < 5 || cleanCi.length > 10) {
      localErrors.ci = 'Entre 5 y 10 dígitos.';
    }

    // Validación detallada de Fechas y Límites de Edad
    if (!isDateSelected) {
      localErrors.fechaNacimiento = 'La fecha es obligatoria.';
    } else {
      const edadUser = obtenerEdad(date);
      
      if (rol === 'chofer' && edadUser < 18) {
        localErrors.fechaNacimiento = 'Debe ser mayor de 18 años para ser Chofer.';
      } else if (rol === 'pasajero') {
        if (categoria === 'estudiante' && edadUser >= 19) {
          localErrors.fechaNacimiento = 'Categoría Estudiante permite máximo 18 años.';
        } else if (categoria === 'adulto_mayor' && edadUser < 60) {
          localErrors.fechaNacimiento = 'Adulto Mayor requiere mínimo 60 años.';
        }
      }
    }

    if (!cleanCorreo) {
      localErrors.correo = 'El correo es obligatorio.';
    } else if (!validateStandardEmail(cleanCorreo)) {
      localErrors.correo = 'Formato no válido.';
    } else if (rol === 'pasajero' && categoria === 'universitario') {
      if (!validateUniversityEmail(cleanCorreo)) {
        localErrors.correo = 'Usa tu correo institucional (Ej: @umss.edu.bo o @upds.net.bo).';
      }
    }

    if (cleanTelefono.length > 0) {
      const telRegex = /^[67]\d{7}$/;
      if (!telRegex.test(cleanTelefono)) {
        localErrors.telefono = 'Inicia con 6 o 7 (8 dígitos).';
      }
    }

    if (!cleanPassword) {
      localErrors.password = 'La contraseña es obligatoria.';
    } else if (cleanPassword.length < 6) {
      localErrors.password = 'Mínimo 6 caracteres.';
    }

    if (Object.keys(localErrors).length > 0) {
      setErrors(localErrors);
      setApiError('Por favor verifica los campos marcados en rojo.');
      triggerModal('error', localErrors.fechaNacimiento || 'Faltan campos obligatorios o el formato es incorrecto.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          nombre: cleanNombre, 
          apellido: cleanApellido, 
          ci: cleanCi, 
          correo: cleanCorreo, 
          telefono: cleanTelefono, 
          password: cleanPassword,
          fecha_nacimiento: getMysqlDateString(),
          rol,
          categoria: rol === 'pasajero' ? categoria : null 
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setApiSuccess(`¡Registro Exitoso! Cuenta creada.`);
        triggerModal('success', '¡Tu cuenta ha sido creada con éxito en LlajtaBus!');
        
        setTimeout(() => {
          setModalVisible(false);
          navigation.navigate('LoginScreen'); 
        }, 2200);
      } else {
        const errorMsg = data.error || 'Ocurrió un error inesperado en el servidor.';
        setApiError(errorMsg);
        triggerModal('error', errorMsg);
      }
    } catch (error) {
      const networkError = 'Error de red: No se pudo conectar con el servidor de LlajtaBus.';
      setApiError(networkError);
      triggerModal('error', networkError);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
      style={{ flex: 1, backgroundColor: '#090d16' }}
    >
      <ScrollView 
        ref={scrollViewRef}
        contentContainerStyle={styles.container} 
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.headerContainer}>
          <Text style={styles.title}>Crear Cuenta</Text>
          <Text style={styles.subtitle}>SISTEMA DE REGULACIÓN MULTI-ROL LLAJTABUS</Text>
        </View>

        <View style={styles.card}>
          {apiError ? <View style={styles.errorBanner}><Text style={styles.errorTextBanner}>{apiError}</Text></View> : null}
          {apiSuccess ? <View style={styles.successBanner}><Text style={styles.successTextBanner}>{apiSuccess}</Text></View> : null}

          <Text style={styles.labelTitle}>Tipo de Usuario</Text>
          <View style={styles.selectorRow}>
            <TouchableOpacity 
              style={[styles.selectorButton, rol === 'pasajero' && styles.selectorActive]} 
              onPress={() => { setRol('pasajero'); setApiError(''); setErrors({}); }}
            >
              <MaterialIcons name="directions-walk" size={18} color={rol === 'pasajero' ? '#fff' : '#64748b'} />
              <Text style={[styles.selectorText, rol === 'pasajero' && styles.textActive]}>Pasajero</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.selectorButton, rol === 'chofer' && styles.selectorActive]} 
              onPress={() => { setRol('chofer'); setApiError(''); setErrors({}); }}
            >
              <MaterialIcons name="airline-seat-recline-normal" size={18} color={rol === 'chofer' ? '#fff' : '#64748b'} />
              <Text style={[styles.selectorText, rol === 'chofer' && styles.textActive]}>Chofer</Text>
            </TouchableOpacity>
          </View>

          {rol === 'pasajero' && (
            <View style={{ marginBottom: 16 }}>
              <Text style={styles.labelTitle}>Categoría de Tarifa (Cercado)</Text>
              <View style={styles.gridSelector}>
                {['estudiante', 'universitario', 'adulto', 'adulto_mayor'].map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    style={[styles.gridButton, categoria === cat && styles.gridActive]}
                    onPress={() => { setCategoria(cat); setErrors({}); }}
                  >
                    <Text style={[styles.gridText, categoria === cat && styles.textActive]}>
                      {cat.replace('_', ' ')}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          <View style={styles.row}>
            <View style={[styles.inputGroup, { marginRight: 10 }]}>
              <Text style={styles.label}>Nombre</Text>
              <TextInput style={styles.input} placeholder="Jan Alessi" placeholderTextColor="#475569" value={nombre} onChangeText={setNombre} />
              {errors.nombre && <Text style={styles.fieldError}>{errors.nombre}</Text>}
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Apellido</Text>
              <TextInput style={styles.input} placeholder="Mejia" placeholderTextColor="#475569" value={apellido} onChangeText={setApellido} />
              {errors.apellido && <Text style={styles.fieldError}>{errors.apellido}</Text>}
            </View>
          </View>

          <View style={styles.row}>
            <View style={[styles.inputGroup, { marginRight: 10 }]}>
              <Text style={styles.label}>Carnet Identidad</Text>
              <TextInput style={styles.input} placeholder="Ej. 7948211" placeholderTextColor="#475569" keyboardType="numeric" value={ci} onChangeText={setCi} />
              {errors.ci && <Text style={styles.fieldError}>{errors.ci}</Text>}
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Fec. Nacimiento</Text>
              <TouchableOpacity 
                style={[styles.input, styles.datePickerButton, errors.fechaNacimiento && { borderColor: '#ef4444' }]} 
                onPress={() => setShowDatePicker(true)}
              >
                <Text style={[styles.dateText, isDateSelected && { color: '#fff' }]}>
                  {getFormattedDateLabel()}
                </Text>
                <MaterialIcons name="calendar-today" size={18} color="#3498db" />
              </TouchableOpacity>
              
              {showDatePicker && (
                <DateTimePicker
                  value={date}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={onDateChange}
                  maximumDate={new Date()} 
                />
              )}
              {errors.fechaNacimiento && <Text style={styles.fieldError}>{errors.fechaNacimiento}</Text>}
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Correo Electrónico</Text>
            <TextInput style={styles.input} placeholder={categoria === 'universitario' && rol === 'pasajero' ? "ejemplo@umss.edu.bo" : "correo@correo.com"} placeholderTextColor="#475569" keyboardType="email-address" autoCapitalize="none" value={correo} onChangeText={setCorreo} />
            {errors.correo && <Text style={styles.fieldError}>{errors.correo}</Text>}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Número Telefónico (Opcional)</Text>
            <TextInput style={styles.input} placeholder="Ej. 71234567" placeholderTextColor="#475569" keyboardType="phone-pad" value={telefono} onChangeText={setTelefono} />
            {errors.telefono && <Text style={styles.fieldError}>{errors.telefono}</Text>}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Definir Contraseña</Text>
            <View style={[styles.passwordContainer, errors.password && { borderColor: '#ef4444' }]}>
              <TextInput 
                style={styles.passwordInput} 
                placeholder="Mínimo 6 caracteres" 
                placeholderTextColor="#475569" 
                secureTextEntry={!showPassword} 
                autoCapitalize="none" 
                value={password} 
                onChangeText={setPassword} 
              />
              <TouchableOpacity 
                style={styles.iconContainer} 
                onPress={() => setShowPassword(!showPassword)}
              >
                <MaterialIcons 
                  name={showPassword ? "visibility" : "visibility-off"} 
                  size={20} 
                  color="#64748b" 
                />
              </TouchableOpacity>
            </View>
            {errors.password && <Text style={styles.fieldError}>{errors.password}</Text>}
          </View>

          <TouchableOpacity style={styles.button} onPress={handleRegister} disabled={loading} activeOpacity={0.8}>
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <View style={styles.buttonContent}>
                <MaterialIcons name="person-add" size={20} color="#fff" style={{ marginRight: 8 }} />
                <Text style={styles.buttonText}>Crear Mi Cuenta LlajtaBus</Text>
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity style={styles.backButton} onPress={() => navigation.navigate('LoginScreen')}>
            <Text style={styles.backButtonText}>Volver al Inicio de Sesión</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={[
              styles.modalIconCircle, 
              { backgroundColor: modalType === 'success' ? '#10b98122' : '#ef444422' }
            ]}>
              <MaterialIcons 
                name={modalType === 'success' ? 'check-circle' : 'cancel'} 
                size={54} 
                color={modalType === 'success' ? '#10b981' : '#ef4444'} 
              />
            </View>
            
            <Text style={styles.modalTitle}>
              {modalType === 'success' ? '¡Todo Listo!' : 'Error de Registro'}
            </Text>
            
            <Text style={styles.modalMessageText}>{modalMessage}</Text>
            
            {modalType === 'error' ? (
              <TouchableOpacity style={styles.modalButtonError} onPress={handleCloseErrorModal}>
                <Text style={styles.modalButtonText}>Corregir Datos</Text>
              </TouchableOpacity>
            ) : (
              <Text style={styles.modalRedirectText}>Redirigiendo al login...</Text>
            )}
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: '#090d16', justifyContent: 'center', padding: 24, paddingTop: 40, paddingBottom: 40 },
  headerContainer: { alignItems: 'center', marginBottom: 20 },
  title: { fontSize: 32, fontWeight: '900', color: '#fff' },
  subtitle: { fontSize: 10, color: '#64748b', fontWeight: '800', marginTop: 4, letterSpacing: 1.5 },
  card: { backgroundColor: '#111827', padding: 22, borderRadius: 24, borderWidth: 1, borderColor: '#1f2937' },
  labelTitle: { color: '#3498db', fontSize: 13, fontWeight: '700', marginBottom: 8 },
  selectorRow: { flexDirection: 'row', backgroundColor: '#030712', borderRadius: 12, padding: 4, marginBottom: 16, borderWidth: 1, borderColor: '#1f2937' },
  selectorButton: { flex: 1, flexDirection: 'row', height: 40, justifyContent: 'center', alignItems: 'center', borderRadius: 8 },
  selectorActive: { backgroundColor: '#3498db' },
  selectorText: { color: '#64748b', fontSize: 14, fontWeight: '600', marginLeft: 6 },
  gridSelector: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, backgroundColor: '#030712', padding: 6, borderRadius: 12, borderWidth: 1, borderColor: '#1f2937', marginTop: 4 },
  gridButton: { flex: 1, minWidth: '45%', height: 36, justifyContent: 'center', alignItems: 'center', borderRadius: 8, backgroundColor: '#111827' },
  gridActive: { backgroundColor: '#1e293b', borderWidth: 1, borderColor: '#3498db' },
  gridText: { color: '#64748b', fontSize: 11, fontWeight: '700', textTransform: 'uppercase' },
  textActive: { color: '#fff' },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  inputGroup: { flex: 1, marginBottom: 14 },
  label: { color: '#94a3b8', fontSize: 12, fontWeight: '600', marginBottom: 6 },
  input: { backgroundColor: '#030712', borderRadius: 12, paddingHorizontal: 14, borderWidth: 1, borderColor: '#1f2937', height: 46, color: '#fff', fontSize: 14 },
  
  // Estilos mejorados para el Input con Contraseña
  passwordContainer: { flexDirection: 'row', backgroundColor: '#030712', borderRadius: 12, borderWidth: 1, borderColor: '#1f2937', height: 46, alignItems: 'center' },
  passwordInput: { flex: 1, height: '100%', paddingHorizontal: 14, color: '#fff', fontSize: 14 },
  iconContainer: { paddingHorizontal: 14, height: '100%', justifyContent: 'center', alignItems: 'center' },
  
  datePickerButton: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  dateText: { color: '#475569', fontSize: 14 },
  fieldError: { color: '#ef4444', fontSize: 11, marginTop: 4, fontWeight: '600', marginLeft: 2 },
  errorBanner: { backgroundColor: '#ef444422', padding: 12, borderRadius: 12, borderWidth: 1, borderColor: '#ef4444', marginBottom: 16 },
  errorTextBanner: { color: '#f87171', fontSize: 13, fontWeight: '600', textAlign: 'center' },
  successBanner: { backgroundColor: '#10b98122', padding: 12, borderRadius: 12, borderWidth: 1, borderColor: '#10b981', marginBottom: 16 },
  successTextBanner: { color: '#34d399', fontSize: 13, fontWeight: '600', textAlign: 'center' },
  button: { backgroundColor: '#3498db', height: 50, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginTop: 14 },
  buttonContent: { flexDirection: 'row', alignItems: 'center' },
  buttonText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  backButton: { marginTop: 16, alignItems: 'center' },
  backButtonText: { color: '#64748b', fontSize: 13, textDecorationLine: 'underline' },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(3, 7, 18, 0.85)', justifyContent: 'center', alignItems: 'center', padding: 24 },
  modalContainer: { backgroundColor: '#111827', width: '100%', maxWidth: 340, borderRadius: 28, padding: 26, alignItems: 'center', borderWidth: 1, borderColor: '#1f2937', elevation: 20 },
  modalIconCircle: { width: 80, height: 80, borderRadius: 40, justifyContent: 'center', alignItems: 'center', marginBottom: 18 },
  modalTitle: { color: '#fff', fontSize: 20, fontWeight: '900', marginBottom: 10, textAlign: 'center' },
  modalMessageText: { color: '#94a3b8', fontSize: 14, textAlign: 'center', lineHeight: 20, marginBottom: 24, fontWeight: '500' },
  modalButtonError: { backgroundColor: '#ef4444', height: 46, width: '100%', borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  modalButtonText: { color: '#fff', fontSize: 14, fontWeight: '700' },
  modalRedirectText: { color: '#10b981', fontSize: 12, fontWeight: '700', letterSpacing: 0.5 }
});