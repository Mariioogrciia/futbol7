import os
from flask import Flask, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
from models import db, Jugador, Equipo, Partido, Gol
from routes.api import api_bp
from datetime import date

load_dotenv()


def create_app():
    app = Flask(__name__)
    CORS(app)

    # DB: local SQLite O Railway PostgreSQL
    db_url = os.getenv('DATABASE_URL', 'sqlite:///futbol7.db')
    if not db_url.startswith('sqlite'):
        db_url = db_url.replace('postgres://', 'postgresql://')

    app.config['SQLALCHEMY_DATABASE_URI'] = db_url
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

    # Inicializa DB + blueprints
    db.init_app(app)
    app.register_blueprint(api_bp, url_prefix='/api')

    # Crear tablas + datos test (SIN before_first_request)
    with app.app_context():
        db.create_all()
        if not db.session.query(Equipo).first():
            e = Equipo(nombre="Tu Equipo 7")
            db.session.add(e)
            j1 = Jugador(nombre="Juan", apellido1="Pérez", numero=10, equipo=e, posicion="DC")
            j2 = Jugador(nombre="Pedro", apellido1="García", numero=7, equipo=e, posicion="DFC")
            db.session.add_all([j1, j2])
            db.session.commit()

    @app.route('/')
    def home():
        return jsonify({
            "mensaje": "Fútbol 7 API",
            "endpoints": [
                "/api/jugadores", "/api/partidos", "/api/goleadores",
                "/api/equipos", "/api/equipo/1/stats"
            ]
        })



    return app

app = create_app()
if __name__ == '__main__':
    app.run(debug=True, port=5000)
