export function legacyRedirectUrl(destination: string, search: Record<string, string | string[] | undefined>) {
    const query = new URLSearchParams();
    for (const [key, value] of Object.entries(search)) {
        if (Array.isArray(value)) value.forEach(item => query.append(key, item));
        else if (value !== undefined) query.append(key, value);
    }
    return destination + (query.size ? "?" + query.toString() : "");
}
