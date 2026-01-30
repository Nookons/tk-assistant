

export const FetchUser = async () => {
    const res = await fetch("/api/auth/me", {cache: "no-store"});
    if (!res.ok) throw new Error(res.statusText);
    return res.json();
}