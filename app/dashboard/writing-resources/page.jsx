"use client";

import { useEffect, useState } from "react";
import { Loader2, Lock, BookOpen, CheckCircle, Smartphone } from "lucide-react";

const POLL_INTERVAL = 5000;

const resources = [
  {
    title: "Mastering Academic Writing",
    description: "A complete guide to essay structure, citations, and argumentation for higher grades.",
    tag: "Academic",
    color: "bg-blue-50 border-blue-200",
    tagColor: "bg-blue-100 text-blue-700",
  },
  {
    title: "SEO Content Writing Guide",
    description: "Learn keyword research, on-page SEO, and how to write content that ranks on Google.",
    tag: "SEO",
    color: "bg-green-50 border-green-200",
    tagColor: "bg-green-100 text-green-700",
  },
  {
    title: "Freelance Writing Toolkit",
    description: "Templates, pitch scripts, rate cards, and client management tips for freelancers.",
    tag: "Freelance",
    color: "bg-purple-50 border-purple-200",
    tagColor: "bg-purple-100 text-purple-700",
  },
  {
    title: "AI Writing Integration",
    description: "How to ethically use AI tools (ChatGPT, Claude, Gemini) to speed up your workflow.",
    tag: "AI",
    color: "bg-orange-50 border-orange-200",
    tagColor: "bg-orange-100 text-orange-700",
  },
  {
    title: "Copywriting Fundamentals",
    description: "Headlines, hooks, CTAs, and persuasion principles used by top copywriters.",
    tag: "Copywriting",
    color: "bg-pink-50 border-pink-200",
    tagColor: "bg-pink-100 text-pink-700",
  },
  {
    title: "Research & Citation Mastery",
    description: "APA, MLA, Harvard citation styles with step-by-step examples and common pitfalls.",
    tag: "Research",
    color: "bg-teal-50 border-teal-200",
    tagColor: "bg-teal-100 text-teal-700",
  },
];

export default function WritingResourcesPage() {
  const [hasAccess, setHasAccess] = useState(null); // null = loading
  const [resourcesFee, setResourcesFee] = useState(500);
  const [phone, setPhone] = useState("");
  const [stage, setStage] = useState("idle"); // idle | sending | waiting | success | failed
  const [message, setMessage] = useState("");
  const [transactionRequestId, setTransactionRequestId] = useState(null);
  const [purchaseId, setPurchaseId] = useState(null);

  useEffect(() => {
    fetch("/api/resources/access").then(r => r.json()).then(d => setHasAccess(d.hasAccess));
    fetch("/api/settings").then(r => r.json()).then(d => setResourcesFee(d.resourcesFee));
  }, []);

  // Poll after STK push
  useEffect(() => {
    if (stage !== "waiting" || !transactionRequestId) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch("/api/pay/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ transactionRequestId, purchaseId }),
        });
        const data = await res.json();

        if (data.status === "COMPLETED") {
          clearInterval(interval);
          setStage("success");
          setHasAccess(true);
        } else if (data.status === "FAILED") {
          clearInterval(interval);
          setStage("failed");
          setMessage("❌ Payment was not completed. Please try again.");
        }
      } catch (err) {
        console.error(err);
      }
    }, POLL_INTERVAL);

    return () => clearInterval(interval);
  }, [stage, transactionRequestId, purchaseId]);

  const initiatePayment = async () => {
    let p = phone.trim().replace(/\s+/g, "");
    if (p.startsWith("0")) p = "254" + p.slice(1);
    else if (p.startsWith("+")) p = p.slice(1);
    if (!/^254\d{9}$/.test(p)) {
      setMessage("❌ Enter a valid number: 07XXXXXXXX or 2547XXXXXXXX");
      return;
    }

    setStage("sending");
    setMessage("");

    const res = await fetch("/api/pay/stk", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone: p, productType: "resources" }),
    });
    const data = await res.json();

    if (!res.ok || !data.success) {
      setStage("failed");
      setMessage("❌ " + (data.error || "STK push failed. Try again."));
      return;
    }

    setTransactionRequestId(data.transactionRequestId);
    setPurchaseId(data.purchaseId);
    setStage("waiting");
  };

  // Loading state
  if (hasAccess === null) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={32} className="animate-spin text-gray-400" />
      </div>
    );
  }

  // LOCKED — show paywall
  if (!hasAccess && stage !== "success") {
    return (
      <div className="max-w-lg mx-auto space-y-6 py-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Writing Resources</h1>
          <p className="text-sm text-gray-500 mt-1">Premium guides and tools for WriteMaster members</p>
        </div>

        {/* Preview (blurred) */}
        <div className="relative rounded-xl overflow-hidden border border-gray-200">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 blur-sm pointer-events-none select-none">
            {resources.slice(0, 4).map((r) => (
              <div key={r.title} className={`p-3 rounded-lg border ${r.color}`}>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${r.tagColor}`}>{r.tag}</span>
                <p className="font-semibold text-sm text-gray-800 mt-2">{r.title}</p>
              </div>
            ))}
          </div>
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm">
            <Lock size={32} className="text-gray-500 mb-2" />
            <p className="font-bold text-gray-800">Unlock Writing Resources</p>
            <p className="text-sm text-gray-500 mt-1">One-time payment of <strong>KES {resourcesFee}</strong></p>
          </div>
        </div>

        {/* Payment form */}
        {(stage === "idle" || stage === "failed") && (
          <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
            <div className="flex items-center gap-2">
              <Smartphone size={20} className="text-green-600" />
              <p className="font-semibold text-gray-800">Pay KES {resourcesFee} via M-Pesa</p>
            </div>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="07XXXXXXXX or 2547XXXXXXXX"
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#FF7A00] outline-none text-sm"
            />
            {message && (
              <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{message}</p>
            )}
            <button
              onClick={initiatePayment}
              className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl transition flex items-center justify-center gap-2"
            >
              <Smartphone size={18} /> Unlock Resources — KES {resourcesFee}
            </button>
            <p className="text-xs text-gray-400 text-center">One-time payment. Resources unlocked permanently on your account.</p>
          </div>
        )}

        {stage === "sending" && (
          <div className="bg-white border border-gray-200 rounded-xl p-8 text-center space-y-3">
            <Loader2 size={36} className="animate-spin text-[#FF7A00] mx-auto" />
            <p className="font-semibold text-gray-700">Sending STK push...</p>
          </div>
        )}

        {stage === "waiting" && (
          <div className="bg-white border border-green-200 rounded-xl p-8 text-center space-y-4">
            <div className="text-4xl">📱</div>
            <h2 className="font-bold text-gray-800 text-lg">Check Your Phone</h2>
            <p className="text-sm text-gray-600">
              Enter your <strong>M-Pesa PIN</strong> to pay <strong>KES {resourcesFee}</strong>.
            </p>
            <div className="flex items-center justify-center gap-2 text-sm text-amber-600 bg-amber-50 rounded-lg px-3 py-2">
              <Loader2 size={14} className="animate-spin" />
              Waiting for confirmation...
            </div>
            <p className="text-xs text-gray-400">Do not close this page.</p>
          </div>
        )}
      </div>
    );
  }

  // UNLOCKED — show full resources
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Writing Resources</h1>
        <p className="text-sm text-gray-500 mt-1">Premium guides and materials for WriteMaster members</p>
      </div>

      {(stage === "success" || hasAccess) && (
        <div className="flex items-center gap-2 text-green-700 bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-sm font-medium">
          <CheckCircle size={18} />
          Resources unlocked — full access granted
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {resources.map((r) => (
          <div key={r.title} className={`p-5 rounded-xl border ${r.color} hover:shadow-md transition`}>
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${r.tagColor}`}>{r.tag}</span>
            <div className="flex items-start gap-2 mt-3">
              <BookOpen size={18} className="text-gray-500 mt-0.5 shrink-0" />
              <div>
                <p className="font-bold text-gray-900 text-sm leading-snug">{r.title}</p>
                <p className="text-xs text-gray-600 mt-1">{r.description}</p>
              </div>
            </div>
            <button className="mt-4 w-full py-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 text-sm font-medium rounded-lg transition">
              Open Resource →
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
