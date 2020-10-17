import styled from "styled-components";

export const PrimaryButton = styled.button`
  text-transform: uppercase;
  border: 2px white solid;
  font-weight: 700;
  padding: 12px 32px;
  color: white;
  letter-spacing: 0.1rem;
  background-color: rgba(0, 0, 0, 0);
  &:focus {
    outline: none;
  }
  &:hover {
    background-color: #ffffff;
    color: #0e2991;
  }
`;

export const SecondaryDarkButton = styled.button`
  text-transform: uppercase;
  border: 2px rgba(0, 0, 0, 0.05) solid;
  font-weight: 700;
  padding: 12px 32px;
  color: black;
  letter-spacing: 0.1rem;
  background-color: rgba(0, 0, 0, 0);
  &:focus {
    outline: none;
  }
  &:hover {
    color: #0e2991;
    border-color: #0e2991;
  }
`;
