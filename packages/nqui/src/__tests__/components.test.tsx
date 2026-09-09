import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Alert } from "../components/alert";
import { Avatar, AvatarGroup, gradientFor } from "../components/avatar";
import { Breadcrumb, Breadcrumbs } from "../components/breadcrumbs";
import { Card, CardBody, CardHeader } from "../components/card";
import { Badge, Chip } from "../components/chip";
import { FieldLayout } from "../components/field";
import { Kbd } from "../components/kbd";
import { Select, SelectItem } from "../components/select";
import { Skeleton } from "../components/skeleton";
import { StatusDot } from "../components/status-dot";
import { TextArea } from "../components/text-field";
import { ToggleButton } from "../components/toggle-button";

describe("TextArea", () => {
	it("draws its own focus ring, since a textarea never reports focus-within", () => {
		render(<TextArea label="Notes" />);
		const cls = screen.getByRole("textbox", { name: "Notes" }).className;
		expect(cls).toContain("focus:ring-2");
		expect(cls).toContain("focus:border-primary");
	});
});

describe("Select", () => {
	it("styles invalid and focus state from the trigger's own data attributes", () => {
		render(
			<Select label="Venue" isInvalid>
				<SelectItem id="a">A</SelectItem>
			</Select>,
		);
		const cls = screen.getByRole("button", { name: /Venue/ }).className;
		expect(cls).toContain("group-invalid:border-danger");
		expect(cls).toContain("focus-visible:ring-2");
	});
});

describe("Breadcrumbs", () => {
	it("hides the separator only on the last crumb", () => {
		const { container } = render(
			<Breadcrumbs>
				<Breadcrumb href="/">Home</Breadcrumb>
				<Breadcrumb>Here</Breadcrumb>
			</Breadcrumbs>,
		);
		const svgs = container.querySelectorAll("li svg");
		expect(svgs).toHaveLength(2);
		for (const svg of svgs) expect(svg.getAttribute("class")).toContain("group-last/crumb:hidden");
		expect(container.querySelectorAll("li.group\\/crumb")).toHaveLength(2);
	});
});

describe("FieldLayout", () => {
	it("renders its error message without a React Aria field context", () => {
		render(
			<FieldLayout label="Chart" errorMessage="Nothing to plot">
				<div />
			</FieldLayout>,
		);
		expect(screen.getByText("Nothing to plot")).toBeTruthy();
	});
});

describe("Card", () => {
	it("becomes pressable when only onPress is given", () => {
		render(<Card onPress={() => {}}>Hi</Card>);
		expect(screen.getByRole("button")).toBeTruthy();
	});
	it("lets consumer classes override section defaults", () => {
		render(
			<Card>
				<CardHeader className="px-0" data-testid="h" />
				<CardBody className="py-0" data-testid="b" />
			</Card>,
		);
		expect(screen.getByTestId("h").className).not.toContain("px-5");
		expect(screen.getByTestId("b").className).not.toContain("py-3");
	});
});

describe("Chip", () => {
	it("uses market-aware foreground on solid up/down", () => {
		render(
			<Chip variant="solid" color="up">
				+1%
			</Chip>,
		);
		expect(screen.getByText("+1%").className).toContain("text-up-foreground");
	});
	it("shares the rounded-lg medium radius", () => {
		render(<Chip radius="md">x</Chip>);
		expect(screen.getByText("x").className).toContain("rounded-lg");
	});
	it("merges Badge wrapper classes", () => {
		render(
			<Badge content={3} className="inline-block" data-testid="badge">
				<span>i</span>
			</Badge>,
		);
		expect(screen.getByTestId("badge").className).not.toContain("inline-flex");
	});
});

describe("Avatar", () => {
	it("only claims role=img with a label", () => {
		const { container } = render(<Avatar fallback="?" />);
		expect(container.querySelector("[role=img]")).toBeNull();
		render(<Avatar name="Ada Lovelace" />);
		expect(screen.getByRole("img", { name: "Ada Lovelace" })).toBeTruthy();
	});
	it("builds the fallback gradient from theme variables", () => {
		const bg = gradientFor("Ada");
		expect(bg).toContain("var(--nq-");
		expect(bg).not.toContain("oklch(");
		expect(gradientFor("Ada")).toBe(bg);
	});
	it("passes the group size down to child avatars", () => {
		render(
			<AvatarGroup size="lg">
				<Avatar name="A B" />
				<Avatar name="C D" size="xs" />
			</AvatarGroup>,
		);
		expect(screen.getByRole("img", { name: "A B" }).className).toContain("size-12");
		expect(screen.getByRole("img", { name: "C D" }).className).toContain("size-6");
	});
});

describe("StatusDot", () => {
	it("is announced without a visible label", () => {
		render(<StatusDot status="healthy" />);
		expect(screen.getByRole("img", { name: "healthy" })).toBeTruthy();
	});
});

describe("Alert", () => {
	it("defaults to a polite status role and accepts an override", () => {
		render(<Alert title="Saved" />);
		expect(screen.getByRole("status")).toBeTruthy();
		render(<Alert title="Boom" role="alert" />);
		expect(screen.getByRole("alert")).toBeTruthy();
	});
});

describe("Kbd", () => {
	it("renders a single kbd element", () => {
		const { container } = render(<Kbd keys={["cmd"]}>K</Kbd>);
		expect(container.querySelectorAll("kbd")).toHaveLength(1);
	});
});

describe("Skeleton", () => {
	it("is busy but not a live region", () => {
		const { container } = render(<Skeleton className="h-4" />);
		const el = container.firstChild as HTMLElement;
		expect(el.getAttribute("aria-busy")).toBe("true");
		expect(el.getAttribute("aria-live")).toBeNull();
	});
});

describe("ToggleButton", () => {
	it("takes color on its own axis", () => {
		render(
			<ToggleButton color="primary" defaultSelected>
				On
			</ToggleButton>,
		);
		expect(screen.getByRole("button", { name: "On" }).className).toContain(
			"selected:bg-primary-soft",
		);
	});
});
