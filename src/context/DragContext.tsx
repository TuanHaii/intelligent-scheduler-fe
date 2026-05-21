import { createContext, useContext, useState, type ReactNode } from "react";
import type { DragTask } from "@/types/dnd";

interface DragContextValue {
  draggedTask: DragTask | null;
  setDraggedTask: (task: DragTask | null) => void;
}

const DragContext = createContext<DragContextValue>({
  draggedTask: null,
  setDraggedTask: () => {},
});

export function DragProvider({ children }: { children: ReactNode }) {
  const [draggedTask, setDraggedTask] = useState<DragTask | null>(null);
  return (
    <DragContext.Provider value={{ draggedTask, setDraggedTask }}>
      {children}
    </DragContext.Provider>
  );
}

export function useDrag() {
  return useContext(DragContext);
}
