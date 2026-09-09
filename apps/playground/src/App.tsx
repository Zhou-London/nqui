import {
	IconButton,
	NquiProvider,
	Tab,
	TabList,
	Tabs,
	Tooltip,
	TooltipTrigger,
	useTheme,
} from "@nowquant/nqui";
import { Layers, Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { ComponentsPage } from "./pages/Components";

export function App() {
	const { resolved, toggle } = useTheme();
	const [market, setMarket] = useState<"us" | "cn">("us");
	const [shape, setShape] = useState<"default" | "sharp" | "soft">("default");
	useEffect(() => {
		if (shape === "default") delete document.documentElement.dataset.shape;
		else document.documentElement.dataset.shape = shape;
	}, [shape]);

	return (
		<NquiProvider market={market}>
			<div className="flex h-dvh flex-col bg-background text-foreground">
				<header className="glass z-50 flex h-12 shrink-0 items-center gap-3 overflow-x-clip border-b px-3">
					<span className="flex items-center gap-2 font-semibold text-sm tracking-tight">
						<span className="flex size-6 items-center justify-center rounded-md bg-accent text-accent-foreground">
							<Layers className="size-3.5" />
						</span>
						NQUI
						<span className="hidden font-normal text-muted sm:inline">component gallery</span>
					</span>
					<div className="ml-auto flex items-center gap-1">
						<Tabs
							variant="text"
							size="sm"
							selectedKey={market}
							onSelectionChange={(k) => setMarket(k as "us" | "cn")}
							className="gap-0"
						>
							<TabList aria-label="Market colors">
								<Tab id="us">
									US<span className="hidden sm:inline"> colors</span>
								</Tab>
								<Tab id="cn">
									CN<span className="hidden sm:inline"> colors</span>
								</Tab>
							</TabList>
						</Tabs>
						{/* The shape switch is a nicety; it is hidden on phones so the bar fits in 375px. */}
						<div className="hidden md:block">
							<Tabs
								variant="text"
								size="sm"
								selectedKey={shape}
								onSelectionChange={(k) => setShape(k as typeof shape)}
								className="gap-0"
							>
								<TabList aria-label="Shape">
									<Tab id="sharp">Sharp</Tab>
									<Tab id="default">Round</Tab>
									<Tab id="soft">Soft</Tab>
								</TabList>
							</Tabs>
						</div>
						<TooltipTrigger>
							<IconButton aria-label="Toggle color scheme" size="sm" onPress={toggle}>
								{resolved === "dark" ? <Sun /> : <Moon />}
							</IconButton>
							<Tooltip>Switch to {resolved === "dark" ? "light" : "dark"}</Tooltip>
						</TooltipTrigger>
					</div>
				</header>
				<div className="min-h-0 flex-1 overflow-hidden">
					<ComponentsPage />
				</div>
			</div>
		</NquiProvider>
	);
}
