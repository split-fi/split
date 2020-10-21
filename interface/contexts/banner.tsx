import React, { useMemo, useState, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import { AppComponent } from "next/dist/next-server/lib/router/router";
import { BannerMetadata, BannerType, TxBannerMetadata } from "../types/app";
import { useImmer } from "use-immer";

export interface BannerActionsProviderState {
  addBanner: (banner: BannerMetadata) => void;
  updateBanner: (index: number, changes: Partial<BannerMetadata>) => void;
}

export type BannerProviderState = BannerMetadata[];

const BannerContext = React.createContext<BannerProviderState>([]);
const BannerActionsContext = React.createContext<BannerActionsProviderState>({
  addBanner: () => new Error("BannerProvider not set."),
  updateBanner: () => new Error("BannerProvider not set."),
});

const BannerProvider: React.FC = ({ children }) => {
  const [banners, setBanners] = useImmer<BannerProviderState>([]);

  const addBanner = useCallback(
    (banner: BannerMetadata) => {
      setBanners(draft => {
        draft.push(banner);
      });
    },
    [banners, setBanners],
  );

  const updateBanner = useCallback(
    (index: number, changes: Partial<BannerMetadata>) => {
      if (index < 0 || index >= banners.length) {
        return;
      }
      setBanners(draft => {
        draft[index] = {
          ...draft[index],
          ...changes,
        };
      });
    },
    [banners, setBanners],
  );

  return (
    <BannerContext.Provider value={banners}>
      <BannerActionsContext.Provider
        value={{
          addBanner,
          updateBanner,
        }}
      >
        {children}
      </BannerActionsContext.Provider>
    </BannerContext.Provider>
  );
};

const useBanners = () => {
  return React.useContext(BannerContext);
};

const useTxsBanners = () => {
  const banners = useBanners();
  return banners.filter(b => !!(b as TxBannerMetadata).txHash) as TxBannerMetadata[];
};

const useTxBannerMap = () => {
  const txBanners = useTxsBanners();
  return useMemo(() => {
    return txBanners.reduce((a: { [txHash: string]: TxBannerMetadata }, c: TxBannerMetadata) => {
      return {
        ...a,
        [c.txHash]: c,
      };
    }, {} as { [txHash: string]: TxBannerMetadata });
  }, [txBanners]);
};

const useTxBanner = (txHash: string) => {
  const txBannerMap = useTxBannerMap();
  return txBannerMap[txHash];
};

const useBannerActions = () => {
  return React.useContext(BannerActionsContext);
};

const useTxBannerActions = () => {
  const bannerActions = useBannerActions();
  const txBanners = useTxsBanners();
  const txHashToIndexMap = useMemo(() => {
    return txBanners.reduce((a: { [txHash: string]: number }, c: TxBannerMetadata, i: number) => {
      return {
        ...a,
        [c.txHash]: i,
      };
    }, {} as { [txHash: string]: number });
  }, [txBanners]);
  return useMemo(
    () => ({
      dismissTxBanner: (txHash: string) => {
        if (!txHashToIndexMap[txHash]) {
          return;
        }
        bannerActions.updateBanner(txHashToIndexMap[txHash], { dismissed: true });
      },
      updateTxBanner: (txHash: string, changes: Partial<TxBannerMetadata>) => {
        if (!txHashToIndexMap[txHash]) {
          return;
        }
        bannerActions.updateBanner(txHashToIndexMap[txHash], changes);
      },
      addPendingTxBanner: (txHash: string, description: string) => {
        bannerActions.addBanner({
          dismissed: false,
          type: "loading",
          description: description,
          txHash,
        } as TxBannerMetadata);
      },
    }),
    [],
  );
};

export { BannerProvider, useBanners, useTxsBanners, useTxBannerMap, useTxBanner, useBannerActions, useTxBannerActions };
