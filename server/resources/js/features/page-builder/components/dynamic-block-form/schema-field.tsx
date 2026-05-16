import type { FieldProps } from '../dynamic-block-form.types';
import { BooleanField } from './boolean-field';
import { NumberField } from './number-field';
import { RepeaterField } from './repeater-field';
import { StringField } from './string-field';

export function SchemaField(props: FieldProps) {
    switch (props.schema.type) {
        case 'string':
            return <StringField {...props} />;
        case 'integer':
        case 'number':
            return <NumberField {...props} />;
        case 'boolean':
            return <BooleanField {...props} />;
        case 'array':
            return (
                <RepeaterField
                    {...props}
                    renderField={(fieldProps) => (
                        <SchemaField
                            key={fieldProps.fieldKey}
                            {...fieldProps}
                        />
                    )}
                />
            );
        default:
            return null;
    }
}
