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
  const [clienteCreado, setClienteCreado] = useState(null);
  const [conexionCreada, setConexionCreada] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [mensajeError, setMensajeError] = useState(""); // ⚠ Estado para errores del backend
const [mensajeExito, setMensajeExito] = useState(""); // ✅ Estado para mensajes de éxito



  useEffect(() => {
    setForm((prev) => ({ ...prev, zone }));

    if (zone) {
      // 🔹 Cargar planes
      fetch(`${URL_SERVER}/api/planes/${zone}`)
        .then((res) => res.json())
        .then((data) => {
          console.log("Planes API response:", data);
          setPlanes(Array.isArray(data) ? data : []);
        })
        .catch((err) => console.error("Error cargando planes:", err));

      // 🔹 Cargar equipos
      fetch(`${URL_SERVER}/api/equipos/${zone}`)
        .then((res) => res.json())
        .then((data) => {
          console.log("Equipos API response:", data);
          setEquipos(Array.isArray(data) ? data : []);
        })
        .catch((err) => console.error("Error cargando equipos:", err));

      // 🔹 Cargar accesos DHCP
      fetch(`${URL_SERVER}/api/accesos-dhcp/${zone}`)
        .then((res) => res.json())
        .then((data) => {
          console.log("Accesos DHCP:", data);
          setAccesosDhcp(Array.isArray(data) ? data : []);
        })
        .catch((err) => console.error("Error cargando accesos DHCP:", err));
    }
  }, [zone]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensajeError(""); // limpiar errores previos

    try {
      const res = await fetch("${URL_SERVER}/api/clientes/crear", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ formData: form, pkIp, zone }),
      });

      const data = await res.json();

      if (!res.ok || data.message) {
        setMensajeError(data.message || "Ocurrió un error al crear el cliente.");
        return;
      }

      if (data.cliente && data.conexion) {
        setClienteCreado(data.cliente);
        setConexionCreada(data.conexion);
        setShowModal(true); // Abrir modal de aprovisionamiento
        onCreated(data);
      }
    } catch (err) {
      console.error("Error creando cliente o conexión:", err);
      setMensajeError("Error inesperado al conectar con el servidor.");
    }
  };

 const handleAprovisionar = async () => {
  if (!conexionCreada?.pk) {
    setMensajeError("No existe conexión válida para aprovisionar.");
    return;
  }

  try {
    const res = await fetch("${URL_SERVER}/api/cliente/aprovisionar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        zone,
        pkConexion: conexionCreada.pk,
        numeroDeSerie: form.numeroDeSerie,
      }),
    });

    const data = await res.json();

    // ⚠️ Si trae error
    if (!res.ok || data.message) {
      setMensajeError(data.message || "Error al aprovisionar.");
      return;
    }

    // ✅ Si trae "salida" con estado OK
    if (data.salida?.estado === "OK") {
      setMensajeExito(`✅ ${data.salida.mensaje}`);
      console.log("Detalle técnico:", data.salida.detalle);
    } else {
      setMensajeError("El aprovisionamiento no se completó correctamente.");
    }

    setShowModal(false);
  } catch (err) {
    setMensajeError("Error inesperado al aprovisionar.");
  }
};


  const handleCancelarAprovisionar = () => setShowModal(false);

  return (
    <div className="w-full h-full p-4">
      <h2 className="text-xl font-bold mb-4 text-center">Datos del Cliente y Conexión</h2>

      {/* 🔔 Mensaje de error */}
      {mensajeError && (
        <div className="mb-4 p-3 rounded-lg bg-red-100 text-red-700 border border-red-400">
          ⚠ {mensajeError}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="w-full max-w-4xl mx-auto p-6 rounded-xl shadow-md bg-white"
      >
        {/* Sección de Datos del Cliente */}
        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center text-black">
            DATOS DEL CLIENTE
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Nombre */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Nombre
              </label>
              <input
                type="text"
                name="nombre"
                value={form.nombre}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-black"
                required
              />
            </div>
            {/* Cédula */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Cédula
              </label>
              <input
                type="text"
                name="cedula"
                value={form.cedula}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-black"
                required
              />
            </div>
            {/* Plan Contratado (Select) */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Plan Contratado
              </label>
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
              <label className="block text-sm font-medium text-gray-700">
                Email
              </label>
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
              <label className="block text-sm font-medium text-gray-700">
                Equipo Cliente
              </label>
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
              <label className="block text-sm font-medium text-gray-700">
                Teléfono
              </label>
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
              <label className="block text-sm font-medium text-gray-700">
                Acceso DHCP
              </label>
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
              <label className="block text-sm font-medium text-gray-700">
                Domicilio
              </label>
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
              <label className="block text-sm font-medium text-gray-700">
                Número de Serie
              </label>
              <input
                type="text"
                name="numeroDeSerie"
                value={form.numeroDeSerie}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-black"
                required
              />
            </div>
            
            {/* Conector */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                ID WISPHUB
              </label>
              <input
                type="text"
                name="conector"
                value={form.conector}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-black"
                required
              />
            </div>
            {/* MAC */}
            <div className="col-span-1">
              <label className="block text-sm font-medium text-gray-700">
                MAC Asignada
              </label>
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

      {/* Modal de Aprovisionamiento */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96 text-center">
            <h3 className="text-lg font-bold mb-4">Aprovisionar Cliente</h3>
            <p className="mb-4">
              Cliente y conexión creados correctamente. ¿Desea aprovisionar ahora?
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={handleAprovisionar}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              >
                Sí, Aprovisionar
              </button>
              <button
                onClick={handleCancelarAprovisionar}
                className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
              >
                No
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
