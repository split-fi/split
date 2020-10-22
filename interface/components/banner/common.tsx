import { useWeb3React } from "@web3-react/core";
import { FC } from "react";
import styled from "styled-components";
import { BannerMetadata, BannerType, TxBannerMetadata } from "../../types/app";
import { getEtherscanLink } from "../../utils/etherscan";
import { PrimaryAnchor } from "../anchor";
import { FOOTER_HEIGHT } from "../footer/common";
import { P } from "../typography";

export const BannersWrapper = styled.div`
  position: fixed;
  right: 0;
  left: 0;
  bottom: ${FOOTER_HEIGHT}px;
`;

const bannerTypeToBackgroundColor = (type: BannerType) => {
  if (type === "success") {
    return "#97CB93";
  }
  if (type === "error") {
    return "#D36D6D";
  }
  return "#FFFFFF";
};

const bannerTypeToColor = (type: BannerType) => {
  if (type === "success") {
    return "#0E2991";
  }
  if (type === "error") {
    return "#0E2991";
  }
  return "#0E2991";
};

export interface BannerTypeProps {
  type: BannerType;
}

export const BannerWrapper = styled.div<BannerTypeProps>`
  width: 100%;
  background-color: ${props => bannerTypeToBackgroundColor(props.type)};
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px 0;
`;

const StyledP = styled(P)<BannerTypeProps>`
  color: ${props => bannerTypeToColor(props.type)};
`;

const StyledA = styled(PrimaryAnchor)<BannerTypeProps>`
  color: ${props => bannerTypeToColor(props.type)};
`;

export const TxBanner: FC<TxBannerMetadata> = ({ type, txHash, description }) => {
  const { chainId } = useWeb3React();

  return (
    <BannerWrapper type={type}>
      <StyledP type={type}>{description}</StyledP>
      <StyledA
        target="_blank"
        type={type}
        style={{ marginLeft: 4 }}
        href={getEtherscanLink(chainId ?? 1, txHash, "transaction")}
      >
        see on etherscan
      </StyledA>
    </BannerWrapper>
  );
};

export const Banner: FC<BannerMetadata> = ({ type, description }) => {
  return (
    <BannerWrapper type={type}>
      <StyledP type={type}>{description}</StyledP>
    </BannerWrapper>
  );
};
