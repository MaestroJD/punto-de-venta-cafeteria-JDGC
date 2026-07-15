// Card de producto para el grid del punto de venta
export default function ProductoCard({ producto, onAdd }) {
  return (
    <button
      onClick={() => onAdd(producto)}
      className="flex flex-col items-center justify-center bg-white rounded-xl border border-gray-200
        shadow-sm hover:shadow-md hover:border-orange-300 active:scale-95 transition-all
        p-4 min-h-[110px] text-center cursor-pointer focus:outline-none focus:ring-2 focus:ring-orange-400"
    >
      <span className="text-2xl mb-1">☕</span>
      <p className="text-sm font-semibold text-gray-800 leading-tight line-clamp-2">{producto.nombre}</p>
      <p className="text-xs text-gray-400 mt-0.5">{producto.categoria}</p>
      <p className="text-orange-600 font-bold mt-1">${Number(producto.precio).toFixed(2)}</p>
    </button>
  )
}
