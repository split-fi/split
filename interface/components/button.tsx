import styled from "styled-components";

export const PrimaryButton = styled.button`
  border: 2px white solid;
  font-weight: 700;
  cursor: pointer;
  padding: 12px 32px;
  color: white;
  letter-spacing: 0.05rem;
  font-size: 14px;
  font-weight: bold;
  background-color: rgba(0, 0, 0, 0);
  &:focus {
    outline: none;
  }
  &:hover:enabled,
  &:hover:enabled > * {
    background-color: #ffffff;
    color: #0e2991;
    font-style: italic;
  }
  &:disabled {
    opacity: 0.5;
    cursor: default;
  }
`;

export const SecondaryDarkButton = styled.button`
  border: 2px rgba(0, 0, 0, 0.05) solid;
  font-weight: 900;
  padding: 12px 32px;
  color: black;
  letter-spacing: 0.05rem;
  background-color: rgba(0, 0, 0, 0);
  font-size: 14px;
  &:focus:enabled {
    outline: none;
  }
  &:hover:enabled {
    color: #0e2991;
    border-color: #0e2991;
    font-style: italic;
  }
  &:disabled {
    opacity: 0.5;
    cursor: default;
  }
`;
