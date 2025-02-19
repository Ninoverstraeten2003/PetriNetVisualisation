import { Graph, OperatorType } from "../types";

interface Gateway {
	gatewayId: string;
	transitionIds: string[];
	type: OperatorType;
	text: string;
}

export const parsePNML = (xmlDoc: Document): Graph => {
	if (!xmlDoc) return { nodes: [], edges: [] };

	// Track gateways to merge transitions
	const gateways: Gateway[] = [];
	const gatewayTransitions = new Map<string, string>(); // Map transition ID to gateway ID

	// First pass: Identify gateway transitions and relationships
	Array.from(xmlDoc.getElementsByTagName("transition")).forEach((t) => {
		const operatorElement = t.querySelector("toolspecific operator");
		if (operatorElement) {
			const transitionId = t.getAttribute("id") || "";
			const gatewayId = operatorElement.getAttribute("id") || "";
			const operatorType = operatorElement.getAttribute("type") || "";
			const nameElement = t.querySelector("name text");

			gatewayTransitions.set(transitionId, gatewayId);

			// Track gateway for merging
			const existingGateway = gateways.find((g) => g.gatewayId === gatewayId);
			if (existingGateway) {
				if (!existingGateway.transitionIds.includes(transitionId)) {
					existingGateway.transitionIds.push(transitionId);
				}
			} else {
				gateways.push({
					gatewayId,
					transitionIds: [transitionId],
					type: operatorType as OperatorType,
					text: nameElement?.textContent || gatewayId,
				});
			}
		}
	});

	// Parse places
	const places = Array.from(xmlDoc.getElementsByTagName("place"))
		.map((p) => {
			const id = p.getAttribute("id") || "";
			const nameElement = p.querySelector("name text");
			const initialMarkingElement = p.querySelector("initialMarking text");

			return {
				id: id,
				type: "place" as const,
				text: nameElement?.textContent || id || "Unnamed Place",
				tokens: parseInt(initialMarkingElement?.textContent || "0", 10) || 0,
			};
		})
		.filter((p) => p.id);

	// Parse regular transitions (excluding gateway transitions)
	const transitions = Array.from(xmlDoc.getElementsByTagName("transition"))
		.map((t) => {
			const id = t.getAttribute("id") || "";
			const nameElement = t.querySelector("name text");

			// Skip transitions that are part of a gateway
			if (gatewayTransitions.has(id)) {
				return null;
			}

			return {
				id: id,
				type: "transition" as const,
				text: nameElement?.textContent || id || "Unnamed Transition",
			};
		})
		.filter((t): t is NonNullable<typeof t> => t !== null);

	// Create gateway nodes
	const gatewayNodes = gateways.map((g) => ({
		id: g.gatewayId,
		type: "transition" as const,
		text: g.text,
		isGateway: true,
		gatewayType: g.type,
	}));

	// Process arcs with gateway merging
	const arcsMap = new Map<
		string,
		{
			id: string;
			from: string;
			to: string;
			type: "arc";
			weight: number;
		}
	>();

	Array.from(xmlDoc.getElementsByTagName("arc")).forEach((a) => {
		let from = a.getAttribute("source") || "";
		let to = a.getAttribute("target") || "";

		// Replace transition IDs with gateway IDs where applicable
		if (gatewayTransitions.has(from)) {
			from = gatewayTransitions.get(from)!;
		}
		if (gatewayTransitions.has(to)) {
			to = gatewayTransitions.get(to)!;
		}

		// Create unique key for the arc to prevent duplicates
		const arcKey = `${from}-${to}`;

		if (!arcsMap.has(arcKey)) {
			arcsMap.set(arcKey, {
				id:
					a.getAttribute("id") ||
					`arc-${Math.random().toString(36).substr(2, 9)}`,
				from,
				to,
				type: "arc",
				weight:
					parseInt(
						a.querySelector("inscription text")?.textContent || "1",
						10
					) || 1,
			});
		}
	});

	return {
		nodes: [...places, ...transitions, ...gatewayNodes],
		edges: Array.from(arcsMap.values()),
	};
};

/**
 * Helper function to validate PNML structure
 */
export const validatePNML = (xmlDoc: Document): boolean => {
	// Check for basic PNML structure
	const pnml = xmlDoc.getElementsByTagName("pnml")[0];
	if (!pnml) return false;

	const net = pnml.getElementsByTagName("net")[0];
	if (!net) return false;

	// Check for required elements
	const places = net.getElementsByTagName("place");
	const transitions = net.getElementsByTagName("transition");
	const arcs = net.getElementsByTagName("arc");

	if (places.length === 0 || transitions.length === 0 || arcs.length === 0) {
		return false;
	}

	// Validate basic attributes
	for (const place of Array.from(places)) {
		if (!place.getAttribute("id")) return false;
	}

	for (const transition of Array.from(transitions)) {
		if (!transition.getAttribute("id")) return false;
	}

	for (const arc of Array.from(arcs)) {
		if (
			!arc.getAttribute("id") ||
			!arc.getAttribute("source") ||
			!arc.getAttribute("target")
		) {
			return false;
		}
	}

	return true;
};
