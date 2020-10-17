import { AbstractConnector } from "@web3-react/abstract-connector";
import React from "react";
import styled from "styled-components";
import Option from "./Option";
import { SUPPORTED_WALLETS } from "../../../constants";
import { injected } from "../../../connectors";
import { P, H1, PDark } from "../../typography";
import { PrimaryButton } from "../../button";

const StyledP = styled(PDark)<{ error?: boolean }>`
  text-transform: uppercase;
  font-weight: 900;
  font-size: 12px;
  letter-spacing: 0.05rem;
  color: ${props => (props.error ? "white" : "black")};
`;

const LargeText = styled(H1)<{ error?: boolean }>`
  font-size: 48px;
  font-weight: 900;
  letter-spacing: 0.05rem;
  color: ${props => (props.error ? "white" : "rgba(0,0,0,0.2)")};
`;

const PendingSection = styled.div``;

const LoadingMessage = styled.div<{ error?: boolean }>`
  padding: 1rem;
  border: 2px rgba(0, 0, 0, 0.05) solid;
  background-color: ${props => (props.error ? "#D36D6D" : "none")};
`;

const ErrorGroup = styled.div`
  ${({ theme }) => theme.flexRowNoWrap};
  align-items: center;
  justify-content: flex-start;
`;

const ErrorButton = styled.div`
  border-radius: 8px;
  font-size: 12px;
  color: ${({ theme }) => theme.text1};
  background-color: ${({ theme }) => theme.bg4};
  margin-left: 1rem;
  padding: 0.5rem;
  font-weight: 600;
  user-select: none;
`;

const LoadingWrapper = styled.div`
  padding: 0.5rem 0 1rem 0;
`;

export default function PendingView({
  connector,
  error = false,
  setPendingError,
  tryActivation,
}: {
  connector?: AbstractConnector;
  error?: boolean;
  setPendingError: (error: boolean) => void;
  tryActivation: (connector: AbstractConnector) => void;
}) {
  const isMetamask = (window?.ethereum as any).isMetaMask;

  return (
    <PendingSection>
      <LoadingMessage error={error}>
        {Object.keys(SUPPORTED_WALLETS).map(key => {
          const option = SUPPORTED_WALLETS[key];
          if (option.connector === connector) {
            if (option.connector === injected) {
              if (isMetamask && option.name !== "MetaMask") {
                return null;
              }
              if (!isMetamask && option.name === "MetaMask") {
                return null;
              }
            }
            return <StyledP error={error}>{option.name}</StyledP>;
          }
          return null;
        })}
        <LoadingWrapper>
          <LargeText error={error}>{error ? "(✖╭╮✖)" : "Initializing..."}</LargeText>
        </LoadingWrapper>
        {error && (
          <PrimaryButton
            onClick={() => {
              setPendingError(false);
              connector && tryActivation(connector);
            }}
          >
            Try Again
          </PrimaryButton>
        )}
      </LoadingMessage>
    </PendingSection>
  );
}
