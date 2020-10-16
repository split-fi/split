import React from "react";

interface SplitIconProps {
  className?: string;
}

export const SplitIcon: React.FC<SplitIconProps> = ({ className }) => {
  return (
    <svg
      className={className}
      width="113"
      height="113"
      viewBox="0 0 113 113"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect x="76" y="11" width="37" height="92" transform="rotate(45 76 11)" fill="white" />
    </svg>
  );
};
