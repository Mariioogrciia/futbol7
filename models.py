from flask_sqlalchemy import SQLAlchemy
db = SQLAlchemy()

class Jugador(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(30), nullable=False)
    apellido1 = db.Column(db.String(50), nullable=False)
    fecha_nacimiento = db.Column(db.Date)
    numero = db.Column(db.Integer, unique=True, nullable=False)
    posicion = db.Column(db.String(20))
    telefono = db.Column(db.String(20))
    equipo_id = db.Column(db.Integer, db.ForeignKey('equipo.id'))
    equipo = db.relationship('Equipo', back_populates='jugadores')
    goles = db.relationship('Gol', back_populates='jugador')


class Equipo(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(50), nullable=False)
    temporada = db.Column(db.String(10), default="2025/26")
    jugadores = db.relationship('Jugador', back_populates='equipo')


class Partido(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    fecha = db.Column(db.Date, nullable=False)
    hora = db.Column(db.String(5))
    rival = db.Column(db.String(50), nullable=False)
    goles_nuestro = db.Column(db.Integer, default=0)
    goles_rival = db.Column(db.Integer, default=0)

    @property
    def resultado(self):
        return f"{self.goles_nuestro}-{self.goles_rival}"

    estadio = db.Column(db.String(100))
    goles = db.relationship('Gol', back_populates='partido')  # Solo TU goles


class Gol(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    jugador_id = db.Column(db.Integer, db.ForeignKey('jugador.id'), nullable=False)
    partido_id = db.Column(db.Integer, db.ForeignKey('partido.id'), nullable=False)
    tipo = db.Column(db.String(20), default="Pie")  # "Pie", "Cabeza", "Penalti"
    jugador = db.relationship('Jugador', back_populates='goles')
    partido = db.relationship('Partido', back_populates='goles')
