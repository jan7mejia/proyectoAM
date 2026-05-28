import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  SectionList, 
  ActivityIndicator, 
  Alert, 
  TouchableOpacity, 
  SafeAreaView, 
  Platform, 
  StatusBar 
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { BASE_URL } from '../../config';

export default function TravelHistoryScreen({ route, navigation }) {
  const { user } = route.params || { user: { id_usuario: 1 } };
  const [secciones, setSecciones] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    obtenerHistorialTransacciones();
  }, []);

  // Función para capitalizar los nombres de los meses
  const capitalizar = (str) => str.charAt(0).toUpperCase() + str.slice(1);

  // Agrupar los movimientos por mes y año dinámicamente
  const agruparPorMes = (listaMovimientos) => {
    const grupos = {};

    listaMovimientos.forEach(movimiento => {
      if (!movimiento.fecha) return;
      
      const fechaObjeto = new Date(movimiento.fecha);
      const fechaValida = isNaN(fechaObjeto.getTime()) ? new Date() : fechaObjeto;

      const opcionesMes = { month: 'long', year: 'numeric' };
      const nombreMes = capitalizar(fechaValida.toLocaleDateString('es-ES', opcionesMes));

      if (!grupos[nombreMes]) {
        grupos[nombreMes] = [];
      }
      grupos[nombreMes].push(movimiento);
    });

    return Object.keys(grupos).map(mes => ({
      title: mes,
      data: grupos[mes]
    }));
  };

  const obtenerHistorialTransacciones = async () => {
    try {
      const response = await fetch(`${BASE_URL}/api/movimientos/${user.id_usuario}`);
      const data = await response.json();

      if (response.ok && data.success) {
        const movimientosProcesados = data.movimientos || [];
        const datosAgrupados = agruparPorMes(movimientosProcesados);
        setSecciones(datosAgrupados);
      } else {
        Alert.alert('Aviso del Sistema', data.error || 'No se pudieron recuperar las transacciones.');
      }
    } catch (error) {
      Alert.alert('Fallo de Red', 'Error al sincronizar el historial transaccional.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const formatFechaDia = (fechaStr) => {
    const f = new Date(fechaStr);
    if (isNaN(f.getTime())) return fechaStr;
    return f.toLocaleDateString('es-ES', { day: 'numeric', weekday: 'short', hour: '2-digit', minute: '2-digit' });
  };

  const renderCard = ({ item }) => {
    const esRecarga = item.tipo === 'recarga';
    const signo = esRecarga ? '+' : '-';
    const montoFormateado = parseFloat(item.monto || 0).toFixed(2);

    return (
      <View style={styles.card}>
        <View style={styles.cardLeftSection}>
          <View style={[styles.cardIconBox, { backgroundColor: esRecarga ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)' }]}>
            <MaterialIcons 
              name={esRecarga ? "add-chart" : "directions-bus"} 
              size={22} 
              color={esRecarga ? "#10b981" : "#ef4444"} 
            />
          </View>
          
          <View style={{ flex: 1, paddingRight: 8 }}>
            <Text style={styles.cardDetalle}>
              {esRecarga ? 'Recarga de Saldo Prepago' : `Viaje en ${item.nombre_linea || 'Línea de Transporte'}`}
            </Text>
            
            {/* Contenedor de metadata corregido sin strings sueltos */}
            {!esRecarga && (
              <View style={styles.dbMetadataContainer}>
                <View style={styles.metaRow}>
                  <MaterialIcons name="credit-card" size={12} color="#94a3b8" />
                  <Text style={styles.metaText}>
                    Placa: <Text style={styles.metaValor}>{`${item.placa || 'S/P'}`}</Text>
                  </Text>
                </View>
                <View style={styles.metaRow}>
                  <MaterialIcons name="person" size={12} color="#94a3b8" />
                  <Text style={styles.metaText} numberOfLines={1}>
                    Chofer: <Text style={styles.metaValor}>{`${item.nombre_chofer || 'Asignado'}`}</Text>
                  </Text>
                </View>
              </View>
            )}

            <Text style={styles.cardFecha}>{formatFechaDia(item.fecha)}</Text>
          </View>
        </View>

        {/* Monto formateado limpiamente en un solo string template */}
        <Text style={[styles.cardMonto, { color: esRecarga ? '#10b981' : '#ef4444' }]}>
          {`${signo} Bs. ${montoFormateado}`}
        </Text>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topAppBar}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <MaterialIcons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headTitle}>Mis Movimientos Recientes</Text>
        <View style={{ width: 40 }} />
      </View>

      {secciones.length === 0 ? (
        <View style={styles.emptyContainer}>
          <MaterialIcons name="history-toggle-off" size={64} color="#475569" />
          <Text style={styles.emptyText}>No registras movimientos en tu cuenta digital de transporte todavía.</Text>
        </View>
      ) : (
        <SectionList
          sections={secciones}
          keyExtractor={(item, index) => item.id_historial ? item.id_historial.toString() : index.toString()}
          renderItem={renderCard}
          renderSectionHeader={({ section: { title } }) => (
            <View style={styles.sectionHeaderContainer}>
              <Text style={styles.sectionHeaderTitle}>{title}</Text>
            </View>
          )}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 30 }}
          stickySectionHeadersEnabled={false}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#0f172a',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight || 10 : 0 
  },
  topAppBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
    marginBottom: 10
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1e293b',
    justifyContent: 'center',
    alignItems: 'center'
  },
  headTitle: { 
    fontSize: 17, 
    fontWeight: 'bold', 
    color: '#fff',
    textAlign: 'center'
  },
  sectionHeaderContainer: {
    backgroundColor: '#0f172a',
    paddingVertical: 10,
    marginTop: 8,
    marginBottom: 6
  },
  sectionHeaderTitle: {
    color: '#6366f1',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase'
  },
  card: { 
    flexDirection: 'row', 
    backgroundColor: '#1e293b', 
    padding: 14, 
    borderRadius: 12, 
    alignItems: 'center', 
    justifyContent: 'space-between',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#334155'
  },
  cardLeftSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1
  },
  cardIconBox: { 
    marginRight: 12, 
    padding: 10, 
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2
  },
  cardDetalle: { 
    color: '#f8fafc', 
    fontSize: 14, 
    fontWeight: '600',
    marginBottom: 4
  },
  dbMetadataContainer: {
    backgroundColor: '#0f172a',
    padding: 8,
    borderRadius: 6,
    marginVertical: 4,
    gap: 3
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  metaText: {
    color: '#94a3b8',
    fontSize: 12
  },
  metaValor: {
    color: '#e2e8f0',
    fontWeight: '600'
  },
  cardFecha: { 
    color: '#64748b', 
    fontSize: 11, 
    marginTop: 4,
    textTransform: 'capitalize'
  },
  cardMonto: { 
    fontSize: 15, 
    fontWeight: 'bold',
    marginLeft: 6,
    alignSelf: 'center'
  },
  emptyContainer: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    paddingHorizontal: 40 
  },
  emptyText: { 
    color: '#64748b', 
    textAlign: 'center', 
    marginTop: 15, 
    fontSize: 14,
    lineHeight: 20
  }
});