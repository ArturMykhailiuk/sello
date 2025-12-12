import React from "react";
import * as styles from "./ItemBadge.module.css";
import { Image } from "../Image/Image";
import { ButtonIcon } from "../ButtonIcon/ButtonIcon";
import XIcon from "../../assets/icons/x.svg?react";
import CheckIcon from "../../assets/icons/check.svg?react";

/**
 * @param {object} props
 * @param {string} props.imgURL — URL of the item image.
 * @param {string} props.name — Name of the item.
 * @param {string} props.measure — Measure string to display.
 * @param {() => void} [props.onDelete] — Optional delete handler.
 */
const ItemBadge = ({ imgURL, name, measure, onDelete }) => {
  return (
    <div className={styles.ItemBadge}>
      <div className={styles.imageWrapper}>
        {imgURL ? (
          <Image src={imgURL} alt={name} className={styles.image} />
        ) : (
          <CheckIcon className={styles.image} />
        )}
      </div>

      <div className={styles.content}>
        <span className={styles.name} title={name}>
          {name}
        </span>

        <span className={styles.measure} title={measure}>
          {measure + " грн."}
        </span>
      </div>

      {onDelete && (
        <div className={styles.deleteButton}>
          <ButtonIcon icon={<XIcon />} onClick={onDelete} />
        </div>
      )}
    </div>
  );
};

export { ItemBadge };
