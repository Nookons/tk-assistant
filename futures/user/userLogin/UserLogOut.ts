
export const UserLogOut = async () => {
    const res = await fetch("/api/auth/logout", {method: "POST"});

    if (!res.ok) {
        const errorText = await res.text();
        console.error("Logout failed:", errorText);
    }
}