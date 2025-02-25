import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowRight } from "lucide-react";
import React, { useCallback, useMemo } from "react";
import { Edge, Graph, Node } from "../types";
import { EdgeInfo } from "./EdgeInfo";
import { NodeInfo } from "./NodeInfo";
import {
	ResizableHandle,
	ResizablePanel,
	ResizablePanelGroup,
} from "./ui/resizable";
import { SidebarGroupLabel } from "./ui/sidebar";

interface SidebarComponentProps {
	currentGraph: Graph | null;
	enabledTransitions: string[];
	selectedNodes: Node[];
	selectedEdges: Edge[];
}

export const SidebarComponent: React.FC<SidebarComponentProps> = ({
	currentGraph,
	enabledTransitions,
	selectedNodes,
	selectedEdges,
}) => {
	const getTransitionConnections = useCallback(
		(transitionId: string) => {
			if (!currentGraph) return { inputPlaces: [], outputPlaces: [] };

			const inputPlaces = currentGraph.edges
				.filter((edge) => edge.to === transitionId)
				.map((edge) => currentGraph.nodes.find((node) => node.id === edge.from))
				.filter(
					(node): node is Node => node !== undefined && node.type === "place"
				);

			const outputPlaces = currentGraph.edges
				.filter((edge) => edge.from === transitionId)
				.map((edge) => currentGraph.nodes.find((node) => node.id === edge.to))
				.filter(
					(node): node is Node => node !== undefined && node.type === "place"
				);

			return { inputPlaces, outputPlaces };
		},
		[currentGraph]
	);

	const enabledTransitionNodes = useMemo(
		() =>
			currentGraph?.nodes.filter(
				(node) =>
					node.type === "transition" && enabledTransitions.includes(node.id)
			) || [],
		[currentGraph, enabledTransitions]
	);

	const selectedPlaces = useMemo(
		() => selectedNodes.filter((node) => node.type === "place"),
		[selectedNodes]
	);

	const selectedTransitions = useMemo(
		() => selectedNodes.filter((node) => node.type === "transition"),
		[selectedNodes]
	);

	const MemoizedArrowRight = useMemo(
		() => <ArrowRight className="h-4 w-4" />,
		[]
	);

	return (
		<ResizablePanelGroup
			direction="vertical"
			className="h-full border-r rounded-none"
		>
			<ResizablePanel defaultSize={40} className="flex flex-col">
				<div className="sticky top-0 z-10 bg-background w-full">
					<SidebarGroupLabel className="flex items-center justify-between border-b w-full">
						Enabled Transitions
						<Badge variant="secondary" className="text-xs">
							{enabledTransitions.length}
						</Badge>
					</SidebarGroupLabel>
				</div>
				<div className="flex-1 overflow-auto">
					<div className="flex flex-col">
						{enabledTransitions.length > 0 &&
							enabledTransitionNodes.map((transition) => {
								const { inputPlaces, outputPlaces } = getTransitionConnections(
									transition.id
								);
								return (
									<div
										key={transition.id}
										className="p-2 border-b last:border-b-0 border-b-muted-foreground"
									>
										<div className="flex gap-3 justify-between items-center">
											<div className="space-y-2">
												{inputPlaces.map((place) => (
													<NodeInfo key={place.id} node={place} />
												))}
											</div>

											<div className="flex flex-col items-center gap-1">
												<NodeInfo node={transition} />
												{MemoizedArrowRight}
											</div>

											<div className="space-y-2">
												{outputPlaces.map((place) => (
													<NodeInfo key={place.id} node={place} />
												))}
											</div>
										</div>
									</div>
								);
							})}
					</div>
				</div>
			</ResizablePanel>
			<ResizableHandle withHandle={true} className="z-20" />
			<ResizablePanel defaultSize={60} className="flex flex-col">
				<div className="sticky top-0 z-10 bg-background w-full">
					<SidebarGroupLabel className="flex items-center justify-between border-b w-full">
						Selection Info
						<Badge variant="secondary" className="text-xs">
							{selectedNodes.length + selectedEdges.length}
						</Badge>
					</SidebarGroupLabel>
				</div>
				<div className="flex-1 flex flex-col overflow-hidden">
					<Tabs defaultValue="places" className="flex flex-col h-full">
						<div className="sticky top-0 z-10 bg-background w-full shadow-sm">
							<TabsList className="w-full flex justify-center rounded-none">
								<TabsTrigger value="places" className="px-0 w-full font-normal">
									Places
									<Badge variant="outline" className="ml-1">
										{selectedPlaces.length}
									</Badge>
								</TabsTrigger>
								<TabsTrigger
									value="transitions"
									className="px-2 w-full font-normal"
								>
									Transitions
									<Badge variant="outline" className="ml-1">
										{selectedTransitions.length}
									</Badge>
								</TabsTrigger>
								<TabsTrigger value="edges" className="px-0 w-full font-normal">
									Edges
									<Badge variant="outline" className="ml-1">
										{selectedEdges.length}
									</Badge>
								</TabsTrigger>
							</TabsList>
						</div>
						<div className="flex-1 overflow-auto">
							<TabsContent
								value="places"
								className="h-full m-0 p-0 data-[state=active]:flex data-[state=active]:flex-col"
							>
								{selectedPlaces.map((node) => (
									<div
										key={node.id}
										className="p-2 border-b last:border-b-0 border-b-muted-foreground"
									>
										<NodeInfo node={node} />
									</div>
								))}
								{selectedPlaces.length === 0 && (
									<p className="text-muted-foreground text-sm p-2">
										No places selected
									</p>
								)}
							</TabsContent>
							<TabsContent
								value="transitions"
								className="h-full m-0 p-0 data-[state=active]:flex data-[state=active]:flex-col"
							>
								{selectedTransitions.map((node) => (
									<div
										key={node.id}
										className="p-2 border-b last:border-b-0 border-b-muted-foreground"
									>
										<NodeInfo node={node} />
									</div>
								))}
								{selectedTransitions.length === 0 && (
									<p className="text-muted-foreground text-sm p-2">
										No transitions selected
									</p>
								)}
							</TabsContent>
							<TabsContent
								value="edges"
								className="h-full m-0 p-0 data-[state=active]:flex data-[state=active]:flex-col"
							>
								{selectedEdges.map((edge) => (
									<div
										key={edge.id}
										className="p-2 border-b last:border-b-0 border-b-muted-foreground"
									>
										<EdgeInfo edge={edge} />
									</div>
								))}
								{selectedEdges.length === 0 && (
									<p className="text-muted-foreground text-sm p-2">
										No edges selected
									</p>
								)}
							</TabsContent>
						</div>
					</Tabs>
				</div>
			</ResizablePanel>
		</ResizablePanelGroup>
	);
};
