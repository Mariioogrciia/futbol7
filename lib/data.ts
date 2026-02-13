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
  { id: 10, name: "Alberto Suárez", position: "Medio", number: 26, description: "Ni se quien es (no ha venido).", avatar: "/images/suarez.jpeg" },
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

// Gallery images are dynamically loaded from public/gallery folder
export const galleryImages: GalleryImage[] = [
  { id: 1, src: "/gallery/WhatsApp Image 2026-02-12 at 23.02.22.jpeg", alt: "Foto galería 1", overlay: "Victoria Molomazo 1" },
  { id: 2, src: "/gallery/WhatsApp Image 2026-02-12 at 23.02.23 (1).jpeg", alt: "Foto galería 2", overlay: "Victoria Molomazo 2" },
  { id: 3, src: "/gallery/WhatsApp Image 2026-02-12 at 23.02.23 (2).jpeg", alt: "Foto galería 3", overlay: "Nacho sacando balón" },
  { id: 4, src: "/gallery/WhatsApp Image 2026-02-12 at 23.02.23 (3).jpeg", alt: "Foto galería 4", overlay: "Descanso" },
  { id: 5, src: "/gallery/WhatsApp Image 2026-02-12 at 23.02.23.jpeg", alt: "Foto galería 5", overlay: "Los que menos hacen" },
  { id: 6, src: "/gallery/WhatsApp Image 2026-02-12 at 23.02.24 (1).jpeg", alt: "Foto galería 6", overlay: "Descanso x2" },
  { id: 7, src: "/gallery/WhatsApp Image 2026-02-12 at 23.02.24 (2).jpeg", alt: "Foto galería 7", overlay: "Aprendiendo a tirar" },
  { id: 8, src: "/gallery/WhatsApp Image 2026-02-12 at 23.02.24 (3).jpeg", alt: "Foto galería 8", overlay: "No sabe tirar" },
  { id: 9, src: "/gallery/WhatsApp Image 2026-02-12 at 23.02.24.jpeg", alt: "Foto galería 9", overlay: "Descanso x3" },
  { id: 10, src: "/gallery/WhatsApp Image 2026-02-12 at 23.02.25 (1).jpeg", alt: "Foto galería 10", overlay: "Moreno sintiendo los colores" },
  { id: 11, src: "/gallery/WhatsApp Image 2026-02-12 at 23.02.25 (2).jpeg", alt: "Foto galería 11", overlay: "Los joga bonito" },
  { id: 12, src: "/gallery/WhatsApp Image 2026-02-12 at 23.02.25 (3).jpeg", alt: "Foto galería 12", overlay: "Pasecitos" },
  { id: 13, src: "/gallery/WhatsApp Image 2026-02-12 at 23.02.25.jpeg", alt: "Foto galería 13", overlay: "Momento del partido" },
  { id: 14, src: "/gallery/WhatsApp Image 2026-02-12 at 23.02.26 (1).jpeg", alt: "Foto galería 14", overlay: "Momentos antes del desastre" },
  { id: 15, src: "/gallery/WhatsApp Image 2026-02-12 at 23.02.26 (2).jpeg", alt: "Foto galería 15", overlay: "Partido x2" },
  { id: 16, src: "/gallery/WhatsApp Image 2026-02-12 at 23.02.26 (3).jpeg", alt: "Foto galería 16", overlay: "Momentos antes del desastre x2" },
  { id: 17, src: "/gallery/WhatsApp Image 2026-02-12 at 23.02.26.jpeg", alt: "Foto galería 17", overlay: "Seguridad bajo palos" },
  { id: 18, src: "/gallery/WhatsApp Image 2026-02-12 at 23.02.27 (1).jpeg", alt: "Foto galería 18", overlay: "Banquillo aura" },
  { id: 19, src: "/gallery/WhatsApp Image 2026-02-12 at 23.02.27 (2).jpeg", alt: "Foto galería 19", overlay: "88" },
  { id: 20, src: "/gallery/WhatsApp Image 2026-02-12 at 23.02.27.jpeg", alt: "Foto galería 20", overlay: "Cara de sorpresa" },
  { id: 21, src: "/gallery/WhatsApp Image 2026-02-12 at 23.02.28 (1).jpeg", alt: "Foto galería 21", overlay: "Lengua de concentracion" },
  { id: 22, src: "/gallery/WhatsApp Image 2026-02-12 at 23.02.28 (2).jpeg", alt: "Foto galería 22", overlay: "Guich en acción" },
  { id: 23, src: "/gallery/WhatsApp Image 2026-02-12 at 23.02.28 (3).jpeg", alt: "Foto galería 23", overlay: "El capi" },
  { id: 24, src: "/gallery/WhatsApp Image 2026-02-12 at 23.02.28 (4).jpeg", alt: "Foto galería 24", overlay: "Analizando el juego" },
  { id: 25, src: "/gallery/WhatsApp Image 2026-02-12 at 23.02.28.jpeg", alt: "Foto galería 25", overlay: "AURA" },
  { id: 26, src: "/gallery/WhatsApp Image 2026-02-12 at 23.02.29 (1).jpeg", alt: "Foto galería 26", overlay: "Rascada de cuello que picaba" },
  { id: 27, src: "/gallery/WhatsApp Image 2026-02-12 at 23.02.29 (2).jpeg", alt: "Foto galería 27", overlay: "LAURA" },
  { id: 28, src: "/gallery/WhatsApp Image 2026-02-12 at 23.02.29 (3).jpeg", alt: "Foto galería 28", overlay: "Bailecito" },
  { id: 29, src: "/gallery/WhatsApp Image 2026-02-12 at 23.02.29.jpeg", alt: "Foto galería 29", overlay: "Subida inofensiva" },
  { id: 30, src: "/gallery/WhatsApp Image 2026-02-12 at 23.02.30 (1).jpeg", alt: "Foto galería 30", overlay: "El capi mirando a la nada" },
  { id: 31, src: "/gallery/WhatsApp Image 2026-02-12 at 23.02.30 (2).jpeg", alt: "Foto galería 31", overlay: "Mr. Laura" },
  { id: 32, src: "/gallery/WhatsApp Image 2026-02-12 at 23.02.30 (3).jpeg", alt: "Foto galería 32", overlay: "Siciliano" },
  { id: 33, src: "/gallery/WhatsApp Image 2026-02-12 at 23.02.30 (4).jpeg", alt: "Foto galería 33", overlay: "Protagonista (todos le observan)" },
  { id: 34, src: "/gallery/WhatsApp Image 2026-02-12 at 23.02.30.jpeg", alt: "Foto galería 34", overlay: "Mr. Laura perdiendola" },
  { id: 35, src: "/gallery/WhatsApp Image 2026-02-12 at 23.02.31 (1).jpeg", alt: "Foto galería 35", overlay: "Pase elevado al rival" },
  { id: 36, src: "/gallery/WhatsApp Image 2026-02-12 at 23.02.31 (2).jpeg", alt: "Foto galería 36", overlay: "La mano de araña" },
  { id: 37, src: "/gallery/WhatsApp Image 2026-02-12 at 23.02.31 (3).jpeg", alt: "Foto galería 37", overlay: "En teoría tiro" },
  { id: 38, src: "/gallery/WhatsApp Image 2026-02-12 at 23.02.31 (4).jpeg", alt: "Foto galería 38", overlay: "TOP AURA MOMENTS" },
  { id: 39, src: "/gallery/WhatsApp Image 2026-02-12 at 23.02.31 (5).jpeg", alt: "Foto galería 39", overlay: "Descansando de no hacer nada" },
  { id: 40, src: "/gallery/WhatsApp Image 2026-02-12 at 23.02.31.jpeg", alt: "Foto galería 40", overlay: "(Todas las fotos son suyas)" },
  { id: 41, src: "/gallery/WhatsApp Image 2026-02-12 at 23.02.32 (1).jpeg", alt: "Foto galería 41", overlay: "La manita araña" },
  { id: 42, src: "/gallery/WhatsApp Image 2026-02-12 at 23.02.32 (2).jpeg", alt: "Foto galería 42", overlay: "Yogui qui yogui" },
  { id: 43, src: "/gallery/WhatsApp Image 2026-02-12 at 23.02.32 (3).jpeg", alt: "Foto galería 43", overlay: "Concentración" },
  { id: 44, src: "/gallery/WhatsApp Image 2026-02-12 at 23.02.32.jpeg", alt: "Foto galería 44", overlay: "Markinho" },
  { id: 45, src: "/gallery/WhatsApp Image 2026-02-12 at 23.02.33 (1).jpeg", alt: "Foto galería 45", overlay: "Tiro toma 1" },
  { id: 46, src: "/gallery/WhatsApp Image 2026-02-12 at 23.02.33 (2).jpeg", alt: "Foto galería 46", overlay: "Tiro toma 2" },
  { id: 47, src: "/gallery/WhatsApp Image 2026-02-12 at 23.02.33 (3).jpeg", alt: "Foto galería 47", overlay: "Tiro toma 0" },
  { id: 48, src: "/gallery/WhatsApp Image 2026-02-12 at 23.02.33 (4).jpeg", alt: "Foto galería 48", overlay: "Rellena Botellas" },
  { id: 49, src: "/gallery/WhatsApp Image 2026-02-12 at 23.02.33.jpeg", alt: "Foto galería 49", overlay: "Que pesao" },
  { id: 50, src: "/gallery/WhatsApp Image 2026-02-12 at 23.02.34 (1).jpeg", alt: "Foto galería 50", overlay: "Haaland" },
  { id: 51, src: "/gallery/WhatsApp Image 2026-02-12 at 23.02.34 (2).jpeg", alt: "Foto galería 51", overlay: "Cara concentración" },
  { id: 52, src: "/gallery/WhatsApp Image 2026-02-12 at 23.02.34 (3).jpeg", alt: "Foto galería 52", overlay: "Inazuma eleven" },
  { id: 53, src: "/gallery/WhatsApp Image 2026-02-12 at 23.02.34 (4).jpeg", alt: "Foto galería 53", overlay: "Y otra suya" },
  { id: 54, src: "/gallery/WhatsApp Image 2026-02-12 at 23.02.34 (5).jpeg", alt: "Foto galería 54", overlay: "Sacando de banda el capi" },
  { id: 55, src: "/gallery/WhatsApp Image 2026-02-12 at 23.02.34.jpeg", alt: "Foto galería 55", overlay: "Azucar moreno" },
  { id: 56, src: "/gallery/WhatsApp Image 2026-02-12 at 23.02.35 (1).jpeg", alt: "Foto galería 56", overlay: "El presionador" },
  { id: 57, src: "/gallery/WhatsApp Image 2026-02-12 at 23.02.35 (2).jpeg", alt: "Foto galería 57", overlay: "Rellena botellas rellenando" },
  { id: 58, src: "/gallery/WhatsApp Image 2026-02-12 at 23.02.35 (3).jpeg", alt: "Foto galería 58", overlay: "Aura" },
  { id: 59, src: "/gallery/WhatsApp Image 2026-02-12 at 23.02.35 (4).jpeg", alt: "Foto galería 59", overlay: "El pichichi jugando" },
  { id: 60, src: "/gallery/WhatsApp Image 2026-02-12 at 23.02.35.jpeg", alt: "Foto galería 60", overlay: "Salida de balón del tigre" },
  { id: 61, src: "/gallery/WhatsApp Image 2026-02-12 at 23.02.36 (1).jpeg", alt: "Foto galería 61", overlay: "El rompetobillos" },
  { id: 62, src: "/gallery/WhatsApp Image 2026-02-12 at 23.02.36 (2).jpeg", alt: "Foto galería 62", overlay: "Momento de confusión" },
  { id: 63, src: "/gallery/WhatsApp Image 2026-02-12 at 23.02.36 (3).jpeg", alt: "Foto galería 63", overlay: "47" },
  { id: 64, src: "/gallery/WhatsApp Image 2026-02-12 at 23.02.36 (4).jpeg", alt: "Foto galería 64", overlay: "Respirando" },
  { id: 65, src: "/gallery/WhatsApp Image 2026-02-12 at 23.02.36.jpeg", alt: "Foto galería 65", overlay: "Buena pierna eh" },
  { id: 66, src: "/gallery/WhatsApp Image 2026-02-12 at 23.02.37 (1).jpeg", alt: "Foto galería 66", overlay: "Moviendo la bola" },
  { id: 67, src: "/gallery/WhatsApp Image 2026-02-12 at 23.02.37 (2).jpeg", alt: "Foto galería 67", overlay: "Acción de roch" },
  { id: 68, src: "/gallery/WhatsApp Image 2026-02-12 at 23.02.37 (3).jpeg", alt: "Foto galería 68", overlay: "El capi con pasos prohibidos" },
  { id: 69, src: "/gallery/WhatsApp Image 2026-02-12 at 23.02.37 (4).jpeg", alt: "Foto galería 69", overlay: "Haciendo que se mueve" },
  { id: 70, src: "/gallery/WhatsApp Image 2026-02-12 at 23.02.37.jpeg", alt: "Foto galería 70", overlay: "Analizando el juego" },
  { id: 71, src: "/gallery/WhatsApp Image 2026-02-12 at 23.02.38 (1).jpeg", alt: "Foto galería 71", overlay: "Medio inofensiva" },
  { id: 72, src: "/gallery/WhatsApp Image 2026-02-12 at 23.02.38 (2).jpeg", alt: "Foto galería 72", overlay: "Se viene tiro" },
  { id: 73, src: "/gallery/WhatsApp Image 2026-02-12 at 23.02.38 (3).jpeg", alt: "Foto galería 73", overlay: "Se viene tiro x2" },
  { id: 74, src: "/gallery/WhatsApp Image 2026-02-12 at 23.02.38 (4).jpeg", alt: "Foto galería 74", overlay: "Toque de 11" },
  { id: 75, src: "/gallery/WhatsApp Image 2026-02-12 at 23.02.38.jpeg", alt: "Foto galería 75", overlay: "El capi yendose x2" },
  { id: 76, src: "/gallery/WhatsApp Image 2026-02-12 at 23.02.39 (1).jpeg", alt: "Foto galería 76", overlay: "Yogui jugando (raro)" },
  { id: 77, src: "/gallery/WhatsApp Image 2026-02-12 at 23.02.39 (2).jpeg", alt: "Foto galería 77", overlay: "Yogui controlando" },
  { id: 78, src: "/gallery/WhatsApp Image 2026-02-12 at 23.02.39 (3).jpeg", alt: "Foto galería 78", overlay: "Joga portero" },
  { id: 79, src: "/gallery/WhatsApp Image 2026-02-12 at 23.02.39 (4).jpeg", alt: "Foto galería 79", overlay: "Guandin tirando" },
  { id: 80, src: "/gallery/WhatsApp Image 2026-02-12 at 23.02.39 (5).jpeg", alt: "Foto galería 80", overlay: "Control de juego de guandin" },
  { id: 81, src: "/gallery/WhatsApp Image 2026-02-12 at 23.02.39.jpeg", alt: "Foto galería 81", overlay: "Analizando" },
  { id: 82, src: "/gallery/WhatsApp Image 2026-02-12 at 23.02.40 (1).jpeg", alt: "Foto galería 82", overlay: "Aura bajo palos" },
  { id: 83, src: "/gallery/WhatsApp Image 2026-02-12 at 23.02.40 (2).jpeg", alt: "Foto galería 83", overlay: "Regatito" },
  { id: 84, src: "/gallery/WhatsApp Image 2026-02-12 at 23.02.40 (3).jpeg", alt: "Foto galería 84", overlay: "Unica aparicion de coarasa" },
  { id: 85, src: "/gallery/WhatsApp Image 2026-02-12 at 23.02.40 (4).jpeg", alt: "Foto galería 85", overlay: "Baller" },
  { id: 86, src: "/gallery/WhatsApp Image 2026-02-12 at 23.02.40.jpeg", alt: "Foto galería 86", overlay: "Yogui qui yogui x2" },
  { id: 87, src: "/gallery/WhatsApp Image 2026-02-12 at 23.02.41 (1).jpeg", alt: "Foto galería 87", overlay: "Mirando a la nada pensando en ti" },
  { id: 88, src: "/gallery/WhatsApp Image 2026-02-12 at 23.02.41 (2).jpeg", alt: "Foto galería 88", overlay: "Hihglights" },
  { id: 89, src: "/gallery/WhatsApp Image 2026-02-12 at 23.02.41 (3).jpeg", alt: "Foto galería 89", overlay: "Juego de equipo" },
  { id: 90, src: "/gallery/WhatsApp Image 2026-02-12 at 23.02.41 (4).jpeg", alt: "Foto galería 90", overlay: "Baller x2" },
  { id: 91, src: "/gallery/WhatsApp Image 2026-02-12 at 23.02.41.jpeg", alt: "Foto galería 91", overlay: "Me preocupa la mano ya" },
  { id: 92, src: "/gallery/WhatsApp Image 2026-02-12 at 23.02.42 (1).jpeg", alt: "Foto galería 92", overlay: "Basumoscas" },
  { id: 93, src: "/gallery/WhatsApp Image 2026-02-12 at 23.02.42 (2).jpeg", alt: "Foto galería 93", overlay: "Regating" },
  { id: 94, src: "/gallery/WhatsApp Image 2026-02-12 at 23.02.42 (3).jpeg", alt: "Foto galería 94", overlay: "Controlling" },
  { id: 95, src: "/gallery/WhatsApp Image 2026-02-12 at 23.02.42 (4).jpeg", alt: "Foto galería 95", overlay: "Continue controlling" },
  { id: 96, src: "/gallery/WhatsApp Image 2026-02-12 at 23.02.42 (5).jpeg", alt: "Foto galería 96", overlay: "Pase moreno" },
  { id: 97, src: "/gallery/WhatsApp Image 2026-02-12 at 23.02.42.jpeg", alt: "Foto galería 97", overlay: "Salida de balón" },
  { id: 98, src: "/gallery/WhatsApp Image 2026-02-12 at 23.02.43 (1).jpeg", alt: "Foto galería 98", overlay: "Pretiro" },
  { id: 99, src: "/gallery/WhatsApp Image 2026-02-12 at 23.02.43 (2).jpeg", alt: "Foto galería 99", overlay: "Pretiro x2" },
  { id: 100, src: "/gallery/WhatsApp Image 2026-02-12 at 23.02.43 (3).jpeg", alt: "Foto galería 100", overlay: "Victoria Esmeralda" },
  { id: 101, src: "/gallery/WhatsApp Image 2026-02-12 at 23.02.43 (4).jpeg", alt: "Foto galería 101", overlay: "Victoria Isineta" },
  { id: 102, src: "/gallery/WhatsApp Image 2026-02-12 at 23.02.43.jpeg", alt: "Foto galería 102", overlay: "Moreacty" },
  { id: 103, src: "/gallery/WhatsApp Image 2026-02-12 at 23.02.44.jpeg", alt: "Foto galería 103", overlay: "Victoria Kuda" },
];
