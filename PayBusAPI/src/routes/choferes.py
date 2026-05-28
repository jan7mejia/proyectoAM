from flask import Blueprint, jsonify, request
import mysql.connector
from src.database import get_db_connection
from datetime import datetime

choferes_bp = Blueprint('choferes', __name__)

# ======================================
# ENDPOINT: FLUJO DE COBROS Y RECAUDACIÓN EN TIEMPO REAL
# ======================================
@choferes_bp.route('/api/chofer/monitoreo/<int:id_chofer>', methods=['GET'])
def monitoreo_chofer(id_chofer):
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        
        # 1. Obtener los datos de la asignación activa del chofer (Línea e Interno/Vehículo)
        query_asig = """
            SELECT a.id_linea, a.id_vehiculo, l.nombre_linea, v.placa 
            FROM asignaciones a
            JOIN lineas l ON a.id_linea = l.id_linea
            JOIN vehiculos v ON a.id_vehiculo = v.id_vehiculo
            WHERE a.id_chofer = %s AND a.estado = 'activo'
            LIMIT 1
        """
        cursor.execute(query_asig, (id_chofer,))
        asignacion = cursor.fetchone()
        
        # Si no tiene asignación activa, mandamos valores por defecto para no romper el front
        nombre_linea = asignacion['nombre_linea'] if asignacion else "Línea No Asignada"
        placa_vehiculo = asignacion['placa'] if asignacion else "S/N"
        
        # 2. Calcular la recaudación total del chofer el día de hoy
        query_ingresos = """
            SELECT IFNULL(SUM(monto), 0.00) as total 
            FROM pagos 
            WHERE id_chofer = %s AND DATE(fecha_pago) = CURRENT_DATE()
        """
        cursor.execute(query_ingresos, (id_chofer,))
        total_hoy = float(cursor.fetchone()['total'])
        
        # 3. Obtener el flujo completo de pasajeros entrantes ordenados por fecha
        query_pagos = """
            SELECT 
                p.id_pago as id,
                CONCAT(u.nombre, ' ', IFNULL(u.apellido, '')) as pasajero,
                u.ci,
                IFNULL(c.nombre_categoria, 'adulto') as tipo_pasajero,
                p.monto,
                p.metodo_pago as metodo,
                DATE_FORMAT(p.fecha_pago, '%H:%i:%s') as hora,
                p.fecha_pago
            FROM pagos p
            JOIN usuarios u ON p.id_usuario = u.id_usuario
            LEFT JOIN categorias_pasajero c ON u.id_categoria = c.id_categoria
            WHERE p.id_chofer = %s AND DATE(p.fecha_pago) = CURRENT_DATE()
            ORDER BY p.fecha_pago DESC
        """
        cursor.execute(query_pagos, (id_chofer,))
        alertas_pagos = cursor.fetchall()
        
        # Formatear montos a float serializable
        for pago in alertas_pagos:
            pago['monto'] = float(pago['monto'])
            # Eliminamos objeto datetime antes de mandar el JSON
            if 'fecha_pago' in pago: del pago['fecha_pago']

        cursor.close()
        conn.close()
        
        return jsonify({
            "success": True,
            "unidad": f"{nombre_linea} (Placa: {placa_vehiculo})",
            "ingresosHoy": total_hoy,
            "alertasPagos": alertas_pagos
        }), 200
        
    except mysql.connector.Error as err:
        return jsonify({'success': False, 'error': str(err)}), 500