export interface IObject {
    objectName: string;
    url?: string;
}

export interface IPriority
{
    priorityKey: string;
    object: IObject;
    checked: boolean;
}
