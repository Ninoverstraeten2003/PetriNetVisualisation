import type {
	ExcalidrawElement,
	ExcalidrawEllipseElement,
	ExcalidrawRectangleElement,
	ExcalidrawTextElement,
} from "@excalidraw/excalidraw/types/element/types";
import {
	GatewayType,
	Graph,
	LayoutGraph,
	LayoutNode,
	OperatorType,
	WOPED_OPERATOR_TYPES,
} from "./types";
import {
	calculateDotPositions,
	calculateEdgePoints,
	getGatewayColor,
} from "./utils/utils";

// Helper functions for creating elements
export const createTextElement = ({
	id,
	text,
	x,
	y,
	width,
	height,
	groupIds,
	verticalAlign,
}: {
	id: string;
	parentId: string;
	text: string;
	x: number;
	y: number;
	width: number;
	height: number;
	groupIds: string[];
	verticalAlign: "top" | "middle";
}): ExcalidrawTextElement => ({
	type: "text",
	id,
	x,
	y,
	width,
	height,
	angle: 0,
	strokeColor: "#000000",
	backgroundColor: "transparent",
	fillStyle: "solid",
	strokeWidth: 1,
	strokeStyle: "solid",
	roughness: 0,
	opacity: 100,
	groupIds,
	roundness: null,
	seed: 1,
	version: 1,
	versionNonce: 0,
	isDeleted: false,
	boundElements: null,
	updated: 1,
	link: null,
	locked: false,
	text,
	fontSize: 16,
	fontFamily: 1,
	textAlign: "center",
	verticalAlign,
	baseline: 18,
	containerId: null,
	originalText: text,
	frameId: null,
	lineHeight: 1.25 as number & { _brand: "unitlessLineHeight" },
});

export const createTokenElement = ({
	id,
	x,
	y,
	groupIds,
}: {
	id: string;
	x: number;
	y: number;
	groupIds: string[];
}): ExcalidrawEllipseElement => ({
	type: "ellipse",
	id,
	x,
	y,
	width: 10,
	height: 10,
	angle: 0,
	strokeColor: "#000000",
	backgroundColor: "#000000",
	fillStyle: "solid",
	strokeWidth: 1,
	strokeStyle: "solid",
	roughness: 0,
	opacity: 100,
	groupIds,
	roundness: { type: 3 },
	seed: Math.floor(Math.random() * 100000),
	version: 1,
	versionNonce: Math.floor(Math.random() * 100000),
	isDeleted: false,
	boundElements: null,
	updated: Date.now(),
	link: null,
	locked: true,
	frameId: null,
});

export const createArrowElement = ({
	id,
	startX,
	startY,
	endX,
	endY,
	bendPoints,
	fromId,
	toId,
	groupIds,
	hasWeight,
}: {
	id: string;
	startX: number;
	startY: number;
	endX: number;
	endY: number;
	bendPoints?: Array<{ x: number; y: number }>;
	fromId: string;
	toId: string;
	groupIds: string[];
	hasWeight: boolean;
}): ExcalidrawElement => {
	// Convert all points to relative coordinates
	const points: [number, number][] = [[0, 0]];

	if (bendPoints && bendPoints.length > 0) {
		bendPoints.forEach((point) => {
			points.push([point.x - startX, point.y - startY]);
		});
	}

	points.push([endX - startX, endY - startY]);

	return {
		type: "arrow",
		id,
		x: startX,
		y: startY,
		width: Math.abs(endX - startX),
		height: Math.abs(endY - startY),
		angle: 0,
		strokeColor: "#000000",
		backgroundColor: "transparent",
		fillStyle: "solid",
		strokeWidth: 2,
		strokeStyle: "solid",
		roughness: 0,
		opacity: 100,
		groupIds,
		roundness: null,
		seed: Math.random() * 100000,
		version: 1,
		versionNonce: Math.floor(Math.random() * 100000),
		isDeleted: false,
		boundElements: hasWeight
			? [{ type: "text" as const, id: `${id}-weight` }]
			: null,
		updated: Date.now(),
		link: null,
		locked: false,
		points,
		lastCommittedPoint: null,
		startBinding: {
			elementId: fromId,
			focus: 0,
			gap: 1,
		},
		endBinding: {
			elementId: toId,
			focus: 0,
			gap: 1,
		},
		startArrowhead: null,
		endArrowhead: "arrow",
		frameId: null,
	};
};
export const createWeightLabel = ({
	id,
	weight,
	x,
	y,
	groupIds,
	arrowId,
}: {
	id: string;
	weight: number;
	x: number;
	y: number;
	groupIds: string[];
	arrowId: string;
}): ExcalidrawTextElement => ({
	type: "text",
	id,
	x,
	y,
	width: 20,
	height: 20,
	angle: 0,
	strokeColor: "#000000",
	backgroundColor: "transparent",
	fillStyle: "solid",
	strokeWidth: 1,
	strokeStyle: "solid",
	roughness: 0,
	opacity: 100,
	groupIds,
	roundness: null,
	seed: Math.random() * 100000,
	versionNonce: Math.floor(Math.random() * 100000),
	updated: Date.now(),
	version: 1,
	isDeleted: false,
	boundElements: [{ type: "arrow" as const, id: arrowId }],
	link: null,
	locked: false,
	text: weight.toString(),
	fontSize: 16,
	fontFamily: 1,
	textAlign: "center",
	verticalAlign: "middle",
	baseline: 18,
	containerId: null,
	originalText: weight.toString(),
	frameId: null,
	lineHeight: 1.25 as number & { _brand: "unitlessLineHeight" },
});

const createPlaceElements = (
	layoutNode: LayoutNode,
	originalNode: Graph["nodes"][0],
	graph: Graph
): ExcalidrawElement[] => {
	const elements: ExcalidrawElement[] = [];
	const placeGroupId = `place-group-${layoutNode.id}`;
	const diameter = 60;

	// Create circular place - using center coordinates directly from layout
	const placeElement: ExcalidrawEllipseElement = {
		type: "ellipse",
		id: layoutNode.id,
		x: layoutNode.x - diameter / 2, // Adjust from center position
		y: layoutNode.y - diameter / 2, // Adjust from center position
		width: diameter,
		height: diameter,
		angle: 0,
		strokeColor: "#000000",
		backgroundColor: "#f0f0f0",
		fillStyle: "solid",
		strokeWidth: 2,
		strokeStyle: "solid",
		roughness: 0,
		opacity: 100,
		groupIds: [placeGroupId],
		roundness: { type: 3 },
		seed: 1,
		version: 1,
		versionNonce: 0,
		isDeleted: false,
		boundElements: graph.edges
			.filter((e) => e.from === layoutNode.id || e.to === layoutNode.id)
			.map((e) => ({
				type: "arrow" as const,
				id: e.id,
			})),
		updated: 1,
		link: null,
		locked: false,
		frameId: null,
	};
	elements.push(placeElement);

	// Add label below the place
	elements.push(
		createTextElement({
			id: `${layoutNode.id}-label`,
			parentId: layoutNode.id,
			text: originalNode.text,
			x: layoutNode.x - diameter / 2,
			y: layoutNode.y + diameter / 2 + 5,
			width: diameter,
			height: 20,
			groupIds: [placeGroupId],
			verticalAlign: "top",
		})
	);

	// Add tokens if any
	if (originalNode.tokens && originalNode.tokens > 0) {
		const tokenGroupId = `${layoutNode.id}-tokens`;
		const positions = calculateDotPositions(originalNode.tokens);

		positions.forEach((pos, index) => {
			elements.push(
				createTokenElement({
					id: `${layoutNode.id}-token-${index}`,
					x: layoutNode.x + pos.x - 5, // Position relative to center
					y: layoutNode.y + pos.y - 5, // Position relative to center
					groupIds: [placeGroupId, tokenGroupId],
				})
			);
		});
	}

	return elements;
};

const createTransitionElements = (
	layoutNode: LayoutNode,
	originalNode: Graph["nodes"][0],
	graph: Graph
): ExcalidrawElement[] => {
	const elements: ExcalidrawElement[] = [];
	const transitionGroupId = `transition-group-${layoutNode.id}`;
	const width = 100;
	const height = 40;

	// Create rectangle - using center coordinates directly from layout
	const transitionElement: ExcalidrawRectangleElement = {
		type: "rectangle",
		id: layoutNode.id,
		x: layoutNode.x - width / 2, // Adjust from center position
		y: layoutNode.y - height / 2, // Adjust from center position
		width: width,
		height: height,
		angle: 0,
		strokeColor: "#000000",
		backgroundColor: "#dddddd",
		fillStyle: "solid",
		strokeWidth: 2,
		strokeStyle: "solid",
		roughness: 0,
		opacity: 100,
		groupIds: [transitionGroupId],
		roundness: { type: 3 },
		seed: 1,
		version: 1,
		versionNonce: 0,
		isDeleted: false,
		boundElements: graph.edges
			.filter((e) => e.from === layoutNode.id || e.to === layoutNode.id)
			.map((e) => ({
				type: "arrow" as const,
				id: e.id,
			})),
		updated: 1,
		link: null,
		locked: false,
		frameId: null,
	};
	elements.push(transitionElement);

	// Add label below the transition
	elements.push(
		createTextElement({
			id: `${layoutNode.id}-label`,
			parentId: layoutNode.id,
			text: originalNode.text,
			x: layoutNode.x - width / 2,
			y: layoutNode.y + height / 2 + 5,
			width: width,
			height: 20,
			groupIds: [transitionGroupId],
			verticalAlign: "top",
		})
	);

	return elements;
};

const createEdgeElements = (
	edge: Graph["edges"][0],
	layout: LayoutGraph,
	graph: Graph
): ExcalidrawElement[] => {
	const elements: ExcalidrawElement[] = [];
	const fromNode = layout.children?.find((n: LayoutNode) => n.id === edge.from);
	const toNode = layout.children?.find((n: LayoutNode) => n.id === edge.to);

	if (!fromNode || !toNode) return elements;

	const arrowGroupId = `arrow-group-${edge.id}`;
	const layoutEdge = layout.edges?.find((e) => e.id === edge.id);
	const fromNodeData = graph.nodes.find((n) => n.id === edge.from);
	const toNodeData = graph.nodes.find((n) => n.id === edge.to);

	if (!layoutEdge?.sections?.[0]) {
		// Fallback to direct connection if no layout sections
		const points = calculateEdgePoints(
			fromNode,
			toNode,
			fromNodeData?.type,
			toNodeData?.type,
			fromNodeData?.gatewayType,
			toNodeData?.gatewayType
		);

		elements.push(
			createArrowElement({
				id: edge.id,
				startX: points.startX,
				startY: points.startY,
				endX: points.endX,
				endY: points.endY,
				fromId: edge.from,
				toId: edge.to,
				groupIds: [arrowGroupId],
				hasWeight: edge.weight > 1,
			})
		);
		return elements;
	}

	// Use ELK's routing
	const section = layoutEdge.sections[0];
	const startPoint = section.startPoint!;
	const endPoint = section.endPoint!;

	elements.push(
		createArrowElement({
			id: edge.id,
			startX: startPoint.x,
			startY: startPoint.y,
			endX: endPoint.x,
			endY: endPoint.y,
			bendPoints: section.bendPoints,
			fromId: edge.from,
			toId: edge.to,
			groupIds: [arrowGroupId],
			hasWeight: edge.weight > 1,
		})
	);

	if (edge.weight > 1) {
		// Weight label positioning using the middle of the path
		const midPoint = section.bendPoints?.length
			? section.bendPoints[Math.floor(section.bendPoints.length / 2)]
			: {
					x: (startPoint.x + endPoint.x) / 2,
					y: (startPoint.y + endPoint.y) / 2,
			  };

		elements.push(
			createWeightLabel({
				id: `${edge.id}-weight`,
				weight: edge.weight,
				x: midPoint.x - 10,
				y: midPoint.y - 10,
				groupIds: [arrowGroupId],
				arrowId: edge.id,
			})
		);
	}

	return elements;
};

const createGatewayTransitionElements = (
	layoutNode: LayoutNode,
	originalNode: Graph["nodes"][0] & { gatewayType?: OperatorType },
	graph: Graph
): ExcalidrawElement[] => {
	const elements: ExcalidrawElement[] = [];
	const transitionGroupId = `transition-group-${layoutNode.id}`;

	// Default dimensions
	const width = 100; // Increased from 60
	const height = 100; // Increased from 60

	// Get gateway type label
	const gatewayTypeLabel =
		WOPED_OPERATOR_TYPES[originalNode.gatewayType || "0"] || "";

	// Create diamond shape
	elements.push({
		type: "diamond",
		id: layoutNode.id,
		x: layoutNode.x - width / 2,
		y: layoutNode.y - height / 2,
		width,
		height,
		angle: 0,
		strokeColor: "#000000",
		backgroundColor: getGatewayColor(gatewayTypeLabel).backgroundColorHex,
		fillStyle: "solid",
		strokeWidth: 2,
		strokeStyle: "solid",
		roughness: 0,
		opacity: 100,
		groupIds: [transitionGroupId],
		roundness: { type: 3 },
		seed: 1,
		version: 1,
		versionNonce: 0,
		isDeleted: false,
		boundElements: graph.edges
			.filter((e) => e.from === layoutNode.id || e.to === layoutNode.id)
			.map((e) => ({
				type: "arrow" as const,
				id: e.id,
			})),
		updated: 1,
		link: null,
		locked: false,
		frameId: null,
	});

	// Add gateway marker based on type
	if (originalNode.gatewayType) {
		elements.push(
			...createGatewayMarker(
				layoutNode,
				WOPED_OPERATOR_TYPES[originalNode.gatewayType],
				transitionGroupId,
				width
			)
		);
	}

	// Add gateway type label above the diamond
	elements.push(
		createTextElement({
			id: `${layoutNode.id}-type-label`,
			parentId: layoutNode.id,
			text: gatewayTypeLabel,
			x: layoutNode.x - width / 2,
			y: layoutNode.y - height / 2 - 25, // Position above the diamond
			width,
			height: 20,
			groupIds: [transitionGroupId],
			verticalAlign: "middle",
		})
	);

	// Add label
	elements.push(
		createTextElement({
			id: `${layoutNode.id}-label`,
			parentId: layoutNode.id,
			text: originalNode.text, // Removed the gateway type from label since we have markers
			x: layoutNode.x - width / 2,
			y: layoutNode.y + height / 2 + 5,
			width,
			height: 30,
			groupIds: [transitionGroupId],
			verticalAlign: "top",
		})
	);

	return elements;
};

const createGatewayMarker = (
	layoutNode: LayoutNode,
	gatewayType: GatewayType,
	groupId: string,
	diamondWidth: number
): ExcalidrawElement[] => {
	const markers: ExcalidrawElement[] = [];
	const centerX = layoutNode.x;
	const centerY = layoutNode.y;
	const size = diamondWidth * 0.35;

	switch (gatewayType) {
		case "AND-split": {
			markers.push(
				...createPlusSymbol(
					centerX, // Center position
					centerY,
					size,
					groupId,
					layoutNode.id
				)
			);
			break;
		}
		case "AND-join": {
			markers.push(
				...createPlusSymbol(
					centerX, // Center position
					centerY,
					size,
					groupId,
					layoutNode.id
				)
			);
			break;
		}
		case "XOR-split": {
			markers.push(
				...createXSymbol(
					centerX, // Center position
					centerY,
					size,
					groupId,
					layoutNode.id
				)
			);
			break;
		}
		case "XOR-join": {
			markers.push(
				...createXSymbol(
					centerX, // Center position
					centerY,
					size,
					groupId,
					layoutNode.id
				)
			);
			break;
		}
		case "AND-join-split": {
			markers.push(
				...createPlusSymbol(
					centerX, // Single centered plus symbol
					centerY,
					size,
					groupId,
					`${layoutNode.id}-center`
				)
			);
			break;
		}
		case "XOR-join-split": {
			markers.push(
				...createXSymbol(
					centerX, // Single centered X symbol
					centerY,
					size,
					groupId,
					`${layoutNode.id}-center`
				)
			);
			break;
		}
		case "AND-join-XOR-split": {
			// For mixed types, we can use a slightly modified size and spacing
			const spacing = size / 2;
			markers.push(
				...createPlusSymbol(
					centerX - spacing,
					centerY,
					size * 0.8, // Slightly smaller size for combined symbols
					groupId,
					`${layoutNode.id}-left`
				),
				...createXSymbol(
					centerX + spacing,
					centerY,
					size * 0.8,
					groupId,
					`${layoutNode.id}-right`
				)
			);
			break;
		}
		case "XOR-join-AND-split": {
			const spacing = size / 2;
			markers.push(
				...createXSymbol(
					centerX - spacing,
					centerY,
					size * 0.8,
					groupId,
					`${layoutNode.id}-left`
				),
				...createPlusSymbol(
					centerX + spacing,
					centerY,
					size * 0.8,
					groupId,
					`${layoutNode.id}-right`
				)
			);
			break;
		}
		default: {
			markers.push(
				...createUnknownSymbol(centerX, centerY, size, groupId, layoutNode.id)
			);
			break;
		}
	}

	return markers;
};

const createPlusSymbol = (
	x: number,
	y: number,
	size: number,
	groupId: string,
	id: string
): ExcalidrawElement[] => {
	return [
		// Vertical line
		{
			type: "line",
			id: `${id}-plus-v`,
			x: x,
			y: y - size / 2,
			width: 2,
			height: size,
			angle: 0,
			strokeColor: "#000000",
			backgroundColor: "transparent",
			fillStyle: "solid",
			strokeWidth: 2,
			strokeStyle: "solid",
			roughness: 0,
			opacity: 100,
			groupIds: [groupId],
			roundness: { type: 3 },
			seed: 1,
			version: 1,
			versionNonce: 0,
			isDeleted: false,
			boundElements: null,
			updated: 1,
			link: null,
			locked: true,
			frameId: null,
			points: [
				[0, 0],
				[0, size],
			] as const,
			lastCommittedPoint: null,
			startBinding: null,
			endBinding: null,
			startArrowhead: null,
			endArrowhead: null,
		},
		// Horizontal line
		{
			type: "line",
			id: `${id}-plus-h`,
			x: x - size / 2,
			y: y,
			width: size,
			height: 2,
			angle: 0,
			strokeColor: "#000000",
			backgroundColor: "transparent",
			fillStyle: "solid",
			strokeWidth: 2,
			strokeStyle: "solid",
			roughness: 0,
			opacity: 100,
			groupIds: [groupId],
			roundness: { type: 3 },
			seed: 1,
			version: 1,
			versionNonce: 0,
			isDeleted: false,
			boundElements: null,
			updated: 1,
			link: null,
			locked: true,
			frameId: null,
			points: [
				[0, 0],
				[size, 0],
			] as const,
			lastCommittedPoint: null,
			startBinding: null,
			endBinding: null,
			startArrowhead: null,
			endArrowhead: null,
		},
	];
};

const createXSymbol = (
	x: number,
	y: number,
	size: number,
	groupId: string,
	id: string
): ExcalidrawElement[] => {
	return [
		// First diagonal line (\)
		{
			type: "line",
			id: `${id}-x-1`,
			x: x - size / 2,
			y: y - size / 2,
			width: size,
			height: size,
			angle: 0,
			strokeColor: "#000000",
			backgroundColor: "transparent",
			fillStyle: "solid",
			strokeWidth: 2,
			strokeStyle: "solid",
			roughness: 0,
			opacity: 100,
			groupIds: [groupId],
			roundness: { type: 3 },
			seed: 1,
			version: 1,
			versionNonce: 0,
			isDeleted: false,
			boundElements: null,
			updated: 1,
			link: null,
			locked: true,
			frameId: null,
			points: [
				[0, 0],
				[size, size],
			] as const,
			lastCommittedPoint: null,
			startBinding: null,
			endBinding: null,
			startArrowhead: null,
			endArrowhead: null,
		},
		// Second diagonal line (/)
		{
			type: "line",
			id: `${id}-x-2`,
			x: x - size / 2,
			y: y - size / 2,
			width: size,
			height: size,
			angle: 0,
			strokeColor: "#000000",
			backgroundColor: "transparent",
			fillStyle: "solid",
			strokeWidth: 2,
			strokeStyle: "solid",
			roughness: 0,
			opacity: 100,
			groupIds: [groupId],
			roundness: { type: 3 },
			seed: 1,
			version: 1,
			versionNonce: 0,
			isDeleted: false,
			boundElements: null,
			updated: 1,
			link: null,
			locked: true,
			frameId: null,
			points: [
				[0, size],
				[size, 0],
			] as const,
			lastCommittedPoint: null,
			startBinding: null,
			endBinding: null,
			startArrowhead: null,
			endArrowhead: null,
		},
	];
};

const createUnknownSymbol = (
	x: number,
	y: number,
	size: number,
	groupId: string,
	id: string
): ExcalidrawElement[] => {
	return [
		// Question mark (?)
		{
			type: "text",
			id: `${id}-unknown`,
			x: x - size / 2,
			y: y - size / 2,
			width: size,
			height: size,
			angle: 0,
			strokeColor: "#000000",
			backgroundColor: "transparent",
			fillStyle: "solid",
			strokeWidth: 2,
			strokeStyle: "solid",
			roughness: 0,
			opacity: 100,
			groupIds: [groupId],
			roundness: null,
			seed: 1,
			version: 1,
			versionNonce: 0,
			isDeleted: false,
			boundElements: null,
			updated: 1,
			link: null,
			locked: true,
			text: "?",
			fontSize: size,
			fontFamily: 1,
			textAlign: "center",
			verticalAlign: "middle",
			baseline: size,
			containerId: null,
			originalText: "?",
			frameId: null,
			lineHeight: 1.25 as number & { _brand: "unitlessLineHeight" },
		},
	];
};

export const createElementsFromLayout = (
	graph: Graph,
	layout: LayoutGraph
): ExcalidrawElement[] => {
	const elements: ExcalidrawElement[] = [];

	// Create nodes using layout coordinates
	layout.children?.forEach((layoutNode: LayoutNode) => {
		const originalNode = graph.nodes.find((n) => n.id === layoutNode.id);
		if (!originalNode) return;

		const nodeElements =
			originalNode.type === "place"
				? createPlaceElements(layoutNode, originalNode, graph)
				: originalNode.gatewayType
				? createGatewayTransitionElements(layoutNode, originalNode, graph)
				: createTransitionElements(layoutNode, originalNode, graph);

		elements.push(...nodeElements);
	});

	// Create edges
	graph.edges.forEach((edge) => {
		const edgeElements = createEdgeElements(edge, layout, graph);
		elements.push(...edgeElements);
	});

	return elements;
};
