import * as styles from "./Breadcrumbs.module.css";
import clsx from "clsx";
import { Typography } from "../Typography/Typography.jsx";

/**
 * @param {object} props
 * @param {React.ReactNode} props.children - Breadcrumbs items
 * @param {string} [props.className] - Additional class names
 */
const Breadcrumbs = ({ children, className, ...rest }) => {
  return (
    <div className={clsx(styles.Breadcrumbs, className)} {...rest}>
      {children}
    </div>
  );
};

/**
 * @param {object} props
 * @param {React.ReactNode} props.children - Breadcrumb item text
 * @param {boolean} [props.isActive] - Whether the item is active
 * @param {string} [props.className] - Additional class names
 * @param {function} [props.onClick] - Click handler
 */
const BreadcrumbsItem = ({
  children,
  isActive,
  className,
  onClick,
  ...rest
}) => {
  const isClickable = !!onClick;

  return (
    <button
      type="button"
      {...rest}
      onClick={() => onClick && onClick()}
      className={clsx(
        styles.BreadcrumbsItem,
        className,
        isActive && styles.active,
        !isClickable && styles.disabled,
      )}
      disabled={!isClickable}
    >
      <Typography variant="body" textColor={isActive ? "gray" : "uablue"}>
        {children}
      </Typography>
    </button>
  );
};

const BreadcrumbsDivider = (props) => {
  return (
    <Typography variant="body" textColor="gray" {...props}>
      /
    </Typography>
  );
};

export { Breadcrumbs, BreadcrumbsItem, BreadcrumbsDivider };
