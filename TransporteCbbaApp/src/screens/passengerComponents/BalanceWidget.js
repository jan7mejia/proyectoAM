import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

export default function BalanceWidget({ user, theme, showBalance, onToggleBalance, navigation }) {
  return (
    <View style={styles.mainBalanceWidget}>
      <View style={styles.balanceHeader}>
        <TouchableOpacity style={styles.hideBalanceButton} onPress={onToggleBalance}>
          <MaterialIcons name={showBalance ? "visibility" : "visibility-off"} size={20} color="#64748b" />
          <Text style={styles.hideBalanceText}>{showBalance ? "Ocultar saldo" : "Mostrar saldo"}</Text>
        </TouchableOpacity>
        <View style={[styles.miniBadge, { backgroundColor: theme.badgeColor }]}>
          <Text style={[styles.miniBadgeText, { color: theme.primaryColor }]}>{theme.label}</Text>
        </View>
      </View>
      
      <View style={styles.balanceBody}>
        <Text style={styles.balanceAmountText}>
          {showBalance ? parseFloat(user?.saldo || 0).toFixed(2) : "••••"}
          <Text style={styles.currencyText}> Bs.</Text>
        </Text>
      </View>

      <View style={styles.balanceActionsRow}>
        <TouchableOpacity style={styles.balanceActionButton} onPress={() => navigation.navigate('RechargeScreen', { user })}>
          <View style={styles.actionIconCircle}><MaterialIcons name="add" size={20} color="#fff" /></View>
          <Text style={styles.actionButtonText}>Agregar dinero</Text>
        </TouchableOpacity>
        
        <View style={styles.verticalDivider} />
        
        <TouchableOpacity style={styles.balanceActionButton} onPress={() => navigation.navigate('TravelHistoryScreen', { user, defaultTab: 'historial' })}>
          <View style={[styles.actionIconCircle, { backgroundColor: '#334155' }]}><MaterialIcons name="history" size={20} color="#fff" /></View>
          <Text style={styles.actionButtonText}>Ver Movimientos</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  mainBalanceWidget: { backgroundColor: '#0d1527', borderRadius: 24, padding: 20, marginBottom: 16, borderWidth: 1, borderColor: '#1e293b' },
  balanceHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  hideBalanceButton: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  hideBalanceText: { color: '#64748b', fontSize: 12, fontWeight: '600' },
  miniBadge: { paddingVertical: 4, paddingHorizontal: 8, borderRadius: 8 },
  miniBadgeText: { fontSize: 9, fontWeight: '900' },
  balanceBody: { marginBottom: 16 },
  balanceAmountText: { color: '#fff', fontSize: 32, fontWeight: '800' },
  currencyText: { fontSize: 18, fontWeight: '500', color: '#64748b' },
  balanceActionsRow: { flexDirection: 'row', alignItems: 'center', borderTopWidth: 1, borderColor: '#1e293b', paddingTop: 14 },
  balanceActionButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  actionIconCircle: { width: 28, height: 28, borderRadius: 10, backgroundColor: '#6366f1', justifyContent: 'center', alignItems: 'center' },
  actionButtonText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  verticalDivider: { width: 1, height: 24, backgroundColor: '#1e293b' },
});