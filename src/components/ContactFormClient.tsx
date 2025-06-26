// src/components/ContactFormClient.tsx
import React, { useEffect, useState } from "react";
import NotificationModal from "./NotificationModal"; // Importa el nuevo componente

export default function ContactFormClient() {
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState("");

  useEffect(() => {
    const form = document.querySelector("#contact-form");
    if (!(form instanceof HTMLFormElement)) return;

    const handleSubmit = async (e: Event) => {
      e.preventDefault();
      const formData = new FormData(form);

      try {
        const response = await fetch("https://formspree.io/f/manjlrzp", {
          method: "POST",
          body: formData,
          headers: {
            Accept: "application/json",
          },
        });

        if (response.ok) {
          form.reset();
          setNotificationMessage("¡Mensaje enviado! Gracias por contactarnos.");
          setShowNotification(true);
        } else {
          setNotificationMessage(
            "Hubo un error al enviar el mensaje. Inténtalo más tarde."
          );
          setShowNotification(true); // Puedes mostrar una notificación de error también
        }
      } catch (error) {
        console.error("Error de red:", error);
        setNotificationMessage("Error de red. Inténtalo nuevamente.");
        setShowNotification(true); // Notificación de error de red
      }
    };

    form.addEventListener("submit", handleSubmit);

    // Limpia el event listener cuando el componente se desmonta
    return () => {
      form.removeEventListener("submit", handleSubmit);
    };
  }, []);

  const handleCloseNotification = () => {
    setShowNotification(false);
    setNotificationMessage(""); // Limpia el mensaje al cerrar
  };

  return (
    <>
      {/* El modal ahora se renderiza aquí y es controlado por el estado */}
      <NotificationModal
        message={notificationMessage}
        isVisible={showNotification}
        onClose={handleCloseNotification}
      />
    </>
  );
}
