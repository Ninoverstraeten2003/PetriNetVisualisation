import { ExcalidrawElement } from "@excalidraw/excalidraw/types/element/types";
import type {
	AppState,
	ExcalidrawImperativeAPI,
} from "@excalidraw/excalidraw/types/types";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { layoutGraph } from "../layoutService";
import { Edge, Graph, Node } from "../types";

export const usePetriNetEditor = (
	excalidrawAPI: ExcalidrawImperativeAPI | null,
	layoutEngine: "dagre" | "elk" | "webcola"
) => {
	const [currentGraph, setCurrentGraph] = useState<Graph | null>(null);
	const [selectedNodes, setSelectedNodes] = useState<Node[]>([]);
	const [selectedEdges, setSelectedEdges] = useState<Edge[]>([]);
	const [hasGraphData, setHasGraphData] = useState<boolean>(false);

	useEffect(() => {
		const updateLayout = async () => {
			if (currentGraph && excalidrawAPI) {
				toast.message("Updating the scene", {
					icon: "⏳",
				});
				try {
					const layoutedElements = await layoutGraph(
						currentGraph,
						layoutEngine
					);
					excalidrawAPI.updateScene({
						elements: layoutedElements,
					});
					if (excalidrawAPI.getSceneElements().length === 0) {
						setHasGraphData(false);
					} else {
						setHasGraphData(true);
					}

					excalidrawAPI.scrollToContent();
				} catch (err) {
					toast.error("Something went wrong", { icon: "❌" });
					console.error(err);
				} finally {
					toast.message("Scene updated", {
						icon: "✔️",
					});
				}
			}
		};
		updateLayout();
	}, [layoutEngine, currentGraph, excalidrawAPI]);

	const handleChange = (
		elements: readonly ExcalidrawElement[],
		appState: AppState
	) => {
		if (!currentGraph || !excalidrawAPI) return;

		// Maybe this logic needs to be somewhere else
		if (excalidrawAPI.getSceneElements().length === 0) {
			setHasGraphData(false);
		} else {
			setHasGraphData(true);
		}
		const selectedElementIds = Object.keys(appState.selectedElementIds);
		const shouldShowSidebar = selectedElementIds.length > 0;

		// Clear selections if nothing is selected
		if (!shouldShowSidebar) {
			if (selectedNodes.length > 0 || selectedEdges.length > 0) {
				setSelectedNodes([]);
				setSelectedEdges([]);
			}
			return;
		}

		const newSelectedNodes: Node[] = [];
		const newSelectedEdges: Edge[] = [];

		// Process all selected elements
		selectedElementIds.forEach((selectedElementId) => {
			const baseId = selectedElementId.match(/^([^-]+)/)?.[1];

			if (baseId) {
				const node = currentGraph.nodes.find((n) => n.id === baseId);
				const edge = currentGraph.edges.find((e) => e.id === selectedElementId);

				if (node && !newSelectedNodes.some((n) => n.id === node.id)) {
					newSelectedNodes.push(node);
				} else if (edge && !newSelectedEdges.some((e) => e.id === edge.id)) {
					newSelectedEdges.push(edge);
				}
			}
		});

		// Check if selections have actually changed before updating state
		const nodesChanged =
			newSelectedNodes.length !== selectedNodes.length ||
			newSelectedNodes.some((node) => !selectedNodes.includes(node));

		const edgesChanged =
			newSelectedEdges.length !== selectedEdges.length ||
			newSelectedEdges.some((edge) => !selectedEdges.includes(edge));

		if (nodesChanged || edgesChanged) {
			setSelectedNodes(newSelectedNodes);
			setSelectedEdges(newSelectedEdges);

			// Only toggle sidebar if we have selections and it's not already shown
			if (shouldShowSidebar) {
				excalidrawAPI?.toggleSidebar({
					name: "nodeinfo",
					force: true,
				});
			}
		}
	};

	return {
		hasGraphData,
		currentGraph,
		setCurrentGraph,
		selectedNodes,
		selectedEdges,
		handleChange,
	};
};
