export const validateErrorLine = (line: string): { valid: boolean; error?: string } => {
    const parts = line.split(".");

    if (parts.length < 3) {
        return {valid: false, error: "Invalid format (expected: Error.Robot.Time)"};
    }

    const [, , errorTime] = parts;

    if (!errorTime || !errorTime.includes(':')) {
        return {valid: false, error: "Invalid time format"};
    }

    const timeParts = errorTime.split(':');

    if (timeParts.length !== 2) {
        return {valid: false, error: "Time must be in HH:mm format"};
    }

    const [hour, minute] = timeParts.map(Number);

    if (isNaN(hour) || isNaN(minute) || hour < 0 || hour > 23 || minute < 0 || minute > 59) {
        return {valid: false, error: "Invalid time values"};
    }

    return {valid: true};
};

export const validateErrorLineP3 = (line: string): { valid: boolean; error?: string } => {
    const parts = line.trim().split(".");

    if (parts.length < 5) {
        return { valid: false, error: "Invalid format (expected: Robot.ErrorType.SubType.Recovery.HH:mm)" };
    }

    const errorTime = parts[4];

    if (!errorTime?.includes(':')) {
        return { valid: false, error: "Invalid time format" };
    }

    const [hour, minute] = errorTime.split(':').map(Number);

    if (isNaN(hour) || isNaN(minute) || hour < 0 || hour > 23 || minute < 0 || minute > 59) {
        return { valid: false, error: "Invalid time values (expected HH:mm)" };
    }

    return { valid: true };
};