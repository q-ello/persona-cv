import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo } from "react";
import { timelineApi } from "../../../services/api/api";
import { EventResponse, IEvent } from "@cv/shared";
import { useLanguage } from "../../../services/localization/languageStore";

const resolveNearMonthData = (year: number, month: number, direction: number) => {
    const newDate = new Date(year, month + direction, 1);
    return { year: newDate.getFullYear(), month: newDate.getMonth() };
};

const useTimelineData = (year: number, month: number) => {
    const queryClient = useQueryClient();

    const lang = useLanguage();

    useEffect(() => {
        const { year: nextYear, month: nextMonth } = resolveNearMonthData(year, month, 1);
        const { year: prevYear, month: prevMonth } = resolveNearMonthData(year, month, -1);
        queryClient.prefetchQuery({
            queryKey: ['timeline', lang, nextYear, nextMonth],
            queryFn: () => timelineApi.getMonthEvents(lang, nextYear, nextMonth)
        });

        queryClient.prefetchQuery({
            queryKey: ['timeline', lang, prevYear, prevMonth],
            queryFn: () => timelineApi.getMonthEvents(lang, prevYear, prevMonth)
        });
    }, [lang, month, year, queryClient]);

    const { data: eventsData } = useQuery<EventResponse>({
        queryKey: ['timeline', lang, year, month],
        queryFn: () => timelineApi.getMonthEvents(lang, year, month)
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
