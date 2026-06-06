import { useMemo } from "react";
import { timelineApi } from "../../../services/api/api";
import { useQuery } from "@tanstack/react-query";
import { useLanguage } from "../../../services/localization/languageStore";

const usePriorities = () => {
    const lang = useLanguage();

    const { data: prioritiesData, isLoading: prioritiesLoading, } = useQuery({
        queryKey: ["priorities", lang],
        queryFn: () => timelineApi.getPriorities(lang),
        staleTime: 1000 * 60 * 30,
    });

    const priorities = useMemo(() => {
        if (!prioritiesData) return [];
        return prioritiesData;
    }, [prioritiesData, prioritiesLoading]);

    return { priorities, prioritiesLoading };
}

export default usePriorities;
