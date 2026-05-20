import React, { useState } from 'react';
import { StyleSheet, Text, View, FlatList } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

export default function DriverDashboard() {
  // Simula los campos de la tabla pagos y notificaciones en tiempo real
  const [ingresosHoy, setIngresosHoy] = useState(148.00);
  const [alertasPagos, setAlertasPagos] = useState([
    { id: '1', pasajero: 'Carlos Claros', monto: '2.00', metodo: 'QR App', hora: '11:15' },
    { id: '2', pasajero: 'Ana Maria Rojas', monto: '1.00', metodo: 'Tarjeta RFID', hora: '11:12' },
    { id: '3', pasajero: 'Mateo Villarroel', monto: '1.00', metodo: 'QR Bancario', hora: '11:02' },
  ]);

  return (
    <View style={styles.container}>
      <View style={styles.statusBanner}>
        <MaterialIcons name="circle" size={12} color="#2ecc71" />
        <Text style={styles.statusText}>Unidad Activa • Línea 102 (Interno 42)</Text>
      </View>

      <View style={styles.incomeCard}>
        <Text style={styles.incomeLabel}>RECAUDACIÓN DEL TURNO (Bs.)</Text>
        <Text style={styles.incomeMonto}>{ingresosHoy.toFixed(2)}</Text>
      </View>

      <View style={styles.notiHeaderRow}>
        <MaterialIcons name="notifications-active" size={20} color="#e67e22" />
        <Text style={styles.notiTitle}>Flujo de Pasajeros Entrantes</Text>
      </View>

      <FlatList
        data={alertasPagos}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={styles.ticketCard}>
            <View style={styles.ticketLeft}>
              <Text style={styles.ticketUser}>{item.pasajero}</Text>
              <Text style={styles.ticketMeta}>Método: {item.metodo} • {item.hora}</Text>
            </View>
            <Text style={styles.ticketMonto}>+{item.monto} Bs.</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a', padding: 20 },
  statusBanner: { backgroundColor: '#1e293b', padding: 12, borderRadius: 10, flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  statusText: { color: '#94a3b8', fontSize: 13, fontWeight: '600', marginLeft: 8 },
  incomeCard: { backgroundColor: '#0f766e', padding: 25, borderRadius: 16, alignItems: 'center', marginBottom: 25 },
  incomeLabel: { color: '#ccfbf1', fontSize: 12, fontWeight: '700', letterSpacing: 0.5 },
  incomeMonto: { color: '#fff', fontSize: 42, fontWeight: '900', marginTop: 5 },
  notiHeaderRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  notiTitle: { color: '#fff', fontSize: 16, fontWeight: 'bold', marginLeft: 10 },
  ticketCard: { backgroundColor: '#1e293b', padding: 16, borderRadius: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, borderWidth: 1, borderColor: '#334155' },
  ticketUser: { color: '#f8fafc', fontSize: 15, fontWeight: 'bold' },
  ticketMeta: { color: '#94a3b8', fontSize: 12, marginTop: 3 },
  ticketMonto: { color: '#2ecc71', fontWeight: 'bold', fontSize: 16 }
});