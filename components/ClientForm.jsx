"use client";

import { useState, useEffect } from "react";

export default function ClientForm({ zone, pkIp, onCreated }) {
  const [form, setForm] = useState({
    nombre: "",
    email: "",
    telefono: "",
    domicilio: "",
    cedula: "",
    plan: "",
    mac: "",
    modoConexion: "dhcp",
    accesoDhcp: "",
    equipoCliente: "",
    nodoDeRed: "1400",
    conector: "",
    numeroDeSerie: "",
    zone: zone || "",
  });

  const [planes, setPlanes] = useState([]);
  const [equipos, setEquipos] = useState([]);
  const [accesosDhcp, setAccesosDhcp] = useState([]);

  useEffect(() => {
    setForm((prev) => ({ ...prev, zone }));

    if (zone) {
      // 🔹 Cargar planes
      fetch(`http://localhost:4000/api/planes/${zone}`)
        .then((res) => res.json())
        .then((data) => {
          console.log("Planes API response:", data);
          setPlanes(Array.isArray(data) ? data : []);
        })
        .catch((err) => console.error("Error cargando planes:", err));

      // 🔹 Cargar equipos
      fetch(`http://localhost:4000/api/equipos/${zone}`)
        .then((res) => res.json())
        .then((data) => {
          console.log("Equipos API response:", data);
          setEquipos(Array.isArray(data) ? data : []);
        })
        .catch((err) => console.error("Error cargando equipos:", err));

      // 🔹 Cargar accesos DHCP
      fetch(`http://localhost:4000/api/accesos-dhcp/${zone}`)
        .then((res) => res.json())
        .then((data) => {
          console.log("Accesos DHCP:", data);
          setAccesosDhcp(Array.isArray(data) ? data : []);
        })
        .catch((err) => console.error("Error cargando equipos:", err));
    }
  }, [zone]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:4000/api/clientes/crear", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ formData: form, pkIp, zone }),
      });

      const text = await res.text();
      try {
        const data = JSON.parse(text);
        console.log("Cliente creado:", data);
        onCreated(data);
      } catch {
        console.error("Respuesta no JSON:", text);
      }
    } catch (err) {
      console.error("Error creando cliente o conexión:", err);
    }
  };
  console.log(accesosDhcp, "sfzfdbzfjl")

  return (
   <div className="p-4">
            <h2 className="text-xl font-bold mb-4">Datos del Cliente y Conexión</h2>
  <form onSubmit={handleSubmit} className="w-full max-w-4xl mx-auto p-6 rounded-xl shadow-md bg-white">
 
    {/* Sección de Datos del Cliente */}
    <div className="bg-gray-50 p-4 rounded-lg mb-6">
      <h3 className="text-lg font-semibold mb-4 flex items-center text-black">
        Client Data
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Nombre */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Nombre</label>
          <input
            type="text"
            name="nombre"
            value={form.nombre}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-black"
            required
          />
        </div>
        {/* Plan Contratado (Select) */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Plan Contratado</label>
          <select
            name="plan"
            value={form.plan}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-black"
            required
          >
            <option value="">-- Selecciona un plan --</option>
            {(planes || []).map((p) => (
              <option key={p.pk} value={p.pk}>
                {p?.nombre || "Sin nombre"}
              </option>
            ))}
          </select>
        </div>
        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Email</label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-black"
            required
          />
        </div>
        {/* Equipo Cliente (Select) */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Equipo Cliente</label>
          <select
            name="equipoCliente"
            value={form.equipoCliente}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-black"
            required
          >
            <option value="">-- Selecciona equipo --</option>
            {(equipos || []).map((e) => (
              <option key={e.pk} value={e.pk}>
                {e?.nombre || "Sin nombre"}
              </option>
            ))}
          </select>
        </div>
        {/* Teléfono */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Teléfono</label>
          <input
            type="text"
            name="telefono"
            value={form.telefono}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-black"
            required
          />
        </div>
        {/* Acceso DHCP (Select) */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Acceso DHCP</label>
          <select
            name="accesoDhcp"
            value={form.accesoDhcp}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-black"
            required
          >
            <option value="">-- Selecciona acceso --</option>
            {(accesosDhcp || []).map((a) => (
              <option key={a.pk} value={a.pk}>
                {a?.nombre || "Sin nombre"}
              </option>
            ))}
          </select>
        </div>
        {/* Domicilio */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Domicilio</label>
          <input
            type="text"
            name="domicilio"
            value={form.domicilio}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-black"
            required
          />
        </div>
        {/* Número de Serie */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Número de Serie</label>
          <input
            type="text"
            name="numeroDeSerie"
            value={form.numeroDeSerie}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-black"
            required
          />
        </div>
        {/* Cédula */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Cédula</label>
          <input
            type="text"
            name="cedula"
            value={form.cedula}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-black"
            required
          />
        </div>
        {/* Conector */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Conector</label>
          <input
            type="text"
            name="conector"
            value={form.conector}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-black"
            required
          />
        </div>
        {/* MAC (Asignada y Actual, replicando el estilo) */}
        <div className="col-span-1">
          <label className="block text-sm font-medium text-gray-700">MAC Asignada</label>
          <input
            type="text"
            name="mac"
            value={form.mac}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-black"
            required
          />
        </div>
      </div>
    </div>

    {/* Botón de envío */}
    <button
      type="submit"
      className="w-full bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150 ease-in-out"
    >
      Crear Cliente y Conexión
    </button>
  </form>
</div>
    
   
  );
}
