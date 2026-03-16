import {toast} from "sonner";

export const copyToClipboard = (text: string) => {
    try {
        navigator.clipboard.writeText(text);
        toast.success("Copied to clipboard");
    } catch (error) {
        console.log(error);
        error && toast.error(error.toString);
    }
};