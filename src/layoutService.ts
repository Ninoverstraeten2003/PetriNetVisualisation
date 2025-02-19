import { ExcalidrawElement } from "@excalidraw/excalidraw/types/element/types";
import dagre from "dagre";
import ELK, { ElkNode as ElkNodeType } from "elkjs/lib/elk.bundled.js";
import { createElementsFromLayout } from "./elements";
import { Graph } from "./types";
import * as cola from "webcola";

export const layoutGraph = async (
	graph: Graph,
	engine: "dagre" | "elk" | "webcola"
): Promise<ExcalidrawElement[]> => {
	if (engine === "elk") {
		return layoutGraphWithElk(graph);
	}
	if (engine === "dagre") {
		return layoutGraphWithDagre(graph);
	}
	return layoutGraphWithCola(graph);
};

const layoutGraphWithElk = async (
	graph: Graph
): Promise<ExcalidrawElement[]> => {
	const elk = new ELK();

	const elkGraph: ElkNodeType = {
		id: "root",
		layoutOptions: {
			"elk.algorithm": "layered",
			"elk.direction": "RIGHT",
			"elk.spacing.nodeNode": "100",
			"elk.layered.spacing.nodeNodeBetweenLayers": "150",
			"elk.spacing.edgeEdge": "50",
			"elk.spacing.edgeNode": "50",
			"elk.edges.routing": "ORTHOGONAL",
			"elk.portConstraints": "FREE",
		},
		children: graph.nodes.map((node) => ({
			id: node.id,
			width: node.type === "place" ? 60 : 100,
			height: node.type === "place" ? 60 : 40,
			labels: [{ text: node.text }],
		})),
		edges: graph.edges.map((edge) => ({
			id: edge.id,
			sources: [edge.from],
			targets: [edge.to],
		})),
	};

	const layoutedGraph = await elk.layout(elkGraph);

	console.log("ELK Layout Results:", {
		nodes: layoutedGraph.children?.map((node) => ({
			id: node.id,
			x: node.x,
			y: node.y,
			width: node.width,
			height: node.height,
		})),
		edges: layoutedGraph.edges?.map((edge) => ({
			id: edge.id,
			sections: edge.sections,
		})),
	});

	// Convert ELK's top-left coordinates to center-based
	return createElementsFromLayout(graph, {
		id: layoutedGraph.id,
		children:
			layoutedGraph.children?.map((node) => ({
				id: node.id,
				// Convert to center coordinates
				x: (node.x || 0) + (node.width || 0) / 2,
				y: (node.y || 0) + (node.height || 0) / 2,
				width: node.width || 0,
				height: node.height || 0,
				labels: node.labels?.map((label) => ({
					text: label.text || "",
				})),
			})) || [],
		edges:
			layoutedGraph.edges?.map((edge) => ({
				id: edge.id,
				sources: edge.sources,
				targets: edge.targets,
				sections: edge.sections?.map((section) => ({
					startPoint: section.startPoint,
					endPoint: section.endPoint,
					bendPoints: section.bendPoints,
				})),
			})) || [],
	});
};

const layoutGraphWithDagre = async (
	graph: Graph
): Promise<ExcalidrawElement[]> => {
	const g = new dagre.graphlib.Graph();

	g.setGraph({
		rankdir: "LR",
		nodesep: 150,
		edgesep: 50,
		ranksep: 150,
		marginx: 50,
		marginy: 50,
	});

	g.setDefaultEdgeLabel(() => ({}));

	// Add nodes
	graph.nodes.forEach((node) => {
		g.setNode(node.id, {
			label: node.text,
			width: node.type === "place" ? 60 : 100,
			height: node.type === "place" ? 60 : 40,
		});
	});

	// Add edges
	graph.edges.forEach((edge) => {
		g.setEdge(edge.from, edge.to);
	});

	// Calculate layout
	dagre.layout(g);

	// Convert dagre layout to our LayoutGraph format
	const layoutGraph = {
		id: "root",
		children: g.nodes().map((nodeId: string) => {
			const node = g.node(nodeId);
			return {
				id: nodeId,
				x: node.x,
				y: node.y,
				width: node.width,
				height: node.height,
				// Ensure label text is always a string
				labels: [{ text: node.label || "" }],
			};
		}),
		edges: g.edges().map((edge) => {
			const dagreEdge = g.edge(edge.v, edge.w);
			return {
				id: edge.v + "-" + edge.w,
				sources: [edge.v],
				targets: [edge.w],
				sections: [
					{
						startPoint: dagreEdge.points[0], // Start position
						endPoint: dagreEdge.points[dagreEdge.points.length - 1], // End position
						bendPoints: dagreEdge.points.slice(1, -1), // Intermediate points
					},
				],
			};
		}),
	};

	return createElementsFromLayout(graph, layoutGraph);
};

const layoutGraphWithCola = async (
	graph: Graph
): Promise<ExcalidrawElement[]> => {
	const width = 1500; // Increased width for better spread
	const height = 800; // Increased height

	// Create nodes with positions arranged in assembly flow
	const nodes = graph.nodes.map((node, index) => ({
		originalId: node.id,
		width: node.type === "place" ? 60 : 100,
		height: node.type === "place" ? 60 : 40,
		// Arrange initial positions in a left-to-right assembly flow pattern
		x: (index % 5) * 250, // Wider horizontal spacing
		y: Math.floor(index / 5) * 150 + (index % 2) * 50, // Staggered vertical positions
	}));

	const nodeIndexMap = new Map(
		graph.nodes.map((node, index) => [node.id, index])
	);

	// Configure cola for assembly-style layout
	const layout = new cola.Layout()
		.size([width, height])
		.nodes(nodes)
		.links(
			graph.edges.map((edge) => ({
				source: nodeIndexMap.get(edge.from)!,
				target: nodeIndexMap.get(edge.to)!,
				length: 200, // Increased edge length for better spacing
			}))
		)
		.avoidOverlaps(true)
		.flowLayout("x", 250) // Stronger horizontal flow
		.convergenceThreshold(0.005) // More precise convergence
		.symmetricDiffLinkLengths(200) // Enable symmetric link lengths for better alignment
		.jaccardLinkLengths(200, 0.8) // Stronger link length constraints
		.handleDisconnected(false) // Keep components together
		.groupCompactness(0.8); // Encourage tighter grouping

	// Run more iterations with stronger forces
	layout.start(50, 30, 20, undefined, false);
	return createElementsFromLayout(graph, {
		id: "root",
		children: nodes.map((node, index) => ({
			id: graph.nodes[index].id, // Use original node ID from graph
			x: node.x || 0,
			y: node.y || 0,
			width: node.width || 0,
			height: node.height || 0,
			labels: [
				{
					text: graph.nodes[index].text || graph.nodes[index].id,
				},
			],
		})),
		edges: graph.edges.map((edge) => {
			const sourceIndex = nodeIndexMap.get(edge.from)!;
			const targetIndex = nodeIndexMap.get(edge.to)!;

			return {
				id: `${edge.from}-${edge.to}`,
				sources: [edge.from],
				targets: [edge.to],
				sections: [
					{
						startPoint: {
							x: nodes[sourceIndex].x || 0,
							y: nodes[sourceIndex].y || 0,
						},
						endPoint: {
							x: nodes[targetIndex].x || 0,
							y: nodes[targetIndex].y || 0,
						},
						bendPoints: [],
					},
				],
			};
		}),
	});
};
