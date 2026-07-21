import { forwardRef, useRef } from "react";
import { NumericFormat, NumericFormatProps } from "react-number-format";
import TextField, { TextFieldProps } from "@mui/material/TextField";

interface NumberInputProps
    extends Omit<
        NumericFormatProps<TextFieldProps>,
        | "customInput"
        | "onChange"
        | "onValueChange"
    > {
    value: string;
    setEditingField: React.Dispatch<React.SetStateAction<"quantity" | "subtotal">>;
    onChange: (value: string) => void;
}

const NumberInput = forwardRef<HTMLInputElement, NumberInputProps>(
    (
        {
            setEditingField,
            value,
            onChange,
            decimalScale = 3,
            allowNegative = false,
            ...props
        },
        ref
    ) => {
        const inputRef = useRef<HTMLInputElement>(null);
        return (
            <NumericFormat size="small" sx={{whiteSpace:"nowrap", borderRadius:50}}
            
                {...props}
                getInputRef={ref}
                customInput={TextField}
                value={value}
                valueIsNumericString
                decimalScale={decimalScale}
                fixedDecimalScale
                allowNegative={allowNegative}
                thousandSeparator={false}
                allowLeadingZeros={false}
                onValueChange={(values) => {
                    onChange(values.value);
                }}
                onFocus = {()=>{
                    setEditingField("quantity")
                }}
                onKeyDown={(e) => {
    if (!/^\d$/.test(e.key)) return;
    


    if (!(e.target instanceof HTMLInputElement)) {
    return;
}

    const input = e.target;

    

    const dot = value.indexOf(".");
    
    if (dot === -1) return;

    const cursor = input.selectionStart ?? 0;
    console.log(input,value, dot, cursor)

    const decimal = value.slice(dot + 1);

    // already has 2 decimals?
    if (decimal.length !== 3) return;

    // caret is after the last decimal digit
    if (cursor !== value.length) return;

    e.preventDefault();

    const newValue =
        value.substring(0, value.length - 1) + e.key;

    onChange(newValue);

    requestAnimationFrame(() => {
        input.setSelectionRange(
            newValue.length,
            newValue.length
        );
    });
}}
                
            />
        );
    }
);

NumberInput.displayName = "NumberInput";

export default NumberInput;