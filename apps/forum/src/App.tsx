import {
	AppShell,
	Avatar,
	BottomNav,
	BottomNavItem,
	Button,
	Chip,
	Dialog,
	DialogBody,
	DialogHeader,
	IconButton,
	Menu,
	MenuItem,
	MenuSeparator,
	MenuTrigger,
	Modal,
	Navbar,
	NavbarBrand,
	NavbarContent,
	NquiProvider,
	Select,
	SelectItem,
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarGroup,
	SidebarHeader,
	SidebarItem,
	SidebarTrigger,
	TextField,
	toast,
	useTheme,
} from "@nowquant/nqui";
import { Composer } from "@nowquant/nqui/editor";
import { Markdown } from "@nowquant/nqui/markdown";
import {
	Bell,
	Bookmark,
	Flame,
	Hash,
	House,
	LogOut,
	Moon,
	PenLine,
	Search,
	Sun,
	User,
} from "lucide-react";
import { useState } from "react";
import { categories, initialPosts, me, type Post } from "./data";
import { AlertsPage } from "./pages/Alerts";
import { FeedPage } from "./pages/Feed";
import { ProfilePage } from "./pages/Profile";
import { SearchPage } from "./pages/Search";
import { ThreadPage } from "./pages/Thread";

type Route =
	| { name: "feed" }
	| { name: "thread"; id: string }
	| { name: "search" }
	| { name: "alerts" }
	| { name: "me" };

export function App() {
	const { resolved, toggle } = useTheme();
	const [route, setRoute] = useState<Route>({ name: "feed" });
	const [category, setCategory] = useState<string | null>(null);
	const [posts, setPosts] = useState(initialPosts);
	const [composing, setComposing] = useState(false);
	const [unread, setUnread] = useState(3);

	const update = (id: string, patch: (post: Post) => Post) =>
		setPosts((all) => all.map((p) => (p.id === id ? patch(p) : p)));

	const openThread = (id: string) => setRoute({ name: "thread", id });
	const goHome = (next: string | null = category) => {
		setCategory(next);
		setRoute({ name: "feed" });
	};

	const publish = (title: string, categoryId: string, body: string) => {
		const post: Post = {
			id: `p${Date.now()}`,
			category: categoryId,
			author: me,
			title,
			body,
			at: "now",
			likes: 0,
			liked: false,
			saved: false,
			replies: [],
		};
		setPosts((all) => [post, ...all]);
		setComposing(false);
		toast.success("Posted", title);
		goHome(null);
	};

	let page: React.ReactNode;
	switch (route.name) {
		case "feed":
			page = (
				<FeedPage
					posts={category ? posts.filter((p) => p.category === category) : posts}
					category={categories.find((c) => c.id === category) ?? null}
					onOpen={openThread}
					onUpdate={update}
				/>
			);
			break;
		case "thread": {
			const post = posts.find((p) => p.id === route.id);
			page = post ? (
				<ThreadPage post={post} onBack={() => goHome()} onUpdate={update} />
			) : (
				<FeedPage posts={posts} category={null} onOpen={openThread} onUpdate={update} />
			);
			break;
		}
		case "search":
			page = <SearchPage posts={posts} onOpen={openThread} />;
			break;
		case "alerts":
			page = <AlertsPage onRead={() => setUnread(0)} />;
			break;
		case "me":
			page = <ProfilePage posts={posts.filter((p) => p.author.handle === me.handle)} />;
			break;
	}

	return (
		<NquiProvider toastPlacement="top-center">
			<AppShell
				sidebar={
					<Sidebar>
						<SidebarHeader>
							<span className="flex size-6 items-center justify-center rounded-md bg-accent text-accent-foreground">
								<Flame className="size-4" />
							</span>
							<span className="font-semibold text-sm">Threads</span>
						</SidebarHeader>
						<SidebarContent>
							<SidebarGroup>
								<SidebarItem
									icon={<House />}
									isActive={route.name === "feed" && !category}
									onPress={() => goHome(null)}
								>
									All posts
								</SidebarItem>
								<SidebarItem
									icon={<Bookmark />}
									onPress={() => toast.info("Saved posts", "Coming soon")}
								>
									Saved
								</SidebarItem>
							</SidebarGroup>
							<SidebarGroup title="Categories">
								{categories.map((c) => (
									<SidebarItem
										key={c.id}
										icon={<Hash />}
										isActive={route.name === "feed" && category === c.id}
										badge={<span className="numeric text-subtle text-xs">{c.count}</span>}
										onPress={() => goHome(c.id)}
									>
										{c.name}
									</SidebarItem>
								))}
							</SidebarGroup>
						</SidebarContent>
						<SidebarFooter>
							<Button color="primary" startContent={<PenLine />} onPress={() => setComposing(true)}>
								New post
							</Button>
						</SidebarFooter>
					</Sidebar>
				}
				header={
					<Navbar variant="transparent" position="static">
						<SidebarTrigger />
						<NavbarBrand className="sm:hidden">Threads</NavbarBrand>
						<NavbarContent justify="end" className="gap-2">
							<IconButton aria-label="Search" onPress={() => setRoute({ name: "search" })}>
								<Search />
							</IconButton>
							<IconButton aria-label="Toggle color scheme" onPress={toggle}>
								{resolved === "dark" ? <Sun /> : <Moon />}
							</IconButton>
							<MenuTrigger>
								<IconButton aria-label="Account" className="max-sm:hidden">
									<Avatar name={me.name} size="sm" />
								</IconButton>
								<Menu
									onAction={(key) => {
										if (key === "profile") setRoute({ name: "me" });
										else toast.neutral("Signed out", "This is a demo; you are still here.");
									}}
								>
									<MenuItem id="profile" icon={<User />}>
										Profile
									</MenuItem>
									<MenuSeparator />
									<MenuItem id="signout" icon={<LogOut />} color="error">
										Sign out
									</MenuItem>
								</Menu>
							</MenuTrigger>
						</NavbarContent>
					</Navbar>
				}
				footer={
					<BottomNav hideFromMd>
						<BottomNavItem
							icon={<House />}
							label="Home"
							isActive={route.name === "feed"}
							onPress={() => goHome(null)}
						/>
						<BottomNavItem
							icon={<Search />}
							label="Search"
							isActive={route.name === "search"}
							onPress={() => setRoute({ name: "search" })}
						/>
						<BottomNavItem icon={<PenLine />} label="Post" onPress={() => setComposing(true)} />
						<BottomNavItem
							icon={<Bell />}
							label="Alerts"
							isActive={route.name === "alerts"}
							badge={
								unread ? (
									<Chip size="sm" color="primary" variant="solid">
										{unread}
									</Chip>
								) : undefined
							}
							onPress={() => setRoute({ name: "alerts" })}
						/>
						<BottomNavItem
							icon={<User />}
							label="Me"
							isActive={route.name === "me"}
							onPress={() => setRoute({ name: "me" })}
						/>
					</BottomNav>
				}
			>
				{page}
			</AppShell>
			<ComposeDialog isOpen={composing} onOpenChange={setComposing} onPublish={publish} />
		</NquiProvider>
	);
}

function ComposeDialog({
	isOpen,
	onOpenChange,
	onPublish,
}: {
	isOpen: boolean;
	onOpenChange: (open: boolean) => void;
	onPublish: (title: string, category: string, body: string) => void;
}) {
	const [title, setTitle] = useState("");
	const [categoryId, setCategoryId] = useState(categories[0]?.id ?? "general");
	return (
		<Modal isOpen={isOpen} onOpenChange={onOpenChange} size="lg">
			<Dialog>
				<DialogHeader title="New post" description="Markdown is supported." showClose />
				<DialogBody className="flex flex-col gap-4">
					<TextField
						label="Title"
						placeholder="What is on your mind?"
						value={title}
						onChange={setTitle}
						isRequired
					/>
					<Select
						label="Category"
						selectedKey={categoryId}
						onSelectionChange={(key) => setCategoryId(String(key))}
					>
						{categories.map((c) => (
							<SelectItem key={c.id} id={c.id}>
								{c.name}
							</SelectItem>
						))}
					</Select>
					<Composer
						placeholder="Write your post…"
						submitLabel="Publish"
						minRows={4}
						renderPreview={(text) => <Markdown>{text}</Markdown>}
						onSubmit={({ value }) => {
							if (!title.trim()) {
								toast.warning("Add a title first");
								return;
							}
							onPublish(title.trim(), categoryId, value);
							setTitle("");
						}}
					/>
				</DialogBody>
			</Dialog>
		</Modal>
	);
}
