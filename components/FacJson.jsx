"use client";
import { useState, useRef } from "react";

export default function FacJson() {
	const [isProcessing, setIsProcessing] = useState(false);
	const [status, setStatus] = useState("");
	const [file, setFile] = useState(null);
	const fileInputRef = useRef(null);

	const handleFileChange = (e) => {
		setFile(e.target.files[0]);
	};

	const handleProcess = async () => {
		if (!file) {
			setStatus("⚠️ Selecciona un archivo Excel primero.");
			return;
		}

		const formData = new FormData();
		formData.append("file", file);

		setIsProcessing(true);
		setStatus("📤 Procesando archivo...");

		try {
			const response = await fetch("http://172.16.1.37:8000/process_excel", {
				method: "POST",
				body: formData,
			});

			if (!response.ok) throw new Error("Error en el backend");

			// 📥 Descargar ZIP
			const blob = await response.blob();
			const url = window.URL.createObjectURL(blob);
			const a = document.createElement("a");
			a.href = url;
			a.download = "facturas.zip";
			document.body.appendChild(a);
			a.click();
			a.remove();

			setStatus("✅ Archivos generados correctamente.");
		} catch (err) {
			console.error(err);
			setStatus("❌ Error al procesar el archivo.");
		} finally {
			setIsProcessing(false);
		}
	};

	const handleRemoveFile = () => {
		setFile(null);
		if (fileInputRef.current) {
			fileInputRef.current.value = "";
		}
	};

	return (
		<div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200 p-4 font-sans">
			<div className="w-full max-w-2xl bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-8">
				<h1 className="text-3xl md:text-4xl font-extrabold text-center mb-4 text-purple-700 dark:text-purple-400">
					Procesador de Facturas
				</h1>
				<p className="text-center text-gray-600 dark:text-gray-400 mb-8">
					Sube tu archivo Excel (.xlsx) para generar automáticamente los JSON.
				</p>

				<div
					className={`p-6 rounded-lg border-2 border-dashed mb-6 transition-all ${
						file
							? "border-green-500 bg-green-50 dark:bg-green-900/30"
							: "border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700"
					}`}
				>
					<label
						htmlFor="file-upload"
						className="flex flex-col items-center cursor-pointer"
					>
						{file ? (
							<>
								<p className="font-semibold text-green-600">
									✅ Archivo seleccionado: {file.name}
								</p>
								<button
									type="button"
									onClick={handleRemoveFile}
									className="mt-2 text-red-500 hover:underline text-sm"
								>
									❌ Quitar archivo
								</button>
							</>
						) : (
							<>
								<span className="font-semibold text-lg">
									Arrastra y suelta tu archivo aquí
								</span>
								<span className="text-sm text-gray-500 mt-1">
									o haz clic para seleccionar
								</span>
							</>
						)}
						<input
							id="file-upload"
							type="file"
							accept=".xlsx, .xls"
							ref={fileInputRef}
							onChange={handleFileChange}
							className="hidden"
						/>
					</label>
				</div>

				<button
					onClick={handleProcess}
					disabled={isProcessing}
					className="w-full py-3 px-6 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg shadow-lg disabled:opacity-50"
				>
					{isProcessing ? "Procesando..." : "Generar Archivos JSON"}
				</button>

				{status && (
					<div className="mt-6 text-center text-sm font-medium p-4 rounded-lg bg-gray-200 dark:bg-gray-700">
						{status}
					</div>
				)}
			</div>
		</div>
	);
}
