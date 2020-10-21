import React, { useState } from "react";
import styled from "styled-components";

import { H1 } from "./typography";
import { Triangle } from "./icons/triangle";
import { useIsOpenUntilOutside } from "../hooks/useOnClickOutside";

const DropdownContainer = styled.div`
  display: flex;
  align-items: center;
  cursor: pointer;
`;

const Selector = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const ArrowContainer = styled.div`
  margin-left: 10px;
`;

const Select = styled.div`
  position: absolute;
  border-radius: 21px;
  border: 2px solid white;
  padding: 30px;
  background-color: #0c2ea0;
`;

const Option = styled.div`
  font-size: 40px;
  color: white;
  margin: 20px 0px;
  &:hover {
    font-style: italic;
    font-weight: bold;
  }
`;

export interface DropdownItem {
  id: string;
  displayName: string;
}

export interface DropdownProps {
  selectedId: string;
  items: DropdownItem[];
  onSelect?: (itemId: string) => void;
  onSelectIndex?: (index: number) => void;
  className?: string;
}

const noop = () => {};

export const Dropdown: React.FC<DropdownProps> = ({
  selectedId,
  className,
  onSelect = noop,
  onSelectIndex = noop,
  items = [],
}) => {
  const [isOpen, setIsOpen, node] = useIsOpenUntilOutside();
  const selectedItem = items.find(item => item.id === selectedId);
  if (!selectedItem) {
    return null;
  }
  return (
    <DropdownContainer ref={node} onClick={() => setIsOpen(true)} className={className}>
      <Selector>
        <H1>{selectedItem.displayName}</H1>
        <ArrowContainer>
          <Triangle />
        </ArrowContainer>
      </Selector>
      {isOpen && (
        <Select>
          {items.map((item, index) => (
            <Option
              key={item.id}
              onClick={e => {
                onSelect(item.id);
                onSelectIndex(index);
                setIsOpen(false);
                e.stopPropagation();
              }}
            >
              {item.displayName}
            </Option>
          ))}
        </Select>
      )}
    </DropdownContainer>
  );
};
