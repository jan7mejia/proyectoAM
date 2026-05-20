from flask import Flask, request, jsonify
import mysql.connector
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

db_config = {
    'user': 'root',
    'password': '123jan',  # Déjalo vacío o pon la clave de tu XAMPP/WampServer
    'host': '127.0.0.1',
    'database': 'transporte_cercado_final'
}

def get_db_connection():
    return mysql.connector.connect(**db_config)

# ======================================
# ENDPOINT DE INICIO DE SESIÓN
# ======================================
@app.route('/api/login', methods=['POST'])
def login():
    data = request.json or {}
    login_input = str(data.get('loginInput', '')).strip()
    password = str(data.get('password', '')).strip()

    if not login_input or not password:
        return jsonify({'success': False, 'error': 'Por favor, llena todos los campos'}), 400

    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        
        query = """
            SELECT u.id_usuario, u.nombre, u.apellido, u.correo, u.ci, u.saldo, r.nombre_rol 
            FROM usuarios u
            JOIN roles r ON u.id_rol = r.id_rol
            WHERE (u.correo = %s OR u.ci = %s) AND u.password = %s AND u.estado = 'activo'
        """
        cursor.execute(query, (login_input, login_input, password))
        user = cursor.fetchone()
        
        cursor.close()
        conn.close()

        if user:
            return jsonify({
                'success': True,
                'message': f"Bienvenido {user['nombre']}",
                'user': {
                    'id': user['id_usuario'],
                    'nombre': f"{user['nombre']} {user['apellido']}",
                    'rol': user['nombre_rol'],
                    'saldo': float(user['saldo']),
                    'correo': user['correo']
                }
            }), 200
        else:
            return jsonify({'success': False, 'error': 'Credenciales incorrectas o usuario inactivo'}), 401

    except mysql.connector.Error as err:
        return jsonify({'success': False, 'error': f"Error de BD: {str(err)}"}), 500

# ======================================
# ENDPOINT DE REGISTRO SEPARADO (SOLUCIÓN AL ERROR 500)
# ======================================
@app.route('/api/register', methods=['POST'])
def register():
    data = request.json or {}
    
    nombre = str(data.get('nombre', '')).strip()
    apellido = str(data.get('apellido', '')).strip()
    ci = str(data.get('ci', '')).strip()
    correo = str(data.get('correo', '')).strip().lower()
    telefono = str(data.get('telefono', '')).strip()
    password = str(data.get('password', '')).strip()
    rol_elegido = str(data.get('rol', '')).strip()
    categoria_elegida = data.get('categoria', '')

    if not nombre or not apellido or not ci or not correo or not password or not rol_elegido:
        return jsonify({'success': False, 'error': 'Faltan campos obligatorios en el formulario'}), 400

    valor_telefono = telefono if telefono != '' else None

    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # PASO A: SI ES PASAJERO, INSERTAMOS CON SU CATEGORÍA CORRESPONDIENTE
        if rol_elegido == 'pasajero':
            mapping_cat = {
                'estudiante': 1,
                'universitario': 2,
                'adulto': 3,
                'adulto_mayor': 4
            }
            id_categoria = mapping_cat.get(categoria_elegida, 3) # Adulto por defecto si no manda
            
            query = """
                INSERT INTO usuarios (nombre, apellido, ci, correo, telefono, password, id_rol, id_categoria, saldo, estado)
                VALUES (%s, %s, %s, %s, %s, %s, 1, %s, 0.00, 'activo')
            """
            valores = (nombre, apellido, ci, correo, valor_telefono, password, id_categoria)
        
        # PASO B: SI ES CHOFER, OMITIMOS LA COLUMNA CATEGORÍA PARA EVITAR CONFLICTOS DE TIPOS (ENTRA COMO NULL POR DEFECTO)
        else:
            query = """
                INSERT INTO usuarios (nombre, apellido, ci, correo, telefono, password, id_rol, id_categoria, saldo, estado)
                VALUES (%s, %s, %s, %s, %s, %s, 2, NULL, 0.00, 'activo')
            """
            valores = (nombre, apellido, ci, correo, valor_telefono, password)

        cursor.execute(query, valores)
        conn.commit()
        
        cursor.close()
        conn.close()
        
        return jsonify({'success': True, 'message': '¡Usuario creado exitosamente!'}), 201

    except mysql.connector.Error as err:
        print(f"Error detallado en consola MySQL: {err}")
        if err.errno == 1062:
            return jsonify({'success': False, 'error': 'El Carnet de Identidad (C.I.) o Correo ya existen en el sistema.'}), 400
        return jsonify({'success': False, 'error': f"Error interno del Servidor MySQL: {err.msg}"}), 500
    except Exception as e:
        print(f"Error general de Python: {e}")
        return jsonify({'success': False, 'error': 'Error interno en la ejecución del script Python.'}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)