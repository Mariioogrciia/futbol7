# ⚽ Fútbol 7 Club - Gestión y Experiencia Premium

¡Bienvenido al repositorio oficial de **Fútbol 7 Club**! Una plataforma web moderna, deportiva y de alto rendimiento diseñada para elevar la experiencia de gestión y seguimiento de equipos de fútbol 7.

![Fútbol 7 Banner](https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&q=80&w=1200)

## 🌟 Características Principales

### 🏆 Gestión de Equipo y Jugadores
- **Plantilla Dinámica**: Visualización premium de los jugadores con efectos de hover y diseño moderno.
- **Perfiles Individuales**: Páginas dedicadas para cada jugador con sus estadísticas, fotos personalizadas y citas inspiradoras.
- **Galería de Fotos**: Sección visual para capturar los mejores momentos del equipo.

### 🎰 ImpersedBet (El Oráculo)
- **Sistema de Apuestas Interno**: Una sección inmersiva y deportiva para realizar pronósticos.
- **Diseño Premium**: Interfaz optimizada con modo claro/oscuro, tarjetas dinámicas y navegación fluida.
- **Historial de Puntos**: Seguimiento de los aciertos y puntos de cada usuario.

### 🤖 Mister Chat (AI Assistant)
- **Chatbot Inteligente**: Integrado con los datos reales del equipo.
- **Consultas en Tiempo Real**: Pregunta sobre estadísticas de jugadores, resultados de partidos o el próximo encuentro.
- **Tecnología de Punta**: Potenciado por **Groq (Llama 3)** para respuestas instantáneas y precisas.

### 📊 Estadísticas y Resultados
- **Clasificación y Resultados**: Tablas comparativas actualizadas.
- **Máximos Goleadores**: Seguimiento automático de los "Pichichis" del equipo.
- **Widgets en Vivo**: Marcadores y notificaciones de partidos recientes.

---

## 🚀 Stack Tecnológico

Este proyecto utiliza las tecnologías más modernas para garantizar velocidad, SEO y una experiencia de usuario excepcional:

- **Frontend**: [Next.js 15](https://nextjs.org/) (App Router + Turbopack)
- **Estilizado**: [Tailwind CSS](https://tailwindcss.com/) + [Framer Motion](https://www.framer.com/motion/) (Animaciones)
- **Componentes**: [Radix UI](https://www.radix-ui.com/) + [Lucide React](https://lucide.dev/)
- **Backend**: [Supabase](https://supabase.com/) & [MongoDB](https://www.mongodb.com/)
- **AI**: [Vercel AI SDK](https://sdk.vercel.ai/) (Modelos: Google Gemini & Groq/Llama 3)
- **Lenguaje**: [TypeScript](https://www.typescriptlang.org/)

---

## 🛠️ Configuración e Instalación

### 1. Clonar el repositorio
```bash
git clone https://github.com/Mariioogrciia/futbol7.git
cd futbol7
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Variables de Entorno
Crea un archivo `.env.local` en la raíz y añade las siguientes claves (solicítalas al administrador):

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=tu_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_key

# AI Keys
GOOGLE_GENERATIVE_AI_API_KEY=tu_key
GROQ_API_KEY=tu_key

# Auth / Database
MONGODB_URI=tu_uri
JWT_SECRET=tu_secreto
```

### 4. Iniciar en modo desarrollo
```bash
npm run dev
```
La aplicación estará disponible en `http://localhost:3000`.

---

## 📁 Estructura del Proyecto

```text
├── app/              # Rutas y páginas de Next.js
├── components/       # Componentes de UI reutilizables
├── lib/              # Utilidades, hooks y configuración de DB
├── public/           # Activos estáticos (imágenes, iconos)
├── supabase/         # Migraciones y configuración de Supabase
└── types/            # Definiciones de TypeScript
```

---

## 🎨 Diseño y Aestética

El proyecto sigue una filosofía de **Diseño Premium**:
- **Modo Oscuro/Claro**: Adaptabilidad total.
- **Micro-animaciones**: Transiciones suaves y feedback visual interactivo.
- **Tipografía Moderna**: Uso de fuentes legibles y deportivas.

---

## 👥 Contribuidores

- **Mario García** - *Desarrollador Principal* - [Mariioogrciia](https://github.com/Mariioogrciia)

---

✨ Elaborado con pasión por el fútbol y el código. ✨
