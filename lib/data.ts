export type Position = "Portero" | "Defensa" | "Medio" | "Delantero" / "Banca o Mister(feka)";

export interface Player {
  id: number;
  name: string;
  position: Position;
  number: number;
  description: string;
  avatar: string;
}

export interface Match {
  id: number;
  rival: string;
  date: string;
  time: string;
  location: string;
  fieldType: string;
  status: "Confirmado" | "Pendiente";
  isNext?: boolean;
}

export interface GalleryImage {
  id: number;
  src: string;
  alt: string;
  overlay: string;
}

export const players: Player[] = [
  { id: 1, name: "Ignacio Soto", position: "Portero", number: 1, description: "Reflejos felinos y gran presencia bajo palos (no sale).", avatar: "/images/player-1.jpg" },
  { id: 2, name: "Javier Martín (Coarasa)", position: "Defensa", number: 2, description: "Lider de la zaga, contundente (a favor de los rivales) y con 2 piernas zurdas.", avatar: "/images/player-2.jpg" },
  { id: 3, name: "Carlos Barragán", position: "Defensa", number: 7, description: "Velocidad y anticipacion en cada jugada (para coger el cigarro).", avatar: "/images/player-3.jpg" },
  { id: 4, name: "Guillermo García", position: "Defensa", number: 69, description: "Motor del equipo, vision de juego excepcional (menos para correr hacia atrás).", avatar: "/images/player-4.jpg" },
  { id: 5, name: "David García", position: "Defensa", number: 8, description: "Control del ritmo (bajo) y ruptura (de tobillos).", avatar: "/images/player-5.jpg" },
  { id: 6, name: "Miguel Sicilia", position: "Defensa", number: 47, description: "Creatividad y tecnica al servicio del equipo (no la pasa).", avatar: "/images/player-6.jpg" },
  { id: 7, name: "Adrián Moreno", position: "Defensa", number: 22, description: "Lateral sólido, siempre en el lugar justo (para no marcar).", avatar: "/images/player-7.jpg" },
  { id: 8, name: "Hugo Hernández", position: "Medio", number: 10, description: "Velocidad electrica (para chuparla) y el capitán (vive en un edit).", avatar: "/images/player-8.jpg" },
  { id: 9, name: "Marcos Rivera", position: "Medio", number: 11, description: "Jueo de pies a la orden del día (solo viene con la novia).", avatar: "/images/player-8.jpg" },
  { id: 10, name: "Alberto Suárez", position: "Medio", number: 26, description: "Ni se quien es (no ha venido).", avatar: "/images/player-8.jpg" },
  { id: 10, name: "David Sastre", position: "Delantero", number: 88, description: "Ejemplo a bajos rasos de fernando llorente (está cansado antes de entrar).", avatar: "/images/player-8.jpg" },
  { id: 11, name: "Mario García", position: "Banca/Mister(feka)", number: 21, description: "Ha jugado 2 partidos (tiene la rodilla de plastilina), en teoría mister.", avatar: "/images/player-8.jpg" },
  { id: 12, name: "Rodrigo Casado", position: "Delantero", number: 33, description: "El presionador del equipo (no da pie con bola).", avatar: "/images/player-8.jpg" },
];

export const matches: Match[] = [
  { id: 1, rival: "Deportivo Aluche", date: "15 Mar 2026", time: "20:30", location: "Campo Municipal Norte", fieldType: "Cesped artificial", status: "Confirmado", isNext: true },
  { id: 2, rival: "CF Vallecas United", date: "22 Mar 2026", time: "21:00", location: "Polideportivo Sur", fieldType: "Indoor", status: "Confirmado" },
  { id: 3, rival: "Racing Moncloa", date: "29 Mar 2026", time: "20:00", location: "Campo Municipal Norte", fieldType: "Cesped artificial", status: "Pendiente" },
  { id: 4, rival: "Atletico Carabanchel", date: "5 Abr 2026", time: "21:30", location: "Complejo Deportivo Este", fieldType: "Cesped artificial", status: "Pendiente" },
];

export const stats = {
  played: 24,
  won: 16,
  drawn: 4,
  lost: 4,
  goalsFor: 58,
  goalsAgainst: 22,
  topScorer: "Luis Navarro",
  topScorerGoals: 18,
};

export const galleryImages: GalleryImage[] = [
  { id: 1, src: "/images/gallery-1.jpg", alt: "Celebracion del equipo", overlay: "Victoria 3-1" },
  { id: 2, src: "/images/gallery-2.jpg", alt: "Gol decisivo", overlay: "Gol decisivo" },
  { id: 3, src: "/images/gallery-3.jpg", alt: "Entrenamiento", overlay: "Entrenamiento" },
  { id: 4, src: "/images/gallery-4.jpg", alt: "Foto de equipo", overlay: "Foto oficial" },
  { id: 5, src: "/images/gallery-5.jpg", alt: "Partido nocturno", overlay: "Partido nocturno" },
  { id: 6, src: "/images/gallery-6.jpg", alt: "Trofeo de liga", overlay: "Campeones" },
];
