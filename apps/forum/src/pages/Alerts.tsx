import {
	Avatar,
	Button,
	CardRow,
	CardStack,
	EmptyState,
	PageContent,
	PageHeader,
} from "@nowquant/nqui";
import { BellOff } from "lucide-react";
import { useEffect, useState } from "react";
import { notifications } from "../data";

export function AlertsPage({ onRead }: { onRead: () => void }) {
	const [items, setItems] = useState(notifications);
	useEffect(onRead, [onRead]);
	return (
		<>
			<PageHeader
				title="Alerts"
				actions={
					<Button
						size="sm"
						variant="outline"
						color="neutral"
						onPress={() => setItems([])}
						isDisabled={items.length === 0}
					>
						Clear all
					</Button>
				}
			/>
			<PageContent>
				{items.length === 0 ? (
					<EmptyState
						icon={<BellOff />}
						title="All caught up"
						description="New replies and mentions show up here."
					/>
				) : (
					<CardStack gap="sm">
						{items.map((n) => (
							<CardRow
								key={n.id}
								icon={<Avatar name={n.who.name} size="sm" />}
								title={
									<>
										<span className="font-medium">{n.who.name}</span> {n.text}
									</>
								}
								description={n.target}
								endContent={<span className="text-subtle text-xs">{n.at}</span>}
							/>
						))}
					</CardStack>
				)}
			</PageContent>
		</>
	);
}
