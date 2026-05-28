import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TextInput, 
  TouchableOpacity, 
  ActivityIndicator, 
  Alert, 
  Dimensions,
  Modal,
  SafeAreaView,
  Platform,
  StatusBar
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import { BASE_URL } from '../../config';

const { width } = Dimensions.get('window');

export default function RechargeScreen({ route, navigation }) {
  const { user } = route.params || { user: { id_usuario: 1 } };
  const [monto, setMonto] = useState('');
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false); 
  const [sound, setSound] = useState(null);

  const montosRapidos = ['10', '20', '50', '100'];

  // Limpieza del buffer de audio al desmontar la pantalla
  useEffect(() => {
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [sound]);

  // Función para reproducir el timbre de recarga exitosa
  const reproducirSonidoRecarga = async () => {
    try {
      const { sound: soundObject } = await Audio.Sound.createAsync(
        require('../../assets/sounds/pay.mp3')
      );
      setSound(soundObject);
      await soundObject.playAsync();
    } catch (error) {
      console.log('Error al reproducir sonido de recarga:', error);
    }
  };

  const ejecutarRecarga = async () => {
    if (!monto || parseFloat(monto) <= 0) {
      Alert.alert('Monto Inválido', 'Por favor ingresa una cantidad válida en Bolivianos.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/api/recargar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id_usuario: user.id_usuario,
          monto: parseFloat(monto),
          metodo: 'qr',
          destino: 'app'
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Lanzar efecto auditivo e inicializar ventana modal de confirmación
        await reproducirSonidoRecarga();
        setModalVisible(true);
      } else {
        Alert.alert('Fallo Transaccional', data.error || 'No se pudo procesar la recarga digital.');
      }
    } catch (error) {
      Alert.alert('Error de Conexión', 'Fallo al enlazar con el módulo transaccional de la API.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCerrarExito = () => {
    setModalVisible(false);
    setMonto('');
    // Retorna de forma segura al panel del pasajero actualizando sus datos
    navigation.navigate('PassengerDashboard', { user });
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Barra de Navegación Superior */}
      <View style={styles.topAppBar}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.navigate('PassengerDashboard', { user })}
          activeOpacity={0.7}
        >
          <MaterialIcons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headTitle}>Recarga de Saldo</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Cuerpo Central */}
      <View style={styles.mainContent}>
        <View style={styles.iconHeaderCircle}>
          <MaterialIcons name="account-balance-wallet" size={48} color="#10b981" />
        </View>
        
        <Text style={styles.title}>Cargar Saldo Digital</Text>
        <Text style={styles.subtitle}>
          Agrega fondos prepago rápidos a tu billetera virtual para validar tus pasajes mediante QR o RFID.
        </Text>

        {/* Input con diseño moderno tipo Tarjeta */}
        <View style={styles.inputContainer}>
          <Text style={styles.currency}>Bs.</Text>
          <TextInput 
            style={styles.input} 
            placeholder="0.00" 
            keyboardType="numeric" 
            value={monto} 
            onChangeText={setMonto} 
            placeholderTextColor="#475569" 
          />
        </View>

        {/* Botones de montos rápidos */}
        <Text style={styles.sectionLabel}>Selecciona un monto rápido</Text>
        <View style={styles.fastAmountRow}>
          {montosRapidos.map((val) => (
            <TouchableOpacity 
              key={val} 
              style={[styles.amountChip, monto === val && styles.amountChipSelected]} 
              onPress={() => setMonto(val)}
              activeOpacity={0.7}
            >
              <Text style={[styles.amountChipText, monto === val && styles.amountChipTextSelected]}>
                +{val} Bs.
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Botón de acción principal en la zona inferior */}
      <View style={styles.footerSection}>
        <TouchableOpacity 
          style={[styles.btnConfirm, (!monto || loading) && styles.btnDisabled]} 
          onPress={ejecutarRecarga} 
          disabled={loading || !monto}
          activeOpacity={0.8}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <View style={styles.btnContent}>
              <MaterialIcons name="qr-code-2" size={20} color="#fff" style={{ marginRight: 8 }} />
              <Text style={styles.btnText}>GENERAR QR DE PAGO</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* MODAL INTERACTIVO DE RECARGA EXITOSA */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={handleCerrarExito}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.successIconCircle}>
              <MaterialIcons name="check-circle" size={64} color="#10b981" />
            </View>
            
            <Text style={styles.modalTitle}>¡Abono Completado!</Text>
            <Text style={styles.modalMessage}>
              Se han transferido los fondos electrónicos a tu cuenta prepago PayBus de manera exitosa.
            </Text>

            {/* Recibo electrónico interno */}
            <View style={styles.receiptBox}>
              <View style={styles.receiptRow}>
                <Text style={styles.receiptLabel}>Monto Cargado:</Text>
                <Text style={styles.receiptValue}>Bs. {parseFloat(monto || 0).toFixed(2)}</Text>
              </View>
              <View style={styles.receiptRow}>
                <Text style={styles.receiptLabel}>Método de Pago:</Text>
                <Text style={styles.receiptValue}>QR Interbancario</Text>
              </View>
              <View style={styles.receiptRow}>
                <Text style={styles.receiptLabel}>Ubicación:</Text>
                <Text style={styles.receiptValue}>Cercado - Cbba</Text>
              </View>
              <View style={styles.receiptRow}>
                <Text style={styles.receiptLabel}>Estado:</Text>
                <Text style={[styles.receiptValue, { color: '#10b981' }]}>Liquidado</Text>
              </View>
            </View>

            <TouchableOpacity style={styles.btnModalClose} onPress={handleCerrarExito}>
              <Text style={styles.btnModalCloseText}>ENTENDIDO, VOLVER AL PANEL</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#0f172a',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight || 10 : 0
  },
  topAppBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b'
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1e293b',
    justifyContent: 'center',
    alignItems: 'center'
  },
  headTitle: { 
    fontSize: 18, 
    fontWeight: 'bold', 
    color: '#fff',
    textAlign: 'center'
  },
  mainContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24
  },
  iconHeaderCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20
  },
  title: { 
    fontSize: 22, 
    fontWeight: 'bold', 
    color: '#fff', 
    marginBottom: 8 
  },
  subtitle: { 
    fontSize: 13, 
    color: '#94a3b8', 
    textAlign: 'center', 
    paddingHorizontal: 15, 
    marginBottom: 35,
    lineHeight: 18 
  },
  sectionLabel: {
    color: '#64748b',
    fontSize: 12,
    fontWeight: '600',
    alignSelf: 'flex-start',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5
  },
  inputContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#1e293b', 
    borderRadius: 16, 
    width: '100%', 
    paddingHorizontal: 20, 
    marginBottom: 30, 
    height: 65,
    borderWidth: 1,
    borderColor: '#334155'
  },
  currency: { 
    color: '#f8fafc', 
    fontSize: 22, 
    fontWeight: 'bold', 
    marginRight: 12 
  },
  input: { 
    flex: 1, 
    color: '#fff', 
    fontSize: 24, 
    fontWeight: 'bold' 
  },
  fastAmountRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    width: '100%', 
    marginBottom: 20,
    gap: 8
  },
  amountChip: { 
    flex: 1,
    backgroundColor: '#1e293b', 
    paddingVertical: 12, 
    borderRadius: 12, 
    borderWidth: 1, 
    borderColor: '#334155',
    alignItems: 'center'
  },
  amountChipSelected: { 
    backgroundColor: '#10b981', 
    borderColor: '#10b981' 
  },
  amountChipText: { 
    color: '#94a3b8', 
    fontSize: 13, 
    fontWeight: '700' 
  },
  amountChipTextSelected: { 
    color: '#fff' 
  },
  footerSection: {
    paddingHorizontal: 24,
    paddingBottom: 30,
    width: '100%'
  },
  btnConfirm: { 
    width: '100%', 
    height: 54, 
    backgroundColor: '#10b981', 
    borderRadius: 14, 
    justifyContent: 'center', 
    alignItems: 'center',
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3
  },
  btnDisabled: {
    backgroundColor: '#1e293b',
    borderColor: '#334155',
    borderWidth: 1,
    elevation: 0
  },
  btnContent: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  btnText: { 
    color: '#fff', 
    fontSize: 14, 
    fontWeight: '700',
    letterSpacing: 0.5
  },
  modalOverlay: { 
    flex: 1, 
    backgroundColor: 'rgba(15, 23, 42, 0.85)', 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  modalContent: { 
    width: width - 40, 
    backgroundColor: '#1e293b', 
    borderRadius: 24, 
    padding: 24, 
    alignItems: 'center', 
    borderWidth: 1, 
    borderColor: '#334155', 
    elevation: 10 
  },
  successIconCircle: { 
    marginBottom: 16 
  },
  modalTitle: { 
    fontSize: 20, 
    fontWeight: 'bold', 
    color: '#fff', 
    marginBottom: 8 
  },
  modalMessage: { 
    fontSize: 13, 
    color: '#94a3b8', 
    textAlign: 'center', 
    marginBottom: 20, 
    paddingHorizontal: 5, 
    lineHeight: 18 
  },
  receiptBox: { 
    width: '100%', 
    backgroundColor: '#0f172a', 
    borderRadius: 16, 
    padding: 16, 
    marginBottom: 24, 
    borderWidth: 1, 
    borderColor: '#334155' 
  },
  receiptRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    paddingVertical: 6 
  },
  receiptLabel: { 
    color: '#64748b', 
    fontSize: 13, 
    fontWeight: '600' 
  },
  receiptValue: { 
    color: '#f8fafc', 
    fontSize: 13, 
    fontWeight: '700' 
  },
  btnModalClose: { 
    width: '100%', 
    height: 50, 
    backgroundColor: '#6366f1', 
    borderRadius: 12, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  btnModalCloseText: { 
    color: '#fff', 
    fontSize: 14, 
    fontWeight: '700', 
    letterSpacing: 0.5 
  }
});