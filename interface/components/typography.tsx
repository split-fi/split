import styled from "styled-components";

export const H1 = styled.h1`
  color: white;
  padding: 0;
  margin: 0;
  font-weight: normal;
  font-size: 40px;
`;

export const LargeDisplayTextDark = styled(H1)<{ isActive?: boolean }>`
  color: black;
  font-weight: ${props => (!props.isActive ? 700 : 300)};
  font-style: ${props => (!props.isActive ? "italic" : "normal")};
`;

export const H2 = styled.h2`
  color: white;
  padding: 0;
  font-weight: normal;
  margin: 0;
`;

export const H3 = styled.h3`
  color: white;
  padding: 0;
  margin: 0;
  font-weight: normal;
  font-size: 28px;
`;

export const H4 = styled.h4`
  color: white;
  padding: 0;
  font-weight: normal;
  margin: 0;
`;

export const P = styled.p`
  font-size: 16px;
  color: white;
  padding: 0;
  margin: 0;
`;

export const PDark = styled(P)`
  color: black;
`;

export const H3Dark = styled(H3)`
  color: black;
`;

export const Faded = styled.span`
  color: rgba(255, 255, 255, 0.5);
`;

export const FadedDark = styled.span`
  color: rgba(0, 0, 0, 0.5);
`;
