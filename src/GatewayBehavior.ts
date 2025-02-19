import { Edge, GatewayType, Node } from "./types";

export interface GatewayBehavior {
	isEnabled(
		gatewayNode: Node,
		incomingEdges: Edge[],
		outgoingEdges: Edge[],
		currentMarking: Map<string, number>
	): boolean;

	executeFlow(
		gatewayNode: Node,
		incomingEdges: Edge[],
		outgoingEdges: Edge[],
		currentMarking: Map<string, number>,
		selectedOutputId?: string
	): Map<string, number>;

	requiresOutputSelection(): boolean;
}

// AND-split: All output places receive tokens when fired
export class AndSplitBehavior implements GatewayBehavior {
	requiresOutputSelection(): boolean {
		return false;
	}

	isEnabled(
		gatewayNode: Node,
		incomingEdges: Edge[],
		outgoingEdges: Edge[],
		currentMarking: Map<string, number>
	): boolean {
		return incomingEdges.every((edge) => {
			const inputTokens = currentMarking.get(edge.from) || 0;
			return inputTokens >= edge.weight;
		});
	}

	executeFlow(
		gatewayNode: Node,
		incomingEdges: Edge[],
		outgoingEdges: Edge[],
		currentMarking: Map<string, number>
	): Map<string, number> {
		const newMarking = new Map(currentMarking);

		// Consume tokens from input places
		incomingEdges.forEach((edge) => {
			const currentTokens = newMarking.get(edge.from) || 0;
			newMarking.set(edge.from, currentTokens - edge.weight);
		});

		// Add tokens to ALL output places
		outgoingEdges.forEach((edge) => {
			const currentTokens = newMarking.get(edge.to) || 0;
			newMarking.set(edge.to, currentTokens + edge.weight);
		});

		return newMarking;
	}
}

// AND-join: Requires tokens in all input places
export class AndJoinBehavior implements GatewayBehavior {
	requiresOutputSelection(): boolean {
		return false;
	}

	isEnabled(
		gatewayNode: Node,
		incomingEdges: Edge[],
		outgoingEdges: Edge[],
		currentMarking: Map<string, number>
	): boolean {
		return incomingEdges.every((edge) => {
			const inputTokens = currentMarking.get(edge.from) || 0;
			return inputTokens >= edge.weight;
		});
	}

	executeFlow(
		gatewayNode: Node,
		incomingEdges: Edge[],
		outgoingEdges: Edge[],
		currentMarking: Map<string, number>
	): Map<string, number> {
		const newMarking = new Map(currentMarking);

		// Consume tokens from ALL input places
		incomingEdges.forEach((edge) => {
			const currentTokens = newMarking.get(edge.from) || 0;
			newMarking.set(edge.from, currentTokens - edge.weight);
		});

		// Add tokens to output places
		outgoingEdges.forEach((edge) => {
			const currentTokens = newMarking.get(edge.to) || 0;
			newMarking.set(edge.to, currentTokens + edge.weight);
		});

		return newMarking;
	}
}

// XOR-split: Only one output place receives tokens
export class XorSplitBehavior implements GatewayBehavior {
	requiresOutputSelection(): boolean {
		return true;
	}

	isEnabled(
		gatewayNode: Node,
		incomingEdges: Edge[],
		outgoingEdges: Edge[],
		currentMarking: Map<string, number>
	): boolean {
		return incomingEdges.every((edge) => {
			const inputTokens = currentMarking.get(edge.from) || 0;
			return inputTokens >= edge.weight;
		});
	}

	executeFlow(
		gatewayNode: Node,
		incomingEdges: Edge[],
		outgoingEdges: Edge[],
		currentMarking: Map<string, number>,
		selectedOutputId?: string
	): Map<string, number> {
		if (!selectedOutputId) {
			throw new Error("XOR-split requires output selection");
		}

		const selectedEdge = outgoingEdges.find(
			(edge) => edge.to === selectedOutputId
		);
		if (!selectedEdge) {
			throw new Error("Selected output path not found");
		}

		const newMarking = new Map(currentMarking);

		// Consume tokens from input places
		incomingEdges.forEach((edge) => {
			const currentTokens = newMarking.get(edge.from) || 0;
			newMarking.set(edge.from, currentTokens - edge.weight);
		});

		// Add tokens to selected output place only
		const currentTokens = newMarking.get(selectedEdge.to) || 0;
		newMarking.set(selectedEdge.to, currentTokens + selectedEdge.weight);

		return newMarking;
	}
}

// XOR-join: Requires tokens in any one input place
export class XorJoinBehavior implements GatewayBehavior {
	requiresOutputSelection(): boolean {
		return false;
	}

	isEnabled(
		gatewayNode: Node,
		incomingEdges: Edge[],
		outgoingEdges: Edge[],
		currentMarking: Map<string, number>
	): boolean {
		return incomingEdges.some((edge) => {
			const inputTokens = currentMarking.get(edge.from) || 0;
			return inputTokens >= edge.weight;
		});
	}

	executeFlow(
		gatewayNode: Node,
		incomingEdges: Edge[],
		outgoingEdges: Edge[],
		currentMarking: Map<string, number>
	): Map<string, number> {
		const newMarking = new Map(currentMarking);

		// XOR-join: consume tokens from ONE enabled input place
		const enabledEdge = incomingEdges.find((edge) => {
			const inputTokens = currentMarking.get(edge.from) || 0;
			return inputTokens >= edge.weight;
		})!;

		const currentTokens = newMarking.get(enabledEdge.from) || 0;
		newMarking.set(enabledEdge.from, currentTokens - enabledEdge.weight);

		// Add tokens to output places
		outgoingEdges.forEach((edge) => {
			const outTokens = newMarking.get(edge.to) || 0;
			newMarking.set(edge.to, outTokens + edge.weight);
		});

		return newMarking;
	}
}

// AND-join-split (previously AND-mixed): Combines AND-join and AND-split behavior
export class AndMixedBehavior implements GatewayBehavior {
	requiresOutputSelection(): boolean {
		return false;
	}

	isEnabled(
		gatewayNode: Node,
		incomingEdges: Edge[],
		outgoingEdges: Edge[],
		currentMarking: Map<string, number>
	): boolean {
		// AND-join behavior: require ALL inputs
		return incomingEdges.every((edge) => {
			const inputTokens = currentMarking.get(edge.from) || 0;
			return inputTokens >= edge.weight;
		});
	}

	executeFlow(
		gatewayNode: Node,
		incomingEdges: Edge[],
		outgoingEdges: Edge[],
		currentMarking: Map<string, number>
	): Map<string, number> {
		const newMarking = new Map(currentMarking);

		// AND-join behavior: consume from ALL inputs
		incomingEdges.forEach((edge) => {
			const currentTokens = newMarking.get(edge.from) || 0;
			newMarking.set(edge.from, currentTokens - edge.weight);
		});

		// AND-split behavior: distribute to ALL outputs
		outgoingEdges.forEach((edge) => {
			const currentTokens = newMarking.get(edge.to) || 0;
			newMarking.set(edge.to, currentTokens + edge.weight);
		});

		return newMarking;
	}
}

// XOR-join-split (previously XOR-mixed): Combines XOR-join and XOR-split behavior
export class XorMixedBehavior implements GatewayBehavior {
	requiresOutputSelection(): boolean {
		return true;
	}

	isEnabled(
		gatewayNode: Node,
		incomingEdges: Edge[],
		outgoingEdges: Edge[],
		currentMarking: Map<string, number>
	): boolean {
		// XOR-join behavior: require ANY ONE input
		return incomingEdges.some((edge) => {
			const inputTokens = currentMarking.get(edge.from) || 0;
			return inputTokens >= edge.weight;
		});
	}

	executeFlow(
		gatewayNode: Node,
		incomingEdges: Edge[],
		outgoingEdges: Edge[],
		currentMarking: Map<string, number>,
		selectedOutputId?: string
	): Map<string, number> {
		if (!selectedOutputId) {
			throw new Error("XOR-join-split requires output selection");
		}

		const newMarking = new Map(currentMarking);

		// XOR-join behavior: consume from ONE enabled input
		const enabledEdge = incomingEdges.find((edge) => {
			const inputTokens = currentMarking.get(edge.from) || 0;
			return inputTokens >= edge.weight;
		})!;

		const currentTokens = newMarking.get(enabledEdge.from) || 0;
		newMarking.set(enabledEdge.from, currentTokens - enabledEdge.weight);

		// XOR-split behavior: add tokens to selected output only
		const selectedEdge = outgoingEdges.find(
			(edge) => edge.to === selectedOutputId
		);
		if (!selectedEdge) {
			throw new Error("Selected output path not found");
		}

		const outputTokens = newMarking.get(selectedEdge.to) || 0;
		newMarking.set(selectedEdge.to, outputTokens + selectedEdge.weight);

		return newMarking;
	}
}

// AND-join-XOR-split (previously AND-XOR): Combines AND-join and XOR-split behavior
export class AndXorBehavior implements GatewayBehavior {
	requiresOutputSelection(): boolean {
		return true;
	}

	isEnabled(
		gatewayNode: Node,
		incomingEdges: Edge[],
		outgoingEdges: Edge[],
		currentMarking: Map<string, number>
	): boolean {
		// AND-join behavior: require ALL inputs
		return incomingEdges.every((edge) => {
			const inputTokens = currentMarking.get(edge.from) || 0;
			return inputTokens >= edge.weight;
		});
	}

	executeFlow(
		gatewayNode: Node,
		incomingEdges: Edge[],
		outgoingEdges: Edge[],
		currentMarking: Map<string, number>,
		selectedOutputId?: string
	): Map<string, number> {
		if (!selectedOutputId) {
			throw new Error("AND-join-XOR-split requires output selection");
		}

		const newMarking = new Map(currentMarking);

		// AND-join behavior: consume from ALL inputs
		incomingEdges.forEach((edge) => {
			const currentTokens = newMarking.get(edge.from) || 0;
			newMarking.set(edge.from, currentTokens - edge.weight);
		});

		// XOR-split behavior: add tokens to selected output only
		const selectedEdge = outgoingEdges.find(
			(edge) => edge.to === selectedOutputId
		);
		if (!selectedEdge) {
			throw new Error("Selected output path not found");
		}

		const outputTokens = newMarking.get(selectedEdge.to) || 0;
		newMarking.set(selectedEdge.to, outputTokens + selectedEdge.weight);

		return newMarking;
	}
}

// XOR-join-AND-split (previously XOR-AND): Combines XOR-join and AND-split behavior
export class XorAndBehavior implements GatewayBehavior {
	requiresOutputSelection(): boolean {
		return false;
	}

	isEnabled(
		gatewayNode: Node,
		incomingEdges: Edge[],
		outgoingEdges: Edge[],
		currentMarking: Map<string, number>
	): boolean {
		// XOR-join behavior: require ANY ONE input
		return incomingEdges.some((edge) => {
			const inputTokens = currentMarking.get(edge.from) || 0;
			return inputTokens >= edge.weight;
		});
	}

	executeFlow(
		gatewayNode: Node,
		incomingEdges: Edge[],
		outgoingEdges: Edge[],
		currentMarking: Map<string, number>
	): Map<string, number> {
		const newMarking = new Map(currentMarking);

		// XOR-join behavior: consume from ONE enabled input
		const enabledEdge = incomingEdges.find((edge) => {
			const inputTokens = currentMarking.get(edge.from) || 0;
			return inputTokens >= edge.weight;
		})!;

		const currentTokens = newMarking.get(enabledEdge.from) || 0;
		newMarking.set(enabledEdge.from, currentTokens - enabledEdge.weight);

		// AND-split behavior: add tokens to ALL outputs
		outgoingEdges.forEach((edge) => {
			const outTokens = newMarking.get(edge.to) || 0;
			newMarking.set(edge.to, outTokens + edge.weight);
		});

		return newMarking;
	}
}

// Factory to create appropriate gateway behavior
export class GatewayBehaviorFactory {
	private static behaviors: Map<GatewayType, GatewayBehavior> = new Map([
		["AND-split", new AndSplitBehavior()],
		["AND-join", new AndJoinBehavior()],
		["XOR-split", new XorSplitBehavior()],
		["XOR-join", new XorJoinBehavior()],
		["AND-join-split", new AndMixedBehavior()], // Updated name
		["XOR-join-split", new XorMixedBehavior()], // Updated name
		["AND-join-XOR-split", new AndXorBehavior()], // Updated name
		["XOR-join-AND-split", new XorAndBehavior()], // Updated name
		["UNKNOWN", new AndSplitBehavior()], // Default to AND-split for unknown types
	]);

	static getBehavior(gatewayType: GatewayType): GatewayBehavior {
		const behavior = this.behaviors.get(gatewayType);
		if (!behavior) {
			throw new Error(
				`No behavior implemented for gateway type: ${gatewayType}`
			);
		}
		return behavior;
	}
}
