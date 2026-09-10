import { createContext, useContext } from "react";
export type Density = "comfortable" | "compact";
export const DensityContext = createContext<Density>("comfortable");
/** Read the density chosen by the nearest NquiProvider. */
export function useDensity(): Density {
	return useContext(DensityContext);
}
