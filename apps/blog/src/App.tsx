import {
	Button,
	CommandItem,
	CommandPalette,
	CommandSection,
	IconButton,
	Kbd,
	Link,
	Navbar,
	NavbarBrand,
	NavbarContent,
	NavbarItem,
	NquiProvider,
	Tooltip,
	TooltipTrigger,
	useCommandShortcut,
	useTheme,
} from "@nowquant/nqui";
import { FileText, Moon, PenTool, Search, Sun, Tag, User } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { author, posts } from "./data";
import { AboutPage } from "./pages/About";
import { HomePage } from "./pages/Home";
import { PostPage } from "./pages/Post";
import { TagPage } from "./pages/Tag";

type Route =
	| { name: "home"; page: number }
	| { name: "post"; slug: string }
	| { name: "tag"; tag: string }
	| { name: "about" }
	| { name: "missing"; path: string };

function parse(hash: string): Route {
	const path = hash.replace(/^#/, "") || "/";
	const [, a, b] = path.split("/");
	if (!a) return { name: "home", page: 1 };
	if (a === "page" && b) return { name: "home", page: Number(b) || 1 };
	if (a === "post" && b) return { name: "post", slug: b };
	if (a === "tag" && b) return { name: "tag", tag: decodeURIComponent(b) };
	if (a === "about") return { name: "about" };
	return { name: "missing", path };
}

function useHashRoute(): [Route, (path: string) => void] {
	const [route, setRoute] = useState(() => parse(window.location.hash));
	useEffect(() => {
		const sync = () => {
			const hash = window.location.hash;
			// Routes start with "#/"; anything else is an in-page anchor, such as a heading id
			// from the table of contents, so scroll there and leave the route alone.
			if (hash && !hash.startsWith("#/")) {
				document.getElementById(hash.slice(1))?.scrollIntoView({ block: "start" });
				return;
			}
			setRoute(parse(hash));
			document.querySelector("main")?.scrollTo({ top: 0 });
		};
		window.addEventListener("hashchange", sync);
		return () => window.removeEventListener("hashchange", sync);
	}, []);
	const navigate = useCallback((path: string) => {
		window.location.hash = path;
	}, []);
	return [route, navigate];
}

export function App() {
	const [route, navigate] = useHashRoute();
	return (
		<NquiProvider
			navigate={navigate}
			useHref={(href) => (href.startsWith("/") ? `#${href}` : href)}
		>
			<Site route={route} navigate={navigate} />
		</NquiProvider>
	);
}

function Site({ route, navigate }: { route: Route; navigate: (path: string) => void }) {
	const { resolved, toggle } = useTheme();
	const [paletteOpen, setPaletteOpen] = useState(false);
	useCommandShortcut(useCallback(() => setPaletteOpen((o) => !o), []));

	let page: React.ReactNode;
	switch (route.name) {
		case "home":
			page = <HomePage page={route.page} />;
			break;
		case "post":
			page = <PostPage slug={route.slug} />;
			break;
		case "tag":
			page = <TagPage tag={route.tag} />;
			break;
		case "about":
			page = <AboutPage />;
			break;
		case "missing":
			page = <HomePage page={1} missing={route.path} />;
			break;
	}

	const section = route.name === "post" ? "home" : route.name;
	return (
		<div className="flex h-dvh flex-col bg-background text-foreground">
			<Navbar>
				<NavbarBrand>
					<Link href="/" variant="foreground" className="gap-2 no-underline">
						<span className="flex size-6 items-center justify-center rounded-md bg-accent text-accent-foreground">
							<PenTool className="size-3.5" />
						</span>
						Field Notes
					</Link>
				</NavbarBrand>
				<NavbarContent>
					<NavbarItem href="/" isActive={section === "home"}>
						Writing
					</NavbarItem>
					<NavbarItem href="/tag/data" isActive={section === "tag"}>
						Topics
					</NavbarItem>
					<NavbarItem href="/about" isActive={section === "about"}>
						About
					</NavbarItem>
				</NavbarContent>
				<NavbarContent justify="end" className="gap-2">
					<Button
						variant="outline"
						color="neutral"
						size="sm"
						className="max-md:hidden"
						startContent={<Search />}
						endContent={
							<Kbd keys={["cmd"]} size="sm">
								K
							</Kbd>
						}
						onPress={() => setPaletteOpen(true)}
					>
						Search
					</Button>
					<IconButton
						aria-label="Search"
						className="md:hidden"
						onPress={() => setPaletteOpen(true)}
					>
						<Search />
					</IconButton>
					<TooltipTrigger>
						<IconButton aria-label="Toggle color scheme" onPress={toggle}>
							{resolved === "dark" ? <Sun /> : <Moon />}
						</IconButton>
						<Tooltip>{resolved === "dark" ? "Light mode" : "Dark mode"}</Tooltip>
					</TooltipTrigger>
				</NavbarContent>
			</Navbar>
			<main className="min-h-0 flex-1 overflow-y-auto">
				{page}
				<footer className="mx-auto flex w-full max-w-page flex-wrap items-center justify-between gap-4 border-border border-t px-4 py-8 text-muted text-sm md:px-8">
					<span>
						© 2026 {author.name}. Written in {author.location}.
					</span>
					<span className="flex gap-4">
						{author.links.map((l) => (
							<Link key={l.label} href={l.href} variant="muted" target="_blank">
								{l.label}
							</Link>
						))}
					</span>
				</footer>
			</main>
			<CommandPalette
				isOpen={paletteOpen}
				onOpenChange={setPaletteOpen}
				placeholder="Search posts and pages…"
				onAction={(key) => {
					navigate(String(key));
					setPaletteOpen(false);
				}}
			>
				<CommandSection title="Posts">
					{posts.map((p) => (
						<CommandItem
							key={p.slug}
							id={`/post/${p.slug}`}
							icon={<FileText />}
							description={p.summary}
						>
							{p.title}
						</CommandItem>
					))}
				</CommandSection>
				<CommandSection title="Pages">
					<CommandItem id="/" icon={<PenTool />}>
						Writing
					</CommandItem>
					<CommandItem id="/tag/data" icon={<Tag />}>
						Topics
					</CommandItem>
					<CommandItem id="/about" icon={<User />}>
						About
					</CommandItem>
				</CommandSection>
			</CommandPalette>
		</div>
	);
}
