"use client";

import { motion } from "framer-motion";

export default function JoinUsSection() {
  const items = [
    {
      title: "Make Money As You Learn",
      description:
        "No more struggling to find your first writing gig. As a mentored writer, you’ll receive real paid assignments from our network of global clients—allowing you to grow your skills while earning from day one.",
    },
    {
      title: "Fast & Reliable Payments",
      description:
        "Submit your work and get paid quickly. Earnings are credited to your account within hours, and you can withdraw anytime directly to your M-Pesa wallet—simple, fast, and stress-free.",
    },
    {
      title: "Consistent Flow of Work",
      description:
        "We connect you directly with clients who need dependable writers. With steady tasks, transparent rates, and guaranteed payouts, you can build a predictable monthly income doing what you love.",
    },
    {
      title: "Get Access to Direct Clients",
      description:
        "We help you become more than just a freelancer—we help you build a writing career. Our team guides you on how to pitch, negotiate, and secure long-term clients who value and pay for quality work.",
    },
  ];

  return (
    <section
      id="join-us"
      className="px-6 sm:px-8 md:px-12 mt-32 max-w-6xl mx-auto"
    >
      <motion.h3
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
        className="text-3xl sm:text-4xl font-bold text-center mb-14"
      >
        Why Join Us?
      </motion.h3>

      <div className="grid sm:grid-cols-1 md:grid-cols-2 gap-10">
        {items.map((item, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
            className="p-6 rounded-2xl bg-white/90 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 shadow-md hover:shadow-xl transition"
          >
            <h4 className="text-2xl font-semibold text-[#FF7A00] mb-3">
              {item.title}
            </h4>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              {item.description}
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
