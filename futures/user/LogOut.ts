import {toast} from "sonner";


export const LogOutUser = async () => {
    const res = await fetch("/api/auth/logout", {method: "POST"});

    if (!res.ok) {
        const errorText = await res.text();
        console.error("Logout failed:", errorText);
        toast.error("Logout failed due to an API error.");
    } else {
        toast.success("Successfully logged out.");
    }
}