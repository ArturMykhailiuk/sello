import NotFoundImage from "../../assets/images/not-found-page.png";
import * as styles from "./NotFound.module.css";

export default function NotFound() {
  return (
    <div className={styles.NotFound}>
      <p className={styles.titleNotFound}>Сторінку не знайдено</p>
      <img
        src={NotFoundImage}
        alt="Not Found"
        height={500}
        width={500}
        className={styles.image404}
      />
    </div>
  );
}
