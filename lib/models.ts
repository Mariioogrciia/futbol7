import { hash, compare } from 'bcryptjs';
import { ObjectId } from 'mongodb';

export interface User {
  _id?: ObjectId;
  email: string;
  password: string;
  nombre: string;
  rol: 'admin' | 'equipo' | 'externo';
  equipo_id?: string;
  fechaCreacion: Date;
  activo: boolean;
}

export interface Equipo {
  _id?: ObjectId;
  nombre: string;
  user_id: string; // Usuario tipo 'equipo' propietario
  temporada: number;
  descripcion?: string;
  ciudad?: string;
  fechaCreacion: Date;
}

export interface Jugador {
  _id?: ObjectId;
  equipo_id: string;
  nombre: string;
  posicion: string;
  dorsal?: number;
  goles: number;
  fechaCreacion: Date;
}

export interface Partido {
  _id?: ObjectId;
  equipo_id: string;
  rival: string;
  fecha: Date;
  estado: 'programado' | 'en_vivo' | 'finalizado';
  goles_equipo: number;
  goles_rival: number;
  goleadores: { jugador: string; goles: number }[];
  resultado?: string;
  notas?: string;
}

// Funciones de hash
export async function hashPassword(password: string) {
  return hash(password, 10);
}

export async function comparePassword(password: string, hashedPassword: string) {
  return compare(password, hashedPassword);
}
