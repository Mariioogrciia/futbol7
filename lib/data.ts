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
  { id: 3, name: "Carlos Barragán", position: "Defensa", number: 7, description: "Velocidad y anticipacion en cada jugada (para coger el cigarro).", avatar: "/images/Barragan.jpeg" },
  { id: 4, name: "Guillermo García", position: "Defensa", number: 69, description: "Motor del equipo, vision de juego excepcional (menos para correr hacia atrás).", avatar: "/images/Guille.jpeg" },
  { id: 5, name: "David García", position: "Defensa", number: 8, description: "Control del ritmo (bajo) y ruptura (de tobillos).", avatar: "/images/David.jpeg" },
  { id: 6, name: "Miguel Sicilia", position: "Defensa", number: 47, description: "Creatividad y tecnica al servicio del equipo (no la pasa).", avatar: "/images/sicilia.jpeg" },
  { id: 7, name: "Adrián Moreno", position: "Defensa", number: 22, description: "Lateral sólido, siempre en el lugar justo (para no marcar).", avatar: "/images/Moreno.jpeg" },
  { id: 8, name: "Hugo Hernández", position: "Medio", number: 10, description: "Velocidad electrica (para chuparla) y el capitán (vive en un edit).", avatar: "/images/Hugo.jpeg" },
  { id: 9, name: "Marcos Rivera", position: "Medio", number: 11, description: "Jueo de pies a la orden del día (solo viene con la novia).", avatar: "/images/Markitos.jpeg" },
  { id: 10, name: "Alberto Suárez", position: "Medio", number: 26, description: "Ni se quien es (no ha venido).", avatar: "/images/suarez.jpg" },
  { id: 11, name: "David Sastre", position: "Delantero", number: 88, description: "Ejemplo a bajos rasos de fernando llorente (está cansado antes de entrar).", avatar: "/images/Sastre.jpeg" },
  { id: 12, name: "Rodrigo Casado", position: "Delantero", number: 33, description: "El presionador del equipo (no da pie con bola).", avatar: "/images/Roch.jpeg" },
];

export const staff: StaffMember[] = [
  { id: 1, name: "Mario García", role: "Mister", description: "Ha jugado 2 partidos (tiene la rodilla de plastilina), en teoria mister.", avatar: "/images/mister.jpeg" },
  { id: 2, name: "Fernando Gallego", role: "Rellena Botellas", description: "El alma del equipo desde la banda. Sin el no hay hidratacion.", avatar: "/images/Fer.jpeg" },
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

// Liga 5a Division - Grupo Mixto (Temporada anterior)
export const leagueMatches: Match[] = [
  { id: 101, jornada: 1, rival: "El Conclave", date: "20 Sep 2025", time: "17:45", location: "Campo Futbol 7 - A - Est. Atmo. - C. Teleg.", isHome: true, result: "derrota", goalsFor: 2, goalsAgainst: 4, status: "Jugado" },
  { id: 102, jornada: 2, rival: "Inter Ofi FC", date: "27 Sep 2025", time: "15:45", location: "Futbol 7 D Casa Grande", isHome: false, result: "derrota", goalsFor: 2, goalsAgainst: 5, status: "Jugado" },
  { id: 103, jornada: 3, rival: "Los Molomazo", date: "4 Oct 2025", time: "15:45", location: "Futbol 7 D Casa Grande", isHome: true, result: "victoria", goalsFor: 5, goalsAgainst: 2, status: "Jugado" },
  { id: 104, jornada: 4, rival: "La Corrala FC", date: "11 Oct 2025", time: "20:45", location: "Futbol 7 C Casa Grande", isHome: false, result: "derrota", goalsFor: 0, goalsAgainst: 5, status: "Jugado" },
  { id: 105, jornada: 5, rival: "Cabras Maltesas", date: "18 Oct 2025", time: "18:15", location: "Futbol 7 D Casa Grande", isHome: true, result: "derrota", goalsFor: 1, goalsAgainst: 5, status: "Jugado" },
  { id: 106, jornada: 6, rival: "Fary CF", date: "25 Oct 2025", time: "17:00", location: "Futbol 7 D Casa Grande", isHome: false, result: "empate", goalsFor: 2, goalsAgainst: 2, status: "Jugado" },
  { id: 107, jornada: 7, rival: "Cachorritas FC", date: "8 Nov 2025", time: "17:00", location: "Futbol 7 D Casa Grande", isHome: true, result: "derrota", goalsFor: 4, goalsAgainst: 6, status: "Jugado" },
  { id: 108, jornada: 8, rival: "Esmeralda", date: "15 Nov 2025", time: "20:45", location: "Futbol 7 C Casa Grande", isHome: false, result: "victoria", goalsFor: 5, goalsAgainst: 4, status: "Jugado" },
  { id: 109, jornada: 9, rival: "AD Isineta", date: "22 Nov 2025", time: "20:45", location: "Futbol 7 D Casa Grande", isHome: true, result: "victoria", goalsFor: 7, goalsAgainst: 2, status: "Jugado" },
  { id: 110, jornada: 10, rival: "Galletasaray", date: "29 Nov 2025", time: "16:30", location: "Futbol 7 C El Vivero", isHome: false, result: "derrota", goalsFor: 3, goalsAgainst: 4, status: "Jugado" },
  { id: 111, jornada: 11, rival: "Casa 441", date: "13 Dic 2025", time: "19:30", location: "Futbol 7 D Casa Grande", isHome: true, result: "derrota", goalsFor: 4, goalsAgainst: 5, status: "Jugado" },
  { id: 112, jornada: 12, rival: "Kuda FC", date: "20 Dic 2025", time: "17:45", location: "Futbol 7 C El Vivero", isHome: false, result: "victoria", goalsFor: 4, goalsAgainst: 0, status: "Jugado" },
  { id: 113, jornada: 13, rival: "Descanso", date: "10 Ene 2026", time: "-", location: "-", isHome: true, status: "Jugado" },
  { id: 114, jornada: 14, rival: "DKT", date: "17 Ene 2026", time: "19:30", location: "Futbol 7 D Casa Grande", isHome: true, result: "empate", goalsFor: 3, goalsAgainst: 3, status: "Jugado" },
  { id: 115, jornada: 15, rival: "Betsiktas FC", date: "24 Ene 2026", time: "20:45", location: "Futbol 7 D Casa Grande", isHome: false, result: "derrota", goalsFor: 2, goalsAgainst: 5, status: "Jugado" },
];

// Clasificacion Liga 5a Division - Grupo Mixto
export interface StandingEntry {
  pos: number;
  team: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  gf: number;
  gc: number;
  ps: number;
  points: number;
  sanction?: string;
}

export const standings: StandingEntry[] = [
  { pos: 1, team: "Cachorritas FC", played: 13, won: 11, drawn: 2, lost: 0, gf: 72, gc: 33, ps: 0, points: 35 },
  { pos: 2, team: "La Corrala FC", played: 13, won: 10, drawn: 3, lost: 0, gf: 49, gc: 24, ps: 0, points: 33 },
  { pos: 3, team: "Cabras Maltesas", played: 13, won: 8, drawn: 3, lost: 2, gf: 51, gc: 25, ps: 0, points: 27 },
  { pos: 4, team: "Fary CF", played: 13, won: 8, drawn: 1, lost: 4, gf: 52, gc: 40, ps: 0, points: 25 },
  { pos: 5, team: "Galletasaray", played: 13, won: 6, drawn: 2, lost: 5, gf: 34, gc: 43, ps: 0, points: 20 },
  { pos: 6, team: "Betsiktas FC", played: 13, won: 6, drawn: 2, lost: 5, gf: 44, gc: 39, ps: 0, points: 20 },
  { pos: 7, team: "El Conclave", played: 13, won: 6, drawn: 2, lost: 5, gf: 50, gc: 49, ps: 0, points: 20 },
  { pos: 8, team: "Los Molomazo", played: 13, won: 7, drawn: 3, lost: 3, gf: 59, gc: 44, ps: -8, points: 16, sanction: "Partido(s): 101874" },
  { pos: 9, team: "Impersed Cubiertas FC", played: 13, won: 4, drawn: 2, lost: 7, gf: 42, gc: 46, ps: 0, points: 14 },
  { pos: 10, team: "Esmeralda", played: 13, won: 4, drawn: 2, lost: 7, gf: 41, gc: 50, ps: 0, points: 14 },
  { pos: 11, team: "Kuda FC", played: 13, won: 3, drawn: 0, lost: 10, gf: 20, gc: 38, ps: 0, points: 9 },
  { pos: 12, team: "Casa 441", played: 13, won: 2, drawn: 3, lost: 8, gf: 36, gc: 56, ps: -1, points: 8, sanction: "Partido(s): 101912" },
  { pos: 13, team: "DKT", played: 13, won: 1, drawn: 3, lost: 9, gf: 30, gc: 49, ps: 0, points: 6 },
  { pos: 14, team: "AD Isineta", played: 13, won: 1, drawn: 0, lost: 12, gf: 30, gc: 74, ps: -3, points: 0, sanction: "Partido(s): 101872" },
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
