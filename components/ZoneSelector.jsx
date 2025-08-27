"use client";

import { useEffect, useState } from "react";

export default function ZoneSelector({ onSelect }) {
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadZones = async () => {
      try {
        const res = await fetch("http://172.16.1.37:4000/api/zonas"); // 👈 ajusta si usas proxy
        const data = await res.json();
        setZones(data);
      } catch (error) {
        console.error("❌ Error cargando zonas:", error);
      } finally {
        setLoading(false);
      }
    };
    loadZones();
  }, []);

  if (loading) return <p className="text-white">Cargando zonas...</p>;

  return (
    <div className="mb-6 w-full max-w-md">
      <label className="block mb-2 font-medium">Selecciona Zona:</label>
      <select
        className="w-full border rounded-lg p-2 shadow"
        onChange={(e) => onSelect(e.target.value)}
      >
        <option value="" className="text-black">-- Selecciona --</option>
        {zones.map((z) => (
          <option key={z.id} value={z.id} className="text-black">
            {z.nombre}
          </option>
        ))}
      </select>
    </div>
  );
}
