import React from "react";
import styled from "styled-components";

import { H1 } from "./typography";

const DropdownContainer = styled.div``;

export interface DropdownItem {
  id: string;
  displayName: string;
}

export interface DropdownProps {
  selectedId: string;
  items: DropdownItem[];
  onSelect: (itemId: string) => void;
  className?: string;
}

export const Dropdown: React.FC<DropdownProps> = ({ selectedId, items = [] }) => {
  const selectedItem = items.find(item => item.id === selectedId);
  if (!selectedItem) {
    return null;
  }
  return (
    <DropdownContainer>
      <H1>{selectedItem.displayName}</H1>
    </DropdownContainer>
  );
};
