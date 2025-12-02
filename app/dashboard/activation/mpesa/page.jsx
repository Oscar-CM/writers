'use client';

import { useState, useEffect } from "react";
import { supabase } from "../../../../utils/supabaseClient";
import { useRouter } from "next/navigation";
import { CheckCircle, AlertTriangle, Loader2, Copy } from "lucide-react";

export default function MpesaActivationPage() {
  const router = useRouter();
  const [profile, setProfile] = useState(null);
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  const [fullName, setFullName] = useState('');
  const [mpesaNumber, setMpesaNumber] = useState('');
  const [mpesaCode, setMpesaCode] = useState('');

  const [message, setMessage] = useState(null);
  const [messageType, setMessageType] = useState(null);

  const mpesaPayNumber = "0718770747";
  const usdAmount = 5;
  const kesConversionRate = 140; // Example rate
  const kesAmount = usdAmount * kesConversionRate;

  const initiateSTKPush = async () => {
    setMessage(null);
    setLoading(true);

    const amount = 5 * 140; // USD converted to KES

    const { data: { session } } = await supabase.auth.getSession();

    const res = await fetch("/api/mpesa-stk", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        phone: mpesaNumber,
        amount,
        user_id: session.user.id,
      }),
    });

    const data = await res.json();
    setLoading(false);

    if (!data.success) {
      setMessage("STK push failed. Check your number and try again.");
      setMessageType("error");
      return;
    }

    setMessage("STK push sent! Check your phone to complete payment.");
    setMessageType("success");
  };


  // Load profile
  useEffect(() => {
    const loadProfile = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return router.push("/login");

      const { data } = await supabase
        .from("profiles")
        .select("full_name, activated, user_id")
        .eq("user_id", session.user.id)
        .single();

      setProfile(data);
      setStatus(data?.activated ? "active" : "inactive");
    };
    loadProfile();
  }, [router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);

    // Basic validation
    if (!fullName || !mpesaNumber || !mpesaCode) {
      setMessage("All fields are required.");
      setMessageType("error");
      return;
    }

    if (!/^07\d{8}$/.test(mpesaNumber)) {
      setMessage("Please check the MPesa number used again.");
      setMessageType("error");
      return;
    }

    if (!/^[A-Z0-9]{10}$/.test(mpesaCode)) {
      setMessage("MPesa code is invalid.");
      setMessageType("error");
      return;
    }

    setLoading(true);

    // Save payment info
    const { error } = await supabase.from("mpesa_payments").insert([{
      user_id: profile.user_id,
      full_name: fullName,
      mpesa_number: mpesaNumber,
      mpesa_code: mpesaCode,
      amount_usd: usdAmount,
      amount_kes: kesAmount,
      paid_at: new Date()
    }]);

    if (error) {
      setMessage("Failed to save payment info. Contact support.");
      setMessageType("error");
      setLoading(false);
      return;
    }

    // Activate account
    const { error: activationError } = await supabase
      .from("profiles")
      .update({ activated: true })
      .eq("user_id", profile.user_id);

    if (activationError) {
      setMessage("Payment saved but activation failed. Contact support.");
      setMessageType("error");
      setLoading(false);
      return;
    }

    setMessage("Payment verified and account activated! 🎉");
    setMessageType("success");
    setLoading(false);
    setStatus("active");
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(mpesaPayNumber);
    setMessage(`MPesa number ${mpesaPayNumber} copied to clipboard!`);
    setMessageType("success");
  };

  if (!profile) return <p>Loading...</p>;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 px-4 py-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="text-3xl sm:text-4xl font-bold text-center text-gray-900 dark:text-white">
          M-Pesa Activation
        </h1>

        {/* Status */}
        <div className={`p-5 rounded-xl border shadow-sm flex items-center gap-4 justify-center
          ${status === "active"
            ? "bg-green-50 border-green-500"
            : "bg-red-50 border-red-400"}`}>
          {status === "active" ? (
            <CheckCircle size={32} className="text-green-600" />
          ) : (
            <AlertTriangle size={32} className="text-red-600" />
          )}
          <p className="text-lg font-bold">
            Status: {status === "active" ? "ACTIVE" : "INACTIVE"}
          </p>
        </div>

        {/* Message */}
        {message && (
          <div className={`p-4 rounded-lg text-center ${messageType === "success" ? "bg-green-100 text-green-700 border border-green-300" : ""
            } ${messageType === "error" ? "bg-red-100 text-red-700 border border-red-400" : ""}`}>
            {message}
          </div>
        )}

        {/* Payment Form */}
        {status !== "active" && (
          <div className="space-y-4">
            <div className="p-4 bg-yellow-50 border border-yellow-300 rounded-lg text-center">
              <p className="font-bold">Pay {usdAmount}$ via M-Pesa</p>
              <p className="text-gray-700 dark:text-gray-300">Amount in KES: {kesAmount}</p>
              <p className="mt-2">Send payment to:</p>
              <div className="flex justify-center items-center gap-2 mt-1">
                <span className="font-mono font-bold">{mpesaPayNumber}</span>
                <button onClick={handleCopy} className="p-1 bg-gray-200 dark:bg-gray-700 rounded">
                  <Copy size={18} />
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
              <div>
                <label className="block text-gray-700 dark:text-gray-300 font-semibold">Full Name</label>
                <input
                  type="text"
                  className="w-full mt-1 p-2 rounded border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 dark:text-gray-300 font-semibold">MPesa Number Used</label>
                <input
                  type="tel"
                  className="w-full mt-1 p-2 rounded border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900"
                  value={mpesaNumber}
                  onChange={(e) => setMpesaNumber(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 dark:text-gray-300 font-semibold">MPesa Code</label>
                <input
                  type="text"
                  className="w-full mt-1 p-2 rounded border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900"
                  value={mpesaCode}
                  onChange={(e) => setMpesaCode(e.target.value)}
                  required
                />
              </div>

              <button
                onClick={initiateSTKPush}
                disabled={loading}
                className="w-full py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="animate-spin" /> : "Pay with M-Pesa (STK Push)"}
              </button>


              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 mt-4 bg-[#FF7A00] text-white rounded-xl font-bold hover:bg-[#e96d00] flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="animate-spin" /> : "Submit Payment Info"}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
