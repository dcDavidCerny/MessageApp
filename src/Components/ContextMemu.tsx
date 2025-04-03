import React, {
  useState,
  useEffect,
  useRef,
  ReactNode,
  MouseEvent,
} from "react";
import styled from "@emotion/styled";

export interface ContextMenuItem {
  text: string;
  onClick: () => void;
}

export interface ContextMenuProps {
  items: ContextMenuItem[];
  children: ReactNode;
  isOnClick?: boolean;
  fullWidth?: boolean;
}

const Container = styled.div<{ fullWidth?: boolean }>`
  display: inline-block;
  position: relative;
  width: ${(props) => (props.fullWidth ? "100%" : "auto")};
`;

const Menu = styled.ul<{ x: number; y: number }>`
  position: fixed;
  top: ${(props) => props.y}px;
  left: ${(props) => props.x}px;
  background: #fff;
  border: 1px solid #ccc;
  list-style: none;
  padding: 4px 0;
  margin: 0;
  z-index: 1000;
  box-shadow: 0px 2px 10px rgba(0, 0, 0, 0.2);
`;

const MenuItem = styled.li`
  padding: 8px 12px;
  cursor: pointer;
  white-space: nowrap;
  &:hover {
    background: #eee;
  }
`;

export const ContextMenu: React.FC<ContextMenuProps> = ({
  items,
  children,
  isOnClick = false,
  fullWidth = false,
}) => {
  const [visible, setVisible] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleContextMenu = (event: MouseEvent) => {
    event.preventDefault();
    setPosition({ x: event.clientX, y: event.clientY });
    setVisible(true);
  };

  const handleClickMenu = (event: MouseEvent) => {
    event.stopPropagation();
    setPosition({ x: event.clientX - 50, y: event.clientY });
    setVisible(true);
  };

  const handleClick = () => {
    if (visible) {
      setVisible(false);
    }
  };

  useEffect(() => {
    document.addEventListener("click", handleClick);
    return () => {
      document.removeEventListener("click", handleClick);
    };
  }, [visible]);

  return (
    <Container
      fullWidth={fullWidth}
      {...(isOnClick
        ? { onClick: handleClickMenu }
        : { onContextMenu: handleContextMenu })}
    >
      {children}
      {visible && (
        <Menu x={position.x} y={position.y}>
          {items.map((item, index) => (
            <MenuItem
              key={index}
              onClick={(e) => {
                e.stopPropagation();
                item.onClick();
                setVisible(false);
              }}
            >
              {item.text}
            </MenuItem>
          ))}
        </Menu>
      )}
    </Container>
  );
};

export default ContextMenu;
