import { useState, useEffect } from "react";
import clsx from "clsx";
import styles from "./SlidePanel.module.css";

/**
 * @param {object} props
 * @param {React.ReactNode} props.children - Content to display in the slide panel
 * @param {boolean} [props.isOpen] - Controlled open state
 * @param {() => void} [props.onToggle] - Toggle callback for controlled mode
 * @param {boolean} [props.defaultOpen=true] - Default open state for uncontrolled mode
 * @param {string} [props.storageKey] - localStorage key for persisting state
 * @param {boolean} [props.showToggleButton=true] - Whether to show toggle button in sidebar
 * @param {Array} [props.tabs] - Array of tab objects with key, label, and icon
 * @param {string} [props.activeTab] - Currently active tab key
 * @param {(tabKey: string) => void} [props.onTabChange] - Tab change callback
 */
export const SlidePanel = ({
  children,
  isOpen: controlledIsOpen,
  onToggle,
  defaultOpen = true,
  storageKey,
  showToggleButton = true,
  tabs = [],
  activeTab,
  onTabChange,
}) => {
  const isControlled = controlledIsOpen !== undefined;

  const [internalIsOpen, setInternalIsOpen] = useState(() => {
    if (isControlled) return controlledIsOpen;
    if (storageKey && typeof window !== "undefined") {
      const stored = localStorage.getItem(storageKey);
      return stored !== null ? stored === "true" : defaultOpen;
    }
    return defaultOpen;
  });

  const isOpen = isControlled ? controlledIsOpen : internalIsOpen;

  useEffect(() => {
    if (!isControlled && storageKey && typeof window !== "undefined") {
      localStorage.setItem(storageKey, String(internalIsOpen));
    }
  }, [internalIsOpen, storageKey, isControlled]);

  const handleToggle = () => {
    if (isControlled && onToggle) {
      onToggle();
    } else {
      setInternalIsOpen((prev) => !prev);
    }
  };

  return (
    <div className={styles.container}>
      {/* Narrow sidebar with toggle button - always visible */}
      <div className={styles.sideBar}>
        {showToggleButton && (
          <button
            className={clsx(styles.toggleButton, { [styles.open]: isOpen })}
            onClick={handleToggle}
            aria-label={isOpen ? "Сховати меню" : "Показати меню"}
            aria-expanded={isOpen}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className={styles.icon}
            >
              {isOpen ? (
                // Chevron left (close)
                <path
                  d="M15 18L9 12L15 6"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              ) : (
                // Chevron right (open)
                <path
                  d="M9 18L15 12L9 6"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}
            </svg>
          </button>
        )}

        {/* Tab icons */}
        {tabs.map(({ key, icon }) => (
          <button
            key={key}
            className={clsx(styles.tabIconButton, {
              [styles.activeTabIcon]: activeTab === key,
            })}
            onClick={() => onTabChange && onTabChange(key)}
            aria-label={key}
          >
            {icon}
          </button>
        ))}
      </div>

      {/* Expandable panel with content */}
      <div className={clsx(styles.panel, { [styles.closed]: !isOpen })}>
        <div className={styles.content}>{children}</div>
      </div>
    </div>
  );
};
