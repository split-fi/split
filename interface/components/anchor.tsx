import styled from "styled-components";

export const PrimaryAnchor = styled.a`
  font-size: 16px;
  color: white;
  text-decoration: none;
  font-weight: bold;
  &:focus {
    outline: none;
  }
`;

export const NoStyledAnchor = styled.a`
  text-decoration: none;
  &:focus {
    outline: none;
  }
`;
