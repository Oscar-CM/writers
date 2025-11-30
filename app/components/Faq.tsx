"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

export default function FAQSection() {
  const faqs = [
    
    {
      question: "Do I need prior writing experience?",
      answer:
        "No. Whether you're a complete beginner or an experienced writer, WriteMaster provides structured guidance to help you grow your skills and earn consistently.",
    },
    {
      question: "How quickly can I start earning?",
      answer:
        "Most writers begin receiving their first paid assignments within a few days of joining, depending on availability and your readiness to work.",
    },
    {
      question: "How do payments work?",
      answer:
        "Payments are processed within hours after your work is approved. You can withdraw instantly to your M-Pesa wallet or other supported payment methods.",
    },
    {
      question: "What makes WriteMaster different?",
      answer:
        "Unlike typical freelance platforms, we provide mentorship, consistent paid tasks, skill-building resources, and help you connect directly with long-term clients.",
    },
    {
      question: "Can I work from anywhere?",
      answer:
        "Yes! All tasks and trainings are remote. As long as you have internet access, you can learn and work from anywhere in the world.",
    },
  ];

  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section id="faq" className="px-6 sm:px-8 md:px-12 mt-32 max-w-4xl mx-auto">
      <h3 className="text-3xl sm:text-4xl font-bold text-center mb-10">
        Frequently Asked Questions
      </h3>

      <div className="space-y-4">
        {faqs.map((faq, index) => {
          const open = openIndex === index;

          return (
            <div
              key={index}
              className="bg-white/90 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 rounded-xl p-5 shadow-sm"
            >
              <button
                onClick={() => setOpenIndex(open ? null : index)}
                className="w-full flex justify-between items-center text-left"
              >
                <span className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {faq.question}
                </span>

                <motion.div
                  animate={{ rotate: open ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <ChevronDown className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                </motion.div>
              </button>

              <AnimatePresence>
                {open && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <p className="text-gray-700 dark:text-gray-300 mt-3 leading-relaxed">
                      {faq.answer}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </section>
  );
}
