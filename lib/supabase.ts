import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Cliente para el cliente (navegador) - usa clave anónima
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Tipos para TypeScript
export interface Usuario {
  id: string
  email: string
  nombre: string
  rol: 'admin' | 'equipo' | 'espectador'
  equipo_id?: string
  created_at: string
}

export interface Equipo {
  id: string
  nombre: string
  user_id: string
  temporada: number
  descripcion?: string
  ciudad?: string
  created_at: string
}

export interface Jugador {
  id: string
  equipo_id: string
  nombre: string
  posicion: string
  dorsal?: number
  goles: number
  created_at: string
}

export interface Partido {
  id: string
  equipo_id: string
  rival: string
  fecha: string
  estado: 'programado' | 'en_vivo' | 'finalizado'
  goles_equipo: number
  goles_rival: number
  goleadores: { jugador: string; goles: number }[]
  resultado?: string
  notas?: string
  created_at: string
}
