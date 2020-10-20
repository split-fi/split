import React from "react";

interface SVGProps {
  width?: string;
  height?: string;
}

export const LogoFull: React.FC<SVGProps> = ({ width = "258", height = "117" }) => (
  <svg id="Logo_full" xmlns="http://www.w3.org/2000/svg" width={width} height={height} viewBox="0 0 258 117">
    <path
      id="Path_31"
      data-name="Path 31"
      d="M566.339-1046.009l-20,91h-18l20-91Z"
      transform="translate(-383.339 1046.009)"
      fill="#e6e7e8"
    />
    <g id="Group_23" data-name="Group 23" transform="translate(0.367 -0.327)">
      <path
        id="Path_32"
        data-name="Path 32"
        d="M182.945-943.615c.369,3.1.77,5.694,2,7,2.173,2.326,7.135,3,13,3,3.445,0,5.97.02,8-1a5.424,5.424,0,0,0,3-5c0-1.959-1.365-2.979-3-4s-7.467-3.51-18-6c-7.583-1.877-12.9-4.184-16-7a15.464,15.464,0,0,1-5-12c0-6.162,3.153-11.571,8-16s11.206-6,20-6c8.343,0,15.744,1.674,21,5s8.223,8.838,9,17h-18a9.181,9.181,0,0,0-2-5c-1.924-2.367-5.376-4-10-4-3.806,0-6.383.817-8,2a4.388,4.388,0,0,0-2,4c0,2,.28,3.1,2,4,1.718.939,8.573,2.715,19,5a31.215,31.215,0,0,1,15,8,15.5,15.5,0,0,1,5,12c0,6.611-2.072,11.817-7,16s-12.7,7-23,7c-10.511,0-17.991-2.572-23-7a22.178,22.178,0,0,1-8-17Z"
        transform="translate(-165.312 1012.942)"
        fill="#e6e7e8"
      />
      <path
        id="Path_33"
        data-name="Path 33"
        d="M405.551-980.969c5.443,5.755,9,13.858,9,25,0,11.754-2.681,20.838-8,27s-12.621,9-21,9a20.63,20.63,0,0,1-13-4,23.79,23.79,0,0,1-6-6v35h-17v-93h16v10a31.537,31.537,0,0,1,7-7c3.9-2.979,7.618-5,13-5C393.4-989.969,400.109-986.723,405.551-980.969Zm-13,12c-2.371-3.958-6.681-5-12-5-6.392,0-10.609,3-13,9a32.839,32.839,0,0,0-2,12c0,7.755,2.839,12.857,7,16,2.474,1.837,4.618,3,8,3a14.455,14.455,0,0,0,12-6c2.577-3.755,4-8.756,4-15A27.608,27.608,0,0,0,392.551-968.969Z"
        transform="translate(-275.919 1012.296)"
        fill="#e6e7e8"
      />
      <path
        id="Path_34"
        data-name="Path 34"
        d="M664.613-1030.009h-17v-16h17Zm-17,8h17v66h-17Z"
        transform="translate(-454.98 1046.336)"
        fill="#e6e7e8"
      />
      <path
        id="Path_35"
        data-name="Path 35"
        d="M716.4-999.876v-13h10v-18h17v18h11v13h-11v35c0,2.735.305,4.327,1,5s2.449,1,6,1c.53,0,1.408.021,2,0s1.428.041,2,0v13h-9c-8.244.285-12.981-.857-16-4-1.959-2-3-4.837-3-9v-41Z"
        transform="translate(-496.769 1037.203)"
        fill="#e6e7e8"
      />
    </g>
  </svg>
);

export const LogoSmall: React.FC<SVGProps> = ({ width = "23", height = "41" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={width} height={height} viewBox="0 0 23 41">
    <g id="Group_46" data-name="Group 46" transform="translate(-349.479 -210.684)">
      <g id="Logo_reduced" transform="translate(349.479 210.684)">
        <path
          id="Path_42"
          data-name="Path 42"
          d="M372.479,210.684l-15,41h-8l15-41Z"
          transform="translate(-349.479 -210.684)"
          fill="#e6e7e8"
        />
      </g>
    </g>
  </svg>
);
