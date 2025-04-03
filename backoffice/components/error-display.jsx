export function ErrorDisplay({ message }) {
  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md max-w-md">
        <h2 className="text-lg font-semibold mb-2">Errore</h2>
        <p>{message}</p>
      </div>
    </div>
  )
}

