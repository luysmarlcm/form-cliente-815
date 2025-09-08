"use client";

import { useEffect, useState } from "react";

export default function OnuSelector({ zone, onSelect }) {
    const [onus, setOnus] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedOnu, setSelectedOnu] = useState("");
    const URL_SERVER = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

    useEffect(() => {
        const loadOnus = async () => {
            if (!zone) return;

            try {
                const res = await fetch(`${URL_SERVER}/api/onus-disponibles/${zone}`);
                const data = await res.json();

                if (Array.isArray(data.onusDisponibles)) {
                    const parsedOnus = data.onusDisponibles.map((raw) => {
                        // si viene con <br> lo separamos
                        const [serial, alias] = raw.split("<br>");
                        return {
                            serial: serial.trim(),
                            nombre: alias ? `${serial.trim()} (${alias.replace(/[()]/g, "")})` : serial.trim(),
                        };
                    });
                    setOnus(parsedOnus);
                } else {
                    setOnus([]);
                }
            } catch (error) {
                console.error("❌ Error cargando ONUs:", error);
                setOnus([]);
            } finally {
                setLoading(false);
            }
        };

        loadOnus();
    }, [zone]);

    const handleSelectOnu = (e) => {
        const value = e.target.value;
        setSelectedOnu(value);
        onSelect(value); // devolvemos solo el número de serie limpio
    };

    if (loading) return <p className="">Cargando ONUs...</p>;

    return (
        <div className="mb-6 w-full max-w-md">
            <label className="block mb-2 font-medium">Selecciona ONU disponible:</label>
            <select
                className="w-full border rounded-lg p-2 shadow"
                value={selectedOnu}
                onChange={handleSelectOnu}
            >
                <option value="" className="text-black">-- Selecciona --</option>
                {onus.map((onu) => (
                    <option key={onu.serial} value={onu.serial} className="text-black">
                        {onu.nombre}
                    </option>
                ))}
            </select>
        </div>
    );
}
