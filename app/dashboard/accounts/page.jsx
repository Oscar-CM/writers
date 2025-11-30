// Updated Accounts Section
// Removed upload account icons
// Added WhatsApp contact numbers
// Added note for user inquiries
// Popup updated to include contact info
"use client"

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function AccountsSection() {
  const accountsData = [
    {
      name: "4writers",
      description: "2 takes university • 3000+ orders • Last order scored 30k",
      price: 30000,
      category: "Academic",
      rating: "Used",
      level: "Used",
      posted: "2025-02-01",
    },
    {
      name: "Writerslabs",
      description: "1600+ orders • Access to Masters orders • Rated 93% • Active orders in progress",
      price: 60000,
      category: "Academic",
      rating: "Used",
      level: "Used",
      posted: "2025-01-28",
    },
  ];

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [ratingFilter, setRatingFilter] = useState("");
  const [selected, setSelected] = useState(null);

  const filtered = useMemo(() => {
    return accountsData.filter((acc) => {
      const matchSearch = acc.name.toLowerCase().includes(search.toLowerCase());
      const matchCategory = categoryFilter ? acc.category === categoryFilter : true;
      const matchRating = ratingFilter ? acc.rating === ratingFilter : true;
      return matchSearch && matchCategory && matchRating;
    });
  }, [search, categoryFilter, ratingFilter]);

  const daysAgo = (date) => {
    const diff = Math.floor((new Date() - new Date(date)) / (1000 * 60 * 60 * 24));
    return diff === 0 ? "Today" : `${diff} day(s) ago`;
  };

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-gray-800 mb-4">Available Accounts</h2>

      {/* Contact Notice */}
      <div className="p-4 bg-green-100 border border-green-300 rounded-xl text-green-900 shadow">
        For inquiries or assistance, reach our account managers anytime on WhatsApp:
        <br />
        <strong>UK:</strong> +44 7658 889 87 &nbsp; | &nbsp;
        <strong>Kenya:</strong> +254 722 808 825
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <input
          type="text"
          placeholder="Search accounts..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 px-4 py-3 border rounded-lg"
        />

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-4 py-3 border rounded-lg"
        >
          <option value="">All Categories</option>
          <option value="Academic">Academic</option>
        </select>

        <select
          value={ratingFilter}
          onChange={(e) => setRatingFilter(e.target.value)}
          className="px-4 py-3 border rounded-lg"
        >
          <option value="">All Ratings</option>
          <option value="Used">Used</option>
        </select>
      </div>

      {/* Account Cards */}
      <div className="grid md:grid-cols-2 gap-6">
        {filtered.map((acc, i) => (
          <motion.div
            key={i}
            className="p-6 bg-white border rounded-xl shadow hover:shadow-lg cursor-pointer"
            onClick={() => setSelected(acc)}
          >
            <h3 className="text-xl font-semibold text-gray-800">{acc.name}</h3>
            <p className="text-gray-600 my-2">{acc.description}</p>
            <p className="font-semibold text-[#FF7A00] text-lg">KES {acc.price.toLocaleString()}</p>
            <p className="text-sm text-gray-500 mt-2">Posted: {daysAgo(acc.posted)}</p>
          </motion.div>
        ))}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            onClick={() => setSelected(null)}
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white p-6 rounded-xl shadow-xl max-w-md w-full"
            >
              <h3 className="text-2xl font-bold text-gray-800 mb-2">{selected.name}</h3>
              <p className="text-gray-600 mb-4">{selected.description}</p>
              <p><strong>Price:</strong> KES {selected.price.toLocaleString()}</p>
              <p><strong>Category:</strong> {selected.category}</p>
              <p><strong>Rating:</strong> {selected.rating}</p>
              <p><strong>Level:</strong> {selected.level}</p>
              <p className="text-sm text-gray-500 mt-2">Posted {daysAgo(selected.posted)}</p>

              <div className="mt-4 p-4 bg-green-100 border border-green-300 rounded-lg text-green-900">
                Contact account managers on WhatsApp: <br />
                <strong>UK:</strong> +44 7658 889 87<br />
                <strong>Kenya:</strong> +254 722 808 825<br /><br />
                <span className="font-semibold">To purchase this account, please contact the Kenya line: +254 722 808 825</span>
              </div>

              <button
                onClick={() => setSelected(null)}
                className="mt-4 w-full py-3 bg-[#FF7A00] text-white rounded-lg font-semibold"
              >
                Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
