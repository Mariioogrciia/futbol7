export type Position = "Portero" | "Defensa" | "Medio" | "Delantero";

export interface Player {
  id: number;
  name: string;
  position: Position;
  number: number;
  description: string;
  avatar: string;
}

export interface StaffMember {
  id: number;
  name: string;
  role: string;
  description: string;
  avatar: string;
}

export interface Match {
  id: number;
  jornada: number;
  rival: string;
  date: string;
  time: string;
  location: string;
  isHome: boolean;
  result?: "victoria" | "derrota" | "empate";
  goalsFor?: number;
  goalsAgainst?: number;
  status: "Jugado" | "Proximo" | "Pendiente";
}

export interface GalleryImage {
  id: number;
  src: string;
  alt: string;
  overlay: string;
}

export const players: Player[] = [
  { id: 1, name: "Ignacio Soto", position: "Portero", number: 1, description: "Reflejos felinos y gran presencia bajo palos (no sale).", avatar: "/images/Nacho.jpeg" },
  { id: 2, name: "Javier Martín (Coarasa)", position: "Defensa", number: 2, description: "Lider de la zaga, contundente (a favor de los rivales) y con 2 piernas zurdas.", avatar: "/images/Coarasa.jpeg" },
  { id: 3, name: "Carlos Barragán", position: "Defensa", number: 7, description: "Velocidad y anticipacion en cada jugada (para coger el cigarro).", avatar: "/images/Barragan-3.jpg" },
  { id: 4, name: "Guillermo García", position: "Defensa", number: 69, description: "Motor del equipo, vision de juego excepcional (menos para correr hacia atrás).", avatar: "/images/Guille.jpeg" },
  { id: 5, name: "David García", position: "Defensa", number: 8, description: "Control del ritmo (bajo) y ruptura (de tobillos).", avatar: "/images/David.jpeg" },
  { id: 6, name: "Miguel Sicilia", position: "Defensa", number: 47, description: "Creatividad y tecnica al servicio del equipo (no la pasa).", avatar: "/images/sicilia.jpeg" },
  { id: 7, name: "Adrián Moreno", position: "Defensa", number: 22, description: "Lateral sólido, siempre en el lugar justo (para no marcar).", avatar: "/images/Moreno.jpeg" },
  { id: 8, name: "Hugo Hernández", position: "Medio", number: 10, description: "Velocidad electrica (para chuparla) y el capitán (vive en un edit).", avatar: "/images/Hugo.jpeg" },
  { id: 9, name: "Marcos Rivera", position: "Medio", number: 11, description: "Jueo de pies a la orden del día (solo viene con la novia).", avatar: "/images/Markitos.jpeg" },
  { id: 10, name: "Alberto Suárez", position: "Medio", number: 26, description: "Ni se quien es (no ha venido).", avatar: "/images/player-8.jpg" },
  { id: 11, name: "David Sastre", position: "Delantero", number: 88, description: "Ejemplo a bajos rasos de fernando llorente (está cansado antes de entrar).", avatar: "/images/Sastre.jpeg" },

  { id: 13, name: "Rodrigo Casado", position: "Delantero", number: 33, description: "El presionador del equipo (no da pie con bola).", avatar: "/images/Roch.jpeg" },
];

export const staff: StaffMember[] = [
  { id: 1, name: "Mario García", role: "Mister", description: "Ha jugado 2 partidos (tiene la rodilla de plastilina), en teoria mister.", avatar: "/images/player-8.jpg" },
  { id: 2, name: "Fernando Gallego", role: "Rellena Botellas", description: "El alma del equipo desde la banda. Sin el no hay hidratacion.", avatar: "/images/player-8.jpg" },
];

export const matches: Match[] = [
  // Jornada 1 - 31/01/2026 - LOCAL - GANADO 4-1
  { id: 1, jornada: 1, rival: "AD Isineta", date: "31 Ene 2026", time: "15:45", location: "Futbol 7 B Casa Grande", isHome: true, result: "victoria", goalsFor: 4, goalsAgainst: 1, status: "Jugado" },
  // Jornada 2 - 07/02/2026 - VISITANTE - PERDIDO 2-11
  { id: 2, jornada: 2, rival: "La Corrala FC", date: "7 Feb 2026", time: "20:45", location: "Futbol 7 C Santa Ana", isHome: false, result: "derrota", goalsFor: 2, goalsAgainst: 11, status: "Jugado" },
  // Jornada 3 - 14/02/2026 - LOCAL
  { id: 3, jornada: 3, rival: "Mercenarios", date: "14 Feb 2026", time: "20:45", location: "Futbol 7 C Santa Ana", isHome: true, status: "Proximo" },
  // Jornada 4 - 21/02/2026 - VISITANTE
  { id: 4, jornada: 4, rival: "El Conclave", date: "21 Feb 2026", time: "19:30", location: "Campo de Futbol 7 - D - Sur C.Teleg.", isHome: false, status: "Pendiente" },
  // Jornada 5 - 28/02/2026 - LOCAL
  { id: 5, jornada: 5, rival: "Bayern Rivas FC", date: "28 Feb 2026", time: "15:45", location: "Futbol 7 C Casa Grande", isHome: true, status: "Pendiente" },
  // Jornada 6 - 07/03/2026 - LOCAL
  { id: 6, jornada: 6, rival: "Los Cha", date: "7 Mar 2026", time: "15:45", location: "Futbol 7 B Casa Grande", isHome: true, status: "Pendiente" },
  // Jornada 7 - 14/03/2026 - VISITANTE
  { id: 7, jornada: 7, rival: "Moniacos FC", date: "14 Mar 2026", time: "17:00", location: "Futbol 7 C Santa Ana", isHome: false, status: "Pendiente" },
  // Jornada 8 - 21/03/2026 - LOCAL
  { id: 8, jornada: 8, rival: "Blue Ladies", date: "21 Mar 2026", time: "17:00", location: "Futbol 7 C Santa Ana", isHome: true, status: "Pendiente" },
  // Jornada 9 - 11/04/2026 - VISITANTE
  { id: 9, jornada: 9, rival: "Cipreces FC", date: "11 Abr 2026", time: "17:00", location: "Futbol 7 C Santa Ana", isHome: false, status: "Pendiente" },
];

export const stats = {
  played: 2,
  won: 1,
  drawn: 0,
  lost: 1,
  goalsFor: 6,
  goalsAgainst: 12,
  topScorer: "Por determinar",
  topScorerGoals: 0,
};

export const galleryImages: GalleryImage[] = [
  { id: 1, src: "/images/gallery-1.jpg", alt: "Celebracion del equipo", overlay: "Victoria 3-1" },
  { id: 2, src: "/images/gallery-2.jpg", alt: "Gol decisivo", overlay: "Gol decisivo" },
  { id: 3, src: "/images/gallery-3.jpg", alt: "Entrenamiento", overlay: "Entrenamiento" },
  { id: 4, src: "/images/gallery-4.jpg", alt: "Foto de equipo", overlay: "Foto oficial" },
  { id: 5, src: "/images/gallery-5.jpg", alt: "Partido nocturno", overlay: "Partido nocturno" },
  { id: 6, src: "/images/gallery-6.jpg", alt: "Trofeo de liga", overlay: "Campeones" },
];
