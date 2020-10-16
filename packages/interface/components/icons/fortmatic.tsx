import React from "react";

interface FortmaticIconProps {
  className?: string;
}

export const FortmaticIcon: React.FC<FortmaticIconProps> = ({ className }) => {
  return (
    <svg
      width="302"
      height="302"
      viewBox="0 0 302 302"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M151 0H226.5H302V75.6051H226.5H151H75.5V151.21V156.058V226.375V226.815V301.98H0V226.815V226.375V156.058V151.21V75.6051V0H75.5H151ZM226.502 226.395H151.442V151.23H301.958V229.039C301.958 248.382 294.288 266.933 280.634 280.615C266.98 294.296 248.459 301.988 229.143 302H226.502V226.395Z"
        fill="#6851FF"
      />
    </svg>
  );
};
