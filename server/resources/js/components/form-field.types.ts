import type React from 'react';
import type { InputHTMLAttributes } from 'react';

export interface FormFieldProps extends InputHTMLAttributes<HTMLInputElement> {
    label: string;
    error?: string;
    hint?: string;
    wrapperClassName?: string;
}
export interface SelectFieldProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    label: string;
    error?: string;
    hint?: string;
    options: { value: string; label: string }[];
    placeholder?: string;
    wrapperClassName?: string;
}
export interface TextareaFieldProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    label: string;
    error?: string;
    hint?: string;
    wrapperClassName?: string;
}
export interface CheckboxFieldProps extends Omit<
    InputHTMLAttributes<HTMLInputElement>,
    'type'
> {
    label: string;
    error?: string;
    wrapperClassName?: string;
}
