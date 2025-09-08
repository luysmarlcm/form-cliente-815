"use client";

import { useEffect, useState } from "react";

export default function NodeSelector({ zone, onSelect, setServices }) {
  const [nodes, setNodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const URL_SERVER = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

  useEffect(() => {
    const loadNodes = async () => {
      try {
        const res = await fetch(`${URL_SERVER}/api/nodos/${zone}`);
        const data = await res.json();
        setNodes(data);
      } catch (error) {
        console.error("❌ Error cargando nodos:", error);
      } finally {
        setLoading(false);
      }
    };
    if (zone) loadNodes();
  }, [zone]);

  if (loading) return <p className="text-gray-500">Cargando nodos...</p>;

  const handleChange = async (pk) => {
    onSelect(pk); // guardamos el nodo
    try {
      const res = await fetch(
        `http://localhost:4000/api/nodos/${zone}/${pk}/servicios`
      );
      const data = await res.json();
      setServices(data); // guardamos ONU/IP disponibles
    } catch (error) {
      console.error("❌ Error cargando servicios del nodo:", error);
    }
  };

  return (
    <div className="mb-6 w-full max-w-md">
      <label className="block mb-2 font-medium">Selecciona Nodo:</label>
      <select
        className="w-full border rounded-lg p-2 shadow"
        onChange={(e) => handleChange(e.target.value)}
      >
        <option value="">-- Selecciona --</option>
        {nodes.map((n) => (
          <option key={n.pk} value={n.pk}>
            {n.fields.nombre}
          </option>
        ))}
      </select>
    </div>
  );
}
