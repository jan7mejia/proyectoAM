import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Alert, ActivityIndicator, TextInput, Modal, KeyboardAvoidingView, Platform } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { BASE_URL } from '../../config';

export default function RfidCardScreen({ route, navigation }) {
  const { user } = route.params;
  const [loading, setLoading] = useState(true);
  const [tarjeta, setTarjeta] = useState(null);
  
  // Entrada para vinculación
  const [codigoVinculacion, setCodigoVinculacion] = useState('');
  
  // Estados para recarga
  const [modalRecarga, setModalRecarga] = useState(false);
  const [montoRecarga, setMontoRecarga] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Obtener estado real de la tarjeta desde la base de datos
  const checkTarjetaUsuario = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${BASE_URL}/api/tarjeta-rfid/${user.id_usuario}`);
      const data = await response.json();
      if (data.success && data.tiene_tarjeta) {
        setTarjeta(data.tarjeta);
      } else {
        setTarjeta(null);
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Error de Red", "No se pudo sincronizar con el hardware central de Llajtabus.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkTarjetaUsuario();
  }, []);

  // Función realista para registrar / vincular una tarjeta en la cuenta
  const handleVincularTarjeta = async () => {
    if (!codigoVinculacion.trim()) {
      Alert.alert("Campo Obligatorio", "Introduce el código UID de tu tarjeta física.");
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`${BASE_URL}/api/tarjeta-rfid/vincular`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id_usuario: user.id_usuario,
          codigo_rfid: codigoVinculacion.trim()
        })
      });
      const data = await response.json();
      if (data.success) {
        Alert.alert("¡Tarjeta Registrada!", data.message);
        setCodigoVinculacion('');
        checkTarjetaUsuario();
      } else {
        Alert.alert("Error de Registro", data.error || "No se pudo asociar la tarjeta.");
      }
    } catch (error) {
      Alert.alert("Error", "Ocurrió un error en la comunicación.");
    } finally {
      setLoading(false);
    }
  };

  // Traspasar dinero de la App a la Tarjeta Física
  const handleRecargarTarjeta = async () => {
    if (!montoRecarga || parseFloat(montoRecarga) <= 0) {
      Alert.alert("Monto Inválido", "Ingresa un monto correcto.");
      return;
    }
    try {
      setSubmitting(true);
      const response = await fetch(`${BASE_URL}/api/tarjeta-rfid/recargar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id_usuario: user.id_usuario,
          monto: parseFloat(montoRecarga)
        })
      });
      const data = await response.json();
      if (data.success) {
        Alert.alert("¡Éxito!", data.message);
        setModalRecarga(false);
        setMontoRecarga('');
        checkTarjetaUsuario();
      } else {
        Alert.alert("Fallo de Fondos", data.error || "No se pudo realizar la recarga.");
      }
    } catch (error) {
      Alert.alert("Error", "Fallo de conexión.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mi Tarjeta Física RFID</Text>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#2563eb" />
          <Text style={{ color: '#64748b', marginTop: 10 }}>Sincronizando hardware...</Text>
        </View>
      ) : tarjeta ? (
        /* VISTA CUANDO EL PASAJERO SÍ TIENE TARJETA VINCULADA */
        <View style={styles.content}>
          <View style={styles.rfidCard}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardBrand}>Llajtabus Electrónico</Text>
              <MaterialIcons name="contactless" size={28} color="#fff" />
            </View>
            <Text style={styles.cardNumber}>UID-ID: {tarjeta.codigo}</Text>
            
            <View style={styles.saldoContainer}>
              <Text style={styles.saldoLabel}>SALDO DISPONIBLE EN EL PLÁSTICO</Text>
              <Text style={styles.saldoValue}>Bs. {tarjeta.saldo.toFixed(2)}</Text>
            </View>

            <View style={styles.cardFooter}>
              <View>
                <Text style={styles.cardHolderLabel}>PASAJERO TITULAR</Text>
                <Text style={styles.cardHolderName}>{user.nombre} {user.apellido}</Text>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: tarjeta.estado === 'activa' ? '#10b981' : '#ef4444' }]}>
                <Text style={styles.statusText}>{tarjeta.estado.toUpperCase()}</Text>
              </View>
            </View>
          </View>

          {/* Botón para Traspasar Dinero a la Tarjeta */}
          <TouchableOpacity style={styles.btnRecargar} onPress={() => setModalRecarga(true)}>
            <MaterialIcons name="add-card" size={22} color="#fff" style={{ marginRight: 8 }} />
            <Text style={styles.btnText}>Traspasar Saldo a la Tarjeta Física</Text>
          </TouchableOpacity>

          <View style={styles.infoBox}>
            <MaterialIcons name="info-outline" size={22} color="#3b82f6" style={{ marginRight: 12 }} />
            <Text style={styles.infoText}>
              Esta pantalla es tu central de control. No necesitas presionar botones al subir al micro; simplemente acerca el plástico físico al validador del chofer para que debite tu pasaje.
            </Text>
          </View>
        </View>
      ) : (
        /* VISTA TOTALMENTE DINÁMICA REALISTA: REGISTRAR TARJETA NUEVA */
        <View style={styles.contentCenter}>
          <MaterialIcons name="credit-card" size={64} color="#3b82f6" style={{ marginBottom: 15 }} />
          <Text style={styles.noCardTitle}>¿Tienes una Tarjeta Física Llajtabus?</Text>
          <Text style={styles.noCardSub}>
            Vincula el código único impreso en tu tarjeta inteligente para monitorear tu saldo y transferirle fondos desde la app.
          </Text>

          <View style={styles.formVincular}>
            <TextInput
              style={styles.vincularInput}
              placeholder="Introduce el código UID (Ej: RFID-5042)"
              placeholderTextColor="#475569"
              value={codigoVinculacion}
              onChangeText={setCodigoVinculacion}
              autoCapitalize="characters"
            />
            <TouchableOpacity style={styles.btnVincularReal} onPress={handleVincularTarjeta}>
              <MaterialIcons name="sync" size={20} color="#fff" style={{ marginRight: 8 }} />
              <Text style={styles.btnText}>Vincular Tarjeta de Transporte</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Modal para Recargar Tarjeta */}
      <Modal visible={modalRecarga} transparent={true} animationType="fade">
        <View style={styles.modalBg}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Traspasar Fondos</Text>
            <Text style={styles.modalSub}>¿Cuánto saldo de tu cuenta digital deseas mover a tu tarjeta RFID plástica?</Text>
            <TextInput
              style={styles.input}
              placeholder="Monto en Bs."
              placeholderTextColor="#475569"
              keyboardType="numeric"
              value={montoRecarga}
              onChangeText={setMontoRecarga}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.btnCancel} onPress={() => setModalRecarga(false)}>
                <Text style={{ color: '#cbd5e1' }}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.btnConfirm} onPress={handleRecargarTarjeta} disabled={submitting}>
                {submitting ? <ActivityIndicator color="#fff" /> : <Text style={{ color: '#fff', fontWeight: '700' }}>Confirmar</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#090d16' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', paddingTop: 50, paddingHorizontal: 20, paddingBottom: 15, backgroundColor: '#0f172a' },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: '700', marginLeft: 15 },
  content: { flex: 1, padding: 24, alignItems: 'center', paddingTop: 30 },
  contentCenter: { flex: 1, padding: 24, alignItems: 'center', justifyContent: 'center' },
  
  // Estilos Tarjeta
  rfidCard: { width: '100%', height: 230, backgroundColor: '#1e3a8a', borderRadius: 20, padding: 24, justifyContent: 'space-between', elevation: 8, borderWidth: 1, borderColor: '#2563eb' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardBrand: { color: '#fff', fontSize: 18, fontWeight: '800' },
  cardNumber: { color: '#93c5fd', fontSize: 13, fontFamily: 'monospace', marginTop: 8 },
  saldoContainer: { marginVertical: 12 },
  saldoLabel: { color: '#93c5fd', fontSize: 9, fontWeight: '700', letterSpacing: 0.5 },
  saldoValue: { color: '#fff', fontSize: 28, fontWeight: '800' },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  cardHolderLabel: { color: '#93c5fd', fontSize: 9, fontWeight: '700' },
  cardHolderName: { color: '#fff', fontSize: 13, fontWeight: '700', marginTop: 2 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
  statusText: { color: '#fff', fontSize: 10, fontWeight: '800' },
  
  btnRecargar: { backgroundColor: '#2563eb', flexDirection: 'row', width: '100%', paddingVertical: 15, borderRadius: 14, marginTop: 30, alignItems: 'center', justifyContent: 'center', elevation: 4 },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  infoBox: { flexDirection: 'row', backgroundColor: '#0f172a', padding: 16, borderRadius: 12, marginTop: 30, borderWidth: 1, borderColor: '#1e293b' },
  infoText: { color: '#94a3b8', fontSize: 12, flex: 1, lineHeight: 18 },
  
  // Estilos Formulario Registro / Vinculación
  noCardTitle: { color: '#fff', fontSize: 18, fontWeight: '700', textAlign: 'center', marginBottom: 8 },
  noCardSub: { color: '#64748b', fontSize: 13, textAlign: 'center', paddingHorizontal: 15, lineHeight: 20, marginBottom: 30 },
  formVincular: { width: '100%', gap: 12 },
  vincularInput: { backgroundColor: '#0f172a', color: '#fff', padding: 15, borderRadius: 12, borderWidth: 1, borderColor: '#1e293b', fontSize: 14, textAlign: 'center' },
  btnVincularReal: { backgroundColor: '#10b981', flexDirection: 'row', paddingVertical: 15, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },

  // Modales
  modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', alignItems: 'center' },
  modalBox: { width: '85%', backgroundColor: '#0f172a', borderRadius: 16, padding: 24, borderWidth: 1, borderColor: '#1e293b' },
  modalTitle: { color: '#fff', fontSize: 18, fontWeight: '700', marginBottom: 5 },
  modalSub: { color: '#64748b', fontSize: 12, lineHeight: 18, marginBottom: 20 },
  input: { backgroundColor: '#090d16', color: '#fff', padding: 12, borderRadius: 10, fontSize: 16, borderWidth: 1, borderColor: '#1e293b', marginBottom: 20, textAlign: 'center' },
  modalButtons: { flexDirection: 'row', gap: 12 },
  btnCancel: { flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: 10, backgroundColor: '#1e293b' },
  btnConfirm: { flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: 10, backgroundColor: '#2563eb' }
});