import {
	Avatar,
	Card,
	CardBody,
	CardRow,
	CardStack,
	PageContent,
	PageHeader,
	Switch,
	useTheme,
} from "@nowquant/nqui";
import { BellRing, Moon, ShieldCheck } from "lucide-react";
import { me, type Post } from "../data";

export function ProfilePage({ posts }: { posts: Post[] }) {
	const { resolved, setScheme } = useTheme();
	const stats = [
		["Posts", posts.length],
		["Likes", posts.reduce((n, p) => n + p.likes, 0)],
		["Replies", posts.reduce((n, p) => n + p.replies.length, 0)],
	] as const;
	return (
		<>
			<PageHeader title="Profile" />
			<PageContent>
				<Card>
					<CardBody className="flex items-center gap-4">
						<Avatar name={me.name} size="xl" status="online" />
						<div className="min-w-0 flex-1">
							<div className="truncate font-semibold text-xl">{me.name}</div>
							<div className="text-muted text-sm">@{me.handle} · joined 2024</div>
						</div>
					</CardBody>
					<CardBody className="grid grid-cols-3 gap-4 border-border border-t">
						{stats.map(([label, value]) => (
							<div key={label} className="flex flex-col">
								<span className="numeric font-semibold text-xl">{value}</span>
								<span className="text-subtle text-xs">{label}</span>
							</div>
						))}
					</CardBody>
				</Card>
				<CardStack gap="sm">
					<CardRow
						icon={<Moon />}
						title="Dark mode"
						description="Follows the system unless you switch it here."
						endContent={
							<Switch
								aria-label="Dark mode"
								isSelected={resolved === "dark"}
								onChange={(on) => setScheme(on ? "dark" : "light")}
							/>
						}
					/>
					<CardRow
						icon={<BellRing />}
						title="Push notifications"
						endContent={<Switch aria-label="Push notifications" defaultSelected />}
					/>
					<CardRow
						icon={<ShieldCheck />}
						title="Two-factor authentication"
						description="Enabled"
						showChevron
						onPress={() => undefined}
					/>
				</CardStack>
			</PageContent>
		</>
	);
}
