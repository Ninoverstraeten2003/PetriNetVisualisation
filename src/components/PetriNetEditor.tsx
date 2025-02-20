import { Excalidraw, WelcomeScreen } from "@excalidraw/excalidraw";
import type {
	AppState,
	ExcalidrawImperativeAPI,
	UIOptions,
} from "@excalidraw/excalidraw/types/types";
import React, { useState, useMemo, useCallback, ChangeEvent } from "react";
import { useFileUpload } from "../hooks/useFileUpload";
import { usePetriNetEditor } from "../hooks/usePetriNetEditor";
import { useTokenGame } from "../hooks/useTokenGame";
import { MainMenuComponent } from "./MainMenu";
import { SidebarComponent } from "./SideBar";
import { TokenGameController } from "./TokenGameController";
import { ExcalidrawElement } from "@excalidraw/excalidraw/types/element/types";

const PetriNetEditor: React.FC = () => {
	const [excalidrawAPI, setExcalidrawAPI] =
		useState<ExcalidrawImperativeAPI | null>(null);
	const [layoutEngine, setLayoutEngine] = useState<"dagre" | "elk" | "webcola">(
		"elk"
	);

	const {
		hasGraphData,
		currentGraph,
		selectedNodes,
		selectedEdges,
		handleChange,
		setCurrentGraph, // Make sure to destructure these
	} = usePetriNetEditor(excalidrawAPI, layoutEngine);

	const {
		isGameActive,
		enabledTransitions,
		selectedTransition,
		transitionOptions,
		handleTransitionSelect,
		handleFireTransition,
		handleGameActiveToggle,
		handleResetGame,
	} = useTokenGame(currentGraph, excalidrawAPI);

	const { handleFileUpload } = useFileUpload(
		layoutEngine,
		excalidrawAPI,
		setCurrentGraph
	);

	const stableSetExcalidrawAPI = useCallback(
		(api: ExcalidrawImperativeAPI) => {
			setExcalidrawAPI(api);
		},
		[setExcalidrawAPI]
	);

	const stableHandleFileUpload = useCallback(
		(event: ChangeEvent<HTMLInputElement>) => {
			if (event.target.files && event.target.files[0]) {
				handleFileUpload(event);
			}
		},
		[handleFileUpload]
	);

	const stableHandleFireTransition = useCallback(
		(outputId: string) => {
			handleFireTransition(outputId);
		},
		[handleFireTransition]
	);

	const stableHandleGameActiveToggle = useCallback(() => {
		handleGameActiveToggle();
	}, [handleGameActiveToggle]);

	const stableHandleResetGame = useCallback(() => {
		handleResetGame();
	}, [handleResetGame]);

	const memoizedSelectedNodes = useMemo(() => selectedNodes, [selectedNodes]);
	const memoizedSelectedEdges = useMemo(() => selectedEdges, [selectedEdges]);

	const stableOnFireTransition = useCallback(
		(outputId: string) => handleFireTransition(outputId),
		[handleFireTransition]
	);

	const memoizedUIOptions = useMemo<UIOptions>(
		() => ({
			canvasActions: {
				changeViewBackgroundColor: false,
				export: false,
				loadScene: false,
				saveToActiveFile: false,
				saveAsImage: false,
				toggleTheme: false,
			},
		}),
		[]
	);

	const memoizedInitialData = useMemo(
		() => ({
			elements: [],
			appState: {
				viewBackgroundColor: "#ffffff",
				currentItemStrokeWidth: 2,
				currentItemRoughness: 0,
				zoom: {
					value: 1 as unknown as number & { _brand: "normalizedZoom" },
				},
				scrollX: 0,
				scrollY: 0,
				gridSize: 20,
			},
		}),
		[]
	);

	const stableOnChange = useCallback(
		(elements: readonly ExcalidrawElement[], appState: AppState) => {
			handleChange(elements, appState);
		},
		[handleChange]
	);

	// Memoize the props to ensure they are stable across renders
	const memoizedCurrentGraph = useMemo(() => currentGraph, [currentGraph]);
	const memoizedEnabledTransitions = useMemo(
		() => enabledTransitions,
		[enabledTransitions]
	);
	const memoizedTransitionOptionsProp = useMemo(
		() => transitionOptions,
		[transitionOptions]
	);

	return (
		<Excalidraw
			excalidrawAPI={stableSetExcalidrawAPI}
			onChange={stableOnChange}
			zenModeEnabled={false}
			viewModeEnabled={false}
			initialData={memoizedInitialData}
			UIOptions={memoizedUIOptions}
		>
			<WelcomeScreen>
				<WelcomeScreen.Hints.MenuHint>
					<p>Layout algorithm, import PNML petri net and start token game</p>
				</WelcomeScreen.Hints.MenuHint>
			</WelcomeScreen>
			<MainMenuComponent
				layoutEngine={layoutEngine}
				setLayoutEngine={setLayoutEngine}
				handleFileUpload={stableHandleFileUpload}
				isGameActive={isGameActive}
				handleGameActiveToggle={stableHandleGameActiveToggle}
				handleResetGame={stableHandleResetGame}
				currentGraph={memoizedCurrentGraph}
				enabledTransitions={memoizedEnabledTransitions}
				selectedTransition={selectedTransition}
				transitionOptions={memoizedTransitionOptionsProp}
				onTransitionSelect={handleTransitionSelect}
				onFireTransition={stableOnFireTransition}
				hasGraphData={hasGraphData}
			>
				{isGameActive && (
					<TokenGameController
						currentGraph={memoizedCurrentGraph}
						enabledTransitions={memoizedEnabledTransitions}
						selectedTransition={selectedTransition}
						transitionOptions={memoizedTransitionOptionsProp}
						onTransitionSelect={handleTransitionSelect}
						onFireTransition={stableHandleFireTransition}
					/>
				)}
			</MainMenuComponent>

			<SidebarComponent
				currentGraph={memoizedCurrentGraph}
				enabledTransitions={memoizedEnabledTransitions}
				selectedNodes={memoizedSelectedNodes}
				selectedEdges={memoizedSelectedEdges}
			/>
		</Excalidraw>
	);
};

export default PetriNetEditor;
