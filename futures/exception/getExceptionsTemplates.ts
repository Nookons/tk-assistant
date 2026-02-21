import {IIssueTemplate} from "@/types/Exception/ExceptionParse";

export async function getExceptionsTemplates(): Promise<IIssueTemplate[]> {
    const response = await fetch(`/api/exception/get-exceptions-templates`);

    if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
    }

    return response.json();
}