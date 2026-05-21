"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2, CheckCircle, AlertTriangle, Smartphone, ShieldCheck } from "lucide-react";

const POLL_INTERVAL = 5000; // 5 seconds

export default function ActivationPage() {
  const router = useRouter();
  const [profile, setProfile] = useState(null);
  const [settings, setSettings] = useState({ activationFee: 700, activationDescription: "" });
  const [phone, setPhone] = useState("");
  const [stage, setStage] = useState("idle"); // idle | sending | waiting | success | failed
  const [message, setMessage] = useState("");
  const [transactionRequestId, setTransactionRequestId] = useState(null);
  const [purchaseId, setPurchaseId] = useState(null);

  useEffect(() => {
    fetch("/api/profile").then(r => r.json()).then(d => setProfile(d.profile));
    fetch("/api/settings").then(r => r.json()).then(d => setSettings(d));
  }, []);

  // Poll for payment status when waiting
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
          setMessage("🎉 Payment confirmed! Your account is now activated.");
          // Refresh profile then redirect
          setTimeout(() => router.push("/dashboard"), 2500);
        } else if (data.status === "FAILED") {
          clearInterval(interval);
          setStage("failed");
          setMessage("❌ Payment was not completed. Please try again.");
        }
        // else still PENDING — keep polling
      } catch (err) {
        console.error("Poll error:", err);
      }
    }, POLL_INTERVAL);

    return () => clearInterval(interval);
  }, [stage, transactionRequestId, purchaseId, router]);

  const initiatePayment = async () => {
    // Normalize phone
    let p = phone.trim().replace(/\s+/g, "");
    if (p.startsWith("0")) p = "254" + p.slice(1);
    else if (p.startsWith("+")) p = p.slice(1);

    if (!/^254\d{9}$/.test(p)) {
      setMessage("❌ Enter a valid Kenyan number: 07XXXXXXXX or 2547XXXXXXXX");
      return;
    }

    setStage("sending");
    setMessage("");

    const res = await fetch("/api/pay/stk", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone: p, productType: "activation" }),
    });

    const data = await res.json();

    if (!res.ok || !data.success) {
      setStage("failed");
      setMessage("❌ " + (data.error || "STK push failed. Please try again."));
      return;
    }

    setTransactionRequestId(data.transactionRequestId);
    setPurchaseId(data.purchaseId);
    setStage("waiting");
    setMessage("📱 STK push sent to " + p + ". Enter your M-Pesa PIN on your phone to complete payment.");
  };

  if (!profile) return <p className="text-gray-500 text-center mt-10">Loading...</p>;

  if (profile.activated) {
    return (
      <div className="max-w-md mx-auto space-y-6 text-center py-10">
        <CheckCircle size={56} className="text-green-500 mx-auto" />
        <h1 className="text-2xl font-bold text-gray-800">Account Activated</h1>
        <p className="text-gray-500">You have full access to all writing tasks and platform features.</p>
        <button
          onClick={() => router.push("/dashboard/writing-tasks")}
          className="px-6 py-3 bg-[#FF7A00] text-white rounded-xl font-semibold hover:bg-[#e56d00] transition"
        >
          Browse Writing Tasks →
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto space-y-6 py-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Activate Your Account</h1>
        <p className="text-sm text-gray-500 mt-1">One-time M-Pesa payment to unlock full access</p>
      </div>

      {/* Info Card */}
      <div className="bg-orange-50 border border-orange-200 rounded-xl p-5 space-y-3">
        <div className="flex items-center gap-3">
          <ShieldCheck size={28} className="text-[#FF7A00]" />
          <div>
            <p className="font-bold text-gray-800 text-lg">KES {settings.activationFee}</p>
            <p className="text-xs text-gray-500">One-time activation fee</p>
          </div>
        </div>
        <p className="text-sm text-gray-600">
          {settings.activationDescription || "Pay once and unlock all writing tasks, tools, and resources on WriteMaster."}
        </p>
        <ul className="text-sm text-gray-600 space-y-1">
          {["Access all writing tasks", "View detailed task instructions", "Earn from completed assignments", "Priority support"].map(item => (
            <li key={item} className="flex items-center gap-2">
              <span className="text-green-500 font-bold">✓</span> {item}
            </li>
          ))}
        </ul>
      </div>

      {/* Inactive banner */}
      <div className="bg-red-50 border border-red-300 rounded-xl p-4 flex items-start gap-3">
        <AlertTriangle size={20} className="text-red-500 mt-0.5 flex-shrink-0" />
        <p className="text-sm text-red-700">
          Your account is <strong>inactive</strong>. Complete the payment below to unlock writing tasks and start earning.
        </p>
      </div>

      {/* Payment Form */}
      {(stage === "idle" || stage === "failed") && (
        <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
          <div className="flex items-center gap-2 mb-1">
            <Smartphone size={20} className="text-green-600" />
            <p className="font-semibold text-gray-800">Pay via M-Pesa STK Push</p>
          </div>
          <p className="text-xs text-gray-500">Enter your Kenyan phone number and we'll send a payment prompt directly to your phone.</p>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="07XXXXXXXX or 2547XXXXXXXX"
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#FF7A00] outline-none text-sm"
            />
            <p className="text-xs text-gray-400 mt-1">Safaricom M-Pesa numbers only</p>
          </div>

          {message && (
            <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{message}</p>
          )}

          <button
            onClick={initiatePayment}
            className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl transition flex items-center justify-center gap-2"
          >
            <Smartphone size={18} />
            Pay KES {settings.activationFee} via M-Pesa
          </button>
        </div>
      )}

      {/* Sending stage */}
      {stage === "sending" && (
        <div className="bg-white border border-gray-200 rounded-xl p-8 text-center space-y-3">
          <Loader2 size={40} className="animate-spin text-[#FF7A00] mx-auto" />
          <p className="font-semibold text-gray-700">Sending STK push...</p>
          <p className="text-sm text-gray-500">Please wait while we contact M-Pesa</p>
        </div>
      )}

      {/* Waiting for PIN stage */}
      {stage === "waiting" && (
        <div className="bg-white border border-green-200 rounded-xl p-8 text-center space-y-4">
          <div className="text-4xl">📱</div>
          <h2 className="font-bold text-gray-800 text-lg">Check Your Phone</h2>
          <p className="text-sm text-gray-600">
            An M-Pesa payment prompt has been sent to your phone.<br />
            <strong>Enter your M-Pesa PIN</strong> to complete the payment of{" "}
            <strong>KES {settings.activationFee}</strong>.
          </p>
          <div className="flex items-center justify-center gap-2 text-sm text-amber-600 bg-amber-50 rounded-lg px-3 py-2">
            <Loader2 size={16} className="animate-spin" />
            Waiting for payment confirmation...
          </div>
          <p className="text-xs text-gray-400">Do not close this page. This may take up to 30 seconds.</p>
          {message && <p className="text-sm text-gray-600 bg-gray-50 rounded-lg px-3 py-2">{message}</p>}
        </div>
      )}

      {/* Success */}
      {stage === "success" && (
        <div className="bg-green-50 border border-green-300 rounded-xl p-8 text-center space-y-3">
          <CheckCircle size={48} className="text-green-500 mx-auto" />
          <h2 className="font-bold text-gray-800 text-xl">Payment Confirmed!</h2>
          <p className="text-gray-600 text-sm">{message}</p>
          <p className="text-xs text-gray-400">Redirecting to dashboard...</p>
        </div>
      )}
    </div>
  );
}
