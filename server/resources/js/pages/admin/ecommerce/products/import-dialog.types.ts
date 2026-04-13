export type ImportValidationError = {
    row: number;
    field: string;
    message: string;
};

export type ImportValidationResult = {
    valid: boolean;
    errors: ImportValidationError[];
    preview: Record<string, unknown>[];
    total_rows: number;
    missing_headers: string[];
};
