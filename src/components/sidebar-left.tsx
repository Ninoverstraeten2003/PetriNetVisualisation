"use client";

import {
	AudioWaveform,
	Command,
	Home,
	MessageCircleQuestion,
	Search,
	Settings2,
	Sparkles,
	Trash2,
} from "lucide-react";
import * as React from "react";

import { NavFavorites } from "@/components/nav-favorites";
import { NavMain } from "@/components/nav-main";
import { NavSecondary } from "@/components/nav-secondary";
import {
	Sidebar,
	SidebarContent,
	SidebarHeader,
	SidebarRail,
} from "@/components/ui/sidebar";

// This is sample data.
const data = {
	teams: [
		{
			name: "Acme Inc",
			logo: Command,
			plan: "Enterprise",
		},
		{
			name: "Acme Corp.",
			logo: AudioWaveform,
			plan: "Startup",
		},
		{
			name: "Evil Corp.",
			logo: Command,
			plan: "Free",
		},
	],
	navMain: [
		{
			title: "Search",
			url: "#",
			icon: Search,
		},
		{
			title: "Ask AI",
			url: "#",
			icon: Sparkles,
		},
		{
			title: "Home",
			url: "#",
			icon: Home,
			isActive: true,
		},
	],
	navSecondary: [
		{
			title: "Settings",
			url: "#",
			icon: Settings2,
		},
		{
			title: "Trash",
			url: "#",
			icon: Trash2,
		},
		{
			title: "Help",
			url: "#",
			icon: MessageCircleQuestion,
		},
	],
	favorites: [
		{
			name: "Project Management & Task Tracking",
			url: "#",
			emoji: "📊",
		}
	],
};

export function SidebarLeft({
	...props
}: React.ComponentProps<typeof Sidebar>) {
	return (
		<Sidebar className="border-r-0" {...props} variant={"floating"}>
			<SidebarHeader>
				<NavMain items={data.navMain} />
			</SidebarHeader>
			<SidebarContent>
				<NavFavorites favorites={data.favorites} />
				<NavSecondary items={data.navSecondary} className="mt-auto" />
			</SidebarContent>
			<SidebarRail />
		</Sidebar>
	);
}
