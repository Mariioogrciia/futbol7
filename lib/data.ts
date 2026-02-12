export type Position = "Portero" | "Defensa" | "Medio" | "Delantero";

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
  { id: 1, name: "Carlos Herrera", position: "Portero", number: 1, description: "Reflejos felinos y gran presencia bajo palos.", avatar: "/images/player-1.jpg" },
  { id: 2, name: "Sergio Ramos", position: "Defensa", number: 4, description: "Lider de la zaga, contundente y con gol.", avatar: "/images/player-2.jpg" },
  { id: 3, name: "Alejandro Vidal", position: "Defensa", number: 2, description: "Velocidad y anticipacion en cada jugada.", avatar: "/images/player-3.jpg" },
  { id: 4, name: "Daniel Ortiz", position: "Medio", number: 8, description: "Motor del equipo, vision de juego excepcional.", avatar: "/images/player-4.jpg" },
  { id: 5, name: "Pablo Mendez", position: "Medio", number: 6, description: "Control del ritmo y pases de ruptura.", avatar: "/images/player-5.jpg" },
  { id: 6, name: "Marcos Torres", position: "Medio", number: 10, description: "Creatividad y tecnica al servicio del equipo.", avatar: "/images/player-6.jpg" },
  { id: 7, name: "Luis Navarro", position: "Delantero", number: 9, description: "Instinto goleador, siempre en el lugar justo.", avatar: "/images/player-7.jpg" },
  { id: 8, name: "Javier Ruiz", position: "Delantero", number: 7, description: "Velocidad electrica y desborde por banda.", avatar: "/images/player-8.jpg" },
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
