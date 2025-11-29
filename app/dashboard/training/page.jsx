'use client';

import { useState, useEffect } from "react";
import { supabase } from "../../../utils/supabaseClient";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function ApplyTrainingPage() {
  const router = useRouter();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [messageType, setMessageType] = useState(null);

  // Form fields
  const [countryCode, setCountryCode] = useState("+254");
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [experienceLevel, setExperienceLevel] = useState('');
  const [goals, setGoals] = useState('');

  const countryCodes = [
    { code: "+254", country: "Kenya" },
    { code: "+1", country: "USA" },
    { code: "+44", country: "UK" },
    { code: "+91", country: "India" },
    { code: "+234", country: "Nigeria" },
    { code: "+255", country: "Tanzania" },
    { code: "+250", country: "Rwanda" },
    { code: "+256", country: "Uganda" },
    { code: "+263", country: "Zimbabwe" },
    { code: "+27", country: "South Africa" },
    // Add more as needed
  ];

  // Load user profile
  useEffect(() => {
    const loadProfile = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return router.push("/login");

      const { data } = await supabase
        .from("profiles")
        .select("full_name, user_id")
        .eq("user_id", session.user.id)
        .single();

      setProfile(data);
    };

    loadProfile();
  }, [router]);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);

    if (!phoneNumber || !email || !experienceLevel || !goals) {
      setMessage("All fields are required.");
      setMessageType("error");
      return;
    }

    // Basic phone validation (number length only)
    if (!/^\d{6,15}$/.test(phoneNumber)) {
      setMessage("Please enter a valid phone number.");
      setMessageType("error");
      return;
    }

    setLoading(true);

    const { error } = await supabase.from("training_applications").insert([{
      user_id: profile.user_id,
      full_name: profile.full_name,
      phone_number: `${countryCode}${phoneNumber}`,
      email: email,
      experience_level: experienceLevel,
      goals: goals,
      submitted_at: new Date()
    }]);

    if (error) {
      setMessage("Failed to submit application. Please try again.");
      setMessageType("error");
      setLoading(false);
      return;
    }

    setMessage("Your training application has been submitted! ✅ Our will get in touch.");
    setMessageType("success");
    setLoading(false);

    // Clear form
    setPhoneNumber('');
    setEmail('');
    setExperienceLevel('');
    setGoals('');
  };

  if (!profile) return <p className="text-center mt-10">Loading...</p>;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 px-4 py-8">
      <div className="max-w-3xl mx-auto space-y-6">
        <h1 className="text-3xl sm:text-4xl font-bold text-center text-gray-900 dark:text-white">
          Apply for Training
        </h1>

        <div className="p-4 bg-yellow-50 dark:bg-yellow-900 border border-yellow-400 rounded-lg text-center">
          <p className="font-semibold">Note:</p>
          <p>
            Trainings are conducted depending on the need. You will also have a one-on-one session with our trainers.
          </p>
        </div>

        {message && (
          <div className={`p-4 rounded-lg text-center ${
            messageType === "success" ? "bg-green-100 text-green-700 border border-green-300" : ""
          } ${messageType === "error" ? "bg-red-100 text-red-700 border border-red-400" : ""}`}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">

          {/* Phone Number */}
          <div>
            <label className="block text-gray-700 dark:text-gray-300 font-semibold">Phone Number</label>
            <div className="flex gap-2 mt-1">
              <select
                className="p-2 rounded border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900"
                value={countryCode}
                onChange={(e) => setCountryCode(e.target.value)}
                required
              >
                {countryCodes.map(({ code, country }) => (
                  <option key={code} value={code}>
                    {country} ({code})
                  </option>
                ))}
              </select>
              <input
                type="tel"
                className="flex-1 p-2 rounded border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="Enter your number"
                required
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-gray-700 dark:text-gray-300 font-semibold">Email Address</label>
            <input
              type="email"
              className="w-full mt-1 p-2 rounded border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
          </div>

          {/* Experience Level */}
          <div>
            <label className="block text-gray-700 dark:text-gray-300 font-semibold">Experience Level</label>
            <select
              className="w-full mt-1 p-2 rounded border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900"
              value={experienceLevel}
              onChange={(e) => setExperienceLevel(e.target.value)}
              required
            >
              <option value="">Select your level</option>
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
          </div>

          {/* Goals */}
          <div>
            <label className="block text-gray-700 dark:text-gray-300 font-semibold">Your Goals / Expectations</label>
            <textarea
              className="w-full mt-1 p-2 rounded border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900"
              value={goals}
              onChange={(e) => setGoals(e.target.value)}
              rows={4}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 mt-2 bg-[#FF7A00] text-white rounded-xl font-bold hover:bg-[#e96d00] flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin" /> : "Submit Application"}
          </button>
        </form>
      </div>
    </div>
  );
}
