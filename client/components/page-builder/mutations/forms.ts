import { submitForm as apiSubmitForm } from '@/api/forms';

export async function submitEmbeddedForm(
    formId: number,
    payload: Record<string, unknown>,
): Promise<{ message: string }> {
    return apiSubmitForm(formId, payload);
}
