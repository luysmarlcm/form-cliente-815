"use client";

import { useState, useEffect } from "react";
import ZoneSelector from "@/components/ZoneSelector";
import OnuSelector from "@/components/OnuSelector";
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
  const [onuSerial, setOnuSerial] = useState("");
  const [createdClient, setCreatedClient] = useState(null);

  const URL_SERVER = process.env.NEXT_PUBLIC_URL_SERVER || "http://localhost:4000";

  // 🔹 Cuando cambia la zona, obtenemos automáticamente los servicios del nodo por defecto
  useEffect(() => {
    const fetchServices = async () => {
      if (!zone) return;

      const pkNode = DEFAULT_NODES[zone];
      try {
        const res = await fetch(`http://172.16.1.37:4000/api/nodo/${zone}/${pkNode}`);
        const data = await res.json();
        const servicesArray = [];

        if (data.ip) {
          servicesArray.push({
            pk: "ip",
            nombre: `IP ${data.ip.direccion_ip}`,
            type: "IP",
            pk_ip_disponible: data.ip.ip_disponible === "1" ? data.ip.pk_ip_disponible : null,
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

   

      {/* Paso 3: Mostrar IP disponibles */}
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

         {/* Paso 2: Mostrar ONU disponibles */}
      {zone && <OnuSelector zone={zone} onSelect={setOnuSerial} />}

      {/* Paso 4: Formulario solo si hay IP y ONU */}
      {pkIp && onuSerial && (
        <ClientForm
          zone={zone}
          pkIp={pkIp}
          numeroDeSerie={onuSerial}
          onCreated={setCreatedClient}
        />
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
