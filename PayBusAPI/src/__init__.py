from flask import Flask
from flask_cors import CORS

def create_app():
    app = Flask(__name__)
    CORS(app)

    # Importar Blueprints
    from src.routes.auth import auth_bp
    from src.routes.pasajeros import pasajeros_bp
    from src.routes.tarjetas import tarjetas_bp          # <--- NUEVO
    from src.routes.cobros import cobros_bp              # <--- NUEVO
    from src.routes.soporte import soporte_bp
    from src.routes.notificaciones import notificaciones_bp
    from src.routes.choferes import choferes_bp          # <--- MONITOREO CHOFER (NUEVO)

    # Registrar Blueprints
    app.register_blueprint(auth_bp)
    app.register_blueprint(pasajeros_bp)
    app.register_blueprint(tarjetas_bp)                  # <--- NUEVO
    app.register_blueprint(cobros_bp)                    # <--- NUEVO
    app.register_blueprint(soporte_bp)
    app.register_blueprint(notificaciones_bp)
    app.register_blueprint(choferes_bp)                  # <--- MONITOREO CHOFER (NUEVO)

    return app