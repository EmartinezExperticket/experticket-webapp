import Link from "next/link";

export default function CompraOk() {
  return (
    <div className="flex flex-col items-center justify-center h-screen text-center">
      <h1 className="text-3xl font-bold text-green-600">¡Compra Exitosa!</h1>
      <p className="text-lg text-gray-600 mt-2">Gracias por tu compra. Te hemos enviado un correo con los detalles.</p>
      <Link href="/">
        <button className="mt-6 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-700 transition">
          Volver al Home
        </button>
      </Link>
    </div>
  );
}