// src/components/NotificationModal.tsx
import React, { useState, useEffect } from "react";

interface NotificationModalProps {
  message: string;
  onClose: () => void;
  isVisible: boolean;
}

const NotificationModal: React.FC<NotificationModalProps> = ({
  message,
  onClose,
  isVisible,
}) => {
  const [show, setShow] = useState(isVisible);

  useEffect(() => {
    setShow(isVisible);
    if (isVisible) {
      const timer = setTimeout(() => {
        setShow(false);
        onClose(); // Llama a onClose para que el padre sepa que se ocultó
      }, 5000); // Oculta después de 5 segundos

      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  if (!show) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="bg-white rounded-xl p-4 shadow-xl flex items-center space-x-4 border border-pink-100 animate-slideIn">
        <div className="flex-shrink-0">
          {/* Puedes agregar un ícono de éxito aquí, por ejemplo, un checkmark */}
          <svg
            className="h-6 w-6 text-pink-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <div>
          <p className="text-gray-700 font-medium">{message}</p>
        </div>
        <button
          onClick={() => {
            setShow(false);
            onClose();
          }}
          className="ml-auto text-gray-500 hover:text-gray-700"
          aria-label="Cerrar notificación"
        >
          <svg
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default NotificationModal;
