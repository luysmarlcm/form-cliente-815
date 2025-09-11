"use client";

import { useState, useEffect } from "react";
import AprovisionamientoForm from "./AprovisionamientoForm";
import ModalMessage from "./ModalMessage";
import FullScreenLoader from "./FullScreenLoader";

export default function ClientForm({ zone, pkIp, numeroDeSerie, onCreated }) {
  const [form, setForm] = useState({
    nombre: "",
    email: "",
    telefono: "",
    domicilio: "",
    cedula: "",
    plan: "",
    mac: "00:00:00:00:00:00",
    modoConexion: "dhcp",
    accesoDhcp: "",
    equipoCliente: "",
    nodoDeRed: "1400",
    conector: "",
    numeroDeSerie: numeroDeSerie || "",
    zone: zone || "",
    lat: "",
    lng: "",

  });

  const [planes, setPlanes] = useState([]);
  const [equipos, setEquipos] = useState([]);
  const [accesosDhcp, setAccesosDhcp] = useState([]);
  const [mensajeError, setMensajeError] = useState("");
  const [mensajeExito, setMensajeExito] = useState("");
  const [loading, setLoading] = useState(false);
  const [conexionPk, setConexionPk] = useState(null);
  const URL_SERVER = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

  // 🔹 Actualizar form cuando cambian zone o numeroDeSerie
  useEffect(() => {
    setForm((prev) => ({
      ...prev,
      zone,
      numeroDeSerie: numeroDeSerie || "",
    }));
  }, [zone, numeroDeSerie]);

  // 🔹 Cargar datos relacionados
  useEffect(() => {
    if (zone) {
      fetch(`${URL_SERVER}/api/planes/${zone}`)
        .then((res) => res.json())
        .then((data) => setPlanes(Array.isArray(data) ? data : []))
        .catch((err) => console.error("Error cargando planes:", err));

      fetch(`${URL_SERVER}/api/equipos/${zone}`)
        .then((res) => res.json())
        .then((data) => setEquipos(Array.isArray(data) ? data : []))
        .catch((err) => console.error("Error cargando equipos:", err));

      fetch(`${URL_SERVER}/api/accesos-dhcp/${zone}`)
        .then((res) => res.json())
        .then((data) => setAccesosDhcp(Array.isArray(data) ? data : []))
        .catch((err) => console.error("Error cargando accesos DHCP:", err));
    }
  }, [zone]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensajeError("");
    setMensajeExito("");
    setLoading(true);

    try {
      const res = await fetch(`${URL_SERVER}/api/clientes/crear`, {
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

      if (!res.ok) {
        const errorMessage = data.message ? `${data.message} - ${data.error}` : "Ocurrió un error al crear el cliente.";
        setMensajeError(errorMessage);
        return;
      }

      if (!data.cliente) {
        const errorMessage = data.message ? `${data.message} - ${data.error}` : "Error: El servidor no devolvió datos del cliente.";
        setMensajeError(errorMessage);
        return;
      }

      if (!data.conexion) {
        setMensajeError("Cliente creado pero no se pudo crear la conexión.");
        setMensajeExito("El cliente fue creado correctamente");
        onCreated(data);
        return;
      }

      if (Array.isArray(data.conexion) && data.conexion.length > 0) {
        setConexionPk(data.conexion[0].pk || data.conexion[0].id);
      } else if (data.conexion?.pk || data.conexion?.id) {
        setConexionPk(data.conexion.pk || data.conexion.id);
      } else {
        const errorMessage = data.message ? `${data.message} - ${data.error}` : "Cliente creado, pero no se pudo obtener el PK de la conexión.";
        setMensajeError(errorMessage);
        setMensajeExito("El cliente fue creado correctamente");
        onCreated(data);
        return;
      }

      setMensajeExito("Cliente y conexión creados correctamente");
      onCreated(data);
    } catch (err) {
      console.error("❌ Error creando cliente o conexión:", err);
      setMensajeError("Error inesperado al conectar con el servidor.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-6 bg-white rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4">Crear Cliente</h2>

      <form
        onSubmit={handleSubmit}
        className="w-full max-w-4xl mx-auto p-6 rounded-xl shadow-md bg-white"
      >
        {/* DATOS DEL CLIENTE */}
        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center text-black">
            DATOS DEL CLIENTE
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {["nombre", "cedula", "email", "telefono", "domicilio", "conector", "lng", "lat"].map(
              (field) => (
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
              )
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700">Número de Serie</label>
              <input
                type="text"
                name="numeroDeSerie"
                value={form.numeroDeSerie}
                readOnly
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-black bg-gray-100"
              />
            </div>

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
                {planes.map((p) => (
                  <option key={p.pk} value={p.pk}>
                    {p?.nombre || "Sin nombre"}
                  </option>
                ))}
              </select>
            </div>

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
                {equipos.map((e) => (
                  <option key={e.pk} value={e.pk}>
                    {e?.nombre || "Sin nombre"}
                  </option>
                ))}
              </select>
            </div>

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
                {accesosDhcp.map((a) => (
                  <option key={a.pk} value={a.pk}>
                    {a?.nombre || "Sin nombre"}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700"
        >
          {loading ? "Procesando..." : "Crear Cliente y Conexión"}
        </button>
      </form>

      {/* Aprovisionamiento */}
      {conexionPk && (
        <AprovisionamientoForm
          zone={zone}
          conexionPk={conexionPk}
          numeroDeSerie={form.numeroDeSerie}
        />
      )}

      {/* Modal Mensajes */}
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
      <FullScreenLoader show={loading} text="Creando cliente y conexión..." />
    </div>
  );
}
