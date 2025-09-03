"use client";

import { useState, useEffect } from "react";

export default function AprovisionamientoForm({ zone, conexionPk, numeroDeSerie }) {
    const [perfiles, setPerfiles] = useState([]);
    const [perfilSeleccionado, setPerfilSeleccionado] = useState("");
    const [logs, setLogs] = useState([]);
    const [mensajeError, setMensajeError] = useState("");
    const [mensajeExito, setMensajeExito] = useState("");
    const [loading, setLoading] = useState(false);

    const addLog = (msg) => setLogs((prev) => [...prev, msg]);

    // 🔹 Cargar perfiles de aprovisionamiento
    useEffect(() => {
        if (zone) {
            fetch(`http://172.16.1.37:4000/api/conectores-perfil/${zone}`)
                .then((res) => res.json())
                .then((data) => {
                    if (Array.isArray(data)) {
                        // Filtrar solo perfiles con conector válido
                        const perfilesValidos = data.filter((p) => p.conector);
                        setPerfiles(perfilesValidos);
                        // si hay perfil por defecto, lo seleccionamos
                        const def = perfilesValidos.find((p) => p.esDefault);
                        if (def) setPerfilSeleccionado(def.conector);
                    } else {
                        setPerfiles([]);
                    }
                })
                .catch((err) => console.error("Error cargando perfiles:", err));
        }
    }, [zone]);

    // 🔹 Handler para aprovisionar
    const handleAprovisionar = async () => {
        setMensajeError("");
        setMensajeExito("");
        setLogs([]);
        setLoading(true);

        try {
            addLog("🔹 Iniciando aprovisionamiento...");
            const res = await fetch(`http://172.16.1.37:4000/api/cliente/aprovisionar`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    zone,
                    pkConexion: conexionPk,
                    numeroDeSerie,
                    conectorPerfil: Number(perfilSeleccionado),
                }),
            });

            const data = await res.json();
            console.log("📥 Respuesta aprovisionamiento:", data);

            if (data.logs) data.logs.forEach(addLog);

            if (!res.ok || data.message) {
                setMensajeError(data.message || "Ocurrió un error al aprovisionar.");
                return;
            }

            if (data.estado === "OK") {
                setMensajeExito(`✅ ${data.mensaje}`);
            } else {
                setMensajeError(data.mensaje || "Error en aprovisionamiento");
            }
        } catch (err) {
            console.error("❌ Error en aprovisionamiento:", err);
            setMensajeError("Error inesperado en aprovisionamiento.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full max-w-xl mx-auto mt-6 p-6 bg-white rounded-lg shadow">
            <h2 className="text-lg font-bold mb-4">Aprovisionamiento</h2>

            {/* Selector de perfil */}
            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">
                    Perfil de Aprovisionamiento
                </label>
                <select
                    value={perfilSeleccionado}
                    onChange={(e) => setPerfilSeleccionado(e.target.value)}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-black"
                >
                    <option value="">-- Selecciona perfil --</option>
                    {perfiles.map((p, i) => (
                        <option key={i} value={p.conector}>
                            {p.nombre} {p.esDefault ? "⭐" : ""}
                        </option>
                    ))}
                </select>
            </div>

            <button
                onClick={handleAprovisionar}
                disabled={!perfilSeleccionado || loading}
                className="w-full bg-green-600 text-white p-2 rounded-lg hover:bg-green-700 disabled:bg-gray-400"
            >
                {loading ? "Aprovisionando..." : "Aprovisionar Conexión"}
            </button>

            {mensajeError && <p className="mt-4 text-red-600 font-medium">{mensajeError}</p>}
            {mensajeExito && <p className="mt-4 text-green-600 font-medium">{mensajeExito}</p>}

            {logs.length > 0 && (
                <div className="mt-4 p-4 bg-gray-100 rounded max-h-40 overflow-y-auto">
                    <h4 className="font-semibold mb-2">Logs:</h4>
                    <ul className="text-sm text-gray-800">
                        {logs.map((l, i) => (
                            <li key={i}>• {l}</li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}
