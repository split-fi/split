import React, { useMemo, useState, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import { AppModal } from "../types/app";
import { AppComponent } from "next/dist/next-server/lib/router/router";

export interface ModalStatesMap {
  [appModal: string]: boolean;
}

export interface AppModalContext {
  modalStates: ModalStatesMap;
  setModalState: (modalKey: AppModal, state: boolean) => void;
}

const InitialModalStates = {
  [AppModal.WALLET]: false,
};

const AppModalContext = React.createContext<AppModalContext>({
  modalStates: InitialModalStates,
  setModalState: () => new Error("Missing AddModalContext"),
});

const AppModalProvider: React.FC = ({ children }) => {
  const [modalStates, setModalStates] = useState<ModalStatesMap>(InitialModalStates);

  const setModalState = (modalKey: AppModal | undefined, state: boolean) => {
    if (!modalKey) {
      return;
    }
    if (!modalStates[modalKey]) {
      return;
    }
    const newModalStates = {
      ...modalStates,
      [modalKey]: state,
    };
    setModalStates(newModalStates);
  };

  return (
    <AppModalContext.Provider
      value={{
        modalStates,
        setModalState,
      }}
    >
      {children}
    </AppModalContext.Provider>
  );
};

const useAppModal = () => {
  return React.useContext(AppModalContext);
};

const useModalState = (modalKey: AppModal) => {
  const { modalStates } = useAppModal();
  return modalStates[modalKey];
};

const useModalStateActions = (modalKey: AppModal) => {
  const { setModalState } = useAppModal();
  return {
    openModal: () => setModalState(modalKey, true),
    closeModal: () => setModalState(modalKey, false),
  };
};

export { AppModalProvider, useAppModal, useModalState, useModalStateActions };
