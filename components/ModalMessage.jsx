"use client";

import { motion } from "framer-motion";
import { CheckCircle, XCircle, AlertTriangle } from "lucide-react";

export default function ModalMessage({ type = "success", message, onClose }) {
    if (!message) return null;

    let Icon, borderClass, iconClass, btnClass, title;

    switch (type) {
        case "success":
            Icon = CheckCircle;
            borderClass = "border-green-500";
            iconClass = "text-green-600";
            btnClass = "bg-green-600 hover:bg-green-700 text-white";
            title = "Éxito";
            break;
        case "error":
            Icon = XCircle;
            borderClass = "border-red-500";
            iconClass = "text-red-600";
            btnClass = "bg-red-600 hover:bg-red-700 text-white";
            title = "Error";
            break;
        case "alert":
            Icon = AlertTriangle;
            borderClass = "border-yellow-500";
            iconClass = "text-yellow-600";
            btnClass = "bg-yellow-500 hover:bg-yellow-600 text-white";
            title = "Alerta";
            break;
        default:
            Icon = CheckCircle;
            borderClass = "border-gray-400";
            iconClass = "text-gray-600";
            btnClass = "bg-gray-500 hover:bg-gray-600 text-white";
            title = "Mensaje";
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                className={`max-w-md w-full p-6 rounded-2xl shadow-lg text-center bg-white border-2 ${borderClass}`}
            >
                <div className="flex justify-center mb-4">
                    <Icon className={`w-12 h-12 ${iconClass}`} />
                </div>
                <h3 className="text-lg font-bold mb-2">{title}</h3>
                <p className="mb-4 text-gray-800 whitespace-pre-line">{message}</p>
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
