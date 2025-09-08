"use client";

import { Loader2 } from "lucide-react";
import { motion } from "framer-motion";

export default function FullScreenLoader({ show, text = "Procesando..." }) {
    if (!show) return null;

    return (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/60">
            <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="flex flex-col items-center"
            >
                <Loader2 className="w-16 h-16 text-white animate-spin mb-4" />
                <p className="text-white text-lg font-medium">{text}</p>
            </motion.div>
        </div>
    );
}
