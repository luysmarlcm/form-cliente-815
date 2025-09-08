"use client";

import { motion } from "framer-motion";
import { CheckCircle, XCircle } from "lucide-react";

export default function ModalMessage({ type = "success", message, onClose }) {
    if (!message) return null;

    const Icon = type === "success" ? CheckCircle : XCircle;
    const bgClass = type === "success" ? "bg-green-100" : "bg-red-100";
    const textClass = type === "success" ? "text-green-700" : "text-red-700";
    const btnClass = type === "success"
        ? "bg-green-600 hover:bg-green-700 text-white"
        : "bg-red-600 hover:bg-red-700 text-white";

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                className={`max-w-md w-full p-6 rounded-2xl shadow-lg text-center ${bgClass} ${textClass}`}
            >
                <div className="flex justify-center mb-4">
                    <Icon className="w-12 h-12" />
                </div>
                <h3 className="text-lg font-bold mb-2">
                    {type === "success" ? "Éxito" : "Error"}
                </h3>
                <p className="mb-4">{message}</p>
                <button
                    onClick={onClose}
                    className={`px-4 py-2 rounded-lg font-medium ${btnClass}`}
                >
                    Cerrar
                </button>
            </motion.div>
        </div>
    );
}
