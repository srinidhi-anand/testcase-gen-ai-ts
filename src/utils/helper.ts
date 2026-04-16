export function formatDate(
    date: Date | string,
    timeZone?: string
): string {
    const d = new Date(date);

    return new Intl.DateTimeFormat("en-US", {
        timeZone: timeZone || getUserTimeZone(),
        dateStyle: "medium",
        timeStyle: "medium",
    }).format(d);
}

export function getUserTimeZone(): string {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
}
