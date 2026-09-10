import {
	Avatar,
	Card,
	CardBody,
	Cell,
	Column,
	Kbd,
	Link,
	Row,
	Table,
	TableBody,
	TableContainer,
	TableHeader,
} from "@nowquant/nqui";
import { author } from "../data";

const timeline = [
	{ year: "2026", what: "Order router rewrite in C++", where: "Trading desk" },
	{ year: "2024", what: "Lakehouse migration to Iceberg", where: "Trading desk" },
	{ year: "2022", what: "Market data pipeline lead", where: "Previous fund" },
	{ year: "2019", what: "Quant developer", where: "Previous fund" },
];

export function AboutPage() {
	return (
		<div className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-4 py-8 md:px-8">
			<div className="flex items-center gap-6">
				<Avatar name={author.name} size="xl" />
				<div className="flex flex-col gap-1">
					<h1 className="font-semibold text-3xl tracking-tight">{author.name}</h1>
					<p className="text-muted">
						{author.role} in {author.location}
					</p>
				</div>
			</div>
			<p className="max-w-prose text-xl leading-relaxed">{author.bio}</p>
			<p className="max-w-prose text-muted">
				Everything here is my own opinion and none of it is investment advice. Press{" "}
				<Kbd keys={["cmd"]}>K</Kbd> anywhere to search the site.
			</p>
			<TableContainer>
				<Table aria-label="Timeline">
					<TableHeader>
						<Column id="year" isRowHeader className="w-24">
							Year
						</Column>
						<Column id="what">What</Column>
						<Column id="where">Where</Column>
					</TableHeader>
					<TableBody>
						{timeline.map((row) => (
							<Row key={row.year} id={row.year}>
								<Cell>{row.year}</Cell>
								<Cell>{row.what}</Cell>
								<Cell className="text-muted">{row.where}</Cell>
							</Row>
						))}
					</TableBody>
				</Table>
			</TableContainer>
			<Card variant="flat">
				<CardBody className="flex flex-col gap-2">
					<h2 className="font-semibold">Elsewhere</h2>
					<div className="flex gap-4">
						{author.links.map((l) => (
							<Link key={l.label} href={l.href} target="_blank">
								{l.label}
							</Link>
						))}
					</div>
				</CardBody>
			</Card>
		</div>
	);
}
