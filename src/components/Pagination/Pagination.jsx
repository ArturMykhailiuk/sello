import ReactPaginate from "react-paginate";
import * as styles from "./Pagination.module.css";
import ChevronUp from "../../assets/icons/chevron-up.svg?react";

/**
 * @param {object} props
 * @param {number} props.totalPages
 * @param {number} props.activePage
 * @param {(pageNumber: number) => void} props.onPageChange
 */
export const Pagination = ({ totalPages, activePage, onPageChange }) => {
  // Захист від некоректних значень
  const safePageCount = Math.max(totalPages, 1);
  const safeForcePage = Math.min(
    Math.max(activePage - 1, 0),
    safePageCount - 1,
  );

  // Не показувати пагінацію якщо менше 2 сторінок
  if (totalPages <= 1) return null;

  return (
    <ReactPaginate
      pageCount={safePageCount}
      forcePage={safeForcePage}
      onPageChange={({ selected }) => onPageChange(selected + 1)}
      previousLabel={<ChevronUp className={styles.PaginationButtonPrev} />}
      nextLabel={<ChevronUp className={styles.PaginationButtonNext} />}
      breakLabel="…"
      marginPagesDisplayed={1}
      pageRangeDisplayed={3}
      containerClassName={styles.Pagination}
      pageLinkClassName={styles.PaginationButton}
      activeLinkClassName={styles.PaginationButton__active}
      previousLinkClassName={styles.PaginationButton}
      nextLinkClassName={styles.PaginationButton}
      breakLinkClassName={styles.PaginationButton}
      disabledLinkClassName={styles.PaginationButton__disabled}
    />
  );
};
