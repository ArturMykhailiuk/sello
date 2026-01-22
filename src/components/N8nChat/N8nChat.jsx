import { useEffect, useRef } from "react";
import PropTypes from "prop-types";
import "@n8n/chat/style.css";
import "./N8nChat.module.css";
import { createChat } from "@n8n/chat";

export const N8nChat = ({ webhookUrl, isOpen, workflowName, onClose }) => {
  const chatInstanceRef = useRef(null);

  useEffect(() => {
    if (!isOpen || !webhookUrl) {
      return;
    }

    if (!chatInstanceRef.current) {
      try {
        chatInstanceRef.current = createChat({
          webhookUrl: webhookUrl,
          mode: "window",
          defaultOpen: true,
          showWelcomeScreen: true,
          initialMessages: [
            "Привіт! 👋",
            `Я ${
              workflowName || "ваш AI асистент"
            }. Чим я можу допомогти сьогодні?`,
          ],
          i18n: {
            en: {
              title: workflowName || "AI Assistant",
              subtitle: "Ask me anything",
              footer: "",
              getStarted: "New Conversation",
              inputPlaceholder: "Type your message...",
            },
          },
        });
      } catch (error) {
        console.error("Error creating chat instance:", error);
      }
    }

    // Cleanup для StrictMode - викликаємо unmount якщо існує
    return () => {
      if (chatInstanceRef.current) {
        try {
          // Спробуємо unmount якщо метод існує
          if (typeof chatInstanceRef.current.unmount === "function") {
            chatInstanceRef.current.unmount();
          }
          // Також видаляємо DOM елемент
          const chatWidget = document.querySelector(".n8n-chat");
          if (chatWidget) {
            chatWidget.remove();
          }
          chatInstanceRef.current = null;
        } catch (e) {
          console.error("Error cleaning up chat on re-render:", e);
        }
      }
    };
  }, [isOpen, webhookUrl, workflowName]);

  useEffect(() => {
    if (!isOpen && chatInstanceRef.current) {
      try {
        const chatWidget = document.querySelector(".n8n-chat");
        if (chatWidget) {
          chatWidget.remove();
        }
        chatInstanceRef.current = null;
      } catch (e) {
        console.error("Error closing chat:", e);
      }
    }
  }, [isOpen]);

  // Cleanup при розмонтуванні компонента
  useEffect(() => {
    return () => {
      try {
        const chatWidget = document.querySelector(".n8n-chat");
        if (chatWidget) {
          chatWidget.remove();
        }
        chatInstanceRef.current = null;
      } catch (e) {
        console.error("Error cleaning up chat:", e);
      }
    };
  }, []);

  useEffect(() => {
    const handleChatClose = (e) => {
      if (
        e.target.closest(".n8n-chat__close") ||
        e.target.closest("[data-n8n-chat-close]")
      ) {
        if (onClose) {
          onClose();
        }
      }
    };

    if (isOpen) {
      document.addEventListener("click", handleChatClose);
    }

    return () => {
      document.removeEventListener("click", handleChatClose);
    };
  }, [isOpen, onClose]);

  return null;
};

N8nChat.propTypes = {
  webhookUrl: PropTypes.string.isRequired,
  isOpen: PropTypes.bool.isRequired,
  workflowName: PropTypes.string,
  onClose: PropTypes.func,
};
