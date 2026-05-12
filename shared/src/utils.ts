export const getGeneralString = (date: Date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
};

export const getMonthFromDateString = (dateString: string): number => {
    return parseInt(dateString.split('-')[1], 10);
}
