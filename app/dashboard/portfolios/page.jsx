"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const projects = [
  {
    title: "Exquisite and Perfect",
    image: "/Capture1.PNG",
    url: "https://reeni-wp.laralink.com/home-v4/",
    price: "Ksh 5,000",
  },
  {
    title: "Perfect Path Out",
    image: "/Capture3.PNG",
    url: "https://reeni-wp.laralink.com/home-v17/",
    price: "Ksh 6,000",
  },
  {
    title: "Minimalistic Personal Portfolio",
    image: "/Capture2.PNG",
    url: "https://reeni-wp.laralink.com/home-v10/",
    price: "Ksh 5,000",
  },
];

export default function PortfolioShowcase() {
  const [activeProject, setActiveProject] = useState(null);

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") setActiveProject(null);
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, []);

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900 px-3 py-8 sm:px-4 sm:py-12">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-2xl sm:text-4xl md:text-5xl font-bold mb-3 tracking-tight"
        >
          Master Writers Portfolios
        </motion.h1>

        <p className="text-neutral-600 max-w-3xl mb-4 text-sm sm:text-base">
          Ready-made portfolio websites to help you attract clients fast.
        </p>

        {/* Info banner – compact */}
        <div className="bg-white border border-neutral-200 rounded-xl p-3 mb-6 shadow-sm text-xs sm:text-sm">
          <p className="text-neutral-700">
            📩 Contact
            <a href="mailto:info@masterwriters.org" className="font-medium underline ml-1">
              info@masterwriters.org
            </a>
            for payment plans & customization.
          </p>
          <p className="text-neutral-700 mt-1">
            ⭐ Active members get <span className="font-semibold">10% OFF</span>.
          </p>
        </div>

        {/* Portfolio grid – shows early on mobile */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {projects.map((project, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
              whileHover={{ y: -4 }}
              className="cursor-pointer"
              onClick={() => setActiveProject(project)}
            >
              <div className="bg-white border border-neutral-200 rounded-2xl overflow-hidden shadow-md">
                {/* Laptop frame – mobile optimized */}
                <div className="bg-neutral-100 p-2 sm:p-3">
                  <div className="flex gap-1.5 mb-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
                    <span className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                    <span className="w-2.5 h-2.5 rounded-full bg-green-400" />
                  </div>

                  <div className="rounded-lg overflow-hidden border border-neutral-300 bg-black">
                    <img
                      src={project.image}
                      alt={project.title}
                      className="w-full object-contain"
                    />
                  </div>
                </div>

                {/* Info */}
                <div className="p-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm sm:text-base font-semibold">
                      {project.title}
                    </h3>
                    <span className="text-xs sm:text-sm font-semibold text-neutral-800">
                      {project.price}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-500 mt-1">
                    Tap to preview
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Fullscreen Preview Modal – mobile friendly */}
      <AnimatePresence>
        {activeProject && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 p-3 sm:p-6"
            onClick={() => setActiveProject(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="relative bg-white rounded-xl p-3 sm:p-6 max-w-5xl mx-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setActiveProject(null)}
                className="absolute top-3 right-3 text-neutral-600 text-lg"
              >
                ✕
              </button>

              <img
                src={activeProject.image}
                alt={activeProject.title}
                className="w-full max-h-[60vh] object-contain rounded-lg bg-neutral-100"
              />

              <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <h2 className="text-lg sm:text-2xl font-semibold">
                    {activeProject.title}
                  </h2>
                  <p className="text-sm text-neutral-600">
                    {activeProject.price} · 10% member discount
                  </p>
                  <p className="text-xs text-neutral-500 mt-1">
                    Email info@masterwriters.org for payment plans
                  </p>
                </div>

                <a
                  href={activeProject.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex justify-center rounded-lg bg-neutral-900 text-white px-5 py-2 text-sm font-medium"
                >
                  Visit Live →
                </a>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
