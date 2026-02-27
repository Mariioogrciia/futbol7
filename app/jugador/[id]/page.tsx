import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, Target, Shield, HeartPulse } from "lucide-react";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { EditableAvatar } from "@/components/editable-avatar";
import { EditableStats } from "@/components/editable-stats";
import { supabase } from "@/lib/supabase"; // Use client for session

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function JugadorPage({ params }: PageProps) {
    const resolvedParams = await Promise.resolve(params);
    const id = resolvedParams.id;

    if (!id) notFound();

    const { data: jugador, error } = await supabaseAdmin
        .from("jugadores")
        .select("*")
        .eq("id", id)
        .single();

    if (error || !jugador) {
        notFound();
    }

    // Determine edit permissions by seeing who is currently making the request
    // Next.js App Router allows checking session in Server Components this way only if cookies are forwarded
    // Since this might not have full cookies context without careful setup, we assume read-only server side,
    // OR just pass canEdit as true for now if the client checks it natively. But we can't reliably do client-auth in a server component without `cookies()`.
    // We will do a workaround: EditableStats component will check client-side auth inside its mounting effect!
    // But since `canEdit` is sent, let's keep it simple: we remove it from Server Component props and let `EditableStats` figure out auth.

    // Let's pass a placeholder `canEdit` and let the client component double-check
    let canEdit = false;

    // Use DB stats instead of random 
    const initialStats = {
        ritmo: jugador.stat_ritmo ?? 50,
        tiro: jugador.stat_tiro ?? 50,
        pase: jugador.stat_pase ?? 50,
        regate: jugador.stat_regate ?? 50,
        defensa: jugador.stat_defensa ?? 50,
        fisico: jugador.stat_fisico ?? 50,
    };

    return (
        <div className="min-h-screen bg-background">
            <div className="relative h-64 sm:h-80 w-full overflow-hidden bg-primary">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_hsl(160_80%_20%_/_0.3),_transparent_60%)]" />
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_hsl(90_65%_50%_/_0.2),_transparent_60%)]" />
            </div>

            <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 -mt-32 relative z-10 pb-24">
                <Link
                    href="/#equipo"
                    className="inline-flex items-center gap-2 text-primary-foreground/80 hover:text-white mb-6 backdrop-blur-md bg-black/20 border border-primary-foreground/10 px-4 py-2 rounded-full transition-colors"
                >
                    <ChevronLeft className="h-4 w-4" /> Volver a la plantilla
                </Link>

                <div className="bg-card rounded-3xl border border-border shadow-2xl overflow-hidden">
                    <div className="p-8 sm:p-12 md:flex gap-12 items-start">

                        <div className="shrink-0 flex flex-col items-center">
                            <EditableAvatar
                                jugadorId={jugador.id}
                                currentFotoUrl={jugador.foto_url}
                                jugadorNombre={jugador.nombre}
                            />
                            <div className="mt-6 flex flex-col items-center">
                                <div className="text-5xl font-black text-foreground">{jugador.dorsal || "-"}</div>
                                <div className="text-sm font-bold text-accent uppercase tracking-widest mt-1">{jugador.posicion}</div>
                            </div>
                        </div>

                        <div className="mt-8 md:mt-0 flex-1">
                            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-foreground tracking-tight mb-4">
                                {jugador.nombre}
                            </h1>
                            <p className="text-lg text-muted-foreground mb-8">
                                Miembro oficial de Impersed Cubiertas FC. Entrega, pasión y tercer tiempo garantizado.
                            </p>

                            <div className="grid grid-cols-2 gap-4 mb-10">
                                <div className="bg-muted rounded-xl p-4 border border-border flex flex-col items-center justify-center text-center shadow-sm">
                                    <Target className="h-5 w-5 text-accent mb-2" />
                                    <span className="text-3xl font-bold">{jugador.goles || 0}</span>
                                    <span className="text-xs text-muted-foreground uppercase tracking-widest mt-1">Goles Totales</span>
                                </div>
                                <div className="bg-muted rounded-xl p-4 border border-border flex flex-col items-center justify-center text-center shadow-sm">
                                    <HeartPulse className="h-5 w-5 text-rose-500 mb-2" />
                                    <span className="text-3xl font-bold">{initialStats.fisico}%</span>
                                    <span className="text-xs text-muted-foreground uppercase tracking-widest mt-1">Físico</span>
                                </div>
                            </div>

                            <div className="border-t border-border pt-10 mt-10">
                                <h3 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
                                    <Shield className="h-6 w-6 text-accent" /> Carta de Habilidades
                                </h3>

                                <EditableStats
                                    jugadorId={jugador.id}
                                    canEdit={true}
                                    initialStats={initialStats}
                                />

                            </div>

                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
