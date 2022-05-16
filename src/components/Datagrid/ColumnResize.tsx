import React from "react";
import Draggable, { DraggableEventHandler } from "react-draggable";

import { columnResizerWidth } from "./styles";

const ColumnResize: React.FC<{
  offset: number;
  onDrop: DraggableEventHandler;
}> = ({ offset, onDrop }) => {
  const [drag, setDrag] = React.useState(false);

  return (
    <Draggable
      axis="x"
      onMouseDown={e => {
        e.preventDefault();
        e.stopPropagation();
      }}
      onDrag={() => {
        setDrag(true);
      }}
      onStop={(event, data) => {
        setDrag(false);
        onDrop(event, data);
      }}
    >
      <div
        style={{
          background: drag ? "red" : "transparent",
          cursor: "e-resize",
          width: columnResizerWidth,
          height: "100%",
          position: "absolute",
          top: 0,
          left: offset
        }}
      />
    </Draggable>
  );
};

export default ColumnResize;
