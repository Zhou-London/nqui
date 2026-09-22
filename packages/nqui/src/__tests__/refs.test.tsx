import { render } from "@testing-library/react";
import { createRef, type ReactElement, type RefObject } from "react";
import { MenuTrigger } from "react-aria-components";
import { describe, expect, it } from "vitest";
import { Accordion, AccordionItem } from "../components/accordion";
import { Alert } from "../components/alert";
import { Avatar } from "../components/avatar";
import { BottomNav, BottomNavItem } from "../components/bottom-nav";
import { Breadcrumb, Breadcrumbs } from "../components/breadcrumbs";
import { Button, IconButton } from "../components/button";
import { Calendar, RangeCalendar } from "../components/calendar";
import { Card } from "../components/card";
import { Checkbox, CheckboxGroup } from "../components/checkbox";
import { Chip } from "../components/chip";
import { ComboBox, ComboBoxItem } from "../components/combobox";
import { DatePicker, DateRangePicker } from "../components/date-picker";
import { Dialog } from "../components/dialog";
import { Divider } from "../components/divider";
import { Form } from "../components/form";
import { Link } from "../components/link";
import { ListBox, ListBoxItem } from "../components/listbox";
import { Menu, MenuItem } from "../components/menu";
import { NavbarItem } from "../components/navbar";
import { Meter, ProgressBar } from "../components/progress";
import { Radio, RadioGroup } from "../components/radio";
import { ScrollShadow } from "../components/scroll-shadow";
import { Select, SelectItem } from "../components/select";
import { SidebarItem } from "../components/sidebar";
import { Slider } from "../components/slider";
import { Switch } from "../components/switch";
import { Cell, Column, Row, Table, TableBody, TableHeader } from "../components/table";
import { Tab, TabList, TabPanel, Tabs } from "../components/tabs";
import { Tag, TagGroup } from "../components/tag-group";
import { NumberField, SearchField, TextArea, TextField } from "../components/text-field";
import { ToggleButton, ToggleButtonGroup } from "../components/toggle-button";

/** A ref that type-checks against any element type, so the cases test that `ref` is accepted. */
type AnyRef = RefObject<null>;
type Case = [name: string, make: (ref: AnyRef) => ReactElement];

const cases: Case[] = [
	[
		"Accordion",
		(ref) => (
			<Accordion ref={ref}>
				<AccordionItem id="a" title="A">
					x
				</AccordionItem>
			</Accordion>
		),
	],
	["Alert", (ref) => <Alert ref={ref} title="Hi" />],
	["Avatar", (ref) => <Avatar ref={ref} name="Ada" />],
	[
		"Breadcrumbs",
		(ref) => (
			<Breadcrumbs ref={ref}>
				<Breadcrumb id="a">A</Breadcrumb>
			</Breadcrumbs>
		),
	],
	["Button", (ref) => <Button ref={ref}>Go</Button>],
	["IconButton", (ref) => <IconButton ref={ref} aria-label="Go" />],
	["Calendar", (ref) => <Calendar ref={ref} aria-label="Date" />],
	["Card", (ref) => <Card ref={ref} />],
	["Checkbox", (ref) => <Checkbox ref={ref}>A</Checkbox>],
	[
		"CheckboxGroup",
		(ref) => (
			<CheckboxGroup ref={ref} label="G">
				<Checkbox value="a">A</Checkbox>
			</CheckboxGroup>
		),
	],
	["Chip", (ref) => <Chip ref={ref}>A</Chip>],
	[
		"ComboBox",
		(ref) => (
			<ComboBox ref={ref} label="C">
				<ComboBoxItem id="a">A</ComboBoxItem>
			</ComboBox>
		),
	],
	["DatePicker", (ref) => <DatePicker ref={ref} label="D" />],
	["Divider", (ref) => <Divider ref={ref} />],
	["Form", (ref) => <Form ref={ref} />],
	[
		"Link",
		(ref) => (
			<Link ref={ref} href="/a">
				A
			</Link>
		),
	],
	[
		"ListBox",
		(ref) => (
			<ListBox ref={ref} aria-label="L">
				<ListBoxItem id="a">A</ListBoxItem>
			</ListBox>
		),
	],
	[
		"NavbarItem",
		(ref) => (
			<NavbarItem ref={ref} href="/a">
				A
			</NavbarItem>
		),
	],
	["ProgressBar", (ref) => <ProgressBar ref={ref} label="P" value={5} />],
	["Meter", (ref) => <Meter ref={ref} label="M" value={5} />],
	[
		"Radio",
		(ref) => (
			<RadioGroup label="R">
				<Radio ref={ref} value="a">
					A
				</Radio>
			</RadioGroup>
		),
	],
	[
		"RadioGroup",
		(ref) => (
			<RadioGroup ref={ref} label="R">
				<Radio value="a">A</Radio>
			</RadioGroup>
		),
	],
	["ScrollShadow", (ref) => <ScrollShadow ref={ref}>x</ScrollShadow>],
	[
		"Select",
		(ref) => (
			<Select ref={ref} label="S">
				<SelectItem id="a">A</SelectItem>
			</Select>
		),
	],
	["Slider", (ref) => <Slider ref={ref} label="S" />],
	["Switch", (ref) => <Switch ref={ref}>S</Switch>],
	[
		"Tabs",
		(ref) => (
			<Tabs ref={ref}>
				<TabList aria-label="T">
					<Tab id="a">A</Tab>
				</TabList>
				<TabPanel id="a">x</TabPanel>
			</Tabs>
		),
	],
	[
		"TagGroup",
		(ref) => (
			<TagGroup ref={ref} label="T">
				<Tag id="a">A</Tag>
			</TagGroup>
		),
	],
	["TextField", (ref) => <TextField ref={ref} label="T" />],
	["TextArea", (ref) => <TextArea ref={ref} label="T" />],
	["SearchField", (ref) => <SearchField ref={ref} aria-label="S" />],
	["NumberField", (ref) => <NumberField ref={ref} label="N" />],
	["ToggleButton", (ref) => <ToggleButton ref={ref}>T</ToggleButton>],
	[
		"AccordionItem",
		(ref) => (
			<Accordion>
				<AccordionItem ref={ref} id="a" title="A">
					x
				</AccordionItem>
			</Accordion>
		),
	],
	[
		"Breadcrumb",
		(ref) => (
			<Breadcrumbs>
				<Breadcrumb ref={ref} id="a">
					A
				</Breadcrumb>
			</Breadcrumbs>
		),
	],
	[
		"ListBoxItem",
		(ref) => (
			<ListBox aria-label="L">
				<ListBoxItem ref={ref} id="a">
					A
				</ListBoxItem>
			</ListBox>
		),
	],
	[
		"TabList",
		(ref) => (
			<Tabs>
				<TabList ref={ref} aria-label="T">
					<Tab id="a">A</Tab>
				</TabList>
				<TabPanel id="a">x</TabPanel>
			</Tabs>
		),
	],
	[
		"Tab",
		(ref) => (
			<Tabs>
				<TabList aria-label="T">
					<Tab ref={ref} id="a">
						A
					</Tab>
				</TabList>
				<TabPanel id="a">x</TabPanel>
			</Tabs>
		),
	],
	[
		"TabPanel",
		(ref) => (
			<Tabs>
				<TabList aria-label="T">
					<Tab id="a">A</Tab>
				</TabList>
				<TabPanel ref={ref} id="a">
					x
				</TabPanel>
			</Tabs>
		),
	],
	[
		"Tag",
		(ref) => (
			<TagGroup label="T">
				<Tag ref={ref} id="a">
					A
				</Tag>
			</TagGroup>
		),
	],
	[
		"BottomNavItem",
		(ref) => (
			<BottomNav>
				<BottomNavItem ref={ref} href="/a" label="A" icon={null} />
			</BottomNav>
		),
	],
	["RangeCalendar", (ref) => <RangeCalendar ref={ref} aria-label="Dates" />],
	["DateRangePicker", (ref) => <DateRangePicker ref={ref} label="D" />],
	["Dialog", (ref) => <Dialog ref={ref} aria-label="D" />],
	[
		"Menu",
		(ref) => (
			<MenuTrigger defaultOpen>
				<Button>Open</Button>
				<Menu ref={ref} aria-label="M">
					<MenuItem id="a">A</MenuItem>
				</Menu>
			</MenuTrigger>
		),
	],
	[
		"MenuItem",
		(ref) => (
			<MenuTrigger defaultOpen>
				<Button>Open</Button>
				<Menu aria-label="M">
					<MenuItem ref={ref} id="a">
						A
					</MenuItem>
				</Menu>
			</MenuTrigger>
		),
	],
	[
		"SidebarItem",
		(ref) => (
			<SidebarItem ref={ref} href="/a">
				A
			</SidebarItem>
		),
	],
	...tableCases(),
	[
		"ToggleButtonGroup",
		(ref) => (
			<ToggleButtonGroup ref={ref}>
				<ToggleButton id="a">A</ToggleButton>
			</ToggleButtonGroup>
		),
	],
];

function tableCases(): Case[] {
	const table = (part: string, ref: AnyRef) => (
		<Table aria-label="T" ref={part === "Table" ? ref : undefined}>
			<TableHeader ref={part === "TableHeader" ? ref : undefined}>
				<Column id="a" isRowHeader ref={part === "Column" ? ref : undefined}>
					A
				</Column>
			</TableHeader>
			<TableBody ref={part === "TableBody" ? ref : undefined}>
				<Row id="r" ref={part === "Row" ? ref : undefined}>
					<Cell ref={part === "Cell" ? ref : undefined}>1</Cell>
				</Row>
			</TableBody>
		</Table>
	);
	return ["Table", "TableHeader", "Column", "TableBody", "Row", "Cell"].map((part) => [
		part,
		(ref: AnyRef) => table(part, ref),
	]);
}

describe("ref", () => {
	it.each(cases)("%s forwards a ref to its root element", (_name, make) => {
		const ref = createRef<never>();
		render(make(ref));
		expect(ref.current).toBeInstanceOf(HTMLElement);
	});
});

describe("inputRef", () => {
	it.each([
		["TextField", (ref: AnyRef) => <TextField inputRef={ref} label="T" />],
		["SearchField", (ref: AnyRef) => <SearchField inputRef={ref} aria-label="S" />],
		["NumberField", (ref: AnyRef) => <NumberField inputRef={ref} label="N" />],
		[
			"ComboBox",
			(ref: AnyRef) => (
				<ComboBox inputRef={ref} label="C">
					<ComboBoxItem id="a">A</ComboBoxItem>
				</ComboBox>
			),
		],
	] as Case[])("%s hands out its <input>", (_name, make) => {
		const ref = createRef<never>();
		render(make(ref));
		expect(ref.current).toBeInstanceOf(HTMLInputElement);
	});
	it("TextArea hands out its <textarea>", () => {
		const ref = createRef<never>();
		render(<TextArea inputRef={ref} label="T" />);
		expect(ref.current).toBeInstanceOf(HTMLTextAreaElement);
	});
});
