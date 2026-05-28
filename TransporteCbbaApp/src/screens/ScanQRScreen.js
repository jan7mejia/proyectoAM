import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  ActivityIndicator, 
  Alert, 
  Dimensions, 
  Platform, 
  StatusBar 
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Camera, CameraView } from 'expo-camera';
import { Audio } from 'expo-av';
import { BASE_URL } from '../../config';

const { width } = Dimensions.get('window');

export default function ScanQRScreen({ route, navigation }) {
  const { user } = route.params || { user: { id_usuario: 1, nombre: "Pasajero" } };
  
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sound, setSound] = useState(null);

  // Solicitar permisos de la cámara al montar la pantalla
  useEffect(() => {
    const getCameraPermissions = async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    };
    getCameraPermissions();

    // Limpieza del sonido al desmontar el componente
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [sound]);

  // Función para reproducir el sonido de éxito (pay.mp3)
  const reproducirSonidoExito = async () => {
    try {
      const { sound: soundObject } = await Audio.Sound.createAsync(
        require('../../assets/sounds/pay.mp3')
      );
      setSound(soundObject);
      await soundObject.playAsync();
    } catch (error) {
      console.log('Error al reproducir el audio de pago:', error);
    }
  };

  const procesarPagoPasaje = async (idVehiculoEscanado) => {
    setLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/api/pagar-qr`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id_usuario: user.id_usuario,
          id_vehiculo: parseInt(idVehiculoEscanado)
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Reproducir sonido de pago exitoso de manera inmediata
        await reproducirSonidoExito();

        Alert.alert(
          '¡Pago Exitoso!',
          `Pasaje procesado correctamente.\n\n🚌 Línea: ${data.linea}\n👤 Conductor: ${data.chofer}\n💵 Monto Descontado: Bs. ${data.monto_descontado.toFixed(2)}\n💰 Nuevo Saldo: Bs. ${data.nuevo_saldo.toFixed(2)}`,
          [
            { 
              text: 'Aceptar', 
              onPress: () => {
                if (navigation.canGoBack()) {
                  navigation.goBack(); 
                } else {
                  navigation.navigate('PassengerDashboard', { user });
                }
              } 
            }
          ]
        );
      } else {
        // Evaluar si el error es de saldo insuficiente devuelto por el backend
        const esSaldoInsuficiente = data.error && data.error.toLowerCase().includes('insuficiente');

        if (esSaldoInsuficiente) {
          Alert.alert(
            '🔔 Pago Rechazado',
            `${data.error}\n\n¿Deseas ir al módulo de recargas para abonar dinero a tu cuenta virtual ahora mismo?`,
            [
              { text: 'Quizás más tarde', onPress: () => setScanned(false), style: 'cancel' },
              { 
                text: 'Recargar Ahora', 
                onPress: () => {
                  setScanned(false);
                  navigation.navigate('RechargeScreen', { user });
                } 
              }
            ]
          );
        } else {
          Alert.alert('Transacción Inválida', data.error || 'Ocurrió un inconveniente al procesar el cobro virtual.');
          setScanned(false);
        }
      }
    } catch (error) {
      Alert.alert('Error de Comunicación', 'No se pudo conectar al servidor de transporte urbano.');
      console.error(error);
      setScanned(false);
    } finally {
      setLoading(false);
    }
  };

  const handleBarcodeScanned = ({ type, data }) => {
    if (scanned || loading) return;
    setScanned(true);

    if (isNaN(data)) {
      Alert.alert(
        'QR No Válido', 
        'El código QR escaneado no pertenece al sistema regulado de PayBus.',
        [{ text: 'Reintentar', onPress: () => setScanned(false) }]
      );
      return;
    }

    procesarPagoPasaje(data);
  };

  if (hasPermission === null) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#6366f1" />
        <Text style={styles.permissionText}>Solicitando acceso a la cámara...</Text>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={styles.centerContainer}>
        <MaterialIcons name="camera-alt" size={64} color="#ef4444" />
        <Text style={[styles.permissionText, { color: '#ef4444' }]}>Permiso de cámara denegado.</Text>
        <Text style={styles.permissionSubtitle}>Por favor, habilita los permisos de la cámara en la configuración de tu dispositivo para poder realizar cobros QR en las unidades de transporte.</Text>
        <TouchableOpacity 
          style={styles.btnVolverDashboard} 
          onPress={() => navigation.navigate('PassengerDashboard', { user })}
        >
          <Text style={styles.btnText}>VOLVER AL PANEL PRINCIPAL</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Barra Superior con Botón de Regreso */}
      <View style={styles.topAppBar}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.navigate('PassengerDashboard', { user })}
          activeOpacity={0.7}
        >
          <MaterialIcons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headTitle}>Lector de Pasaje Digital</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.header}>
        <Text style={styles.subtitle}>Enfoque el código QR oficial ubicado en el parabrisas o panel interior del vehículo.</Text>
      </View>

      {/* Visor de la Cámara de Expo */}
      <View style={styles.cameraContainer}>
        <CameraView
          onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
          barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
          style={StyleSheet.absoluteFillObject}
        />
        {/* Guía visual con esquinas iluminadas */}
        <View style={styles.overlayFrame}>
          <View style={styles.focusedSquare}>
            <View style={[styles.corner, styles.topLeft]} />
            <View style={[styles.corner, styles.topRight]} />
            <View style={[styles.corner, styles.bottomLeft]} />
            <View style={[styles.corner, styles.bottomRight]} />
          </View>
        </View>
        
        {loading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#6366f1" />
            <Text style={styles.loadingText}>Procesando Cobro Virtual...</Text>
          </View>
        )}
      </View>

      {/* Caja de Información del Usuario */}
      <View style={styles.infoBox}>
        <View style={styles.infoRow}>
          <View style={styles.iconContainer}>
            <MaterialIcons name="person" size={18} color="#6366f1" />
          </View>
          <View>
            <Text style={styles.infoLabel}>Pasajero Autenticado</Text>
            <Text style={styles.boldText}>{user.nombre}</Text>
          </View>
        </View>
        <View style={styles.divider} />
        <View style={styles.infoRow}>
          <View style={styles.iconContainer}>
            <MaterialIcons name="card-membership" size={18} color="#10b981" />
          </View>
          <View>
            <Text style={styles.infoLabel}>Categoría de Tarifa</Text>
            <Text style={[styles.boldText, { color: '#10b981' }]}>
              {user.categoria ? user.categoria.toUpperCase() : 'ADULTO'}
            </Text>
          </View>
        </View>
      </View>

      {/* Botón Inferior Dinámico de Re-Escaneo */}
      <View style={styles.bottomSection}>
        {scanned && !loading ? (
          <TouchableOpacity style={styles.btnRescan} onPress={() => setScanned(false)}>
            <MaterialIcons name="refresh" size={20} color="#fff" style={{ marginRight: 8 }} />
            <Text style={styles.btnText}>REINTENTAR ESCANEO</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.scanningBadge}>
            <ActivityIndicator size="small" color="#6366f1" style={{ marginRight: 8 }} />
            <Text style={styles.scanningText}>ESPERANDO CÓDIGO QR</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#0f172a', 
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight || 10 : 20,
    alignItems: 'center', 
    justifyContent: 'space-between' 
  },
  centerContainer: { 
    flex: 1, 
    backgroundColor: '#0f172a', 
    justifyContent: 'center', 
    alignItems: 'center', 
    padding: 30 
  },
  topAppBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    width: '100%',
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b'
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
    fontSize: 18, 
    fontWeight: 'bold', 
    color: '#fff',
    textAlign: 'center'
  },
  header: { 
    alignItems: 'center', 
    paddingHorizontal: 32,
    marginTop: 10 
  },
  subtitle: { 
    fontSize: 13, 
    color: '#94a3b8', 
    textAlign: 'center', 
    lineHeight: 18 
  },
  cameraContainer: { 
    width: width * 0.82, 
    height: width * 0.82, 
    borderRadius: 28, 
    overflow: 'hidden', 
    borderWidth: 1, 
    borderColor: '#334155', 
    position: 'relative',
    marginVertical: 15
  },
  overlayFrame: { 
    ...StyleSheet.absoluteFillObject, 
    justifyContent: 'center', 
    alignItems: 'center', 
    backgroundColor: 'rgba(15, 23, 42, 0.4)' 
  },
  focusedSquare: { 
    width: width * 0.58, 
    height: width * 0.58, 
    position: 'relative',
    backgroundColor: 'transparent' 
  },
  corner: {
    position: 'absolute',
    width: 25,
    height: 25,
    borderColor: '#6366f1',
  },
  topLeft: { top: 0, left: 0, borderTopWidth: 4, borderLeftWidth: 4, borderTopLeftRadius: 12 },
  topRight: { top: 0, right: 0, borderTopWidth: 4, borderRightWidth: 4, borderTopRightRadius: 12 },
  bottomLeft: { bottom: 0, left: 0, borderBottomWidth: 4, borderLeftWidth: 4, borderBottomLeftRadius: 12 },
  bottomRight: { bottom: 0, right: 0, borderBottomWidth: 4, borderRightWidth: 4, borderBottomRightRadius: 12 },
  
  loadingOverlay: { 
    ...StyleSheet.absoluteFillObject, 
    backgroundColor: 'rgba(15, 23, 42, 0.92)', 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  loadingText: { 
    color: '#fff', 
    marginTop: 12, 
    fontWeight: '600', 
    fontSize: 14,
    letterSpacing: 0.5
  },
  permissionText: { 
    color: '#fff', 
    marginTop: 15, 
    fontSize: 16, 
    fontWeight: 'bold' 
  },
  permissionSubtitle: {
    color: '#94a3b8',
    textAlign: 'center',
    fontSize: 13,
    lineHeight: 20,
    marginTop: 8,
    marginBottom: 25,
    paddingHorizontal: 10
  },
  infoBox: { 
    backgroundColor: '#1e293b', 
    width: width - 40, 
    padding: 16, 
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#334155'
  },
  infoRow: { 
    flexDirection: 'row', 
    alignItems: 'center' 
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#0f172a',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12
  },
  infoLabel: {
    color: '#64748b',
    fontSize: 11,
    fontWeight: '500'
  },
  boldText: { 
    fontWeight: '700', 
    color: '#f8fafc',
    fontSize: 14,
    marginTop: 1
  },
  divider: {
    height: 1,
    backgroundColor: '#334155',
    marginVertical: 12
  },
  bottomSection: {
    width: '100%',
    alignItems: 'center',
    paddingBottom: 30
  },
  btnRescan: { 
    flexDirection: 'row', 
    width: width - 40, 
    height: 52, 
    backgroundColor: '#6366f1', 
    borderRadius: 12, 
    justifyContent: 'center', 
    alignItems: 'center',
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4
  },
  btnVolverDashboard: {
    width: '100%',
    height: 50,
    backgroundColor: '#1e293b',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155'
  },
  btnText: { 
    color: '#fff', 
    fontSize: 14, 
    fontWeight: '700',
    letterSpacing: 0.5
  },
  scanningBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e293b',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#334155'
  },
  scanningText: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1
  }
});