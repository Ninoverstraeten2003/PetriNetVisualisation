import { useState, useEffect, useCallback } from "react";
import type { ExcalidrawImperativeAPI } from "@excalidraw/excalidraw/types/types";
import { TokenGame } from "../TokenGame";
import { Graph } from "../types";
import { updateTokenDisplay } from "../utils/tokenDisplayUtils";
import {
	clearHighlights,
	highlightEnabledTransitions,
} from "../utils/highlightUtils";
import { toast } from "sonner";

export const useTokenGame = (
	currentGraph: Graph | null,
	excalidrawAPI: ExcalidrawImperativeAPI | null
) => {
	const [isGameActive, setIsGameActive] = useState(false);
	const [tokenGame, setTokenGame] = useState<TokenGame | null>(null);
	const [enabledTransitions, setEnabledTransitions] = useState<string[]>([]);
	const [selectedTransition, setSelectedTransition] = useState<string | null>(
		null
	);
	const [transitionOptions, setTransitionOptions] = useState<{
		requiresSelection: boolean;
		availableOutputs?: Array<{ id: string; text: string }>;
	}>({ requiresSelection: false });

	// Initialize token game when graph is loaded
	useEffect(() => {
		if (currentGraph) {
			const game = new TokenGame(currentGraph);
			setTokenGame(game);
			setEnabledTransitions(game.getEnabledTransitions());
		}
	}, [currentGraph]);

	// Keep enabled transitions in sync
	useEffect(() => {
		if (tokenGame && isGameActive) {
			const updatedEnabledTransitions = tokenGame.getEnabledTransitions();
			setEnabledTransitions(updatedEnabledTransitions);
		}
	}, [tokenGame, isGameActive]);

	// Update visual indicators when enabled transitions change
	useEffect(() => {
		if (!excalidrawAPI || !currentGraph || !isGameActive) {
			clearHighlights(excalidrawAPI);
			return;
		}

		highlightEnabledTransitions(
			enabledTransitions,
			currentGraph,
			excalidrawAPI,
			selectedTransition
		);
	}, [
		enabledTransitions,
		isGameActive,
		selectedTransition,
		currentGraph,
		excalidrawAPI,
	]);

	const handleTransitionSelect = useCallback(
		(transitionId: string) => {
			if (!tokenGame || !currentGraph || !excalidrawAPI) return;

			const options = tokenGame.getTransitionOptions(transitionId);
			setTransitionOptions(options);

			// If this is the same transition, deselect it
			if (selectedTransition === transitionId) {
				setSelectedTransition(null);
				return;
			}

			setSelectedTransition(transitionId);

			// Auto-fire if no selection is required
			if (!options.requiresSelection) {
				const newMarking = tokenGame.fireTransition(transitionId);
				if (newMarking) {
					updateTokenDisplay(newMarking, currentGraph, excalidrawAPI);
					setSelectedTransition(null);
					setTransitionOptions({ requiresSelection: false });
					setEnabledTransitions(tokenGame.getEnabledTransitions());
				}
			}
		},
		[tokenGame, currentGraph, excalidrawAPI, selectedTransition]
	);

	const handleElementClick = useCallback(
		(element: { id: string }) => {
			if (!isGameActive || !tokenGame || !currentGraph) return;

			const node = currentGraph.nodes.find((n) => n.id === element.id);
			if (!node || node.type !== "transition") return;

			if (enabledTransitions.includes(node.id)) {
				handleTransitionSelect(node.id);
			}
		},
		[
			isGameActive,
			tokenGame,
			enabledTransitions,
			currentGraph,
			handleTransitionSelect,
		]
	);

	const handleFireTransition = (outputId: string) => {
		if (!tokenGame || !currentGraph || !excalidrawAPI) return;

		const transitionId = selectedTransition || outputId;
		if (!transitionId) return;

		const newMarking = tokenGame.fireTransition(
			transitionId,
			transitionOptions.requiresSelection ? outputId : undefined
		);

		if (newMarking) {
			updateTokenDisplay(newMarking, currentGraph, excalidrawAPI);
			setSelectedTransition(null);
			setTransitionOptions({ requiresSelection: false });
			setEnabledTransitions(tokenGame.getEnabledTransitions());
		}
	};

	const handleGameActiveToggle = () => {
		const newGameActive = !isGameActive;
		setIsGameActive(newGameActive);
		toast.message(newGameActive ? "Game started" : "Game ended", {
			icon: newGameActive ? "⭐" : "🏁",
		});
		if (tokenGame) {
			tokenGame.reset();
			if (currentGraph && excalidrawAPI) {
				updateTokenDisplay(
					tokenGame.getCurrentMarking(),
					currentGraph,
					excalidrawAPI
				);
			}
			setEnabledTransitions(
				newGameActive ? tokenGame.getEnabledTransitions() : []
			);
		}
		if (newGameActive) {
			excalidrawAPI?.toggleSidebar({
				name: "nodeinfo",
				force: true,
			});
		}
	};

	const handleResetGame = () => {
		if (!tokenGame || !currentGraph || !excalidrawAPI) return;

		tokenGame.reset();
		setEnabledTransitions(tokenGame.getEnabledTransitions());
		updateTokenDisplay(
			tokenGame.getCurrentMarking(),
			currentGraph,
			excalidrawAPI
		);
	};

	return {
		isGameActive,
		tokenGame,
		enabledTransitions,
		selectedTransition,
		transitionOptions,
		handleTransitionSelect,
		handleFireTransition,
		handleGameActiveToggle,
		handleResetGame,
		handleElementClick,
	};
};
