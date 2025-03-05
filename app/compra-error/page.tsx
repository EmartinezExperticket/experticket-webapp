import Link from "next/link";

export default function CompraError() {
  return (
    <div className="flex flex-col items-center justify-center h-screen text-center">
      <h1 className="text-3xl font-bold text-red-600">Error en la Compra</h1>
      <p className="text-lg text-gray-600 mt-2">Ocurrió un problema con tu pago. Por favor, intenta nuevamente.</p>
      <Link href="/">
        <button className="mt-6 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-700 transition">
          Volver al Home
        </button>
      </Link>
    </div>
  );
}