"use client";

import { useRef, useState, useEffect } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { X, Maximize2, ChevronDown, ChevronUp, Image as ImageIcon } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";

interface SubGalleryImage {
  id: number;
  src: string;
  alt: string;
}

export function GallerySection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.15 });
  const [lightbox, setLightbox] = useState<number | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isGalleryCollapsed, setIsGalleryCollapsed] = useState(false);
  const [images, setImages] = useState<SubGalleryImage[]>([]);
  const [loading, setLoading] = useState(true);

  const IMAGES_PER_LOAD = 6; // Multiples of 3 work best for grid
  const displayedImages = isExpanded ? images : images.slice(0, IMAGES_PER_LOAD);

  useEffect(() => {
    async function loadGallery() {
      try {
        const { data, error } = await supabase.storage.from("galeria").list("", {
          limit: 1000,
          offset: 0,
        });
        if (error) throw error;

        const validFiles = data.filter((file) =>
          file.name !== ".emptyFolderPlaceholder" &&
          !file.name.startsWith(".") &&
          file.id != null
        );

        const galleryData: SubGalleryImage[] = validFiles.map((file, idx) => {
          const { data: pubData } = supabase.storage.from("galeria").getPublicUrl(file.name);
          return {
            id: idx + 1,
            src: pubData.publicUrl,
            alt: `Foto galería ${idx + 1}`,
          };
        });

        setImages(galleryData);
      } catch (err) {
        console.error("Error cargando galería:", err);
      } finally {
        setLoading(false);
      }
    }

    if (isInView) {
      loadGallery();
    }
  }, [isInView]);

  return (
    <section id="galeria" className="relative py-24 lg:py-32 overflow-hidden" ref={ref}>
      {/* Background ambient glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-0 w-[50%] h-[50%] bg-emerald-900/4 blur-[130px] rounded-full" />
      </div>

      <div className="mx-auto max-w-7xl px-4 lg:px-8 relative z-10">

        {/* ── Section Header ── */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="mb-14 flex items-center justify-between gap-6"
        >
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border-subtle to-transparent max-w-12" />
              <span className="inline-flex items-center gap-2 text-[10px] font-black tracking-[0.18em] uppercase text-text-secondary border border-border-subtle px-4 py-2 rounded-full bg-bg-secondary">
                <ImageIcon className="h-3.5 w-3.5 text-emerald-500" />
                Fototeca
              </span>
              <div className="h-px flex-1 bg-gradient-to-l from-transparent via-border-subtle to-transparent max-w-12" />
            </div>

            <h2 className="text-4xl sm:text-5xl lg:text-7xl font-black tracking-tighter text-text-primary leading-[0.95]">
              Galería de<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 via-emerald-400 to-teal-300">
                Momentos
              </span>
            </h2>
            <p className="mt-4 text-text-secondary text-base lg:text-lg font-medium max-w-md">
              La historia de Impersed Cubiertas FC capturada fuera y dentro del campo.
            </p>
          </div>

          <button
            onClick={() => setIsGalleryCollapsed(!isGalleryCollapsed)}
            className="flex h-12 w-12 items-center justify-center rounded-full border border-border-subtle bg-bg-secondary backdrop-blur-md text-text-muted transition-all hover:bg-surface-card-hover hover:border-border-default hover:text-text-primary"
            aria-label={isGalleryCollapsed ? "Expandir galería" : "Minimizar galería"}
          >
            {isGalleryCollapsed ? <ChevronDown className="h-5 w-5" /> : <ChevronUp className="h-5 w-5" />}
          </button>
        </motion.div>

        {/* ── Image Grid container ── */}
        <AnimatePresence>
          {!isGalleryCollapsed && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
              className="mt-12 overflow-hidden"
            >
              {loading ? (
                <div className="flex flex-col items-center justify-center py-20">
                  <div className="w-8 h-8 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin mb-3" />
                  <p className="text-text-secondary font-medium text-sm">Cargando fotos...</p>
                </div>
              ) : images.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <span className="text-4xl opacity-20 mb-3">🖼️</span>
                  <p className="text-slate-500 font-black text-lg">Sin fotografías aún</p>
                </div>
              ) : (
                <>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {displayedImages.map((img, i) => (
                      <motion.div
                        key={img.id}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: i * 0.05 }}
                        className="group relative cursor-pointer overflow-hidden rounded-[1.5rem] border border-border-default bg-surface-card aspect-[4/3] shadow-elevated"
                        onClick={() => setLightbox(img.id)}
                      >
                        <img
                          src={img.src}
                          alt={img.alt}
                          className="absolute inset-0 w-full h-full object-cover transition-all duration-700 group-hover:scale-110 group-hover:rotate-1"
                          loading="lazy"
                        />

                        {/* Hover Overlay glass */}
                        <div className="absolute inset-0 flex items-center justify-center bg-[#070D17]/40 opacity-0 backdrop-blur-[2px] transition-all duration-400 group-hover:opacity-100">
                          <div className="h-12 w-12 flex items-center justify-center rounded-xl bg-white/10 border border-white/20 scale-90 group-hover:scale-100 transition-all duration-400">
                            <Maximize2 className="h-5 w-5 text-white drop-shadow-md" />
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {/* CTAs */}
                  <AnimatePresence>
                    {images.length > IMAGES_PER_LOAD && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="mt-10 flex justify-center"
                      >
                        <button
                          onClick={() => setIsExpanded(!isExpanded)}
                          className="group inline-flex items-center gap-2 rounded-xl border border-border-subtle bg-bg-secondary px-6 py-3 text-sm font-black tracking-wide text-text-primary backdrop-blur-md transition-all duration-200 hover:-translate-y-0.5 hover:bg-surface-card-hover hover:border-border-default"
                        >
                          {isExpanded ? (
                            <>Ver menos</>
                          ) : (
                            <>Ver más <span className="opacity-50">({images.length - IMAGES_PER_LOAD})</span></>
                          )}
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Lightbox Cinematic overlay ── */}
      <AnimatePresence>
        {lightbox !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 backdrop-blur-lg p-4"
            onClick={() => setLightbox(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              className="relative max-h-[85vh] max-w-5xl overflow-hidden rounded-[1.5rem] border border-white/10 bg-[#070D17] shadow-[0_32px_80px_rgba(0,0,0,0.8)]"
              onClick={(e) => e.stopPropagation()}
            >
              {(() => {
                const img = images.find((g) => g.id === lightbox);
                if (!img) return null;
                return (
                  <img
                    src={img.src}
                    alt={img.alt}
                    className="h-auto max-h-[85vh] w-auto object-contain select-none"
                  />
                );
              })()}

              <button
                onClick={() => setLightbox(null)}
                className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-xl bg-black/60 backdrop-blur-md text-white border border-white/10 transition-colors hover:bg-black/80 hover:border-white/20"
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
