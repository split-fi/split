import { useEffect, useState, useRef } from "react";

export const useIsOpenUntilOutside = (): [
  boolean,
  React.Dispatch<React.SetStateAction<boolean>>,
  React.MutableRefObject<any>,
] => {
  const [isOpen, setIsOpen] = useState(false);
  const [node] = useOnClickOutside(isOpen, () => setIsOpen(false));
  return [isOpen, setIsOpen, node];
};

export const useOnClickOutside = (isOpen: boolean, onClickOutside: () => void): [React.MutableRefObject<any>] => {
  const node = useRef();
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (node && (node as any).current.contains(e.target)) {
        // inside click
        return;
      }
      // outside click
      onClickOutside();
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClickOutside]);

  return [node];
};
