export default function Spinner() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 text-gray-600">
      <div className="relative flex items-center justify-center">
        <div className="h-10 w-10 border-4 border-gray-300 border-t-gray-500 rounded-full animate-spin"></div>
      </div>
      <span className="text-sm tracking-wide">Loading...</span>
    </div>
  );
}
