import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

export default function QuickActions({ user, navigation, onOpenRoutes }) {
  return (
    <View style={styles.quickActionsContainer}>
      <TouchableOpacity style={styles.quickActionItem} onPress={() => navigation.navigate('ScanQRScreen', { user })}>
        <View style={[styles.quickActionCircle, { backgroundColor: '#3498db22', borderColor: '#3498db' }]}>
          <MaterialIcons name="qr-code-scanner" size={26} color="#3498db" />
        </View>
        <Text style={styles.quickActionLabel}>Pagar con QR</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.quickActionItem} onPress={() => navigation.navigate('RfidCardScreen', { user })}>
        <View style={[styles.quickActionCircle, { backgroundColor: '#8b5cf622', borderColor: '#8b5cf6' }]}>
          <MaterialIcons name="contactless" size={26} color="#8b5cf6" />
        </View>
        <Text style={styles.quickActionLabel}>Mi RFID</Text>
      </TouchableOpacity>

      {/* BOTÓN MEJORADO: AHORA ABRE EL MODAL DE RUTAS MUNICIPALES */}
      <TouchableOpacity style={styles.quickActionItem} onPress={onOpenRoutes}>
        <View style={[styles.quickActionCircle, { backgroundColor: '#10b98122', borderColor: '#10b981' }]}>
          <MaterialIcons name="alt-route" size={26} color="#10b981" />
        </View>
        <Text style={[styles.quickActionLabel, { color: '#10b981' }]}>Líneas / Rutas</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  quickActionsContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 18, gap: 10 },
  quickActionItem: { flex: 1, backgroundColor: '#0d1527', borderRadius: 20, padding: 14, alignItems: 'center', borderWidth: 1, borderColor: '#1e293b' },
  quickActionCircle: { width: 48, height: 48, borderRadius: 16, borderWidth: 1, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  quickActionLabel: { color: '#94a3b8', fontSize: 11, fontWeight: '700', textAlign: 'center' },
});