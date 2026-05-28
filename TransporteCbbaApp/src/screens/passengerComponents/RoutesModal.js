import React from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  Modal, 
  TouchableOpacity, 
  FlatList, 
  ActivityIndicator 
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

export default function RoutesModal({ visible, onClose, dbLines, loadingLines, theme }) {
  const primaryColor = theme?.primaryColor || '#6366f1';

  const renderRouteItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.badgeContainer}>
          <MaterialIcons name="directions-bus" size={18} color={primaryColor} />
          <Text style={styles.lineName}>{item.nombre_linea || 'Línea Sin Nombre'}</Text>
        </View>
        <View style={[styles.priceBadge, { backgroundColor: theme?.badgeColor || '#312e81' }]}>
          <Text style={[styles.priceText, { color: '#fff' }]}>
            Bs. {parseFloat(item.tarifa_estandar || 2.0).toFixed(2)}
          </Text>
        </View>
      </View>
      
      <Text style={styles.description}>
        {item.descripcion || 'Sin recorrido detallado registrado actualmente.'}
      </Text>
      
      <View style={styles.statusRow}>
        <View style={styles.dot} />
        <Text style={styles.statusText}>Servicio Activo</Text>
      </View>
    </View>
  );

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          
          {/* Encabezado del Modal */}
          <View style={styles.header}>
            <View style={styles.headerTitleRow}>
              <MaterialIcons name="map" size={22} color="#fff" style={{ marginRight: 8 }} />
              <Text style={styles.headerTitle}>Líneas y Rutas Cercado</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <MaterialIcons name="close" size={24} color="#64748b" />
            </TouchableOpacity>
          </View>

          {/* Cuerpo / Lista de datos */}
          {loadingLines ? (
            <View style={styles.centerContainer}>
              <ActivityIndicator size="large" color={primaryColor} />
              <Text style={styles.loadingText}>Cargando rutas del sistema...</Text>
            </View>
          ) : dbLines.length === 0 ? (
            <View style={styles.centerContainer}>
              <MaterialIcons name="info-outline" size={48} color="#475569" />
              <Text style={styles.emptyText}>No se encontraron líneas de transporte registradas.</Text>
            </View>
          ) : (
            <FlatList
              data={dbLines}
              keyExtractor={(item) => (item.id_linea ? item.id_linea.toString() : Math.random().toString())}
              renderItem={renderRouteItem}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
            />
          )}

        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(2, 6, 12, 0.85)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#0f172a',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
    minHeight: '50%',
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderColor: '#1e293b',
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '800',
  },
  closeButton: {
    padding: 4,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    color: '#64748b',
    marginTop: 12,
    fontSize: 14,
    fontWeight: '600',
  },
  emptyText: {
    color: '#64748b',
    marginTop: 12,
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '600',
  },
  listContent: {
    padding: 16,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  badgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  lineName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  priceBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  priceText: {
    fontSize: 12,
    fontWeight: '800',
  },
  description: {
    color: '#94a3b8',
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '500',
    marginBottom: 12,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10b981',
  },
  statusText: {
    color: '#10b981',
    fontSize: 11,
    fontWeight: '700',
  },
});