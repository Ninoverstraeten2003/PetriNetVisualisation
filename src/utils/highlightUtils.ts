import type { ExcalidrawImperativeAPI } from "@excalidraw/excalidraw/types/types";
import { ExcalidrawElement } from "@excalidraw/excalidraw/types/element/types";
import { Graph } from "../types";

const HIGHLIGHT_STROKE_WIDTH = 2; // Default stroke width
const ACTIVE_STROKE_WIDTH = 4; // Thicker stroke width for active elements

export const highlightEnabledTransitions = (
	enabledTransitions: string[],
	graph: Graph,
	excalidrawAPI: ExcalidrawImperativeAPI,
	selectedTransition: string | null
) => {
	const elements = excalidrawAPI.getSceneElements();
	const updatedElements: ExcalidrawElement[] = elements.map((element) => {
		// Handle transitions
		if (enabledTransitions.includes(element.id)) {
			return {
				...element,
				strokeWidth: ACTIVE_STROKE_WIDTH,
			};
		}

		// Handle paths
		if (element.type === "arrow" && selectedTransition) {
			const edge = graph.edges.find((e) => e.id === element.id);
			if (edge && edge.from === selectedTransition) {
				return {
					...element,
					strokeWidth: ACTIVE_STROKE_WIDTH,
				};
			}
		}

		// Reset other elements to default
		return {
			...element,
			strokeColor: "#000000",
			strokeWidth: HIGHLIGHT_STROKE_WIDTH,
			backgroundColor:
				element.type === "rectangle" ? "#dddddd" : element.backgroundColor,
		};
	});

	excalidrawAPI.updateScene({ elements: updatedElements });
};

export const clearHighlights = (
	excalidrawAPI: ExcalidrawImperativeAPI | null
) => {
	if (!excalidrawAPI) return;

	const elements = excalidrawAPI.getSceneElements();
	const updatedElements = elements.map((element) => ({
		...element,
		strokeColor: "#000000",
		strokeWidth: HIGHLIGHT_STROKE_WIDTH,
		backgroundColor:
			element.type === "rectangle" ? "#dddddd" : element.backgroundColor,
	}));

	excalidrawAPI.updateScene({ elements: updatedElements });
};
