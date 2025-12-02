
"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";

export default function ExtrasSection() {
  const [search, setSearch] = useState("");
  const [userEmail, setUserEmail] = useState("oscarcheruiyot3@gmail.com");

  const [numbers, setNumbers] = useState([
    { country: "USA", provider: "AT&T", price: 800, number: "Random", badge: "", badgeColor: "", badgeTooltip: "", outOfStock: false },
    { country: "UK", provider: "Vodafone", price: 700, number: "Random", badge: "", badgeColor: "", badgeTooltip: "", outOfStock: false },
    { country: "Canada", provider: "Rogers", price: 750, number: "Random", badge: "", badgeColor: "", badgeTooltip: "", outOfStock: false },
    { country: "Australia", provider: "Telstra", price: 900, number: "Random", badge: "", badgeColor: "", badgeTooltip: "", outOfStock: false },
    { country: "Germany", provider: "T-Mobile", price: 850, number: "Random", badge: "", badgeColor: "", badgeTooltip: "", outOfStock: false },
  ]);

  const filtered = useMemo(
    () =>
      numbers.filter(
        (item) =>
          item.country.toLowerCase().includes(search.toLowerCase()) ||
          item.provider.toLowerCase().includes(search.toLowerCase())
      ),
    [numbers, search]
  );

  const sendWhatsApp = (item) => {
    const message = `Hello, I'm interested in purchasing this number:\n\n` +
      `🌎 Country: ${item.country}\n` +
      `📶 Provider: ${item.provider}\n` +
      `💰 Price: KES ${item.price}\n` +
      `☎️ Number: ${item.number}\n\nPlease provide details.`;
    const url = `https://wa.me/254722808825?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
  };

  const handleBadgeChange = (item, value) => {
    const colorMap = {
      "Quick Sale": "bg-orange-500",
      "Black Friday Deal": "bg-purple-600",
      "Almost Out": "bg-red-600",
      "Not Currently Available": "bg-gray-400",
      "Nothing": ""
    };

    const tooltipMap = {
      "Quick Sale": "Hurry! Quick Sale, grab it before it’s gone!",
      "Black Friday Deal": "Limited time Black Friday deal!",
      "Almost Out": "Almost out of stock, act fast!",
      "Not Currently Available": "Currently unavailable, check back later",
      "Nothing": ""
    };

    setNumbers((prev) =>
      prev.map((n) =>
        n.country === item.country && n.provider === item.provider
          ? {
              ...n,
              badge: value === "Nothing" ? "" : value,
              badgeColor: colorMap[value],
              badgeTooltip: tooltipMap[value],
              outOfStock: value === "Not Currently Available",
            }
          : n
      )
    );
  };

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-gray-800 mb-4">International Phone Numbers for Sale</h2>

      {/* WhatsApp Banner */}
      <div className="p-4 bg-green-100 border border-green-300 rounded-xl text-green-900 shadow text-sm">
        For purchases or inquiries, contact us anytime on WhatsApp:<br />
        <strong>UK:</strong> +44 7658 889 87 &nbsp; | &nbsp;
        <strong>Kenya:</strong> +254 722 808 825
      </div>

      {/* Search */}
      <input
        type="text"
        placeholder="Search by country or provider..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full px-4 py-3 border rounded-lg mb-4"
      />

      {/* Items Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: i * 0.05 }}
            className="p-5 bg-white border rounded-xl shadow hover:shadow-lg relative"
          >
            {/* Badge Tooltip */}
            {item.badge && (
              <div className="absolute top-3 right-3 group">
                <span className={`text-xs text-white px-3 py-1 rounded-full ${item.badgeColor}`}>
                  {item.badge}
                </span>
                <div className="absolute top-full mt-1 left-1/2 -translate-x-1/2 w-max bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
                  {item.badgeTooltip}
                </div>
              </div>
            )}

            <h3 className="text-lg font-semibold text-gray-900">{item.country}</h3>
            <p className="text-gray-600">Provider: {item.provider}</p>
            <p className="font-mono text-gray-700 mt-1">{item.number}</p>
            <p className="text-[#FF7A00] text-xl font-bold mt-3">KES {item.price}</p>

            {/* Buy Button */}
            <button
              disabled={item.outOfStock}
              onClick={() => sendWhatsApp(item)}
              className={`mt-4 w-full py-2 text-white rounded-lg font-semibold ${
                item.outOfStock
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-green-600 hover:bg-green-700"
              }`}
            >
              {item.outOfStock ? "Not Currently Available" : "Buy"}
            </button>

            {/* Admin Badge Dropdown */}
            {userEmail === "oscarcheruiyot3@gmail.com" && (
              <select
                className="mt-2 w-full px-2 py-1 border rounded-lg text-sm"
                value={item.badge || "Nothing"}
                onChange={(e) => handleBadgeChange(item, e.target.value)}
              >
                <option>Nothing</option>
                <option>Quick Sale</option>
                <option>Black Friday Deal</option>
                <option>Almost Out</option>
                <option>Not Currently Available</option>
              </select>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
