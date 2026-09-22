import { createContext, useContext, useMemo } from "react";
import { useLocale } from "react-aria-components";
import { messagesForLocale, type NquiMessages } from "./messages";

/** Overrides set by `NquiProvider`'s `messages` prop. */
export const MessagesContext = createContext<Partial<NquiMessages> | null>(null);

/**
 * The strings for the current locale (from `NquiProvider` or React Aria's `I18nProvider`),
 * with the provider's `messages` overrides applied.
 */
export function useMessages(): NquiMessages {
	const { locale } = useLocale();
	const overrides = useContext(MessagesContext);
	const base = messagesForLocale(locale);
	return useMemo(() => (overrides ? { ...base, ...overrides } : base), [base, overrides]);
}
