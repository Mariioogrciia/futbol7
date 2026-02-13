
import os
from flask import Flask, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
from models import db, AdminUser
import jwt
from datetime import datetime, timedelta  # Cambia date por datetime
from flask import request

load_dotenv()

def create_app():
    app = Flask(__name__)
    CORS(app)

    db_url = os.getenv('DATABASE_URL', 'sqlite:///futbol7.db')
    if not db_url.startswith('sqlite'):
        db_url = db_url.replace('postgres://', 'postgresql://')

    app.config['SQLALCHEMY_DATABASE_URI'] = db_url
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

    db.init_app(app)

    with app.app_context():
        db.create_all()
        # Crear usuario admin por defecto si no existe
        if not db.session.query(AdminUser).filter_by(username="admin").first():
            admin = AdminUser(username="admin")
            admin.set_password("admin123")
            db.session.add(admin)
            db.session.commit()

    @app.route('/api/login', methods=['POST'])
    def login_admin():
        data = request.get_json()
        username = data.get('username')
        password = data.get('password')
        user = AdminUser.query.filter_by(username=username).first()
        if not user or not user.check_password(password):
            return jsonify({'message': 'Credenciales incorrectas'}), 401
        token = jwt.encode({
            'user_id': user.id,
            'exp': datetime.utcnow() + timedelta(days=1)  # PyJWT lo convierte automáticamente a timestamp
        }, os.getenv('SECRET_KEY', 'devsecret'), algorithm="HS256")
        return jsonify({'token': token})

    return app

app = create_app()
if __name__ == '__main__':
    app.run(debug=True, port=5000)
