import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { BASE_URL } from '../../../config';

export default function CollapsibleLines({ isSectionOpen, onToggleSection, user, navigation }) {
  const [lineasActivas, setLineasActivas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    if (isSectionOpen) {
      const obtenerLineasMunicipales = async () => {
        try {
          setLoading(true);
          setErrorMsg(null);
          
          const response = await fetch(`${BASE_URL}/api/lineas`);
          
          // Verificación de seguridad para evitar caídas por HTML inesperado
          const contentType = response.headers.get("content-type");
          if (!contentType || !contentType.includes("application/json")) {
            throw new TypeError("El servidor no respondió con un formato JSON válido.");
          }

          const data = await response.json();

          if (response.ok && data.success) {
            setLineasActivas(data.lineas);
          } else {
            setErrorMsg("No se pudieron estructurar las rutas de transporte.");
          }
        } catch (error) {
          console.error("Error conectando al servidor de PayBus:", error);
          setErrorMsg("Error de sincronización con la base de datos.");
        } finally {
          setLoading(false);
        }
      };

      obtenerLineasMunicipales();
    }
  }, [isSectionOpen]);

  return (
    <View style={styles.collapsibleSection}>
      <TouchableOpacity style={styles.sectionHeader} onPress={onToggleSection}>
        <View style={styles.sectionTitleRow}>
          <MaterialIcons name="directions-bus" size={20} color="#3498db" style={{ marginRight: 8 }} />
          <Text style={styles.sectionTitle}>Líneas de Transporte Activas</Text>
        </View>
        <MaterialIcons name={isSectionOpen ? "keyboard-arrow-up" : "keyboard-arrow-down"} size={22} color="#64748b" />
      </TouchableOpacity>

      <Text style={styles.sectionSubtitle}>Consulta líneas municipales integradas y sus rutas oficiales.</Text>

      {isSectionOpen && (
        <View style={styles.dynamicList}>
          {loading && (
            <View style={styles.centerContainer}>
              <ActivityIndicator size="small" color="#3498db" />
              <Text style={styles.infoText}>Consultando base de datos de Cercado...</Text>
            </View>
          )}

          {errorMsg && (
            <View style={styles.centerContainer}>
              <MaterialIcons name="cloud-off" size={20} color="#ef4444" />
              <Text style={[styles.infoText, { color: '#ef4444' }]}>{errorMsg}</Text>
            </View>
          )}

          {!loading && !errorMsg && lineasActivas.length === 0 && (
            <View style={styles.centerContainer}>
              <Text style={styles.infoText}>No se encontraron líneas activas en el sistema.</Text>
            </View>
          )}

          {!loading && !errorMsg && lineasActivas.map((linea, index) => {
            // Clasificación automática visual de transporte local boliviano
            const esMicro = linea.nombre_linea.toLowerCase().includes('micro') || 
                            (linea.descripcion && linea.descripcion.toLowerCase().includes('micro'));

            return (
              <TouchableOpacity 
                key={linea.id_linea} 
                style={[styles.lineItem, index === lineasActivas.length - 1 && { borderBottomWidth: 0 }]} 
                onPress={() => navigation.navigate('TravelHistoryScreen', { user, lineaFiltro: linea.id_linea })}
              >
                <View style={[styles.busBadge, !esMicro && { backgroundColor: '#e2e8f015' }]}>
                  <Text style={[styles.busBadgeText, !esMicro && { color: '#94a3b8' }]}>
                    {esMicro ? "Micro" : "Trufi"}
                  </Text>
                </View>
                
                <View style={styles.textRouteContainer}>
                  <Text style={styles.lineNameText}>{linea.nombre_linea}</Text>
                  <Text style={styles.lineRouteText} numberOfLines={2}>
                    {linea.descripcion || "Ruta oficial del transporte municipal de Cochabamba."}
                  </Text>
                </View>

                <MaterialIcons name="chevron-right" size={18} color="#475569" style={{ marginLeft: 'auto' }} />
              </TouchableOpacity>
            );
          })}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  collapsibleSection: { backgroundColor: '#0d1527', borderRadius: 20, padding: 16, borderWidth: 1, borderColor: '#1e293b' },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center' },
  sectionTitle: { color: '#fff', fontSize: 14, fontWeight: '700' },
  sectionSubtitle: { color: '#475569', fontSize: 11, fontWeight: '500', marginTop: 4, marginBottom: 12 },
  dynamicList: { borderTopWidth: 1, borderColor: '#1e293b', paddingTop: 4 },
  lineItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderColor: '#1e293b', gap: 12 },
  busBadge: { backgroundColor: '#3498db22', paddingVertical: 4, paddingHorizontal: 8, borderRadius: 6, alignSelf: 'center' },
  busBadgeText: { color: '#3498db', fontSize: 9, fontWeight: '800', textTransform: 'uppercase' },
  textRouteContainer: { flex: 1, gap: 2 },
  lineNameText: { color: '#cbd5e1', fontSize: 13, fontWeight: '700' },
  lineRouteText: { color: '#64748b', fontSize: 11, fontWeight: '500', lineHeight: 14 },
  centerContainer: { paddingVertical: 20, alignItems: 'center', justifyContent: 'center', gap: 8 },
  infoText: { color: '#475569', fontSize: 11, fontWeight: '500' }
});