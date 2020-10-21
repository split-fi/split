import { useEffect } from "react";
import { useBannerActions, useBanners } from "../../contexts/banner";
import { useMounted } from "../../hooks/useMounted";
import { BannerMetadata, TxBannerMetadata } from "../../types/app";
import { BannersWrapper, Banner, TxBanner } from "./common";

export const Banners = () => {
  const banners = useBanners();
  const undismissedBanners = banners.filter(b => !b.dismissed);

  return (
    <BannersWrapper>
      {undismissedBanners.map((b: BannerMetadata, i: number) => {
        if (!!(b as TxBannerMetadata).txHash) {
          return <TxBanner {...(b as TxBannerMetadata)} key={(b as TxBannerMetadata).txHash} />;
        }
        return <Banner {...b} key={i} />;
        // TODO key is not that great, need to change
      })}
    </BannersWrapper>
  );
};
