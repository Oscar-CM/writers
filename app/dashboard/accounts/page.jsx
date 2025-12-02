"use client";

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
      badge: "Quick Sale",
      badgeColor: "bg-orange-500",
      badgeTooltip: "Hurry! Quick Sale, grab it before it’s gone!",
      outOfStock: false,
    },
    {
      name: "Writerslabs",
      description:
        "1600+ orders • Access to Masters orders • Rated 93% • Active orders",
      price: 60000,
      category: "Academic",
      rating: "Used",
      level: "Used",
      posted: "2025-01-28",
      badge: "Almost Out",
      badgeColor: "bg-red-600",
      badgeTooltip: "Almost out of stock, act fast!",
      outOfStock: true,
    },
  ];

  const [userEmail, setUserEmail] = useState("oscarcheruiyot3@gmail.com");
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [ratingFilter, setRatingFilter] = useState("");
  const [accounts, setAccounts] = useState(accountsData);
  const [selected, setSelected] = useState(null);

  const filtered = useMemo(() => {
    return accounts.filter((acc) => {
      const matchSearch = acc.name.toLowerCase().includes(search.toLowerCase());
      const matchCategory = categoryFilter
        ? acc.category === categoryFilter
        : true;
      const matchRating = ratingFilter ? acc.rating === ratingFilter : true;
      return matchSearch && matchCategory && matchRating;
    });
  }, [accounts, search, categoryFilter, ratingFilter]);

  const daysAgo = (date) => {
    const diff = Math.floor(
      (new Date() - new Date(date)) / (1000 * 60 * 60 * 24)
    );
    return diff === 0 ? "Today" : `${diff} day(s) ago`;
  };

  const sendWhatsApp = (acc) => {
    const message =
      `Hello, I'm interested in buying this account:\n\n` +
      `🧾 *${acc.name}*\n` +
      `💰 Price: KES ${acc.price.toLocaleString()}\n` +
      `📌 Category: ${acc.category}\n\n` +
      `Please share more details.`;

    const url =
      "https://wa.me/254722808825?text=" + encodeURIComponent(message);

    window.open(url, "_blank");
  };

  const handleBadgeChange = (acc, value) => {
    const colorMap = {
      "Quick Sale": "bg-orange-500",
      "Black Friday Deal": "bg-purple-600",
      "Almost Out": "bg-red-600",
      "Not Currently Available": "bg-gray-400",
    };

    const tooltipMap = {
      "Quick Sale": "Hurry! Quick Sale, grab it before it’s gone!",
      "Black Friday Deal": "Limited time Black Friday deal!",
      "Almost Out": "Almost out of stock, act fast!",
      "Not Currently Available": "Currently unavailable, check back later",
    };

    setAccounts((prev) =>
      prev.map((a) =>
        a.name === acc.name
          ? {
              ...a,
              badge: value,
              badgeColor: colorMap[value],
              badgeTooltip: tooltipMap[value],
              outOfStock: value === "Not Currently Available",
            }
          : a
      )
    );
  };

  return (
    <div className="space-y-6 pb-10">
      <h2 className="text-3xl font-bold text-gray-800 mb-4">Available Accounts</h2>

      {/* Contact Box */}
      <div className="p-4 bg-green-100 border border-green-300 rounded-xl text-green-900 shadow text-sm">
        For inquiries, contact our account managers anytime:
        <br />
        <strong>UK:</strong> +44 7658 889 87 &nbsp; | &nbsp;
        <strong>Kenya:</strong> +254 722 808 825
      </div>

      {/* Search + Filter */}
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

      {/* Product Cards */}
      <div className="grid md:grid-cols-2 gap-6">
        {filtered.map((acc, i) => (
          <motion.div
            key={i}
            className="p-5 bg-white border rounded-xl shadow-sm hover:shadow-md transition relative"
            onClick={() => setSelected(acc)}
          >
            {/* Badge with Tooltip */}
            {acc.badge && (
              <div className="absolute top-3 right-3 group">
                <span
                  className={`text-xs text-white px-3 py-1 rounded-full ${acc.badgeColor}`}
                >
                  {acc.badge}
                </span>
                <div className="absolute top-full mt-1 left-1/2 -translate-x-1/2 w-max bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
                  {acc.badgeTooltip}
                </div>
              </div>
            )}

            <h3 className="text-xl font-semibold text-gray-800">{acc.name}</h3>
            <p className="text-gray-600 text-sm mt-1 line-clamp-2">{acc.description}</p>

            <p className="font-bold text-[#FF7A00] text-lg mt-3">
              KES {acc.price.toLocaleString()}
            </p>
            <p className="text-xs text-gray-500 mt-1">Posted: {daysAgo(acc.posted)}</p>

            {/* Buy Button */}
            <button
              disabled={acc.outOfStock}
              onClick={(e) => {
                e.stopPropagation();
                if (!acc.outOfStock) sendWhatsApp(acc);
              }}
              className={`mt-4 w-full py-2 text-white rounded-lg text-sm font-semibold transition ${
                acc.outOfStock
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-green-600 hover:bg-green-700"
              }`}
            >
              {acc.outOfStock ? "Not Currently Available" : "Buy Now"}
            </button>

            {/* Admin Badge Dropdown */}
            {userEmail === "oscarcheruiyot3@gmail.com" && (
              <select
                className="mt-2 w-full px-2 py-1 border rounded-lg text-sm"
                value={acc.badge}
                onChange={(e) => handleBadgeChange(acc, e.target.value)}
              >
                <option>Quick Sale</option>
                <option>Black Friday Deal</option>
                <option>Almost Out</option>
                <option>Not Currently Available</option>
              </select>
            )}
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
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={() => setSelected(null)}
          >
            <motion.div
              initial={{ scale: 0.85 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.85 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white p-6 rounded-xl shadow-xl max-w-md w-full"
            >
              <h3 className="text-2xl font-bold text-gray-800 mb-2">{selected.name}</h3>

              {selected.badge && (
                <span
                  className={`text-xs px-3 py-1 rounded-full text-white ${selected.badgeColor}`}
                  title={selected.badgeTooltip}
                >
                  {selected.badge}
                </span>
              )}

              <p className="text-gray-600 mt-3">{selected.description}</p>

              <div className="mt-4 space-y-2 text-sm">
                <p><strong>Price:</strong> KES {selected.price.toLocaleString()}</p>
                <p><strong>Category:</strong> {selected.category}</p>
                <p><strong>Rating:</strong> {selected.rating}</p>
                <p><strong>Level:</strong> {selected.level}</p>
                <p className="text-gray-500 text-xs">
                  Posted {daysAgo(selected.posted)}
                </p>
              </div>

              <button
                disabled={selected.outOfStock}
                onClick={() => sendWhatsApp(selected)}
                className={`mt-5 w-full py-3 rounded-lg font-semibold text-white ${
                  selected.outOfStock
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-green-600 hover:bg-green-700"
                }`}
              >
                {selected.outOfStock ? "Not Currently Available" : "Buy via WhatsApp"}
              </button>

              <button
                onClick={() => setSelected(null)}
                className="mt-3 w-full py-2 bg-gray-200 rounded-lg font-semibold"
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
