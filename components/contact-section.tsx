"use client";

import { useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { Send, MapPin, Clock, Phone } from "lucide-react";
import { cn } from "@/lib/utils";

export function ContactSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <section id="contacto" className="py-24 lg:py-32" ref={ref}>
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
            Contacto
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            Tienes alguna pregunta o quieres saber mas sobre nosotros?
            Rellena el formulario y nos pondremos en contacto contigo.
          </p>
        </motion.div>

        <div className="mt-12 grid gap-8 lg:grid-cols-5">
          {/* Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:col-span-3"
          >
            <form
              onSubmit={handleSubmit}
              className="rounded-xl border border-border bg-card p-8 shadow-sm"
            >
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="name"
                    className="mb-1.5 block text-sm font-medium text-card-foreground"
                  >
                    Nombre completo
                  </label>
                  <input
                    id="name"
                    type="text"
                    required
                    placeholder="Tu nombre"
                    className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 transition-colors"
                  />
                </div>
                <div>
                  <label
                    htmlFor="email"
                    className="mb-1.5 block text-sm font-medium text-card-foreground"
                  >
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    required
                    placeholder="tu@email.com"
                    className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 transition-colors"
                  />
                </div>
                <div>
                  <label
                    htmlFor="position"
                    className="mb-1.5 block text-sm font-medium text-card-foreground"
                  >
                    Posicion preferida
                  </label>
                  <select
                    id="position"
                    required
                    className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 transition-colors"
                  >
                    <option value="">Selecciona</option>
                    <option>Portero</option>
                    <option>Defensa</option>
                    <option>Medio</option>
                    <option>Delantero</option>
                  </select>
                </div>
                <div>
                  <label
                    htmlFor="level"
                    className="mb-1.5 block text-sm font-medium text-card-foreground"
                  >
                    Nivel
                  </label>
                  <select
                    id="level"
                    required
                    className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 transition-colors"
                  >
                    <option value="">Selecciona</option>
                    <option>Principiante</option>
                    <option>Intermedio</option>
                    <option>Avanzado</option>
                  </select>
                </div>
              </div>

              <div className="mt-5">
                <label
                  htmlFor="message"
                  className="mb-1.5 block text-sm font-medium text-card-foreground"
                >
                  Mensaje
                </label>
                <textarea
                  id="message"
                  rows={4}
                  placeholder="Cuentanos sobre ti y tu experiencia..."
                  className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 transition-colors resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={submitted}
                className={cn(
                  "mt-6 inline-flex items-center rounded-lg px-6 py-3 text-sm font-semibold shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl",
                  submitted
                    ? "bg-accent text-accent-foreground"
                    : "bg-primary text-primary-foreground hover:bg-primary/90"
                )}
              >
                {submitted ? (
                  "Solicitud enviada!"
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Enviar solicitud
                  </>
                )}
              </button>
            </form>
          </motion.div>

          {/* Info card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="lg:col-span-2"
          >
            <div className="rounded-xl border border-border bg-card p-8 shadow-sm">
              <h3 className="text-lg font-bold text-card-foreground">
                Donde entrenamos
              </h3>

              <div className="mt-5 flex flex-col gap-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent/10">
                    <MapPin className="h-4 w-4 text-accent" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-card-foreground">
                      Direccion
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Campo Municipal Norte, Av. del Deporte 42, Madrid
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent/10">
                    <Clock className="h-4 w-4 text-accent" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-card-foreground">
                      Horario de entrenamiento
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Martes y Jueves, 20:00 - 21:30
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent/10">
                    <Phone className="h-4 w-4 text-accent" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-card-foreground">
                      Contacto
                    </p>
                    <p className="text-sm text-muted-foreground">
                      +34 612 345 678
                    </p>
                  </div>
                </div>
              </div>

              {/* Map placeholder */}
              <div className="mt-6 overflow-hidden rounded-lg border border-border">
                <div className="relative aspect-[4/3] bg-muted flex items-center justify-center">
                  <div className="absolute inset-0 bg-primary/5" />
                  <div className="relative text-center">
                    <MapPin className="mx-auto h-8 w-8 text-accent" />
                    <p className="mt-2 text-sm font-medium text-muted-foreground">
                      Campo Municipal Norte
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Madrid, Espana
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
