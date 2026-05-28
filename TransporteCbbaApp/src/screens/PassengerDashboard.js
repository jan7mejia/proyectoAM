
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { StyleSheet, View, ScrollView, Alert, Vibration } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Audio } from 'expo-av'; 
import { BASE_URL } from '../../config';

// Importación de subcomponentes modulares
import DashboardHeader from './passengerComponents/DashboardHeader';
import QuickActions from './passengerComponents/QuickActions';
import BalanceWidget from './passengerComponents/BalanceWidget';
import PromoBanner from './passengerComponents/PromoBanner';
import CollapsibleLines from './passengerComponents/CollapsibleLines';
import NotificationModal from './passengerComponents/NotificationModal';
import SupportModal from './passengerComponents/SupportModal';
import RoutesModal from './passengerComponents/RoutesModal';

const API_URL = `${BASE_URL}/api`;

export default function PassengerDashboard({ route, navigation }) {
  const [showBalance, setShowBalance] = useState(true);
  const [isSectionOpen, setIsSectionOpen] = useState(true);
  const [loading, setLoading] = useState(false);
  const [loadingNotif, setLoadingNotif] = useState(false);

  const [notifications, setNotifications] = useState([]);
  const [isNotifModalOpen, setIsNotifModalOpen] = useState(false);
  const [isRoutesModalOpen, setIsRoutesModalOpen] = useState(false); 

  const [isSupportModalOpen, setIsSupportModalOpen] = useState(false);
  const [reportScope, setReportScope] = useState('general'); 
  const [reportCategory, setReportCategory] = useState('falla_app');
  const [reportMessage, setReportMessage] = useState('');

  const [dbLines, setDbLines] = useState([]);
  const [selectedLine, setSelectedLine] = useState(null);
  const [isLineDropdownOpen, setIsLineDropdownOpen] = useState(false);
  const [loadingLines, setLoadingLines] = useState(false);

  const prevUnreadCountRef = useRef(0);
  const soundRef = useRef(null);

  // CORRECCIÓN: Estado inicial consistente con claves numéricas de la BD (id_categoria = 2)
  const [user, setUser] = useState(route.params?.user || {
    id_usuario: '1',
    nombre: 'Jan Alessi',
    apellido: 'Mejia',
    correo: 'j.mejia@umss.edu.bo',
    saldo: 0.00,
    id_categoria: 2 
  });

  const userIdActivo = user?.id_usuario || user?.id_usuario_emisor || '1';

  useEffect(() => {
    async function prepararAudio() {
      try {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          playsInSilentModeIOS: true,       
          shouldDuckAndroid: true,          
          playThroughEarpieceAndroid: false, 
          stayActiveInBackground: true
        });

        const { sound } = await Audio.Sound.createAsync(
          require('../../assets/sounds/alert.mp3'),
          { shouldPlay: false, volume: 1.0 }
        );
        soundRef.current = sound;
        console.log("Audio de alerta precargado exitosamente en memoria RAM.");
      } catch (error) {
        console.log("Error crítico al inicializar o encontrar el archivo .mp3:", error);
      }
    }
    prepararAudio();

    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync();
      }
    };
  }, []);

  const dispararAlarmaNotificacion = async () => {
    try {
      Vibration.vibrate([0, 500, 200, 500]);
      if (soundRef.current) {
        await soundRef.current.stopAsync();
        await soundRef.current.setPositionAsync(0);
        await soundRef.current.playAsync();
      }
    } catch (error) {
      console.log("Error de ejecución al reproducir la alerta sonora:", error);
    }
  };

  useEffect(() => {
    if (reportScope === 'general') {
      setReportCategory('falla_app');
      setSelectedLine(null);
    } else {
      setReportCategory('mal_servicio');
      if (dbLines.length > 0) setSelectedLine(dbLines[0]);
    }
  }, [reportScope, dbLines]);

  useEffect(() => {
    let interval = null;
    if (userIdActivo) {
      fetchNotificationsSilently();
      interval = setInterval(() => {
        fetchNotificationsSilently();
      }, 5000); 
    }
    return () => { if (interval) clearInterval(interval); };
  }, [userIdActivo]);

  const fetchNotificationsSilently = async () => {
    try {
      const response = await fetch(`${API_URL}/notificaciones/${userIdActivo}`);
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          const nuevasNotificaciones = data.notificaciones || [];
          const unreadCountActual = nuevasNotificaciones.filter(n => !n.leido).length;

          if (unreadCountActual > prevUnreadCountRef.current) {
            await dispararAlarmaNotificacion();
          }

          prevUnreadCountRef.current = unreadCountActual;
          setNotifications(nuevasNotificaciones);
        }
      }
    } catch (error) {
      console.log("Error silencioso cargando alertas:", error);
    }
  };

  const fetchDatabaseLines = async () => {
    try {
      setLoadingLines(true);
      const response = await fetch(`${API_URL}/lineas/activas`);
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setDbLines(data.lineas || []);
          if (data.lineas && data.lineas.length > 0 && reportScope === 'transporte') {
            setSelectedLine(data.lineas[0]);
          }
        }
      }
    } catch (error) {
      console.log("Error cargando líneas:", error);
    } finally {
      setLoadingLines(false);
    }
  };

  const fetchUpdatedUserData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/usuarios/${userIdActivo}`);
      if (response.ok) {
        const data = await response.json();
        // Si el backend responde con data.usuario, nos acoplamos a la estructura
        if (data.success && data.usuario) {
          setUser(data.usuario);
        } else if (data.success && data.user) {
          setUser(data.user);
        }
      }
    } catch (error) {
      console.log("Error cargando datos de usuario:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchNotifications = async () => {
    try {
      setLoadingNotif(true);
      const response = await fetch(`${API_URL}/notificaciones/${userIdActivo}`);
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          const listaNotif = data.notificaciones || [];
          prevUnreadCountRef.current = listaNotif.filter(n => !n.leido).length;
          setNotifications(listaNotif);
        }
      }
    } catch (error) {
      console.log("Error cargando notificaciones:", error);
    } finally {
      setLoadingNotif(false);
    }
  };

  const marcarNotificacionLeida = async (idNotificacion) => {
    try {
      const response = await fetch(`${API_URL}/notificaciones/leer/${idNotificacion}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await response.json();
      if (data.success) {
        setNotifications(prev => {
          const actualizadas = (prev || []).map(n => n.id_notificacion === idNotificacion ? { ...n, leido: true } : n);
          prevUnreadCountRef.current = actualizadas.filter(n => !n.leido).length;
          return actualizadas;
        });
      }
    } catch (error) {
      console.log("Error al actualizar lectura:", error);
    }
  };

  const eliminarNotificacion = async (idNotificacion) => {
    try {
      const response = await fetch(`${API_URL}/notificaciones/eliminar/${idNotificacion}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await response.json();
      if (data.success) {
        setNotifications(prev => {
          const filtradas = (prev || []).filter(n => n.id_notificacion !== idNotificacion);
          prevUnreadCountRef.current = filtradas.filter(n => !n.leido).length;
          return filtradas;
        });
      } else {
        Alert.alert("Error", "No se pudo eliminar la notificación.");
      }
    } catch (error) {
      Alert.alert("Error de Red", "No se pudo conectar con el servidor.");
    }
  };

  useFocusEffect(
    useCallback(() => {
      if (userIdActivo) {
        fetchUpdatedUserData();
        fetchNotifications();
        fetchDatabaseLines();
      }
    }, [userIdActivo])
  );

  const unreadCount = (notifications || []).filter(n => !n.leido).length;

  const getCategoryTheme = (idCat) => {
    // Mapeo dinámico por id_categoria numérico para los estilos estéticos globales del Dashboard
    switch (Number(idCat)) {
      case 1:
        return { label: 'PASAJERO ESTUDIANTE', primaryColor: '#10b981', badgeColor: '#064e3b', icon: 'face' };
      case 2:
        return { label: 'PASAJERO UNIVERSITARIO', primaryColor: '#6366f1', badgeColor: '#312e81', icon: 'school' };
      case 4:
        return { label: 'ADULTO MAYOR (DIGNIDAD)', primaryColor: '#f97316', badgeColor: '#7c2d12', icon: 'elderly' };
      case 3:
      default:
        return { label: 'PASAJERO - TARIFA NORMAL', primaryColor: '#7123a3', badgeColor: '#4a156d', icon: 'directions-walk' };
    }
  };

  // Se determina el color basándose en el id_categoria numérico guardado
  const theme = getCategoryTheme(user?.id_categoria);

  const handleEnviarReporte = async () => {
    if (!reportMessage.trim()) {
      Alert.alert("Campo Requerido", "Por favor, describe el inconveniente.");
      return;
    }
    if (reportScope === 'transporte' && !selectedLine) {
      Alert.alert("Línea Requerida", "Por favor, selecciona la línea.");
      return;
    }
    try {
      setLoading(true);
      const idLineaAsociada = reportScope === 'transporte' ? selectedLine.id_linea : null;
      const response = await fetch(`${API_URL}/soporte/reportar`, {
        method: 'POST',
        headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id_usuario_emisor: parseInt(userIdActivo),
          id_usuario: parseInt(userIdActivo),
          id_linea_afectada: idLineaAsociada,
          tipo_usuario_emisor: 'pasajero',
          categoria: reportCategory,
          mensaje: reportMessage.trim()
        })
      });
      const resData = await response.json();
      if (response.ok && resData.success) {
        Alert.alert("Reporte Recibido", "Tu reporte ha sido enviado con éxito.");
        setReportMessage('');
        setReportScope('general');
        setIsSupportModalOpen(false);
        fetchNotifications();
      } else {
        Alert.alert("Error de Servidor", resData.error || "No se pudo procesar el reporte.");
      }
    } catch (error) {
      Alert.alert("Error de Red", "No se pudo conectar con el servidor.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert("Cerrar Sesión", "¿Estás seguro de que deseas salir?", [
      { text: "Cancelar", style: "cancel" },
      { text: "Salir", style: "destructive", onPress: () => navigation.navigate('LoginScreen') }
    ]);
  };

  return (
    <View style={styles.container}>
      <DashboardHeader
        user={user}
        theme={theme}
        loading={loading}
        unreadCount={unreadCount}
        onOpenNotif={() => { fetchNotifications(); setIsNotifModalOpen(true); }}
        onOpenSupport={() => setIsSupportModalOpen(true)}
        onLogout={handleLogout}
      />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <QuickActions 
          user={user} 
          navigation={navigation} 
          onOpenRoutes={() => { fetchDatabaseLines(); setIsRoutesModalOpen(true); }} 
        />

        <BalanceWidget
          user={user}
          theme={theme}
          showBalance={showBalance}
          onToggleBalance={() => setShowBalance(!showBalance)}
          navigation={navigation}
        />

        {/* CORRECCIÓN CRÍTICA: Se añade el prop user para que herede la sesión */}
        <PromoBanner theme={theme} user={user} idLineaAsignada={1} />

        <CollapsibleLines
          isSectionOpen={isSectionOpen}
          onToggleSection={() => setIsSectionOpen(!isSectionOpen)}
          user={user}
          navigation={navigation}
        />
      </ScrollView>

      <RoutesModal
        visible={isRoutesModalOpen}
        onClose={() => setIsRoutesModalOpen(false)}
        dbLines={dbLines}
        loadingLines={loadingLines}
        theme={theme}
      />

      <NotificationModal
        visible={isNotifModalOpen}
        onClose={() => setIsNotifModalOpen(false)}
        loadingNotif={loadingNotif}
        notifications={notifications}
        theme={theme}
        onMarkRead={marcarNotificacionLeida}
        onDeleteNotif={eliminarNotificacion}
      />

      <SupportModal
        visible={isSupportModalOpen}
        onClose={() => { setReportMessage(''); setReportScope('general'); setIsSupportModalOpen(false); }}
        theme={theme}
        reportScope={reportScope}
        setReportScope={setReportScope}
        loadingLines={loadingLines}
        selectedLine={selectedLine}
        onOpenLinesDropdown={() => setIsLineDropdownOpen(true)}
        reportCategory={reportCategory}
        setReportCategory={setReportCategory}
        reportMessage={reportMessage}
        setReportMessage={setReportMessage}
        onSendReport={handleEnviarReporte}
        isLineDropdownOpen={isLineDropdownOpen}
        onCloseLinesDropdown={() => setIsLineDropdownOpen(false)}
        dbLines={dbLines}
        onSelectLine={(linea) => { setSelectedLine(linea); setIsLineDropdownOpen(false); }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#090d16' },
  scrollContent: { paddingHorizontal: 16, paddingBottom: 30, paddingTop: 14 }
});