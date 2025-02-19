import { Excalidraw, WelcomeScreen } from "@excalidraw/excalidraw";
import type { ExcalidrawImperativeAPI } from "@excalidraw/excalidraw/types/types";
import React, { useState } from "react";
import { useFileUpload } from "../hooks/useFileUpload";
import { usePetriNetEditor } from "../hooks/usePetriNetEditor";
import { useTokenGame } from "../hooks/useTokenGame";
import { MainMenuComponent } from "./MainMenu";
import { SidebarComponent } from "./SideBar";
import { TokenGameController } from "./TokenGameController";

const PetriNetEditor: React.FC = () => {
	const [excalidrawAPI, setExcalidrawAPI] =
		useState<ExcalidrawImperativeAPI | null>(null);
	const [layoutEngine, setLayoutEngine] = useState<"dagre" | "elk" | "webcola">(
		"dagre"
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

	return (
		<div className="bg-white rounded-lg shadow-lg h-full">
			<div className="h-[600px] min-h-screen border border-gray-200 rounded-lg overflow-hidden">
				<Excalidraw
					excalidrawAPI={(api) => setExcalidrawAPI(api)}
					onChange={(elements, appState) => {
						handleChange(elements, appState);
					}}
					zenModeEnabled={true}
					viewModeEnabled={false}
					initialData={{
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
					}}
					UIOptions={{
						canvasActions: {
							changeViewBackgroundColor: false,
							export: false,
							loadScene: false,
							saveToActiveFile: false,
							saveAsImage: false,
							toggleTheme: false,
						},
					}}
				>
					<WelcomeScreen>
						<WelcomeScreen.Hints.MenuHint>
							<p>
								Layout algorithm, import PNML petri net and start token game
							</p>
						</WelcomeScreen.Hints.MenuHint>
					</WelcomeScreen>
					<MainMenuComponent
						layoutEngine={layoutEngine}
						setLayoutEngine={setLayoutEngine}
						handleFileUpload={handleFileUpload}
						isGameActive={isGameActive}
						handleGameActiveToggle={handleGameActiveToggle}
						handleResetGame={handleResetGame}
						currentGraph={currentGraph}
						enabledTransitions={enabledTransitions}
						selectedTransition={selectedTransition}
						transitionOptions={transitionOptions}
						onTransitionSelect={handleTransitionSelect}
						onFireTransition={handleFireTransition}
						hasGraphData={hasGraphData}
					>
						{isGameActive && (
							<TokenGameController
								currentGraph={currentGraph}
								enabledTransitions={enabledTransitions}
								selectedTransition={selectedTransition}
								transitionOptions={transitionOptions}
								onTransitionSelect={handleTransitionSelect}
								onFireTransition={handleFireTransition}
							/>
						)}
					</MainMenuComponent>

					<SidebarComponent
						currentGraph={currentGraph}
						enabledTransitions={enabledTransitions}
						selectedNodes={selectedNodes}
						selectedEdges={selectedEdges}
					/>
				</Excalidraw>
			</div>
		</div>
	);
};

export default PetriNetEditor;
