"use client";

import { useRef, useState, useEffect } from "react";
import { motion, useInView } from "framer-motion";
import { Goal, Trophy, Medal } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";

interface TopScorer {
  jugador_id: number;
  nombre: string;
  posicion: string;
  dorsal?: number;
  total_goles: number;
  partidos: number;
}

export function TopScorersSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const [scorers, setScorers] = useState<TopScorer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTopScorers();
  }, []);

  async function fetchTopScorers() {
    try {
      const { data, error } = await supabase
        .from('goleadores_partido')
        .select('*')
        .order('goles', { ascending: false });

      if (error) throw error;

      // Agrupar por jugador y calcular totales
      const grouped = new Map<number, TopScorer>();
      
      data?.forEach((record: any) => {
        const key = record.jugador_id;
        if (!grouped.has(key)) {
          grouped.set(key, {
            jugador_id: key,
            nombre: record.nombre,
            posicion: record.posicion,
            dorsal: record.dorsal,
            total_goles: 0,
            partidos: 0,
          });
        }
        const scorer = grouped.get(key)!;
        scorer.total_goles += record.goles;
        scorer.partidos += 1;
      });

      // Convertir a array y ordenar
      const sortedScorers = Array.from(grouped.values()).sort(
        (a, b) => b.total_goles - a.total_goles
      );

      setScorers(sortedScorers);
    } catch (error) {
      console.error('Error fetching scorers:', error);
    } finally {
      setLoading(false);
    }
  }

  const getMedalIcon = (position: number) => {
    switch (position) {
      case 0:
        return <Medal className="h-5 w-5 text-yellow-500" />;
      case 1:
        return <Medal className="h-5 w-5 text-gray-400" />;
      case 2:
        return <Medal className="h-5 w-5 text-orange-600" />;
      default:
        return null;
    }
  };

  return (
    <section id="goleadores" className="bg-background py-24 lg:py-32" ref={ref}>
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <div className="mx-auto mb-3 inline-flex items-center gap-2 rounded-full bg-accent/10 border border-accent/20 px-4 py-1.5">
            <Goal className="h-4 w-4 text-accent" />
            <span className="text-sm font-semibold text-accent">
              Máximos Anotadores
            </span>
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl text-balance">
            Tabla de Goleadores
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            Nuestros máximos goleadores de la temporada.
          </p>
        </motion.div>

        {loading ? (
          <div className="text-center mt-12 text-muted-foreground">
            Cargando goleadores...
          </div>
        ) : scorers.length === 0 ? (
          <div className="text-center mt-12 text-muted-foreground">
            No hay goleadores registrados aún.
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-12"
          >
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">#</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Jugador</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Posición</th>
                    <th className="text-center py-3 px-4 text-sm font-semibold text-muted-foreground">Dorsal</th>
                    <th className="text-center py-3 px-4 text-sm font-semibold text-muted-foreground">Goles</th>
                    <th className="text-center py-3 px-4 text-sm font-semibold text-muted-foreground">Partidos</th>
                    <th className="text-center py-3 px-4 text-sm font-semibold text-muted-foreground">Media</th>
                  </tr>
                </thead>
                <tbody>
                  {scorers.map((scorer, index) => (
                    <motion.tr
                      key={scorer.jugador_id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={isInView ? { opacity: 1, y: 0 } : {}}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className={cn(
                        "border-b border-border/50 transition-colors hover:bg-secondary/50",
                        index < 3 && "bg-accent/5"
                      )}
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          {getMedalIcon(index)}
                          <span className="text-sm font-semibold text-foreground">
                            {index + 1}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm font-semibold text-foreground">
                          {scorer.nombre}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm text-muted-foreground">
                          {scorer.posicion}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="inline-flex items-center justify-center h-7 w-7 rounded-full bg-accent/10 text-xs font-bold text-accent">
                          {scorer.dorsal || '-'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="text-lg font-bold text-accent">
                          {scorer.total_goles}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="text-sm text-muted-foreground">
                          {scorer.partidos}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="text-sm font-semibold text-foreground">
                          {(scorer.total_goles / scorer.partidos).toFixed(2)}
                        </span>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
}
