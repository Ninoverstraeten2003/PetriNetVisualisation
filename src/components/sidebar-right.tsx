import * as React from "react";

import { Sidebar, SidebarContent } from "@/components/ui/sidebar";
import { petriNetActor } from "@/xstate/petriNetMachine";
import { useSelector } from "@xstate/react";
import { SidebarComponent } from "./SideBar";

export function SidebarRight({
	...props
}: React.ComponentProps<typeof Sidebar>) {
	const { currentGraph, selectedEdges, selectedNodes, enabledTransitions } =
		useSelector(petriNetActor, (snapshot) => ({
			currentGraph: snapshot.context.currentGraph,
			selectedEdges: snapshot.context.selectedEdges,
			selectedNodes: snapshot.context.selectedNodes,
			enabledTransitions: snapshot.context.enabledTransitions,
		}));

	React.useEffect(() => {
		console.log(enabledTransitions);
	}, [enabledTransitions]);

	return (
		<Sidebar
			className="hidden lg:flex top-0 h-svh"
			side="right"
			collapsible="offcanvas"
			variant="floating"
			{...props}
		>
			<SidebarContent>
				<SidebarComponent
					currentGraph={currentGraph}
					enabledTransitions={enabledTransitions}
					selectedNodes={selectedNodes}
					selectedEdges={selectedEdges}
				/>
			</SidebarContent>
		</Sidebar>
	);
}
