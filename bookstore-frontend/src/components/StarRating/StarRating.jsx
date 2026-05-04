import React, { useState } from "react";
import "./StarRating.css";

/**
 * StarRating component
 *
 * Props:
 *  - value        {number|null}  Current rating value (1-5). Controls filled stars in read-only mode.
 *  - onChange     {function}     Called with the new rating when the user clicks a star. When omitted
 *                                the component is rendered in read-only (display-only) mode.
 *  - readOnly     {boolean}      Force read-only mode even if onChange is provided.
 *  - maxStars     {number}       Total number of stars (default: 5).
 *  - size         {string}       "sm" | "md" (default) | "lg" — controls star size.
 */
function StarRating({ value = 0, onChange, readOnly = false, maxStars = 5, size = "md" }) {
  const interactive = !readOnly && typeof onChange === "function";
  const [hovered, setHovered] = useState(0);

  const handleClick = (star) => {
    if (interactive) {
      onChange(star);
    }
  };

  const filled = interactive ? (hovered || value || 0) : (value || 0);

  return (
    <div
      className={`star-rating star-rating--${size}${interactive ? " star-rating--interactive" : ""}`}
      role={interactive ? "group" : undefined}
      aria-label={interactive ? "Rate this book" : `Rating: ${value ? `${value} out of ${maxStars}` : "No rating yet"}`}
    >
      {Array.from({ length: maxStars }, (_, i) => i + 1).map((star) => (
        <span
          key={star}
          className={`star${star <= filled ? " star--filled" : ""}`}
          onClick={() => handleClick(star)}
          onMouseEnter={() => interactive && setHovered(star)}
          onMouseLeave={() => interactive && setHovered(0)}
          role={interactive ? "button" : undefined}
          aria-label={interactive ? `Rate ${star} star${star !== 1 ? "s" : ""}` : undefined}
          tabIndex={interactive ? 0 : undefined}
          onKeyDown={interactive ? (e) => e.key === "Enter" && handleClick(star) : undefined}
        >
          ★
        </span>
      ))}
    </div>
  );
}

export default StarRating;
