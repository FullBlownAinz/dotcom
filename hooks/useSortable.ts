import { useEffect, useRef } from 'react';
import Sortable from 'sortablejs';

export const useSortable = <T>(
  list: T[],
  setList: (list: T[]) => void,
  isEditMode: boolean
) => {
  const containerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!containerRef.current || !isEditMode) return;

    const sortable = Sortable.create(containerRef.current, {
      animation: 150,
      handle: '.cursor-grab',
      onEnd: (evt) => {
        if (evt.oldIndex !== undefined && evt.newIndex !== undefined) {
          const newList = [...list];
          const [movedItem] = newList.splice(evt.oldIndex, 1);
          newList.splice(evt.newIndex, 0, movedItem);
          setList(newList);
        }
      },
    });

    return () => {
      sortable.destroy();
    };
  }, [list, setList, isEditMode]);

  return containerRef;
};
