import { useMemo } from "react";
import { timelineApi } from "../../../services/api/api";
import { useQuery } from "@tanstack/react-query";

const useObjectives = () => {
    const { data: objectivesData, isLoading: objectivesLoading, } = useQuery({
        queryKey: ["objectives"],
        queryFn: timelineApi.getObjectives,
        staleTime: 1000 * 60 * 30,
    });

    const objectives = useMemo(() => {
        if (!objectivesData) return [];
        return objectivesData;
    }, [objectivesData, objectivesLoading]);

    return { objectives, objectivesLoading };
}

export default useObjectives;
