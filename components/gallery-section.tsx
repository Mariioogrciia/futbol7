"use client";

import { useRef, useState } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { X, Maximize2 } from "lucide-react";
import { galleryImages } from "@/lib/data";

export function GallerySection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const [lightbox, setLightbox] = useState<number | null>(null);

  return (
    <section id="galeria" className="bg-secondary py-24 lg:py-32" ref={ref}>
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
            Galeria
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            Momentos que definen nuestra historia dentro y fuera del campo.
          </p>
        </motion.div>

        {/* Image grid */}
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {galleryImages.map((img, i) => (
            <motion.div
              key={img.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="group relative cursor-pointer overflow-hidden rounded-xl"
              onClick={() => setLightbox(img.id)}
            >
              <div className="aspect-[4/3] relative">
                <Image
                  src={img.src}
                  alt={img.alt}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
              </div>

              {/* Hover overlay */}
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-primary/60 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                <Maximize2 className="mb-2 h-8 w-8 text-primary-foreground" />
                <p className="text-sm font-semibold text-primary-foreground">
                  {img.overlay}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightbox !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-foreground/80 backdrop-blur-md p-4"
            onClick={() => setLightbox(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="relative max-h-[85vh] max-w-4xl overflow-hidden rounded-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {(() => {
                const img = galleryImages.find((g) => g.id === lightbox);
                if (!img) return null;
                return (
                  <Image
                    src={img.src}
                    alt={img.alt}
                    width={1200}
                    height={900}
                    className="h-auto max-h-[85vh] w-auto object-contain"
                  />
                );
              })()}

              <button
                onClick={() => setLightbox(null)}
                className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full bg-foreground/50 text-background transition-colors hover:bg-foreground/70"
                aria-label="Cerrar galeria"
              >
                <X className="h-5 w-5" />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
