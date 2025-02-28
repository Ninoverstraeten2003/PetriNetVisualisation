import { Edge, Graph, Node } from "@/types";
import { AssemblySequence } from "@/types/assembly_sequence.types";
import assemblyGraph from "../HD_Instructions/assembly_sequence.json";

/**
 * Converts an AssemblySequence to a Graph representation
 * @param assemblySequence The assembly sequence to convert
 * @returns A Graph representation of the assembly sequence
 */
export function convertAssemblySequenceToGraph(
	assemblySequence: AssemblySequence
): Graph {
	const nodes: Node[] = [];
	const edges: Edge[] = [];

	// Sort steps by step number to ensure correct order
	const sortedSteps = [...assemblySequence.steps].sort(
		(a, b) => parseInt(a.step) - parseInt(b.step)
	);

	// Create a place for each step
	sortedSteps.forEach((step) => {
		const placeId = `place_${step.step}`;
		nodes.push({
			id: placeId,
			type: "place",
			text: step.name,
			tokens: parseInt(step.step) === 0 ? 1 : 0, // Initial token on first step
		});
	});

	// Create transitions between steps
	for (let i = 0; i < sortedSteps.length - 1; i++) {
		const currentStep = sortedSteps[i];
		const nextStep = sortedSteps[i + 1];

		const transitionId = `transition_${currentStep.step}_to_${nextStep.step}`;
		nodes.push({
			id: transitionId,
			type: "transition",
			text: currentStep.description,
			isGateway: false,
		});

		// Edge from current step place to transition
		edges.push({
			id: `edge_place_${currentStep.step}_to_${transitionId}`,
			from: `place_${currentStep.step}`,
			to: transitionId,
			type: "arc",
			weight: 1,
		});

		// Edge from transition to next step place
		edges.push({
			id: `edge_${transitionId}_to_place_${nextStep.step}`,
			from: transitionId,
			to: `place_${nextStep.step}`,
			type: "arc",
			weight: 1,
		});
	}

	// Handle the last step if there are any steps
	if (sortedSteps.length > 0) {
		const lastStep = sortedSteps[sortedSteps.length - 1];
		const finalTransitionId = `transition_final_${lastStep.step}`;

		nodes.push({
			id: finalTransitionId,
			type: "transition",
			text: lastStep.description,
			isGateway: false,
		});

		// Edge from last step to final transition
		edges.push({
			id: `edge_place_${lastStep.step}_to_${finalTransitionId}`,
			from: `place_${lastStep.step}`,
			to: finalTransitionId,
			type: "arc",
			weight: 1,
		});

		// Optionally, add a final place representing completion
		const finalPlaceId = "place_completed";
		nodes.push({
			id: finalPlaceId,
			type: "place",
			text: "Assembly Completed",
			tokens: 0,
		});

		edges.push({
			id: `edge_${finalTransitionId}_to_${finalPlaceId}`,
			from: finalTransitionId,
			to: finalPlaceId,
			type: "arc",
			weight: 1,
		});
	}

	return {
		nodes,
		edges,
	};
}
export const assemblyGraphData = convertAssemblySequenceToGraph(assemblyGraph);
