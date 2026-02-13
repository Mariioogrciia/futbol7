"use client";

import { useRef, useState } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { X, Maximize2, ChevronDown, ChevronUp } from "lucide-react";
import { galleryImages } from "@/lib/data";

export function GallerySection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const [lightbox, setLightbox] = useState<number | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isGalleryCollapsed, setIsGalleryCollapsed] = useState(false);
  
  const IMAGES_PER_LOAD = 5;
  const displayedImages = isExpanded ? galleryImages : galleryImages.slice(0, IMAGES_PER_LOAD);

  return (
    <section id="galeria" className="bg-secondary py-24 lg:py-32" ref={ref}>
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="flex items-center justify-between"
        >
          <div className="flex-1">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
              Galeria
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
              Momentos que definen nuestra historia dentro y fuera del campo.
            </p>
          </div>
          <button
            onClick={() => setIsGalleryCollapsed(!isGalleryCollapsed)}
            className="ml-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground transition-colors hover:bg-primary/90"
            aria-label={isGalleryCollapsed ? "Expandir galería" : "Minimizar galería"}
            title={isGalleryCollapsed ? "Expandir galería" : "Minimizar galería"}
          >
            {isGalleryCollapsed ? (
              <ChevronDown className="h-6 w-6" />
            ) : (
              <ChevronUp className="h-6 w-6" />
            )}
          </button>
        </motion.div>

        {/* Image grid */}
        <AnimatePresence>
          {!isGalleryCollapsed && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="mt-12"
            >
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {displayedImages.map((img, i) => (
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

              {/* Load more button */}
              {!isExpanded && galleryImages.length > IMAGES_PER_LOAD && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.3 }}
                  className="mt-8 flex justify-center"
                >
                  <button
                    onClick={() => setIsExpanded(true)}
                    className="rounded-lg bg-primary px-8 py-3 font-semibold text-primary-foreground transition-all hover:bg-primary/90 active:scale-95"
                  >
                    Ver más ({galleryImages.length - IMAGES_PER_LOAD} fotos más)
                  </button>
                </motion.div>
              )}

              {/* Collapse button when expanded */}
              {isExpanded && galleryImages.length > IMAGES_PER_LOAD && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.3 }}
                  className="mt-8 flex justify-center"
                >
                  <button
                    onClick={() => setIsExpanded(false)}
                    className="rounded-lg bg-secondary px-8 py-3 font-semibold text-foreground transition-all hover:bg-secondary/80 active:scale-95 border border-primary"
                  >
                    Ver menos
                  </button>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
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
