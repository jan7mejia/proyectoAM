import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, FlatList, ActivityIndicator, Vibration } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import { BASE_URL } from '../../config';

export default function DriverDashboard({ route }) {
  // Obtenemos el id del chofer desde el login; por defecto usamos el ID 2 (según tus registros de MySQL)
  const idChofer = route?.params?.user?.id_usuario || 2;

  const [unidadInfo, setUnidadInfo] = useState('Buscando Unidad Activa...');
  const [ingresosHoy, setIngresosHoy] = useState(0.00);
  const [alertasPagos, setAlertasPagos] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Control de hilos para evitar bucles infinitos del sonido
  const pagosProcesadosRef = useRef(new Set());
  const sonidoRef = useRef(null);

  // Activación física de periféricos: Alarma acústica y sistema vibratorio
  const dispararAlertaNotificacion = async () => {
    try {
      // Patrón de alerta: Inmediato (0ms), vibra 400ms, pausa corta 200ms, re-vibra 400ms
      Vibration.vibrate([0, 400, 200, 400]);

      if (sonidoRef.current) {
        await sonidoRef.current.unloadAsync();
      }
      
      // Carga limpia del recurso de audio local solicitado
      const { sound } = await Audio.Sound.createAsync(
        require('../../assets/sounds/cobrar.mp3')
      );
      sonidoRef.current = sound;
      await sound.playAsync();
    } catch (error) {
      console.log("Aviso de Audio: El recurso sonoro está ocupado o la ruta es inválida.", error);
    }
  };

  useEffect(() => {
    const consultarPasajerosYRecaudacion = async () => {
      try {
        const response = await fetch(`${BASE_URL}/api/chofer/monitoreo/${idChofer}`);
        const data = await response.json();

        if (response.ok && data.success) {
          setUnidadInfo(data.unidad);
          setIngresosHoy(data.ingresosHoy);
          
          // Evaluación del arreglo de pagos entrantes desde la BD
          if (data.alertasPagos && data.alertasPagos.length > 0) {
            const ultimoPago = data.alertasPagos[0]; // El más reciente debido al ORDER BY DESC
            
            // Si el set de control está vacío, registramos el estado inicial de la base de datos sin sonar
            if (pagosProcesadosRef.current.size === 0) {
              data.alertasPagos.forEach(p => pagosProcesadosRef.current.add(p.id));
            } 
            // Si ingresa un nuevo ID que no estaba en el mapa, es un pasajero subiendo en tiempo real
            else if (!pagosProcesadosRef.current.has(ultimoPago.id)) {
              pagosProcesadosRef.current.add(ultimoPago.id);
              await dispararAlertaNotificacion();
            }
          }
          
          setAlertasPagos(data.alertasPagos || []);
        }
      } catch (error) {
        console.error("Error en la sincronización del pooling:", error);
      } finally {
        setLoading(false);
      }
    };

    // Consulta inicial inmediata al montar el componente de monitoreo
    consultarPasajerosYRecaudacion();

    // Muestreo cíclico (Estrategia Polling cada 3 segundos)
    const intervaloMuestreo = setInterval(consultarPasajerosYRecaudacion, 3000);

    // Destructor de hilos para liberar memoria al cerrar sesión o cambiar de pantalla
    return () => {
      clearInterval(intervaloMuestreo);
      if (sonidoRef.current) {
        sonidoRef.current.unloadAsync();
      }
    };
  }, [idChofer]);

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#0f766e" />
        <Text style={{ color: '#94a3b8', marginTop: 10 }}>Sincronizando Turno con la Base de Datos...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.statusBanner}>
        <MaterialIcons name="circle" size={12} color="#2ecc71" style={styles.liveDot} />
        <Text style={styles.statusText}>Unidad Activa • {unidadInfo}</Text>
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
        keyExtractor={item => item.id.toString()}
        renderItem={({ item }) => {
          // Clasificación cromática según la categoría del pasajero para la validación del docente
          let colorCategoria = '#38bdf8'; // Por defecto: adulto
          const categoriaClean = item.tipo_pasajero ? item.tipo_pasajero.toLowerCase() : 'adulto';
          
          if (categoriaClean === 'estudiante') colorCategoria = '#f43f5e';
          if (categoriaClean === 'universitario') colorCategoria = '#a855f7';
          if (categoriaClean === 'adulto_mayor') colorCategoria = '#eab308';

          return (
            <View style={styles.ticketCard}>
              <View style={styles.ticketLeft}>
                <View style={styles.userRow}>
                  <Text style={styles.ticketUser}>{item.pasajero || 'Pasajero Anónimo'}</Text>
                  <View style={[styles.badge, { backgroundColor: `${colorCategoria}20` }]}>
                    <Text style={[styles.badgeText, { color: colorCategoria }]}>
                      {categoriaClean}
                    </Text>
                  </View>
                </View>
                <Text style={styles.ticketMeta}>C.I. {item.ci || 'S/N'} • Vía {(item.metodo || 'QR').toUpperCase()}</Text>
                <Text style={styles.ticketTime}>Hora de Abordo: {item.hora}</Text>
              </View>
              <Text style={styles.ticketMonto}>+{parseFloat(item.monto || 0).toFixed(2)} Bs.</Text>
            </View>
          );
        }}
        ListEmptyComponent={
          <View style={styles.centerEmpty}>
            <MaterialIcons name="directions-bus" size={40} color="#334155" />
            <Text style={{ color: '#64748b', marginTop: 10, textAlign: 'center' }}>
              Esperando abordajes... Los cobros realizados figurarán aquí de forma automática.
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a', padding: 20 },
  center: { justifyContent: 'center', alignItems: 'center' },
  centerEmpty: { padding: 40, justifyContent: 'center', alignItems: 'center' },
  statusBanner: { backgroundColor: '#1e293b', padding: 12, borderRadius: 10, flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  liveDot: { marginRight: 8 },
  statusText: { color: '#94a3b8', fontSize: 13, fontWeight: '600' },
  incomeCard: { backgroundColor: '#0f766e', padding: 25, borderRadius: 16, alignItems: 'center', marginBottom: 25 },
  incomeLabel: { color: '#ccfbf1', fontSize: 12, fontWeight: '700', letterSpacing: 0.5 },
  incomeMonto: { color: '#fff', fontSize: 42, fontWeight: '900', marginTop: 5 },
  notiHeaderRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  notiTitle: { color: '#fff', fontSize: 16, fontWeight: 'bold', marginLeft: 10 },
  ticketCard: { backgroundColor: '#1e293b', padding: 16, borderRadius: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, borderWidth: 1, borderColor: '#334155' },
  ticketLeft: { flex: 1, gap: 2 },
  userRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  ticketUser: { color: '#f8fafc', fontSize: 15, fontWeight: 'bold' },
  ticketMeta: { color: '#94a3b8', fontSize: 12, marginTop: 1 },
  ticketTime: { color: '#64748b', fontSize: 11 },
  ticketMonto: { color: '#2ecc71', fontWeight: '900', fontSize: 16, marginLeft: 10 },
  badge: { paddingVertical: 2, paddingHorizontal: 6, borderRadius: 4 },
  badgeText: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase' }
});