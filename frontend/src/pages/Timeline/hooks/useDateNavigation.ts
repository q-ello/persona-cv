import { useCallback, useMemo, useRef, useState } from "react";

const maxPastDate = new Date(2023, 0, 1);

const clampDate = (date: Date, maxFutureDate: Date): Date => {
    if (date < maxPastDate) return maxPastDate;
    if (date > maxFutureDate) return maxFutureDate;
    return date;
}

const moveMonth = (date: Date, delta: number): Date => {
    const day = date.getDate();
    const newMonth = date.getMonth() + delta;

    const daysInTargetMonth = new Date(date.getFullYear(), newMonth + 1, 0).getDate();
    date.setDate(day > daysInTargetMonth ? daysInTargetMonth : day);
    date.setMonth(newMonth);
    return date;
}

const useDateNavigation = () => {
    const today = useMemo(() => new Date(), []);

    const maxFutureDate = useMemo(() => {
        const date = new Date(today.getFullYear(), today.getMonth() + 3, 1);
        date.setDate(date.getDate() - 1);
        return date;
    }, [today]);

    const [selectedDate, setSelectedDate] = useState<Date>(today);
    const previousDate = useRef(selectedDate);

    const clamp = useCallback((date: Date) => clampDate(date, maxFutureDate), [maxFutureDate]);

    const onMonthChanged = useCallback((direction: number) => {
        setSelectedDate(prev => clamp(moveMonth(new Date(prev), direction)));
    }, [clamp]);

    const selectedDateRef = useRef(selectedDate);
    selectedDateRef.current = selectedDate;

    const handleKeyNav = useCallback((key: string): boolean => {
        let handled = true;
        setSelectedDate(prev => {
            let d = new Date(prev);
            if (key === "w" || key === "ArrowUp") d.setDate(d.getDate() - 7);
            else if (key === "s" || key === "ArrowDown") d.setDate(d.getDate() + 7);
            else if (key === "a" || key === "ArrowLeft") d.setDate(d.getDate() - 1);
            else if (key === "d" || key === "ArrowRight") d.setDate(d.getDate() + 1);
            else if (key === "e") d = moveMonth(d, 1);
            else if (key === "q") d = moveMonth(d, -1);
            else {
                handled = false;
                return prev;
            }
            return clamp(d);
        });
        return handled;
    }, [clamp]);

    const pastSelected = useMemo(() => {
        const s = new Date(selectedDate);
        const t = new Date(today);
        s.setHours(0, 0, 0, 0);
        t.setHours(0, 0, 0, 0)
        return s < t;
    }, [selectedDate, today]);

    const isOnMaxPastMonth = useMemo(() => {
        return selectedDate.getFullYear() === maxPastDate.getFullYear() && selectedDate.getMonth() === maxPastDate.getMonth()
    }, [selectedDate]);

    const isOnMaxFutureMonth = useMemo(() => {
        return selectedDate.getFullYear() === maxFutureDate.getFullYear() && selectedDate.getMonth() === maxFutureDate.getMonth()
    }, [selectedDate]);

    return {
        today,
        selectedDate,
        setSelectedDate,
        previousDate,
        pastSelected,
        isOnMaxFutureMonth,
        isOnMaxPastMonth,
        onMonthChanged,
        handleKeyNav
    };
};

export default useDateNavigation;
