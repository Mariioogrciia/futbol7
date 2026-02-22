// Este archivo verifica que MongoDB esté disponible
import { getDatabase } from '@/lib/mongodb';

export async function GET() {
  try {
    const db = await getDatabase();
    
    // Intentar obtener información de la BD
    const stats = await db.stats();
    
    return Response.json({
      status: 'conectado',
      message: 'MongoDB conectado exitosamente',
      database: stats.db,
    });
  } catch (error: any) {
    console.error('Error conectando a MongoDB:', error.message);
    return Response.json(
      {
        status: 'error',
        message: error.message,
        hint: 'Verifica que MONGODB_URI esté configurado en .env.local',
      },
      { status: 500 }
    );
  }
}
