import { useEffect } from "react";

export default function Toast({ message, type = "info", onClose }) {
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [message, onClose]);

  if (!message) return null;

  const color =
    type === "error"
      ? "bg-red-600"
      : type === "success"
      ? "bg-green-600"
      : "bg-gray-900";

  return (
    <div
      className={`${color} text-white fixed top-16 right-4 z-50 
                  px-4 py-2 rounded-lg shadow-lg max-w-[90%] sm:max-w-xs 
                  text-sm sm:text-base animate-fadeIn transition-opacity`}
    >
      {message}
    </div>
  );
}
