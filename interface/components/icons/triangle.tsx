import React from "react";

interface SVGProps {
  width?: string;
  height?: string;
}

export const Triangle: React.FC<SVGProps> = ({ width = "20", height = "17" }) => (
  <svg
    version="1.1"
    id="Layer_1"
    width={width}
    height={height}
    viewBox="0 0 531.74 460.5"
    overflow="visible"
    enableBackground="new 0 0 531.74 460.5"
    fill="#EFEFEF"
  >
    <polygon stroke="#EFEFEF" points="530.874,0.5 265.87,459.5 0.866,0.5 " />
  </svg>
);
