"use client";

import { useState, useEffect } from "react";
import ModalMessage from "./ModalMessage";
import FullScreenLoader from "./FullScreenLoader";

export default function AprovisionamientoForm({ zone, conexionPk, numeroDeSerie }) {
    const [perfiles, setPerfiles] = useState([]);
    const [perfilSeleccionado, setPerfilSeleccionado] = useState("");
    const [logs, setLogs] = useState([]);
    const [mensajeError, setMensajeError] = useState("");
    const [mensajeExito, setMensajeExito] = useState("");
    const [loading, setLoading] = useState(false);
    const [conexionLocal, setConexionLocal] = useState(conexionPk || null);
    const URL_SERVER = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
    const addLog = (msg) => setLogs((prev) => [...prev, msg]);

    // 🔹 Cargar perfiles de aprovisionamiento
    useEffect(() => {
        if (zone) {
            fetch(`${URL_SERVER}/api/conectores-perfil/${zone}`)
                .then((res) => res.json())
                .then((data) => {
                    if (Array.isArray(data)) {
                        const perfilesValidos = data.filter((p) => p.conector);
                        setPerfiles(perfilesValidos);

                        const def = perfilesValidos.find((p) => p.esDefault);
                        if (def) setPerfilSeleccionado(def.conector);
                    } else {
                        setPerfiles([]);
                    }
                })
                .catch((err) => console.error("Error cargando perfiles:", err));
        }
    }, [zone]);

    // 🔹 Crear conexión si no existe
    const handleCrearConexion = async () => {
        setMensajeError("");
        setMensajeExito("");
        setLogs([]);
        setLoading(true);

        try {
            addLog("🔹 Creando conexión...");
            const res = await fetch(`http://172.16.1.37:4000/api/conexiones/crear`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ zone, numeroDeSerie }),
            });

            const data = await res.json();
            console.log("📥 Respuesta creación conexión:", data);

            if (!res.ok || data.message) {
                setMensajeError(data.message || "Error al crear la conexión.");
                return;
            }

            if (data.conexion?.pk || data.conexion?.id) {
                const pk = data.conexion.pk || data.conexion.id;
                setConexionLocal(pk);
                setMensajeExito("Conexión creada correctamente");
                addLog("Conexión creada con éxito.");
            } else {
                setMensajeError("No se pudo obtener el PK de la nueva conexión.");
            }
        } catch (err) {
            console.error("❌ Error creando conexión:", err);
            setMensajeError("Error inesperado al crear la conexión.");
        } finally {
            setLoading(false);
        }
    };

    // 🔹 Aprovisionar conexión existente
    const handleAprovisionar = async () => {
        setMensajeError("");
        setMensajeExito("");
        setLogs([]);
        setLoading(true);

        try {
            addLog("🔹 Iniciando aprovisionamiento...");
            const res = await fetch(`${URL_SERVER}/api/cliente/aprovisionar`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    zone,
                    pkConexion: conexionLocal,
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
                setMensajeExito(data.mensaje || "Aprovisionamiento exitoso");
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

            {!conexionLocal ? (
                <button
                    onClick={handleCrearConexion}
                    disabled={loading}
                    className="w-full bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
                >
                    {loading ? "Creando conexión..." : "Crear Conexión"}
                </button>
            ) : (
                <>
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
                                    {p.nombre} {p.esDefault ? "(default)" : ""}
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
                </>
            )}

            {/* Logs */}
            {logs.length > 0 && (
                <div className="mt-4 p-3 bg-gray-50 rounded-lg text-sm text-black max-h-40 overflow-y-auto">
                    {logs.map((l, i) => (
                        <p key={i}>• {l}</p>
                    ))}
                </div>
            )}

            {/* Modales */}
            <ModalMessage
                type="error"
                message={mensajeError}
                onClose={() => setMensajeError("")}
            />
            <ModalMessage
                type="success"
                message={mensajeExito}
                onClose={() => setMensajeExito("")}
            />

            {/* Loader FullScreen */}
            <FullScreenLoader
                show={loading}
                text={conexionLocal ? "Aprovisionando conexión..." : "Creando conexión..."}
            />
        </div>
    );
}
