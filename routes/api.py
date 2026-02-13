
from flask import Blueprint, jsonify, request
from models import db, Jugador, Equipo, Partido, Gol, AdminUser
from datetime import date, timedelta
import jwt
import os
from functools import wraps


api_bp = Blueprint('api', __name__)

# Utilidad para proteger rutas con JWT
def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        if 'Authorization' in request.headers:
            token = request.headers['Authorization'].split(" ")[-1]
        if not token:
            return jsonify({'message': 'Token requerido'}), 401
        try:
            data = jwt.decode(token, os.getenv('SECRET_KEY', 'devsecret'), algorithms=["HS256"])
            current_user = AdminUser.query.filter_by(id=data['user_id']).first()
        except Exception as e:
            return jsonify({'message': 'Token inválido', 'error': str(e)}), 401
        return f(current_user, *args, **kwargs)
    return decorated

# Endpoint de login admin
@api_bp.route('/login', methods=['POST'])
def login_admin():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    user = AdminUser.query.filter_by(username=username).first()
    if not user or not user.check_password(password):
        return jsonify({'message': 'Credenciales incorrectas'}), 401
    token = jwt.encode({
        'user_id': user.id,
        'exp': (date.today() + timedelta(days=1)).strftime('%s')
    }, os.getenv('SECRET_KEY', 'devsecret'), algorithm="HS256")
    return jsonify({'token': token})


# 1. Jugadores (GET)
@api_bp.route('/jugadores', methods=['GET'])
def get_jugadores():
    jugadores = Jugador.query.all()
    return jsonify([{
        'id': j.id,
        'nombre_completo': f"{j.nombre} {j.apellido1}",
        'numero': j.numero,
        'posicion': j.posicion,
        'equipo': j.equipo.nombre if j.equipo else None
    } for j in jugadores])


# 2. Partidos (GET)
@api_bp.route('/partidos', methods=['GET'])
def get_partidos():
    partidos = Partido.query.order_by(Partido.fecha.desc()).all()
    return jsonify([{
        'id': p.id,
        'fecha': p.fecha.isoformat(),
        'rival': p.rival,
        'resultado': p.resultado,
        'goles_detalle': [{
            'jugador': f"{g.jugador.nombre} {g.jugador.apellido1}",
            'tipo': g.tipo
        } for g in p.goles]
    } for p in partidos])


# 3. Goleadores TOP (GET)
@api_bp.route('/goleadores', methods=['GET'])
def get_goleadores():
    goleadores = db.session.query(
        Jugador, db.func.count(Gol.id).label('total_goles')
    ).outerjoin(Gol).group_by(Jugador.id).order_by('total_goles DESC').limit(5).all()
    return jsonify([{
        'jugador': f"{j[0].nombre} {j[0].apellido1}",
        'goles': j[1],
        'equipo': j[0].equipo.nombre if j[0].equipo else None
    } for j in goleadores])



# 4. Equipos (GET)
@api_bp.route('/equipos', methods=['GET'])
def get_equipos():
    equipos = Equipo.query.all()
    return jsonify([{
        'id': e.id,
        'nombre': e.nombre,
        'jugadores_count': len(e.jugadores)
    } for e in equipos])


# 5. Actualizar resultado y goleadores (solo admin)
@api_bp.route('/partido/<int:partido_id>/update', methods=['POST'])
@token_required
def update_partido(current_user, partido_id):
    data = request.get_json()
    partido = Partido.query.get_or_404(partido_id)
    # Actualizar resultado
    partido.goles_nuestro = data.get('goles_nuestro', partido.goles_nuestro)
    partido.goles_rival = data.get('goles_rival', partido.goles_rival)
    # Actualizar goleadores (opcional)
    goleadores = data.get('goleadores')
    if goleadores is not None:
        # Borrar goles previos
        for g in partido.goles:
            db.session.delete(g)
        for gol in goleadores:
            jugador = Jugador.query.get(gol['jugador_id'])
            if jugador:
                nuevo_gol = Gol(jugador=jugador, partido=partido, tipo=gol.get('tipo', 'Pie'))
                db.session.add(nuevo_gol)
    db.session.commit()
    return jsonify({'message': 'Partido actualizado'})


# 5. Crear Partido + Goles (POST)
@api_bp.route('/partidos', methods=['POST'])
def crear_partido():
    data = request.json
    p = Partido(
        fecha=date.fromisoformat(data['fecha']),
        rival=data['rival'],
        goles_nuestro=data['goles_nuestro'],
        goles_rival=data['goles_rival']
    )
    db.session.add(p)
    db.session.flush()  # ID auto

    # Añade goles
    for gol_data in data.get('goles', []):
        g = Gol(
            jugador_id=gol_data['jugador_id'],
            partido_id=p.id,
            tipo=gol_data.get('tipo', 'Pie')
        )
        db.session.add(g)

    db.session.commit()
    return jsonify({'id': p.id, 'resultado': p.resultado})


# 6. Stats Equipo (GET)
@api_bp.route('/equipo/<int:equipo_id>/stats')
def stats_equipo(equipo_id):
    total_partidos = db.session.query(Partido).join(Equipo).filter(Equipo.id == equipo_id).count()
    total_goles = db.session.query(db.func.sum(Partido.goles_nuestro)).filter(
        Partido.equipo_id == equipo_id).scalar() or 0
    return jsonify({'partidos': total_partidos, 'goles': total_goles})


# 7. Jugador específico (GET)
@api_bp.route('/jugador/<int:id>')
def get_jugador(id):
    j = Jugador.query.get_or_404(id)
    return jsonify({
        'nombre': f"{j.nombre} {j.apellido1}",
        'numero': j.numero,
        'equipo': j.equipo.nombre if j.equipo else None,
        'goles': len(j.goles)
    })
