import { createFetchMock } from "../../test/utils/createFetchMock"
import { createNagerService } from "./nager.service";

export const createNagerTestService = (response: any) => {
    const fetchMock = createFetchMock(response);

    const service = createNagerService(fetchMock);

    return { service, fetchMock };
}