import styled from "styled-components";

export const PrimaryAnchor = styled.a`
  font-weight: 500;
  font-size: 16px;
  color: white;
  &:focus {
    outline: none;
  }
`;

export const NoStyledAnchor = styled.a`
  &:focus {
    outline: none;
  }
`;
