import { useState, useEffect } from "react";
import placeholder from "../../assets/images/placeholder.svg";
import { normalizeImagePath } from "../../utils/index.js";

/**
 * @param {string} src           The URL of the image to load.
 * @param {string} alt           Alt text for the image.
 * @param {string} className     Optional CSS class(es).
 * @param {() => ReactNode} renderFallback  Optional render function for a custom fallback.
 * @param {string} [fallbackSrc] Optional URL to use as a fallback image (defaults to placeholder.svg).
 * @param {object} props         Additional props to pass to the <img> element.
 */
const Image = ({
  src,
  alt,
  className,
  renderFallback,
  fallbackSrc = placeholder,
  width,
  height,
  loading = "lazy",
  decoding = "async",
  ...props
}) => {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(!src);
  }, [src]);

  const imageStyle =
    width && height
      ? {
          aspectRatio: `${width} / ${height}`,
          objectFit: "cover",
        }
      : {};

  if (failed || !src) {
    if (renderFallback) return <>{renderFallback()}</>;

    return (
      <img
        src={fallbackSrc}
        alt={alt}
        className={className}
        width={width}
        height={height}
        loading={loading}
        decoding={decoding}
        style={imageStyle}
        {...props}
      />
    );
  }

  return (
    <img
      src={normalizeImagePath(src)}
      alt={alt}
      className={className}
      width={width}
      height={height}
      loading={loading}
      decoding={decoding}
      style={imageStyle}
      onError={() => setFailed(true)}
      {...props}
    />
  );
};

export { Image };
