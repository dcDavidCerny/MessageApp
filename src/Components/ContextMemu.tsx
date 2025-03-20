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
  messageId: string;
  items: ContextMenuItem[];
  children: ReactNode;
}

const Container = styled.div`
  display: inline-block;
  position: relative;
`;

interface MenuProps {}
const Menu = styled.ul<MenuProps>`
  position: absolute;
  background: #fff;
  border: 1px solid #ccc;
  list-style: none;
  padding: 1px 1px;
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
  messageId,
  items,
  children,
}) => {
  const [visible, setVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleContextMenu = (event: MouseEvent) => {
    event.preventDefault();
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
    <Container ref={containerRef} onContextMenu={handleContextMenu}>
      {children}
      {visible && (
        <Menu>
          {items.map((item, index) => (
            <MenuItem
              key={index}
              onClick={(e) => {
                e.stopPropagation();
                item.onClick();
                setVisible(false);
              }}
              onMouseDown={(e) => e.stopPropagation()}
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
