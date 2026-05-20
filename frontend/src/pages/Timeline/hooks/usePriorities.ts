import { useMemo } from "react";
import { timelineApi } from "../../../services/api/api";
import { useQuery } from "@tanstack/react-query";

const usePriorities = () => {
    const { data: prioritiesData, isLoading: prioritiesLoading, } = useQuery({
        queryKey: ["priorities"],
        queryFn: timelineApi.getPriorities,
        staleTime: 1000 * 60 * 30,
    });

    const priorities = useMemo(() => {
        if (!prioritiesData) return [];
        return prioritiesData;
    }, [prioritiesData, prioritiesLoading]);

    return { priorities, prioritiesLoading };
}

export default usePriorities;
