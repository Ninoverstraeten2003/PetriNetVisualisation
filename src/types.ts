import { LayoutOptions } from "elkjs";

export type OperatorType =
	| "101"
	| "102"
	| "104"
	| "105"
	| "106"
	| "107"
	| "108"
	| "109"
	| "0";

export type GatewayType =
	| "AND-join-split" // was AND-mixed
	| "XOR-join-split" // was XOR-mixed
	| "AND-join-XOR-split" // was AND-XOR
	| "XOR-join-AND-split" // was XOR-AND
	| "AND-split"
	| "AND-join"
	| "XOR-split"
	| "XOR-join"
	| "UNKNOWN";

export const WOPED_OPERATOR_TYPES: Record<OperatorType, GatewayType> = {
	"101": "AND-split",
	"102": "AND-join",
	"104": "XOR-split",
	"105": "XOR-join",
	"106": "XOR-join-split", // was XOR-mixed
	"107": "AND-join-split", // was AND-mixed
	"108": "AND-join-XOR-split", // was AND-XOR
	"109": "XOR-join-AND-split", // was XOR-AND
	"0": "UNKNOWN",
} as const;

export interface Node {
	id: string;
	type: "place" | "transition";
	text: string;
	tokens?: number;
	isGateway?: boolean;
	gatewayType?: OperatorType;
}

export interface LayoutNode {
	id: string;
	x: number;
	y: number;
	width: number;
	height: number;
	labels?: Array<{ text: string }>;
	gatewayType?: OperatorType;
}

export interface Node {
	id: string;
	type: "place" | "transition";
	text: string;
	tokens?: number;
	isGateway?: boolean;
	gatewayType?: OperatorType;
}

export interface GatewayInfo {
	gatewayId: string;
	transitionIds: string[];
	type: GatewayType;
	text: string;
}

export interface Edge {
	id: string;
	from: string;
	to: string;
	type: "arc";
	weight: number;
}

export interface Graph {
	nodes: Node[];
	edges: Edge[];
}

export interface LayoutNode {
	id: string;
	x: number;
	y: number;
	width: number;
	height: number;
	labels?: Array<{ text: string }>;
	gatewayType?: OperatorType; // Added gatewayType to LayoutNode
}

export interface EdgeSection {
	startPoint: { x: number; y: number };
	endPoint: { x: number; y: number };
	bendPoints?: Array<{ x: number; y: number }>;
}

export interface LayoutEdge {
	id: string;
	sources: string[];
	targets: string[];
	sections?: EdgeSection[];
}

export interface LayoutGraph {
	id: string;
	children: LayoutNode[];
	edges: LayoutEdge[];
}

export interface ElkNode {
	id: string;
	x?: number;
	y?: number;
	width?: number;
	height?: number;
	children?: ElkNode[];
	edges?: ElkEdge[];
	labels?: Array<{ text: string }>;
	layoutOptions?: LayoutOptions;
}

export interface ElkEdge {
	id: string;
	sources: string[];
	targets: string[];
	sections?: ElkSection[];
}

export interface ElkSection {
	startPoint: { x: number; y: number };
	endPoint: { x: number; y: number };
	bendPoints?: Array<{ x: number; y: number }>;
}
