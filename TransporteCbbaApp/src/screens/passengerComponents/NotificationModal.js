import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Modal, ScrollView, ActivityIndicator, Dimensions, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

const { height } = Dimensions.get('window');

export default function NotificationModal({ visible, onClose, loadingNotif, notifications, theme, onMarkRead, onDeleteNotif }) {
  const notifArray = notifications || [];

  // Función manejadora para interceptar el borrado con una confirmación nativa
  const handleConfirmDelete = (idNotificacion) => {
    Alert.alert(
      "¿Eliminar notificación?",
      "Esta acción quitará el aviso de tu historial y no se puede deshacer.",
      [
        {
          text: "Cancelar",
          style: "cancel"
        },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: () => onDeleteNotif(idNotificacion)
        }
      ],
      { cancelable: true }
    );
  };

  return (
    <Modal visible={visible} animationType="fade" transparent={true}>
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContainer, { height: height * 0.75 }]}>
          
          {/* HEADER DEL MODAL */}
          <View style={styles.modalHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <MaterialIcons name="notifications-active" size={22} color="#fff" />
              <Text style={styles.modalTitle}>Avisos y Alertas ({notifArray.length})</Text>
            </View>
            <TouchableOpacity onPress={onClose}>
              <MaterialIcons name="close" size={24} color="#fff" />
            </TouchableOpacity>
          </View>

          {/* CUERPO CENTRAL */}
          {loadingNotif && notifArray.length === 0 ? (
            <ActivityIndicator size="large" color={theme.primaryColor || "#6366f1"} style={{ marginTop: 40 }} />
          ) : notifArray.length === 0 ? (
            <View style={styles.emptyContainer}>
              <MaterialIcons name="notifications-none" size={48} color="#475569" />
              <Text style={styles.emptyText}>No tienes notificaciones recibidas.</Text>
            </View>
          ) : (
            <ScrollView style={styles.notifScroll} showsVerticalScrollIndicator={false}>
              {notifArray.map((item) => (
                <TouchableOpacity
                  key={item.id_notificacion}
                  activeOpacity={0.8}
                  /* Aplica estilo condicional dinámico: si no está leído, se resalta en la UI */
                  style={[styles.notifItem, !item.leido && styles.notifUnread]}
                  onPress={() => { if (!item.leido) onMarkRead(item.id_notificacion); }}
                >
                  <View style={styles.notifItemHeader}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1 }}>
                      {/* Cambia el ícono dinámicamente según el estado de leido/no leido */}
                      <MaterialIcons
                        name={item.leido ? "drafts" : "mark-email-unread"}
                        size={18}
                        color={item.leido ? "#64748b" : theme.primaryColor}
                      />
                      <Text style={[styles.notifItemTitle, !item.leido && { fontWeight: '800', color: '#fff' }]} numberOfLines={1}>
                        {item.titulo || "Aviso del Sistema"}
                      </Text>
                    </View>

                    {/* Botón de borrado interceptado por la confirmación */}
                    <TouchableOpacity 
                      style={{ padding: 4, marginLeft: 8 }} 
                      onPress={() => handleConfirmDelete(item.id_notificacion)}
                    >
                      <MaterialIcons name="delete" size={18} color="#ef4444" />
                    </TouchableOpacity>
                  </View>
                  
                  <Text style={styles.notifItemBody}>{item.mensaje}</Text>
                  
                  <Text style={styles.notifItemTime}>
                    {item.fecha ? item.fecha : 'Reciente'}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: { flex: 1, backgroundColor: '#000000aa', justifyContent: 'flex-end' },
  modalContainer: { backgroundColor: '#0d1527', borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 20, borderWidth: 1, borderColor: '#1e293b' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 14, borderBottomWidth: 1, borderColor: '#1e293b' },
  modalTitle: { color: '#fff', fontSize: 16, fontWeight: '800' },
  emptyContainer: { alignItems: 'center', paddingVertical: 50, gap: 12 },
  emptyText: { color: '#475569', fontSize: 13, fontWeight: '600' },
  notifScroll: { marginTop: 10, maxHeight: height * 0.6 },
  notifItem: { backgroundColor: '#111827', padding: 16, borderRadius: 16, marginBottom: 10, borderWidth: 1, borderColor: '#1e293b' },
  // Estilo de resaltado adaptativo para elementos No Leídos
  notifUnread: { borderColor: '#475569', backgroundColor: '#1e293b77', borderWidth: 1.5 },
  notifItemHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  notifItemTitle: { fontSize: 13, color: '#94a3b8', fontWeight: '600', flex: 1 },
  notifItemBody: { color: '#cbd5e1', fontSize: 12, fontWeight: '500', lineHeight: 17, marginBottom: 6 },
  notifItemTime: { color: '#475569', fontSize: 10, fontWeight: '600', alignSelf: 'flex-end' }
});