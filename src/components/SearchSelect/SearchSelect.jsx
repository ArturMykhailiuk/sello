import { useEffect, useRef, useState } from "react";
import { Input } from "../Input/Input";
import styles from "./SearchSelect.module.css";
import ChevronDown from "../../assets/icons/chevron-down.svg?react";
import ChevronUp from "../../assets/icons/chevron-up.svg?react";
import { Typography } from "../Typography/Typography.jsx";
import { useUncontrolled } from "../../hooks/index.js";

/**
 * @param {Object} props
 * @param {{ id: number, name: string }[]} props.items - List of options to display
 * @param {string} props.name - Name of the input field
 * @param {function} props.onSelect - Callback with selected item { id, name }
 * @param {string} props.placeholder - Placeholder for the input field
 * @param {boolean} [props.required] - Whether the input is required
 * @param {string} [props.value] - Controlled value of the input
 * @param {string} [props.defaultValue] - Default value of the input
 * @param {function} [props.onChange] - Change handler (e) => void
 * @param {number[]} [props.excludeIds] - List of IDs to exclude from the dropdown
 */
const SearchSelect = ({
  value,
  onChange,
  defaultValue = "",
  name,
  items,
  onSelect,
  placeholder = "Select item",
  excludeIds = [],
  required
}) => {
  const [query, setQuery] = useUncontrolled(value, defaultValue, onChange);
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef(null);

  const filteredItems = items.filter((item) => {
    // Якщо query порожній - показуємо всі елементи
    if (!query || query.trim() === "") return !excludeIds.includes(item.id);
    // Інакше фільтруємо по введеному тексту
    return item.name.toLowerCase().includes(query.toLowerCase()) &&
      !excludeIds.includes(item.id);
  });

  const handleSelect = (item) => {
    onSelect(item);
    setQuery(item.name);
    setOpen(false);
  };

  const handleFocus = () => {
    setOpen(true);
  };

  const handleIconClick = () => {
    setOpen((prev) => !prev);
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleBlur = () => {
    const exists = items.find((item) => item.name.toLowerCase() === query.toLowerCase());
    if (exists) {
      const selectedItem = items.find((item) => item.name.toLowerCase() === query.toLowerCase());
      onSelect(selectedItem);
    } else {
      setQuery("");
    }
  }

  return (
    <div ref={wrapperRef} className={styles.wrapper} >
      <Input
        name={name}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={required ? `${placeholder}*` : placeholder}
        iconRight={open ? <ChevronUp /> : <ChevronDown />}
        onFocus={handleFocus}
        onIconClick={handleIconClick}
        onBlur={handleBlur}
      />
      {open && (
        <ul className={styles.dropdownList}>
          {filteredItems.map((item) => (
            <li
              key={item.id}
              className={styles.item}
              onClick={() => handleSelect(item)}
              onMouseDown={(e) => e.preventDefault()}
            >
              <Typography variant="body">{item.name}</Typography>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default SearchSelect;
