import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo } from "react";
import { timelineApi } from "../../../services/api/api";
import { IEvent } from "@cv/shared";

const resolveNearMonthData = (year: number, month: number, direction: number) => {
    const newDate = new Date(year, month + direction, 1);
    return { year: newDate.getFullYear(), month: newDate.getMonth() };
};

const useTimelineData = (year: number, month: number) => {
    const queryClient = useQueryClient();

    useEffect(() => {
        const { year: nextYear, month: nextMonth } = resolveNearMonthData(year, month, 1);
        const { year: prevYear, month: prevMonth } = resolveNearMonthData(year, month, -1);
        queryClient.prefetchQuery({
            queryKey: ['timeline', nextYear, nextMonth],
            queryFn: () => timelineApi.getMonthEvents(nextYear, nextMonth)
        });

        queryClient.prefetchQuery({
            queryKey: ['timeline', prevYear, prevMonth],
            queryFn: () => timelineApi.getMonthEvents(prevYear, prevMonth)
        });
    }, [month, year, queryClient]);

    const { data: eventsData } = useQuery<Record<string, IEvent[]>>({
        queryKey: ['timeline', year, month],
        queryFn: () => timelineApi.getMonthEvents(year, month)
    });

    const events = useMemo(() => {
        if (!eventsData) {
            return new Map<string, IEvent[]>();
        };
        return new Map(Object.entries(eventsData));
    }, [eventsData]);

    return { events };
}

export default useTimelineData
