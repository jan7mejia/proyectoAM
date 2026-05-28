import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Modal, ScrollView, TextInput, ActivityIndicator, Dimensions } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

export default function SupportModal({
  visible,
  onClose,
  theme,
  reportScope,
  setReportScope,
  loadingLines,
  selectedLine,
  onOpenLinesDropdown,
  reportCategory,
  setReportCategory,
  reportMessage,
  setReportMessage,
  onSendReport,
  isLineDropdownOpen,
  onCloseLinesDropdown,
  dbLines,
  onSelectLine
}) {
  return (
    <>
      <Modal visible={visible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContainer, { height: height * 0.88 }]}>
            <View style={styles.modalHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <MaterialIcons name="support-agent" size={24} color={theme.primaryColor} />
                <Text style={styles.modalTitle}>Centro de Reclamos</Text>
              </View>
              <TouchableOpacity onPress={onClose}>
                <MaterialIcons name="close" size={24} color="#fff" />
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1, marginTop: 10 }}>
              <Text style={styles.formLabel}>1. ¿Dónde ocurrió el inconveniente?</Text>
              <View style={styles.scopeRow}>
                <TouchableOpacity
                  style={[styles.scopeButton, reportScope === 'general' && { backgroundColor: theme.primaryColor + '25', borderColor: theme.primaryColor }]}
                  onPress={() => setReportScope('general')}
                >
                  <MaterialIcons name="phone-android" size={20} color={reportScope === 'general' ? theme.primaryColor : '#94a3b8'} />
                  <Text style={[styles.scopeButtonText, reportScope === 'general' && { color: '#fff' }]}>En la Aplicación</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.scopeButton, reportScope === 'transporte' && { backgroundColor: theme.primaryColor + '25', borderColor: theme.primaryColor }]}
                  onPress={() => setReportScope('transporte')}
                >
                  <MaterialIcons name="directions-bus" size={20} color={reportScope === 'transporte' ? theme.primaryColor : '#94a3b8'} />
                  <Text style={[styles.scopeButtonText, reportScope === 'transporte' && { color: '#fff' }]}>En el Micro / Trufi</Text>
                </TouchableOpacity>
              </View>

              {reportScope === 'transporte' && (
                <View style={{ marginTop: 6 }}>
                  <Text style={styles.formLabel}>2. Selecciona la Línea Afectada</Text>
                  {loadingLines ? (
                    <ActivityIndicator size="small" color="#6366f1" style={{ marginVertical: 10 }} />
                  ) : (
                    <TouchableOpacity style={styles.dropdownSelector} onPress={onOpenLinesDropdown}>
                      <Text style={styles.dropdownSelectorText}>
                        {selectedLine ? `${selectedLine.nombre_linea} - ${selectedLine.descripcion || 'Sin descripción'}` : 'Seleccionar Línea...'}
                      </Text>
                      <MaterialIcons name="arrow-drop-down" size={24} color="#94a3b8" />
                    </TouchableOpacity>
                  )}
                </View>
              )}

              <Text style={styles.formLabel}>
                {reportScope === 'general' ? '2. Categoría Técnica' : '3. Tipo de Falta en el Servicio'}
              </Text>

              <View style={styles.categorySelectorGrid}>
                {reportScope === 'general' ? (
                  [
                    { id: 'falla_app', label: 'Falla Técnica en la App (Cierres/Congelamiento)', icon: 'bug-report' },
                    { id: 'problema_saldo', label: 'Problema con mi Saldo / Tarjeta RFID', icon: 'account-balance-wallet' },
                  ].map((cat) => (
                    <TouchableOpacity
                      key={cat.id}
                      style={[styles.categoryOption, reportCategory === cat.id && { borderColor: theme.primaryColor, backgroundColor: '#1e293b' }]}
                      onPress={() => setReportCategory(cat.id)}
                    >
                      <MaterialIcons name={cat.icon} size={18} color={reportCategory === cat.id ? theme.primaryColor : '#64748b'} />
                      <Text style={[styles.categoryOptionText, reportCategory === cat.id && { color: '#fff', fontWeight: '700' }]}>{cat.label}</Text>
                    </TouchableOpacity>
                  ))
                ) : (
                  [
                    { id: 'mal_servicio', label: 'Mal servicio / Cobro excesivo del Chofer', icon: 'sentiment-very-dissatisfied' },
                    { id: 'limpieza', label: 'Falta de limpieza o higiene en la unidad', icon: 'clean-hands' },
                    { id: 'otros', label: 'Otros percances en el recorrido', icon: 'pending' },
                  ].map((cat) => (
                    <TouchableOpacity
                      key={cat.id}
                      style={[styles.categoryOption, reportCategory === cat.id && { borderColor: theme.primaryColor, backgroundColor: '#1e293b' }]}
                      onPress={() => setReportCategory(cat.id)}
                    >
                      <MaterialIcons name={cat.icon} size={18} color={reportCategory === cat.id ? theme.primaryColor : '#64748b'} />
                      <Text style={[styles.categoryOptionText, reportCategory === cat.id && { color: '#fff', fontWeight: '700' }]}>{cat.label}</Text>
                    </TouchableOpacity>
                  ))
                )}
              </View>

              <Text style={styles.formLabel}>
                {reportScope === 'general' ? '3. Describe la falla técnica' : '4. Detalles del Reclamo'}
              </Text>
              <TextInput
                style={styles.textAreaInput}
                multiline={true}
                numberOfLines={4}
                placeholder={reportScope === 'general' ? "Escribe aquí el error detallado..." : "Detalla la situación (Nro de placa, actitud, etc.)"}
                placeholderTextColor="#475569"
                value={reportMessage}
                onChangeText={setReportMessage}
              />
              <View style={styles.actionButtonsContainer}>
                <TouchableOpacity style={[styles.btnAction, { backgroundColor: theme.primaryColor }]} onPress={onSendReport}>
                  <MaterialIcons name="send" size={18} color="#fff" />
                  <Text style={styles.btnActionText}>Enviar Reporte</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.btnAction, styles.btnCancel]} onPress={onClose}>
                  <Text style={styles.btnCancelText}>Cancelar y Volver</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* SUB-MODAL DESPLEGABLE INTERNO */}
      <Modal visible={isLineDropdownOpen} animationType="fade" transparent={true}>
        <View style={styles.dropdownOverlay}>
          <View style={styles.dropdownListContainer}>
            <View style={styles.dropdownHeader}>
              <Text style={styles.dropdownTitle}>Líneas activas en la Llajta</Text>
              <TouchableOpacity onPress={onCloseLinesDropdown}>
                <MaterialIcons name="close" size={22} color="#fff" />
              </TouchableOpacity>
            </View>
            <ScrollView style={{ maxHeight: height * 0.4 }}>
              {(dbLines || []).map((linea) => (
                <TouchableOpacity
                  key={linea.id_linea}
                  style={[styles.dropdownItem, selectedLine?.id_linea === linea.id_linea && { backgroundColor: '#1e293b' }]}
                  onPress={() => onSelectLine(linea)}
                >
                  <MaterialIcons name="directions-bus" size={18} color="#3498db" />
                  <View style={{ marginLeft: 10, flex: 1 }}>
                    <Text style={styles.dropdownItemText}>{linea.nombre_linea}</Text>
                    <Text style={styles.dropdownItemSubtext} numberOfLines={1}>{linea.descripcion || 'Línea integrada regulada'}</Text>
                  </View>
                  {selectedLine?.id_linea === linea.id_linea && <MaterialIcons name="check" size={18} color="#10b981" />}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  modalOverlay: { flex: 1, backgroundColor: '#000000aa', justifyContent: 'flex-end' },
  modalContainer: { backgroundColor: '#0d1527', borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 20, borderWidth: 1, borderColor: '#1e293b' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 14, borderBottomWidth: 1, borderColor: '#1e293b' },
  modalTitle: { color: '#fff', fontSize: 16, fontWeight: '800' },
  formLabel: { color: '#94a3b8', fontSize: 12, fontWeight: '700', marginTop: 14, marginBottom: 8 },
  scopeRow: { flexDirection: 'row', gap: 10 },
  scopeButton: { flex: 1, flexDirection: 'row', height: 44, borderRadius: 14, borderWidth: 1, borderColor: '#1e293b', backgroundColor: '#090d16', justifyContent: 'center', alignItems: 'center', gap: 8 },
  scopeButtonText: { color: '#64748b', fontSize: 12, fontWeight: '700' },
  dropdownSelector: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', height: 46, backgroundColor: '#090d16', borderWidth: 1, borderColor: '#1e293b', borderRadius: 14, paddingHorizontal: 12 },
  dropdownSelectorText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  categorySelectorGrid: { gap: 8, marginTop: 2 },
  categoryOption: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 14, borderWidth: 1, borderColor: '#1e293b', backgroundColor: '#090d16', gap: 10 },
  categoryOptionText: { color: '#64748b', fontSize: 11, fontWeight: '500', flex: 1 },
  textAreaInput: { backgroundColor: '#090d16', borderRadius: 14, borderWidth: 1, borderColor: '#1e293b', padding: 12, color: '#fff', fontSize: 13, textAlignVertical: 'top', marginTop: 2 },
  actionButtonsContainer: { flexDirection: 'row', gap: 10, marginTop: 20, marginBottom: 20 },
  btnAction: { flex: 1, height: 46, borderRadius: 14, justifyContent: 'center', alignItems: 'center', flexDirection: 'row', gap: 8 },
  btnActionText: { color: '#fff', fontSize: 13, fontWeight: '800' },
  btnCancel: { backgroundColor: '#1e293b' },
  btnCancelText: { color: '#94a3b8', fontSize: 13, fontWeight: '700' },
  dropdownOverlay: { flex: 1, backgroundColor: '#00000088', justifyContent: 'center', alignItems: 'center' },
  dropdownListContainer: { width: width * 0.86, backgroundColor: '#0d1527', borderRadius: 24, padding: 16, borderWidth: 1, borderColor: '#1e293b', maxHeight: height * 0.5 },
  dropdownHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, paddingBottom: 10, borderBottomWidth: 1, borderColor: '#1e293b' },
  dropdownTitle: { color: '#fff', fontSize: 15, fontWeight: '800' },
  dropdownItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 14, borderRadius: 12, marginBottom: 6 },
  dropdownItemText: { color: '#fff', fontSize: 13, fontWeight: '700' },
  dropdownItemSubtext: { color: '#64748b', fontSize: 11, fontWeight: '500', marginTop: 2 }
});