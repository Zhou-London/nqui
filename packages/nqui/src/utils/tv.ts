import { createTV, type VariantProps } from "tailwind-variants";
import { twMergeConfig } from "./cn";

/** `tv` preconfigured with the NQUI tailwind-merge settings. */
export const tv = createTV({ twMergeConfig });

export type { VariantProps };
