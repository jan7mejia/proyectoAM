import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function DashboardHeader({ user, theme, loading, unreadCount, onOpenNotif, onOpenSupport, onLogout }) {
  const insets = useSafeAreaInsets();
  const inicialNombre = user?.nombre ? user.nombre[0].toUpperCase() : 'U';
  const inicialApellido = user?.apellido ? user.apellido[0].toUpperCase() : 'P';

  return (
    <View style={[
      styles.header, 
      { paddingTop: insets.top > 0 ? insets.top + 8 : 16 } // Margen dinámico según el notch del dispositivo
    ]}>
      <View style={styles.userInfo}>
        <View style={[styles.avatarCircle, { backgroundColor: theme.primaryColor }]}>
          <Text style={styles.avatarText}>{inicialNombre}{inicialApellido}</Text>
        </View>
        <View style={styles.userTextContainer}>
          <Text style={styles.welcomeText}>Hola,</Text>
          <Text style={styles.nameText} numberOfLines={1}>{user?.nombre} {user?.apellido}</Text>
        </View>
      </View>

      <View style={styles.headerActions}>
        {loading && <ActivityIndicator size="small" color="#6366f1" style={{ marginRight: 4 }} />}

        <TouchableOpacity style={styles.headerIconButton} onPress={onOpenNotif}>
          <MaterialIcons name="notifications" size={22} color={unreadCount > 0 ? theme.primaryColor : "#fff"} />
          {unreadCount > 0 && (
            <View style={styles.notifBadge}>
              <Text style={styles.notifBadgeText}>{unreadCount}</Text>
            </View>
          )}
        </TouchableOpacity>

        <TouchableOpacity style={styles.headerIconButton} onPress={onOpenSupport}>
          <MaterialIcons name="headset-mic" size={22} color="#fff" />
        </TouchableOpacity>

        <TouchableOpacity style={[styles.headerIconButton, styles.logoutButton]} onPress={onLogout}>
          <MaterialIcons name="logout" size={20} color="#ef4444" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 14,
    backgroundColor: '#0d1527',
    borderBottomWidth: 1,
    borderColor: '#1e293b'
  },
  userInfo: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  avatarCircle: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  avatarText: { color: '#fff', fontSize: 14, fontWeight: '800' },
  userTextContainer: { flex: 1 },
  welcomeText: { color: '#64748b', fontSize: 12, fontWeight: '500' },
  nameText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  headerIconButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#1e293b',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative'
  },
  logoutButton: { backgroundColor: '#ef444415', borderWidth: 1, borderColor: '#ef444433' },
  notifBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#ef4444',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4
  },
  notifBadgeText: { color: '#fff', fontSize: 9, fontWeight: '900' },
});