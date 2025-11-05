import React from "react";
import {
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  Mail,
  Phone,
  MapPin,
} from "lucide-react";
import { motion } from "framer-motion";
import FeaturesSection from "./FeaturesSection";

interface FooterProps {
  siteName?: string;
  showSocialMedia?: boolean;
  showNewsletter?: boolean;
  showFeatures?: boolean;
  customLinks?: Array<{ title: string; links: Array<{ name: string; href: string }> }>;
}

export const Footer: React.FC<FooterProps> = ({
  siteName = "TPDSW-Libros",
  showSocialMedia = true,
  showNewsletter = true,
  showFeatures = true,
  customLinks = [],
}) => {
  const defaultLinks = [
    {
      title: "Explorar",
      links: [
        { name: "Libros Populares", href: "#" },
        { name: "Nuevos Lanzamientos", href: "#" },
        { name: "Autores Destacados", href: "#" },
        { name: "Géneros", href: "#" },
        { name: "Listas de Lectura", href: "#" },
      ],
    },
    {
      title: "Comunidad",
      links: [
        { name: "Foro de Discusión", href: "#" },
        { name: "Grupos de Lectura", href: "#" },
        { name: "Mis Listas", href: "#" },
        { name: "Libros Favoritos", href: "#" },
        { name: "Eventos", href: "#" },
        { name: "Reseñadores Destacados", href: "#" },
      ],
    },
    {
      title: "Ayuda",
      links: [
        { name: "Centro de Ayuda", href: "#" },
        { name: "Contacto", href: "#" },
        { name: "Términos de Uso", href: "#" },
        { name: "Política de Privacidad", href: "#" },
        { name: "Preguntas Frecuentes", href: "#" },
      ],
    },
  ];

  const linksToShow = customLinks.length > 0 ? customLinks : defaultLinks;

  const socialMedia = [
    { icon: Facebook, href: "#", label: "Facebook", color: "#3b5998" },
    { icon: Twitter, href: "#", label: "Twitter", color: "#1da1f2" },
    { icon: Instagram, href: "#", label: "Instagram", color: "#e4405f" },
    { icon: Youtube, href: "#", label: "YouTube", color: "#ff0000" },
  ];

  return (
    <>
      <style>{`
        .shine-text {
          background: linear-gradient(
            90deg,
            #39FF14,
            #32CD32,
            #00FF7F,
            #32CD32,
            #39FF14
          );
          background-size: 200% 100%;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: shine 3s linear infinite;
        }

        @keyframes shine {
          0% {
            background-position: 200% 0;
          }
          100% {
            background-position: -200% 0;
          }
        }
      `}</style>

      <footer className="bg-gray-900 dark:bg-gray-950 text-white select-none overflow-hidden relative z-10">
        {showNewsletter && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="bg-gradient-to-r from-blue-200 via-indigo-200 to-purple-200 dark:from-blue-900 dark:via-indigo-900 dark:to-purple-900 py-16 shadow-lg relative overflow-hidden"
          >
            {/* Fondo animado suave */}
            <motion.div
              className="absolute inset-0 opacity-10"
              animate={{
                rotate: [0, 360],
              }}
              transition={{ duration: 120, repeat: Infinity, ease: "linear" }}
              style={{
                background:
                  "radial-gradient(circle at center, rgba(255,255,255,0.6), transparent 70%)",
              }}
            />
            <div className="relative max-w-5xl mx-auto px-6 sm:px-12 text-center text-gray-900 dark:text-gray-100">
              <h3 className="text-3xl font-extrabold tracking-tight mb-4 drop-shadow-sm select-text">
                Mantente al día con las últimas reseñas y novedades
              </h3>
              <p className="max-w-xl mx-auto mb-10 select-text text-gray-700 dark:text-gray-300">
                Recibe recomendaciones exclusivas, lanzamientos y noticias directamente en tu inbox.
              </p>
              <form className="flex flex-col sm:flex-row justify-center gap-4 max-w-md mx-auto">
                <motion.input
                  type="email"
                  placeholder="Tu email"
                  aria-label="Correo electrónico"
                  className="flex-grow rounded-lg px-5 py-3 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 bg-white/95 dark:bg-gray-800/95 backdrop-blur-md focus:outline-none focus:ring-4 focus:ring-indigo-400 dark:focus:ring-indigo-500 focus:ring-opacity-70 transition shadow-md"
                  whileFocus={{ scale: 1.03, boxShadow: "0 0 12px 3px rgba(99,102,241,0.8)" }}
                  transition={{ type: "spring", stiffness: 300 }}
                />
                <motion.button
                  type="submit"
                  className="rounded-lg bg-indigo-600 dark:bg-indigo-500 text-white font-semibold px-8 py-3 hover:bg-indigo-700 dark:hover:bg-indigo-600 shadow-lg transition"
                  whileHover={{ scale: 1.1, boxShadow: "0 0 15px 5px rgba(99,102,241,0.7)" }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  Suscribirse
                </motion.button>
              </form>
            </div>
          </motion.div>
        )}

        {showFeatures && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <FeaturesSection />
          </motion.div>
        )}

        <div className="py-14 max-w-7xl mx-auto px-6 sm:px-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Branding */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="lg:col-span-2 space-y-6"
          >
            {/* Animación pulso para el nombre del sitio con color verde flúor */}
            <motion.h2
              className="text-4xl font-extrabold shine-text select-text cursor-default"
              animate={{
                scale: [1, 1.1, 1],
                opacity: [1, 0.8, 1],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              {siteName}
            </motion.h2>
            <p className="text-gray-400 dark:text-gray-400 max-w-md leading-relaxed select-text">
              Plataforma para descubrir, reseñar y compartir libros. Únete a la comunidad y encuentra tu próxima lectura favorita.
            </p>

            <div className="space-y-3 text-gray-400 dark:text-gray-400">
              {[
                { icon: Mail, text: "contacto@tpdsw.com" },
                { icon: Phone, text: "+54 9 11 1234 5678" },
                { icon: MapPin, text: "Rosario, Argentina" },
              ].map(({ icon: Icon, text }, i) => (
                <motion.div
                  key={i}
                  whileHover={{ scale: 1.1, color: "#fff" }}
                  className="flex items-center gap-3 hover:text-white transition-colors cursor-pointer select-text"
                >
                  <Icon className="w-5 h-5" />
                  <span>{text}</span>
                </motion.div>
              ))}
            </div>

            {showSocialMedia && (
              <div className="flex space-x-6 mt-6">
                {socialMedia.map(({ icon: Icon, href, label, color }, i) => (
                  <motion.a
                    key={i}
                    href={href}
                    aria-label={label}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{
                      scale: 1.3,
                      color: color,
                      textShadow: `0 0 8px ${color}`,
                    }}
                    className="p-3 rounded-lg bg-gray-800 dark:bg-gray-700 hover:bg-gray-700 dark:hover:bg-gray-600 shadow-lg transition flex items-center justify-center"
                  >
                    <Icon className="w-6 h-6" />
                  </motion.a>
                ))}
              </div>
            )}
          </motion.div>

          {/* Links Section con interacción mejorada sin subrayado pero interactiva */}
          {linksToShow.map(({ title, links }, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: idx * 0.1 }}
              viewport={{ once: true }}
            >
              <h3 className="text-lg font-semibold mb-6 text-gray-300 dark:text-gray-300 select-text">{title}</h3>
              <ul className="space-y-4">
                {links.map(({ name, href }, i) => (
                  <motion.li
                    key={i}
                    initial={{ x: 0 }}
                    whileHover={{ scale: 1.05, x: 6 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ type: "spring", stiffness: 300 }}
                    className="cursor-pointer flex items-center gap-2 select-text"
                    title={`Ir a ${name}`}
                  >
                    <a
                      href={href}
                      className="flex items-center gap-1 text-gray-400 dark:text-gray-400 hover:text-blue-400 dark:hover:text-blue-400 transition-colors duration-200 no-underline"
                    >
                      {name}
                      <motion.span
                        initial={{ opacity: 0, x: -6 }}
                        whileHover={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.25, ease: "easeInOut" }}
                        aria-hidden="true"
                        className="text-blue-400"
                      >
                        →
                      </motion.span>
                    </a>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 dark:border-gray-700 py-6">
          <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center text-gray-500 dark:text-gray-400 text-sm select-text">
            <p>© 2025 TPDSW-COM304. Todos los derechos reservados.</p>
            <nav className="flex space-x-8 mt-3 md:mt-0">
              {["Política de Cookies", "Accesibilidad", "Sitemap"].map(
                (link, i) => (
                  <a
                    key={i}
                    href="#"
                    className="hover:text-white transition-colors duration-200 cursor-pointer select-text"
                  >
                    {link}
                  </a>
                )
              )}
            </nav>
          </div>
        </div>
      </footer>
    </>
  );
};
