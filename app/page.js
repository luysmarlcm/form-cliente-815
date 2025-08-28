"use client";

import { useState, useEffect } from "react";
import ZoneSelector from "@/components/ZoneSelector";
import ClientForm from "@/components/ClientForm";

// Nodo por defecto para cada zona
const DEFAULT_NODES = {
  GTRE01: 1400,
  BRMOESTE01: 1400,
  BRMNORTE1: 1400,
};

export default function Home() {
  const [zone, setZone] = useState("");
  const [services, setServices] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  const [pkIp, setPkIp] = useState(null);
  const [createdClient, setCreatedClient] = useState(null);

  const URL_SERVER = process.env.NEXT_PUBLIC_URL_SERVER || "http://localhost:4000";

  // 🔹 Cuando cambia la zona, obtenemos automáticamente los servicios del nodo por defecto
  useEffect(() => {
    const fetchServices = async () => {
      if (!zone) return;

      const pkNode = DEFAULT_NODES[zone];
      try {
        const res = await fetch(`${URL_SERVER}/api/nodo/${zone}/${pkNode}`);
        const data = await res.json();
        const servicesArray = [];

        // Correctly handle the API response structure
        // The API returns a single "ip" object directly under the root
        if (data.ip) {
          servicesArray.push({
            pk: "ip", // Use a unique key like "ip"
            nombre: `IP ${data.ip.direccion_ip}`, // Use the actual IP address for a better display name
            type: "IP",
            pk_ip_disponible: data.ip.ip_disponible === "1" ? data.ip.pk_ip_disponible : null,
          });
        }
        
        // The API returns "onu: null", so no ONU service to add based on the example.
        // If the API structure changes to include ONU data, this logic would need to be revisited.
        // For now, it will not add an ONU service because data.onu is null.
        if (data.onu) {
          servicesArray.push({
            pk: "onu",
            nombre: `ONU ${data.onu.nombre}`,
            type: "ONU",
            pk_ip_disponible: data.onu.ip?.ip_disponible === "1" ? data.onu.ip.pk : null,
          });
        }

        setServices(servicesArray);
        setSelectedService(null);
        setPkIp(null);
      } catch (error) {
        console.error("Error al obtener servicios del nodo:", error);
      }
    };

    fetchServices();
  }, [zone]);

  const handleSelectService = (pk) => {
    const service = services.find((s) => s.pk === pk);
    setSelectedService(service);
    setPkIp(service?.pk_ip_disponible || null);
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6">
      <h1 className="text-2xl font-bold mb-6">Crear Cliente en 815</h1>

      {/* Paso 1: Seleccionar Zona */}
      <ZoneSelector onSelect={setZone} />

      {/* Paso 2: Mostrar ONU/IP disponibles */}
      {services.length > 0 && (
        <div className="w-full max-w-md mb-6">
          <label className="block mb-2 font-medium">
            Selecciona Servicio (IP disponible):
          </label>
          <select
            className="w-full border rounded-lg p-2 shadow "
            value={selectedService?.pk || ""}
            onChange={(e) => handleSelectService(e.target.value)}
          >
            <option value="">-- Selecciona --</option>
            {services.map((s) => (
              <option key={s.pk} value={s.pk} className="text-black">
                {s.nombre} - IP Disponible: {s.pk_ip_disponible ? "Sí" : "No"}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Paso 3: Formulario para crear cliente */}
      {pkIp && (
        <ClientForm zone={zone} pkIp={pkIp} onCreated={setCreatedClient} />
      )}

      {/* Resultado final */}
      {createdClient && (
        <div className="mt-6 p-4 bg-green-100 border text-black border-green-400 rounded w-full max-w-md">
          <h2 className="text-lg font-bold">Cliente creado:</h2>
          <pre className="text-sm mt-2 bg-gray-200 p-2 rounded">
            {JSON.stringify(createdClient, null, 2)}
          </pre>
        </div>
      )}
    </main>
  );
}

