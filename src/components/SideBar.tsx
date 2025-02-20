import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sidebar } from "@excalidraw/excalidraw";
import { ArrowRight, Pin, PinOff } from "lucide-react";
import React, { useState, useCallback, useMemo } from "react";
import { Edge, Graph, Node } from "../types";
import { EdgeInfo } from "./EdgeInfo";
import { NodeInfo } from "./NodeInfo";
import { Button } from "./ui/button";

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
	const [isDocked, setIsDocked] = useState(true);

	const toggleIsDocked = useCallback(() => {
		setIsDocked((prev) => !prev);
	}, []);

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
		<Sidebar name="nodeinfo" docked={isDocked}>
			<Card className="h-full border-r rounded-none">
				<CardHeader className="p-3 border-b">
					<CardTitle className="text-base font-medium flex items-center justify-between">
						Information
						<Button
							variant="ghost"
							size="icon"
							onClick={toggleIsDocked}
							className="h-6 w-6"
						>
							{isDocked ? <PinOff size={14} /> : <Pin size={14} />}
						</Button>
					</CardTitle>
				</CardHeader>
				{enabledTransitions.length > 0 && (
					<>
						<CardHeader className="p-3 border-b">
							<CardTitle className="text-sm font-medium flex items-center justify-between">
								Enabled Transitions
								<Badge variant="secondary" className="text-xs">
									{enabledTransitions.length}
								</Badge>
							</CardTitle>
						</CardHeader>
						{/*https://stackoverflow.com/a/78690553*/}
						<CardContent className="p-0 flex border-b">
							<ScrollArea className="h-[calc(40svh)] w-1 flex-1" type="always">
								{enabledTransitionNodes.map((transition) => {
									const { inputPlaces, outputPlaces } =
										getTransitionConnections(transition.id);
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
								<ScrollBar orientation="horizontal" className="w-full" />
							</ScrollArea>
						</CardContent>
					</>
				)}
				<CardHeader className="p-3 border-b">
					<CardTitle className="text-sm font-medium flex items-center justify-between">
						Selection Info
						<div className="flex items-center gap-2">
							<Badge variant="secondary" className="text-xs">
								{selectedNodes.length + selectedEdges.length}
							</Badge>
						</div>
					</CardTitle>
				</CardHeader>
				<CardContent className="p-0 border-b">
					<Tabs defaultValue="places" className="w-full">
						<TabsList className="w-full flex justify-center">
							<TabsTrigger value="places" className="px-1 w-full">
								Places{" "}
								<Badge variant="outline" className="ml-1">
									{selectedPlaces.length}
								</Badge>
							</TabsTrigger>
							<TabsTrigger value="transitions" className="px-1 w-full">
								Transitions{" "}
								<Badge variant="outline" className="ml-1 w-full">
									{selectedTransitions.length}
								</Badge>
							</TabsTrigger>
							<TabsTrigger value="edges" className="px-1 w-full">
								Edges{" "}
								<Badge variant="outline" className="ml-1">
									{selectedEdges.length}
								</Badge>
							</TabsTrigger>
						</TabsList>
						<TabsContent value="places" className="m-0 flex">
							<ScrollArea className="h-[calc(20svh)]  w-1 flex-1" type="always">
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
								<ScrollBar orientation="horizontal" className="w-full" />
							</ScrollArea>
						</TabsContent>
						<TabsContent value="transitions" className="m-0 flex">
							<ScrollArea className="h-[calc(20svh)] w-1 flex-1" type="always">
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
								<ScrollBar orientation="horizontal" className="w-full" />
							</ScrollArea>
						</TabsContent>
						<TabsContent value="edges" className="m-0 flex">
							<ScrollArea className="h-[calc(20svh)] w-1 flex-1" type="always">
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
								<ScrollBar orientation="horizontal" className="w-full" />
							</ScrollArea>
						</TabsContent>
					</Tabs>
				</CardContent>
			</Card>
		</Sidebar>
	);
};
