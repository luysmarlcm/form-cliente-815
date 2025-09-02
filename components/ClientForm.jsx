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

  const URL_SERVER = process.env.NEXT_PUBLIC_URL_SERVER || "http://localhost:4000";

  const [planes, setPlanes] = useState([]);
  const [equipos, setEquipos] = useState([]);
  const [accesosDhcp, setAccesosDhcp] = useState([]);
  const [mensajeError, setMensajeError] = useState("");
  const [mensajeExito, setMensajeExito] = useState("");
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState([]);
  const [conexionPk, setConexionPk] = useState(null);

  // Función para agregar logs en tiempo real
  const addLog = (msg) => setLogs((prev) => [...prev, msg]);

  useEffect(() => {
    setForm((prev) => ({ ...prev, zone }));

    if (zone) {
      // 🔹 Cargar planes
      fetch(`http://172.16.1.37:4000/api/planes/${zone}`)
        .then((res) => res.json())
        .then((data) => {
          console.log("Planes API response:", data);
          setPlanes(Array.isArray(data) ? data : []);
        })
        .catch((err) => console.error("Error cargando planes:", err));

      // 🔹 Cargar equipos
      fetch(`http://172.16.1.37:4000/api/equipos/${zone}`)
        .then((res) => res.json())
        .then((data) => {
          console.log("Equipos API response:", data);
          setEquipos(Array.isArray(data) ? data : []);
        })
        .catch((err) => console.error("Error cargando equipos:", err));

      // 🔹 Cargar accesos DHCP
      fetch(`http://172.16.1.37:4000/api/accesos-dhcp/${zone}`)
        .then((res) => res.json())
        .then((data) => {
          console.log("Accesos DHCP:", data);
          setAccesosDhcp(Array.isArray(data) ? data : []);
        })
        .catch((err) => console.error("Error cargando accesos DHCP:", err));
    }
  }, [zone]);


  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensajeError("");
    setMensajeExito("");
    setLogs([]);
    setLoading(true);

    try {
      addLog("🔹 Enviando datos al servidor...");
      const res = await fetch(`http://172.16.1.37:4000/api/clientes/crear`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          formData: { ...form, direccion_ip: pkIp },
          pkIp,
          zone,
        }),
      });

      const data = await res.json();
      console.log("📥 Respuesta completa del servidor:", data);

      if (!res.ok || data.message) {
        setMensajeError(data.message || "Ocurrió un error al crear el cliente.");
        return;
      }

      if (!data.cliente || !data.conexion) {
        setMensajeError("Error: El servidor no devolvió los datos del cliente o la conexión esperados.");
        return;
      }

      if (Array.isArray(data.conexion) && data.conexion.length > 0) {
        setConexionPk(data.conexion[0].pk || data.conexion[0].id);
      } else if (data.conexion?.pk || data.conexion?.id) {
        setConexionPk(data.conexion.pk || data.conexion.id);
      } else {
        setMensajeError("No se pudo obtener el PK de la conexión.");
        return;
      }

      setMensajeExito("Cliente y conexión creados correctamente ✅");
      onCreated(data);
    } catch (err) {
      console.error("❌ Error creando cliente o conexión:", err);
      setMensajeError("Error inesperado al conectar con el servidor.");
    } finally {
      setLoading(false);
    }
  };

  // Nuevo handler para aprovisionar la conexión
  const handleAprovisionar = async () => {
    setMensajeError("");
    setMensajeExito("");
    setLogs([]);
    setLoading(true);

    try {
      addLog("🔹 Aprovisionando conexión...");
      const res = await fetch(`http://172.16.1.37:4000/api/cliente/aprovisionar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          zone,
          pkConexion: conexionPk,
          numeroDeSerie: form.numeroDeSerie,
        }),
      });

      const data = await res.json();
      console.log("📥 Respuesta aprovisionamiento:", data);

      if (data.logs) data.logs.forEach(addLog);

      // Mostrar mensaje si el serial no existe
      if (data.message && data.message.includes("no existe en la lista de ONUs disponibles")) {
        setMensajeError(data.message);
        return;
      }

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
    <div className="w-full max-w-2xl mx-auto p-6 bg-white rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4">Crear Cliente</h2>

      <form onSubmit={handleSubmit} className="w-full max-w-4xl mx-auto p-6 rounded-xl shadow-md bg-white">
        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center text-black">
            DATOS DEL CLIENTE
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {["nombre", "cedula", "email", "telefono", "domicilio", "numeroDeSerie", "conector", "mac"].map((field) => (
              <div key={field}>
                <label className="block text-sm font-medium text-gray-700">
                  {field === "conector" ? "ID WispHub" : field.toUpperCase()}
                </label>
                <input
                  type={field === "email" ? "email" : "text"}
                  name={field}
                  value={form[field]}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-black"
                  required
                />
              </div>
            ))}

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

            <div>
              <label className="block text-sm font-medium text-gray-700">Equipo Cliente</label>
              <select name="equipoCliente" value={form.equipoCliente} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-black" required>
                <option value="">-- Selecciona equipo --</option>
                {equipos.map((e) => (
                  <option key={e.pk} value={e.pk}>{e?.nombre || "Sin nombre"}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Acceso DHCP</label>
              <select name="accesoDhcp" value={form.accesoDhcp} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-black" required>
                <option value="">-- Selecciona acceso --</option>
                {accesosDhcp.map((a) => (
                  <option key={a.pk} value={a.pk}>{a?.nombre || "Sin nombre"}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150 ease-in-out">
          {loading ? "Procesando..." : "Crear Cliente y Conexión"}
        </button>
      </form>

      {/* Botón para aprovisionar solo si hay pk de conexión */}
      {conexionPk && (
        <button
          onClick={handleAprovisionar}
          className="w-full bg-green-600 text-white p-2 rounded-lg mt-4"
          disabled={loading}
        >
          {loading ? "Aprovisionando..." : "Aprovisionar Conexión"}
        </button>
      )}

      {loading && (
        <p className="mt-4 text-blue-600 font-medium">🔄 Procesando aprovisionamiento, por favor espere...</p>
      )}
      {mensajeError && <p className="mt-4 text-red-600 font-medium">{mensajeError}</p>}
      {mensajeExito && <p className="mt-4 text-green-600 font-medium">{mensajeExito}</p>}

      {/* Logs en tiempo real */}
      {logs.length > 0 && (
        <div className="mt-4 p-4 bg-gray-100 rounded max-h-40 overflow-y-auto">
          <h4 className="font-semibold mb-2">Logs de Aprovisionamiento:</h4>
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

