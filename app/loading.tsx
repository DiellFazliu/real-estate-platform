export default function Loading() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F7F3EE]">
      <div className="flex flex-col items-center text-center">
        {/* Spinner */}
        <div className="relative h-12 w-12">
          <div className="absolute inset-0 rounded-full border-4 border-[#6B4C3B]/15" />

          <div className="absolute inset-0 animate-spin rounded-full border-4 border-transparent border-t-[#6B4C3B]" />
        </div>

        <h2 className="mt-6 text-xl font-bold text-[#000000]">
          Duke ngarkuar...
        </h2>

        <p className="mt-2 text-sm text-[#000000]/50">
          Ju lutem prisni pak.
        </p>
      </div>
    </main>
  )
}