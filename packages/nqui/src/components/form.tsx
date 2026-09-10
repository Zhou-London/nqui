import { Form as AriaForm, type FormProps as AriaFormProps } from "react-aria-components";
import { cn } from "../utils/cn";

export interface FormProps extends AriaFormProps {}

/** Form with native validation wiring; children are NQUI fields. */
export function Form({ className, ...props }: FormProps) {
	return <AriaForm {...props} className={cn("flex flex-col gap-6", className)} />;
}
