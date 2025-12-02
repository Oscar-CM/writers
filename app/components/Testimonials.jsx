"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function ReviewsSection() {
  const reviews = [
    { name: "Mary Wamboi", role: "Professional Writer", rating: 5, comment: "WriteMaster has completely transformed the way I approach AI-assisted writing. Highly recommended!" },
    { name: "John Smith", role: "Content Creator", rating: 4, comment: "The tools and community here are amazing. I’ve learned so much about modern writing and AI collaboration." },
    { name: "Kibet Michael", role: "Copywriter", rating: 5, comment: "I love the structured tutorials and real-world examples. WriteMaster is a must for any serious writer!" },
    { name: "Alex Lee", role: "Freelance Writer", rating: 4, comment: "The AI tools are intuitive and help me save hours of work while improving quality." },
    { name: "Sophia Brown", role: "Editor", rating: 5, comment: "The community support is outstanding. I feel motivated to improve my writing every day!" },
    { name: "Michael Davis", role: "Blogger", rating: 5, comment: "Excellent tutorials and resources. WriteMaster is a must-have for serious writers." }
  ];

  const [startIndex, setStartIndex] = useState(0);

  const reviewsPerPage = 3;

  const handlePrev = () => {
    setStartIndex((prev) =>
      prev - reviewsPerPage < 0 ? reviews.length - reviewsPerPage : prev - reviewsPerPage
    );
  };

  const handleNext = () => {
    setStartIndex((prev) =>
      prev + reviewsPerPage >= reviews.length ? 0 : prev + reviewsPerPage
    );
  };

  const currentReviews = reviews.slice(startIndex, startIndex + reviewsPerPage);

  return (
    <section className="relative py-10 px-6 sm:px-8 md:px-12 bg-gray-50 dark:bg-gray-900">
      <h2 className="text-4xl sm:text-5xl font-extrabold text-center text-gray-900 dark:text-white mb-12">
        What Our Users Say
      </h2>

      <div className="relative max-w-6xl mx-auto">
        {/* Left Arrow */}
        <button
          onClick={handlePrev}
          className="absolute left-0 top-1/2 -translate-y-1/2 bg-white dark:bg-gray-800 p-2 rounded-full shadow-md hover:bg-gray-100 dark:hover:bg-gray-700 transition z-10"
        >
          <ChevronLeft className="w-6 h-6 text-gray-700 dark:text-gray-100" />
        </button>

        {/* Right Arrow */}
        <button
          onClick={handleNext}
          className="absolute right-0 top-1/2 -translate-y-1/2 bg-white dark:bg-gray-800 p-2 rounded-full shadow-md hover:bg-gray-100 dark:hover:bg-gray-700 transition z-10"
        >
          <ChevronRight className="w-6 h-6 text-gray-700 dark:text-gray-100" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {currentReviews.map((review, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-6 rounded-2xl shadow-lg hover:shadow-2xl transition transform hover:-translate-y-2"
            >
              <p className="text-gray-700 dark:text-gray-300 mb-4">{review.comment}</p>
              <div className="flex items-center gap-2">
                {Array.from({ length: 5 }).map((_, idx) => (
                  <svg
                    key={idx}
                    className={`w-5 h-5 ${
                      idx < review.rating ? "text-yellow-400" : "text-gray-300 dark:text-gray-600"
                    }`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.957a1 1 0 00.95.69h4.163c.969 0 1.371 1.24.588 1.81l-3.37 2.448a1 1 0 00-.364 1.118l1.287 3.957c.3.922-.755 1.688-1.54 1.118l-3.37-2.448a1 1 0 00-1.176 0l-3.37 2.448c-.784.57-1.838-.196-1.539-1.118l1.287-3.957a1 1 0 00-.364-1.118L2.064 9.384c-.783-.57-.38-1.81.588-1.81h4.163a1 1 0 00.95-.69l1.286-3.957z" />
                  </svg>
                ))}
                <span className="text-gray-600 dark:text-gray-400 text-sm font-medium ml-2">{review.name}</span>
              </div>
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">{review.role}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
