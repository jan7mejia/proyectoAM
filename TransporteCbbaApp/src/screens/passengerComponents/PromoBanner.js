import React, { useState, useCallback } from 'react';
import { StyleSheet, View, Text, ActivityIndicator } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native'; // Asegura la actualización al enfocar la pantalla
import { BASE_URL } from '../../../config';

export default function PromoBanner({ theme, user, idLineaAsignada = 1 }) {
  const [tarifaReal, setTarifaReal] = useState(null);
  const [nombreCategoria, setNombreCategoria] = useState("Cargando perfil...");
  const [descripcionBanner, setDescripcionBanner] = useState("");
  const [loading, setLoading] = useState(true);

  // Función unificada para consultar los datos del servidor de manera dinámica
  const cargarInformacionPasajero = async (mostrarCargando = false) => {
    try {
      if (mostrarCargando) setLoading(true);
      
      let categoriaID = user?.id_categoria;
      let usuarioID = user?.id_usuario;

      // 1. Sincronización del perfil con el Backend (PayBusAPI)
      if (!categoriaID && usuarioID) {
        const perfilResponse = await fetch(`${BASE_URL}/api/movimientos/${usuarioID}`);
        if (perfilResponse.ok) {
          const perfilData = await perfilResponse.json();
          if (perfilData.success && perfilData.usuario) {
            categoriaID = perfilData.usuario.id_categoria;
          }
        }
      }

      // 2. Mapeo del ENUM y descripción dinámica del banner
      let tipoPasajeroTexto = "Pasajero Regular";
      let descripcionDinamica = "Tu beneficio de tarifa regular digital está validado. El monto se descontará automáticamente al usar el sistema.";
      let esUniversitario = false;

      switch (Number(categoriaID)) {
        case 1:
          tipoPasajeroTexto = "Estudiante (Colegio)";
          descripcionDinamica = "Tu beneficio de tarifa escolar digital está validado. Recuerda portar tu credencial o uniforme si es requerido.";
          break;
        case 2:
          tipoPasajeroTexto = "Estudiante Universitario";
          descripcionDinamica = "Tu beneficio de tarifa universitaria digital está validado. El monto se descontará automáticamente al escanear el QR o pasar tu tarjeta.";
          esUniversitario = true;
          break;
        case 3:
          tipoPasajeroTexto = "Pasajero Adulto";
          descripcionDinamica = "Tu perfil de tarifa adulto general está activo. Realiza tus cobros de manera rápida mediante QR o tu tarjeta RFID vinculada.";
          break;
        case 4:
          tipoPasajeroTexto = "Adulto Mayor (Preferencial)";
          descripcionDinamica = "Tu beneficio de tarifa preferencial para adulto mayor está validado. Disfruta de un descuento regulado automáticamente en tus viajes.";
          break;
        default:
          tipoPasajeroTexto = "Pasajero Regular";
          descripcionDinamica = "Tu perfil de usuario general está activo. Carga saldo digital para agilizar tus viajes en las líneas autorizadas.";
      }
      
      setNombreCategoria(tipoPasajeroTexto);
      setDescripcionBanner(descripcionDinamica);

      // 3. Consulta asíncrona de la tarifa en tiempo real
      if (categoriaID) {
        const urlTarifa = `${BASE_URL}/api/tarifa?id_categoria=${categoriaID}&id_linea=${idLineaAsignada}`;
        const tarifaResponse = await fetch(urlTarifa);
        const tarifaData = await tarifaResponse.json();

        if (tarifaResponse.ok && tarifaData.success) {
          setTarifaReal(parseFloat(tarifaData.monto).toFixed(2));
        } else {
          setTarifaReal(esUniversitario ? "2.50" : "2.00");
        }
      } else {
        setTarifaReal("2.00");
      }

    } catch (error) {
      console.error("Error de actualización en tiempo real en PromoBanner:", error);
      setNombreCategoria("Modo Desconectado");
      setDescripcionBanner("No se pudo sincronizar la información del perfil con el servidor.");
      setTarifaReal("--.--");
    } finally {
      if (mostrarCargando) setLoading(false);
    }
  };

  // useFocusEffect se ejecuta cada vez que el módulo se muestra en pantalla y activa el intervalo en vivo
  useFocusEffect(
    useCallback(() => {
      // Primera carga con spinner visual activo
      cargarInformacionPasajero(true);

      // Configuración de la consulta en segundo plano (cada 10 segundos)
      const intervaloActualizacion = setInterval(() => {
        console.log("PromoBanner: Comprobando actualización de tarifa en la base de datos...");
        cargarInformacionPasajero(false); // Sincroniza en silencio sin molestar al usuario con un spinner
      }, 10000);

      // Limpieza automática del temporizador al salir del módulo
      return () => clearInterval(intervaloActualizacion);
    }, [user, idLineaAsignada])
  );

  const getBannerIcon = () => {
    let categoriaID = user?.id_categoria;
    switch (Number(categoriaID)) {
      case 1: return "face";
      case 2: return "school";
      case 3: return "directions-bus";
      case 4: return "elderly";
      default: return theme.icon || "account-circle";
    }
  };

  return (
    <View style={[styles.promoBanner, { backgroundColor: theme.primaryColor + '15', borderColor: theme.primaryColor + '44' }]}>
      <View style={styles.promoContent}>
        <View style={[styles.promoIconContainer, { backgroundColor: theme.primaryColor }]}>
          <MaterialIcons name={getBannerIcon()} size={22} color="#fff" />
        </View>
        <View style={styles.promoTextContainer}>
          <Text style={[styles.promoTitle, { color: theme.primaryColor }]}>
            Perfil: {nombreCategoria}
          </Text>
          <Text style={styles.promoDescription}>
            {descripcionBanner}
          </Text>
        </View>
      </View>
      
      <View style={styles.promoFooter}>
        <Text style={styles.promoFooterLabel}>Beneficio autorizado en esta línea:</Text>
        {loading ? (
          <ActivityIndicator size="small" color={theme.primaryColor} />
        ) : (
          <Text style={[styles.promoTarifaValue, { color: theme.primaryColor }]}>
            Bs. {tarifaReal}
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  promoBanner: { 
    padding: 16, 
    borderRadius: 20, 
    borderWidth: 1, 
    marginBottom: 16, 
    gap: 12 
  },
  promoContent: { 
    flexDirection: 'row', 
    gap: 12, 
    alignItems: 'center' 
  },
  promoIconContainer: { 
    width: 38, 
    height: 38, 
    borderRadius: 12, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  promoTextContainer: { 
    flex: 1 
  },
  promoTitle: { 
    fontSize: 14, 
    fontWeight: '800', 
    marginBottom: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.3
  },
  promoDescription: { 
    color: '#94a3b8', 
    fontSize: 11, 
    fontWeight: '500', 
    lineHeight: 15 
  },
  promoFooter: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    borderTopWidth: 1, 
    borderStyle: 'dashed', 
    borderColor: '#334155', 
    paddingTop: 10 
  },
  promoFooterLabel: { 
    color: '#64748b', 
    fontSize: 11, 
    fontWeight: '600' 
  },
  promoTarifaValue: { 
    fontSize: 16, 
    fontWeight: '950' 
  },
});