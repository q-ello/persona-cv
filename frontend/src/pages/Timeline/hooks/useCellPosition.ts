import { useCallback, useMemo, useRef, useState } from 'react'
import { getGeneralString } from '@cv/shared';

export interface ICellPosition {
    x: number;
    y: number;
    w: number;
    h: number;
}

const useCellPosition = (selectedDate: Date, today: Date) => {
    const [rects, setRects] = useState<Map<string, ICellPosition>>(new Map());

    const gridElRef = useRef<HTMLDivElement | null>(null);

    const gridRef = useCallback((el: HTMLDivElement | null) => {
        gridElRef.current = el;
    }, []);

    const registerCell = useCallback((dateKey: string, rect: DOMRect) => {
        const gridRect = gridElRef.current?.getBoundingClientRect();
        if (!gridRect) return;
        setRects(prev => {
            const newMap = new Map(prev);
            newMap.set(dateKey, {
                x: rect.x - gridRect.x,
                y: rect.y - gridRect.y,
                w: rect.width,
                h: rect.height,
            });
            return newMap;
        });
    }, []);

    const selectedPos = useMemo(() =>
        rects.get(getGeneralString(selectedDate)) ?? null,
        [selectedDate, rects]);

    const todayPos = useMemo(() =>
        rects.get(getGeneralString(today)) ?? null,
        [today, rects]);

    return { gridRef, registerCell, selectedPos, todayPos };
}

export default useCellPosition;
