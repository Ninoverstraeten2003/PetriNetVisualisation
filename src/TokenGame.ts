import { GatewayBehaviorFactory } from "./GatewayBehavior";
import { Edge, Graph, Node, WOPED_OPERATOR_TYPES } from "./types";

export class TokenGame {
	private currentMarking: Map<string, number>;
	private graph: Graph;

	constructor(graph: Graph) {
		this.graph = graph;
		this.currentMarking = new Map();

		// Initialize marking from initial tokens
		graph.nodes
			.filter((node) => node.type === "place")
			.forEach((place) => {
				this.currentMarking.set(place.id, place.tokens || 0);
			});
	}
	private getNodeEdges(nodeId: string): { incoming: Edge[]; outgoing: Edge[] } {
		return {
			incoming: this.graph.edges.filter((e) => e.to === nodeId),
			outgoing: this.graph.edges.filter((e) => e.from === nodeId),
		};
	}

	isTransitionEnabled(transition: Node): boolean {
		const { incoming, outgoing } = this.getNodeEdges(transition.id);

		if (transition.gatewayType) {
			const gatewayType = WOPED_OPERATOR_TYPES[transition.gatewayType];
			const behavior = GatewayBehaviorFactory.getBehavior(gatewayType);
			return behavior.isEnabled( 
				transition,
				incoming,
				outgoing,
				this.currentMarking
			);
		}

		// Regular transition logic
		return incoming.every((edge) => {
			const inputPlace = this.currentMarking.get(edge.from) || 0;
			return inputPlace >= edge.weight;
		});
	}

	getEnabledTransitions(): string[] {
		return this.graph.nodes
			.filter((node) => node.type === "transition")
			.filter((transition) => this.isTransitionEnabled(transition))
			.map((t) => t.id);
	}

	getTransitionOptions(transitionId: string): {
		requiresSelection: boolean;
		availableOutputs?: Array<{ id: string; text: string }>;
	} {
		const transition = this.graph.nodes.find((n) => n.id === transitionId);
		if (!transition || !this.isTransitionEnabled(transition)) {
			return { requiresSelection: false };
		}

		// Get outgoing edges for this transition
		const { outgoing } = this.getNodeEdges(transition.id);

		if (transition.gatewayType) {
			const gatewayType = WOPED_OPERATOR_TYPES[transition.gatewayType];
			const behavior = GatewayBehaviorFactory.getBehavior(gatewayType);

			if (behavior.requiresOutputSelection()) {
				// Map outgoing edges to available outputs
				const outputs = outgoing.map((edge) => {
					const targetNode = this.graph.nodes.find((n) => n.id === edge.to);
					return {
						id: edge.to,
						text: targetNode?.text || edge.to,
					};
				});

				return {
					requiresSelection: true,
					availableOutputs: outputs,
				};
			}
		}

		return { requiresSelection: false };
	}

	fireTransition(
		transitionId: string,
		selectedOutputId?: string
	): Map<string, number> | null {
		const transition = this.graph.nodes.find((n) => n.id === transitionId);
		if (!transition || !this.isTransitionEnabled(transition)) {
			return null;
		}

		const { incoming, outgoing } = this.getNodeEdges(transition.id);

		if (transition.gatewayType) {
			const gatewayType = WOPED_OPERATOR_TYPES[transition.gatewayType];
			const behavior = GatewayBehaviorFactory.getBehavior(gatewayType);

			// Check if output selection is required but not provided
			if (behavior.requiresOutputSelection() && !selectedOutputId) {
				// Don't throw error, just return null to indicate transition cannot be fired yet
				return null;
			}

			// Execute the flow
			this.currentMarking = behavior.executeFlow(
				transition,
				incoming,
				outgoing,
				this.currentMarking,
				selectedOutputId
			);
		} else {
			// Regular transition logic
			incoming.forEach((edge) => {
				const currentTokens = this.currentMarking.get(edge.from) || 0;
				this.currentMarking.set(edge.from, currentTokens - edge.weight);
			});

			outgoing.forEach((edge) => {
				const currentTokens = this.currentMarking.get(edge.to) || 0;
				this.currentMarking.set(edge.to, currentTokens + edge.weight);
			});
		}

		return new Map(this.currentMarking);
	}

	reset(): void {
		this.graph.nodes
			.filter((node) => node.type === "place")
			.forEach((place) => {
				this.currentMarking.set(place.id, place.tokens || 0);
			});
	}

	getCurrentMarking(): Map<string, number> {
		return new Map(this.currentMarking);
	}
}
