import { layoutGraph } from "@/layoutService";
import { Edge, Node } from "@/types";
import { parsePNML } from "@/utils/pnmlParser";
import { Excalidraw, WelcomeScreen } from "@excalidraw/excalidraw";
import { ExcalidrawElement } from "@excalidraw/excalidraw/types/element/types";
import type {
	ActiveTool,
	AppState,
	ExcalidrawImperativeAPI,
	PointerDownState,
	UIOptions,
} from "@excalidraw/excalidraw/types/types";
import React, { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";
import { MainMenuComponent } from "./MainMenu";
import { TokenGameController } from "./TokenGameController";
import { petriNetActor } from "@/xstate/petriNetMachine";
import { useSelector } from "@xstate/react";

const PetriNetEditor: React.FC = () => {
	const [excalidrawAPI, setExcalidrawAPI] =
		useState<ExcalidrawImperativeAPI | null>(null);

	const {
		currentGraph,
		selectedEdges,
		selectedNodes,
		hasGraphData,
		isGameActive,
		enabledTransitions,
		selectedTransition,
		transitionOptions,
		layoutEngine,
	} = useSelector(petriNetActor, (snapshot) => ({
		currentGraph: snapshot.context.currentGraph,
		selectedEdges: snapshot.context.selectedEdges,
		selectedNodes: snapshot.context.selectedNodes,
		hasGraphData: Boolean(snapshot.context.currentGraph),
		isGameActive:
			snapshot.matches("gameRunning") || snapshot.matches("transitionSelected"),
		enabledTransitions: snapshot.context.enabledTransitions,
		selectedTransition: snapshot.context.selectedTransition,
		transitionOptions: snapshot.context.transitionOptions,
		layoutEngine: snapshot.context.layoutEngine,
	}));

	const stableSetExcalidrawAPI = useCallback((api: ExcalidrawImperativeAPI) => {
		setExcalidrawAPI(api);
		petriNetActor.send({ type: "SET_EXCALIDRAW_API", api });
	}, []);

	const handleElementClick = useCallback(
		(activeTool: ActiveTool, pointerDownState: PointerDownState) => {
			const targetElement = pointerDownState.hit?.element;
			if (targetElement) {
				petriNetActor.send({
					type: "ELEMENT_CLICK",
					elementId: targetElement.id,
				});
			}
		},
		[]
	);

	const handleChange = useCallback(
		(elements: readonly ExcalidrawElement[], appState: AppState) => {
			if (!currentGraph || !excalidrawAPI) return;

			// // Maybe this logic needs to be somewhere else
			// if (excalidrawAPI.getSceneElements().length === 0) {
			// 	setHasGraphData(false);
			// } else {
			// 	setHasGraphData(true);
			// }

			const selectedElementIds = Object.keys(appState.selectedElementIds);
			const shouldShowSidebar = selectedElementIds.length > 0;

			// Clear selections if nothing is selected
			if (!shouldShowSidebar) {
				if (selectedNodes.length > 0 || selectedEdges.length > 0) {
					petriNetActor.send({
						type: "UPDATE_SELECTION",
						nodes: [],
						edges: [],
					});
					return;
				}
			}

			const newSelectedNodes: Node[] = [];
			const newSelectedEdges: Edge[] = [];

			// Process all selected elements
			selectedElementIds.forEach((selectedElementId) => {
				const baseId = selectedElementId.match(/^([^-]+)/)?.[1];
				if (baseId) {
					const node = currentGraph.nodes.find((n) => n.id === baseId);
					const edge = currentGraph.edges.find(
						(e) => e.id === selectedElementId
					);
					excalidrawAPI.getSceneElements();
					if (node && !newSelectedNodes.some((n) => n.id === node.id)) {
						newSelectedNodes.push(node);
					} else if (edge && !newSelectedEdges.some((e) => e.id === edge.id)) {
						newSelectedEdges.push(edge);
					}
				}
			});

			// Check if selections have actually changed before updating state
			const nodesChanged =
				newSelectedNodes.length !== selectedNodes.length ||
				newSelectedNodes.some((node) => !selectedNodes.includes(node));

			const edgesChanged =
				newSelectedEdges.length !== selectedEdges.length ||
				newSelectedEdges.some((edge) => !selectedEdges.includes(edge));

			if (nodesChanged || edgesChanged) {
				petriNetActor.send({
					type: "UPDATE_SELECTION",
					nodes: newSelectedNodes,
					edges: newSelectedEdges,
				});

				// Only toggle sidebar if we have selections and it's not already shown
				if (shouldShowSidebar) {
					excalidrawAPI?.toggleSidebar({
						name: "nodeinfo",
						force: true,
					});
				}
			}
		},
		[currentGraph, excalidrawAPI, selectedEdges, selectedNodes]
	);

	const handleFileUpload = useCallback(
		(event: React.ChangeEvent<HTMLInputElement>) => {
			if (event.target.files && event.target.files[0]) {
				const file = event.target.files?.[0];
				if (!file) return;

				toast.message("Uploading the file", {
					icon: "⏳",
				});

				const reader = new FileReader();
				reader.onload = async (e) => {
					try {
						const parser = new DOMParser();
						const xmlDoc = parser.parseFromString(
							e.target?.result as string,
							"text/xml"
						);

						const parseError = xmlDoc.getElementsByTagName("parsererror");
						if (parseError.length > 0) {
							throw new Error("Invalid XML format");
						}

						const parsedNet = parsePNML(xmlDoc);
						if (parsedNet && parsedNet.nodes && parsedNet.edges) {
							petriNetActor.send({
								type: "UPLOAD_FILE",
								graph: parsedNet,
							});

							const layoutedElements = await layoutGraph(
								parsedNet,
								layoutEngine
							);
							if (excalidrawAPI) {
								excalidrawAPI.updateScene({
									elements: layoutedElements,
								});
								excalidrawAPI.scrollToContent();
							}
						} else {
							throw new Error("Invalid PNML structure");
						}
					} catch (err) {
						toast.error("Something went wrong", { icon: "❌" });
						console.error(err);
					} finally {
						toast.message("File uploaded", {
							icon: "✔️",
						});
					}
				};

				reader.onerror = (err) => {
					toast.error("Something went wrong", { icon: "❌" });
					console.error(err);
				};

				reader.readAsText(file);
			}
		},
		[excalidrawAPI, layoutEngine]
	);

	const handleGameActiveToggle = useCallback(() => {
		if (isGameActive) {
			petriNetActor.send({ type: "END_GAME" });
		} else {
			petriNetActor.send({ type: "START_GAME" });
		}
	}, [isGameActive]);

	const handleResetGame = useCallback(() => {
		petriNetActor.send({ type: "RESET_GAME" });
	}, []);

	const handleTransitionSelect = useCallback((transitionId: string) => {
		petriNetActor.send({
			type: "SELECT_TRANSITION",
			transitionId,
		});
	}, []);

	const handleFireTransition = useCallback((outputId: string) => {
		petriNetActor.send({
			type: "FIRE_TRANSITION",
			outputId,
		});
	}, []);

	const handleLayoutChange = useCallback(
		(engine: "dagre" | "elk" | "webcola") => {
			petriNetActor.send({
				type: "CHANGE_LAYOUT",
				engine,
			});
		},
		[]
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

	return (
		<Excalidraw
			excalidrawAPI={stableSetExcalidrawAPI}
			onChange={handleChange}
			onPointerDown={handleElementClick}
			zenModeEnabled={true}
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
				setLayoutEngine={handleLayoutChange}
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
		</Excalidraw>
	);
};

export default PetriNetEditor;
