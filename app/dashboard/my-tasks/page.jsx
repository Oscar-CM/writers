"use client";

import { Inbox } from "lucide-react";
import { motion } from "framer-motion";

export default function MyTasksPage() {
  return (
    <div className="w-full h-[60vh] flex flex-col items-center justify-center text-center">
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex flex-col items-center"
      >
        <div className="p-6 rounded-full bg-gray-100 border border-gray-200 shadow-sm">
          <Inbox size={48} className="text-gray-500" />
        </div>

        <h2 className="text-2xl font-semibold mt-6 text-gray-700">
          No Tasks Available
        </h2>

        <p className="text-gray-500 mt-2 max-w-md">
          You currently do not have any writing tasks.  
          Please check back later — new tasks will appear here the moment they are assigned or you win a bid.
        </p>
      </motion.div>
    </div>
  );
}
