import type { ExcalidrawImperativeAPI } from "@excalidraw/excalidraw/types/types";
import { ExcalidrawElement } from "@excalidraw/excalidraw/types/element/types";
import { Graph } from "../types";
import { calculateDotPositions } from "./utils";
import { createTokenElement } from "../elements";

export const updateTokenDisplay = (
	marking: Map<string, number>,
	graph: Graph,
	excalidrawAPI: ExcalidrawImperativeAPI | null
) => {
	if (!excalidrawAPI) return;
	const currentElements = excalidrawAPI.getSceneElements();

	// Remove existing tokens
	const elementsWithoutTokens = currentElements.filter(
		(element) => !(element.type === "ellipse" && element.id.includes("-token-"))
	);

	// Create new token elements
	const newTokenElements: ExcalidrawElement[] = [];

	graph.nodes
		.filter((node) => node.type === "place")
		.forEach((place) => {
			const tokens = marking.get(place.id) || 0;
			const placeElement = elementsWithoutTokens.find((e) => e.id === place.id);
			if (placeElement) {
				const tokenElements = createTokensForPlace(
					place.id,
					tokens,
					placeElement
				);
				newTokenElements.push(...tokenElements);
			}
		});

	// Update scene with new elements
	excalidrawAPI.updateScene({
		elements: [...elementsWithoutTokens, ...newTokenElements],
	});

	// Force a re-render
	requestAnimationFrame(() => {
		excalidrawAPI.refresh();
	});
};

export const createTokensForPlace = (
	placeId: string,
	tokenCount: number,
	placeElement: ExcalidrawElement
): ExcalidrawElement[] => {
	const tokens: ExcalidrawElement[] = [];
	const placeGroupId = `place-group-${placeId}`;
	const tokenGroupId = `${placeId}-tokens`;

	const centerX = placeElement.x + placeElement.width / 2;
	const centerY = placeElement.y + placeElement.height / 2;

	const positions = calculateDotPositions(tokenCount);

	positions.forEach((pos, index) => {
		tokens.push(
			createTokenElement({
				id: `${placeId}-token-${index}`,
				x: centerX + pos.x - 5,
				y: centerY + pos.y - 5,
				groupIds: [placeGroupId, tokenGroupId],
			})
		);
	});

	return tokens;
};
