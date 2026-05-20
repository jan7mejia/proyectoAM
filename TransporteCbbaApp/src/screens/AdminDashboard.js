import React from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

export default function AdminDashboard() {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.adminTitle}>Panel de Control Alcaldía</Text>
      <Text style={styles.adminSubtitle}>G.A.M.C. • Regulación de Tarifas Urbanas</Text>

      {/* Tarjetas de ABM del informe */}
      <Text style={styles.groupLabel}>Módulos de Gestión</Text>

      <View style={styles.actionGrid}>
        <TouchableOpacity style={styles.gridBox} onPress={() => alert('Abrir Registro de Líneas')}>
          <MaterialIcons name="map" size={28} color="#9b59b6" />
          <Text style={styles.boxText}>Registrar Líneas</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.gridBox} onPress={() => alert('Abrir Gestión de Vehículos')}>
          <MaterialIcons name="directions-bus" size={28} color="#3498db" />
          <Text style={styles.boxText}>Registrar Vehículos</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.actionGrid}>
        <TouchableOpacity style={styles.gridBox} onPress={() => alert('Abrir Asignación de Choferes')}>
          <MaterialIcons name="assignment-ind" size={28} color="#e67e22" />
          <Text style={styles.boxText}>Asignar Turnos</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.gridBox} onPress={() => alert('Abrir Configuración de Tarifas')}>
          <MaterialIcons name="attach-money" size={28} color="#2ecc71" />
          <Text style={styles.boxText}>Control de Tarifas</Text>
        </TouchableOpacity>
      </View>

      {/* Monitoreo de Asignaciones (Tabla asignaciones) */}
      <Text style={styles.groupLabel}>Turnos Activos de Hoy</Text>
      
      <View style={styles.logRow}>
        <Text style={styles.logText}>Chofer: H. Condori • Línea 102</Text>
        <Text style={styles.badgeTurnoMañana}>Mañana</Text>
      </View>

      <View style={styles.logRow}>
        <Text style={styles.logText}>Chofer: J. Camacho • Línea Q</Text>
        <Text style={styles.badgeTurnoTarde}>Tarde</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc', padding: 20 },
  adminTitle: { fontSize: 24, fontWeight: 'bold', color: '#1e293b' },
  adminSubtitle: { fontSize: 13, color: '#64748b', marginBottom: 25 },
  groupLabel: { fontSize: 13, fontWeight: 'bold', color: '#94a3b8', textTransform: 'uppercase', marginBottom: 12 },
  actionGrid: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
  gridBox: { backgroundColor: '#fff', width: '48%', padding: 20, borderRadius: 16, alignItems: 'center', borderWidth: 1, borderColor: '#e2e8f0', elevation: 2 },
  boxText: { color: '#334155', fontWeight: '700', fontSize: 13, marginTop: 10 },
  logRow: { backgroundColor: '#fff', padding: 15, borderRadius: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, borderWidth: 1, borderColor: '#e2e8f0' },
  logText: { color: '#334155', fontSize: 14, fontWeight: '500' },
  badgeTurnoMañana: { backgroundColor: '#fee2e2', color: '#ef4444', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, fontSize: 11, fontWeight: 'bold' },
  badgeTurnoTarde: { backgroundColor: '#fef3c7', color: '#d97706', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, fontSize: 11, fontWeight: 'bold' }
});