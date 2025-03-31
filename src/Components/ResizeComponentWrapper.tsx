/** @jsxImportSource @emotion/react */
import React, { useState, useRef, useCallback, useEffect } from "react";
import styled from "@emotion/styled";

// Types for the components
interface ResizeComponentWrapperProps {
  initialConversationListWidth: number;
  conversationListMinWidth: number;
  conversationListMaxWidth: number;
  children: [React.ReactNode, React.ReactNode];
}

export const ResizeComponentWrapper: React.FC<ResizeComponentWrapperProps> = ({
  initialConversationListWidth,
  conversationListMinWidth,
  conversationListMaxWidth,
  children,
}) => {
  const [conversationListWidth, setConversationListWidth] = useState(
    initialConversationListWidth
  );

  const resizerRef = useRef<HTMLDivElement | null>(null);
  const isResizing = useRef<boolean>(false);
  const lastX = useRef<number>(0);

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    isResizing.current = true;
    lastX.current = e.clientX;
    document.body.style.cursor = "col-resize";
    // document.body.style.userSelect = "none";
  }, []);

  const onMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isResizing.current) return;

      const deltaX = e.clientX - lastX.current;
      const newConversationListWidth = conversationListWidth + deltaX;

      if (
        newConversationListWidth >= conversationListMinWidth &&
        newConversationListWidth <= conversationListMaxWidth
      ) {
        setConversationListWidth(newConversationListWidth);
      }

      lastX.current = e.clientX;
    },
    [conversationListWidth, conversationListMinWidth, conversationListMaxWidth]
  );

  const onMouseUp = useCallback(() => {
    isResizing.current = false;
    document.body.style.cursor = "default";
    document.body.style.userSelect = "";
  }, []);

  useEffect(() => {
    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);

    return () => {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    };
  }, [onMouseMove, onMouseUp]);

  // useEffect(() => {
  //   if (isResizing.current) {
  //     document.body.style.userSelect = "none";
  //   } else {
  //     document.body.style.userSelect = "";
  //   }

  //   return () => {
  //     document.body.style.userSelect = "";
  //   };
  // }, [isResizing]);

  return (
    <Wrapper>
      <Column style={{ width: `${conversationListWidth}px` }}>
        {children[0]}
      </Column>

      <Resizer ref={resizerRef} onMouseDown={onMouseDown} />

      <ColumnRight>{children[1]}</ColumnRight>
    </Wrapper>
  );
};

const Wrapper = styled.div`
  display: flex;
  height: 100%;
  width: 100%;
`;

const Column = styled.div`
  background-color: #f0f0f0;
  padding: 10px;
  box-sizing: border-box;
  height: 100%;
  overflow: hidden;
`;

const ColumnRight = styled(Column)`
  flex-grow: 1;
`;

const Resizer = styled.div`
  cursor: col-resize;
  background-color: #ccc;
  width: 5px;
  height: 100%;
  margin: 0 10px;
`;
