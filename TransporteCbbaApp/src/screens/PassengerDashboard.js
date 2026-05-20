import React from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

export default function PassengerDashboard({ route, navigation }) {
  // Recorremos los datos reales del usuario enviados desde el Login
  const { user } = route.params || { user: { nombre: 'Usuario Pasajero', saldo: 0.00, correo: 'pasajero@paybus.com' } };

  return (
    <ScrollView style={styles.container}>
      {/* Cabecera Dinámica */}
      <View style={styles.welcomeCard}>
        <Text style={styles.welcomeText}>¡Hola, {user.nombre}!</Text>
        <Text style={styles.userSub}>{user.correo}</Text>
      </View>

      {/* Tarjeta de Saldo Real de la BD */}
      <View style={styles.balanceCard}>
        <Text style={styles.balanceLabel}>SALDO DISPONIBLE (PayBus)</Text>
        <Text style={styles.balanceMonto}>{user.saldo.toFixed(2)} Bs.</Text>
        <Text style={styles.tarjetaStatus}>• Estado de Cuenta: Activa</Text>
      </View>

      {/* Módulos de Interacción */}
      <Text style={styles.sectionTitle}>Servicios Urbanos</Text>
      
      <TouchableOpacity style={styles.actionButton} onPress={() => alert('Cámara activada para escanear QR del Micro')}>
        <MaterialIcons name="qr-code-scanner" size={24} color="#fff" />
        <View style={styles.btnTextContainer}>
          <Text style={styles.btnTitle}>Pagar Pasaje con QR</Text>
          <Text style={styles.btnDesc}>Escanea el código pegado en el vehículo</Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity style={styles.actionButton} onPress={() => alert('Generando QR de recarga...')}>
        <MaterialIcons name="account-balance-wallet" size={24} color="#fff" />
        <View style={styles.btnTextContainer}>
          <Text style={styles.btnTitle}>Recargar Saldo</Text>
          <Text style={styles.btnDesc}>Añade crédito mediante QR Bancario o Efectivo</Text>
        </View>
      </TouchableOpacity>

      {/* Historial Estático de apoyo visual */}
      <Text style={styles.sectionTitle}>Últimos Movimientos</Text>
      <View style={styles.historyCard}>
        <Text style={styles.historyText}>Pago Pasaje - Línea 102 • -1.00 Bs.</Text>
        <Text style={styles.historyText}>Recarga de Saldo - QR • +20.00 Bs.</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a', padding: 20 },
  welcomeCard: { marginBottom: 20 },
  welcomeText: { color: '#fff', fontSize: 24, fontWeight: 'bold' },
  userSub: { color: '#64748b', fontSize: 14 },
  balanceCard: { backgroundColor: '#1e3a8a', padding: 24, borderRadius: 20, marginBottom: 25, borderWidth: 1, borderColor: '#2563eb' },
  balanceLabel: { color: '#93c5fd', fontSize: 11, fontWeight: '700', letterSpacing: 1 },
  balanceMonto: { color: '#fff', fontSize: 36, fontWeight: '900', marginTop: 5 },
  tarjetaStatus: { color: '#60a5fa', fontSize: 12, marginTop: 12, fontWeight: '600' },
  sectionTitle: { color: '#94a3b8', fontSize: 12, fontWeight: '700', textTransform: 'uppercase', marginBottom: 12, letterSpacing: 0.5 },
  actionButton: { backgroundColor: '#1e293b', padding: 18, borderRadius: 16, flexDirection: 'row', alignItems: 'center', marginBottom: 12, borderWidth: 1, borderColor: '#334155' },
  btnTextContainer: { marginLeft: 15, flex: 1 },
  btnTitle: { color: '#fff', fontSize: 15, fontWeight: 'bold' },
  btnDesc: { color: '#64748b', fontSize: 12, marginTop: 2 },
  historyCard: { backgroundColor: '#1e293b', padding: 16, borderRadius: 16, marginBottom: 20 },
  historyText: { color: '#94a3b8', fontSize: 13, paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: '#334155' }
});