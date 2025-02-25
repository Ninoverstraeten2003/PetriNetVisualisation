import { layoutGraph } from "@/layoutService";
import {
	clearHighlights,
	highlightEnabledTransitions,
} from "@/utils/highlightUtils";
import { updateTokenDisplay } from "@/utils/tokenDisplayUtils";
import { ExcalidrawImperativeAPI } from "@excalidraw/excalidraw/types/types";
import { toast } from "sonner";
import { assign, createActor, createMachine } from "xstate";
import { TokenGame } from "../TokenGame";
import type { Edge, Graph, Node } from "../types";

interface PetriNetContext {
	currentGraph: Graph | null;
	selectedNodes: Node[];
	selectedEdges: Edge[];
	tokenGame: TokenGame | null;
	enabledTransitions: string[];
	selectedTransition: string | null;
	transitionOptions: {
		requiresSelection: boolean;
		availableOutputs?: Array<{ id: string; text: string }>;
	};
	layoutEngine: "dagre" | "elk" | "webcola";
	excalidrawAPI: ExcalidrawImperativeAPI | null;
}

type PetriNetEvents =
	| { type: "SET_EXCALIDRAW_API"; api: ExcalidrawImperativeAPI }
	| { type: "UPLOAD_FILE"; graph: Graph }
	| { type: "SELECT_TRANSITION"; transitionId: string }
	| { type: "FIRE_TRANSITION"; outputId: string }
	| { type: "UPDATE_SELECTION"; nodes: Node[]; edges: Edge[] }
	| { type: "CHANGE_LAYOUT"; engine: "dagre" | "elk" | "webcola" }
	| { type: "START_GAME" | "END_GAME" | "RESET_GAME" }
	| { type: "ELEMENT_CLICK"; elementId: string };

export const petriNetMachine = createMachine(
	{
		/** @xstate-layout N4IgpgJg5mDOIC5QAcwBcBOBLAcugdFhADZgDEAygKIAqA+lQBoDCAggDICSAIgEqsB1OqwAKnANoAGALqIUAe1hY0WeQDs5IAB6IAnADZ8kgMyTJ+gIwB2K8dsAOAwBoQAT0QXJAVgtGvXkyt9L317C2MvAF9Il1RMXAIiUjIAVRF2AHlWbjoAMU52KilZJBBkRWVVDVKdBGMI-F0rAJ8AFm8m3QAmYxd3BAtBr3xWiO9Je3svY11jfWjY9Gw8NHwoDABDZAALdnkNiEhKWgYWDh5+IVEJGU1ypRV1TVqQrvwpgIMZ3V0Q-T6PN5fN4AnZgqFwlEYmUlglVustrt9ocIKl0lkcvlCsU7hVHtVQC9dJJ8PorF0vFNdPYuk0ul0AQhusMvL8TKZBvVWvNoXFlgQETs9gcjmluKwaFQ6NRCswaJwMjgcaV7pUnjVEF4rCTWjT9GZWtYvIbGTT7PgemYuhYWq1iV0FjD4is1pshcijswABKsHAAcSl7FYAE0MikaMqFA8qs9NVZzV0zJJdDbifVwoztW8bGYLKF9ZJOY6+XDXYjhSjKDRWLx6H7WABZIq3FV4mMahA2N72JP2fXGa0GeyMzx2Uk-RMzfStLwU4uwl1QDYAWzAvAArmo1Fg1FBjvQmGwuHxBMIxJGym31YTAU1SfousEpuTp-TGa1RqT7M16d1v-YZihRZnQFFc103bddzRcVJWlKhZXlRUL1VfFYwGTxhlpQsH1ZSR6X0f43EQYxuXwAcKUGVpf0AnlgP5eEwI3Lcdz3KgcByesm2Qq8CW0PQzFJXMLCaMxySokdISMV8bVabU5m6ecQIY1cmMgvdeCoag60bZsSijNVeNqTxHHwYSfFMRxrFsKwR26fAgmaYSZ1sdpJkU+i1kYiCWLIeCqCbHB6GYLhmAAaW46Nrz49CLHNIJCy5EiaTtRlfhGPCAisX4LDtYIgKdDylxU7yoJlKg5ToGh+BwChOEQpUW301COy7d5e37QdQlNXwZzMDluWNGkHV5BcCEwDY1EitQKDAUgAGM0COLTTiPC5T2uCKDLQ-RdCMG0TAmPs+1+U1iQtJNYvMXM+3c0txsmgyZvmxbUTFCUpTKuUFQavTLymtCglJKjpjtSQP2mbpMzsgCAnMfxDSsKjbpde6pqesAFqOfINMq6ravqzbmpvOoGiaFoco6LKekZelhn0AdpkpH5ZLB1pkbGzYHvxdHMdRNiOJ0wn22J+phjJoF2lZKneiIpkaQtYk+2MSZvwHex2dWVHHtmjGXrIDTls43TcX+jtRcaZoJcp7oZf6Oxdtin942CcwUw1-Ate5nXeeOBDcd9fHvqFqLakNRofgjyOI77RkduGbkI4CXUB2pd3PaqHm9eDwziNJy22mt6nZembNgeEgDzDJdXHTUeRDngFVRrQE2to7ABaQwky77vC1aRkO6MHue61d2kjAFuieinLzXCCldWpUZPBs2WhmMEZEzBlMHyfd3BSREUIAn4XotZYYgkyj8RONW2PBtNeqINLfH0pXevOY3cj5DwFLHsxy7FGMIQRGTGk7rOEGoxuRdAAmnTmaNvYvU-jnBAUx3j7WTHaZW3hySpTsiEAItI8F9lpNEaIQA */
		types: {} as {
			context: PetriNetContext;
			events: PetriNetEvents;
		},
		id: "petriNet",
		initial: "idle",
		context: {
			currentGraph: null,
			selectedNodes: [],
			selectedEdges: [],
			tokenGame: null,
			enabledTransitions: [],
			selectedTransition: null,
			transitionOptions: { requiresSelection: false },
			layoutEngine: "elk",
			excalidrawAPI: null,
		},
		states: {
			idle: {
				on: {
					SET_EXCALIDRAW_API: {
						actions: assign({
							excalidrawAPI: ({ event }) => event.api,
						}),
					},
					UPLOAD_FILE: {
						target: "graphLoaded",
						actions: [
							assign({
								currentGraph: ({ event }) => event.graph,
								tokenGame: ({ event }) => new TokenGame(event.graph),
								enabledTransitions: [],
								selectedTransition: null,
								transitionOptions: { requiresSelection: false },
								selectedNodes: [],
								selectedEdges: [],
							}),
							"initializeGraph",
						],
					},
				},
			},
			graphLoaded: {
				on: {
					SET_EXCALIDRAW_API: {
						actions: assign({
							excalidrawAPI: ({ event }) => event.api,
						}),
					},
					UPLOAD_FILE: {
						target: "graphLoaded",
						actions: [
							assign({
								currentGraph: ({ event }) => event.graph,
								tokenGame: ({ event }) => new TokenGame(event.graph),
								enabledTransitions: [],
								selectedTransition: null,
								transitionOptions: { requiresSelection: false },
								selectedNodes: [],
								selectedEdges: [],
							}),
							"initializeGraph",
						],
					},
					UPDATE_SELECTION: {
						actions: assign({
							selectedNodes: ({ event }) => event.nodes,
							selectedEdges: ({ event }) => event.edges,
						}),
					},
					CHANGE_LAYOUT: {
						actions: [
							assign({
								layoutEngine: ({ event }) => event.engine,
							}),
							"updateLayout",
						],
					},
					START_GAME: {
						target: "gameRunning",
						actions: "startGame",
					},
				},
			},
			gameRunning: {
				entry: [
					assign({
						enabledTransitions: ({ context }) =>
							context.tokenGame?.getEnabledTransitions() ?? [],
					}),
					"highlightEnabledTransitions",
				],
				on: {
					SET_EXCALIDRAW_API: {
						actions: assign({
							excalidrawAPI: ({ event }) => event.api,
						}),
					},
					UPDATE_SELECTION: {
						actions: assign({
							selectedNodes: ({ event }) => event.nodes,
							selectedEdges: ({ event }) => event.edges,
						}),
					},
					END_GAME: {
						target: "graphLoaded",
						actions: ["cleanupGame", "resetGameState"],
					},
					RESET_GAME: {
						actions: [
							"resetGame",
							assign({
								enabledTransitions: ({ context }) =>
									context.tokenGame?.getEnabledTransitions() ?? [],
								selectedTransition: null,
								transitionOptions: { requiresSelection: false },
							}),
							"highlightEnabledTransitions",
						],
					},
					ELEMENT_CLICK: {
						actions: [
							({ context, event }) => {
								if (!context.tokenGame || !context.currentGraph) return;
								const node = context.currentGraph.nodes.find(
									(n) => n.id === event.elementId
								);
								if (!node || node.type !== "transition") return;
								if (context.enabledTransitions.includes(node.id)) {
									return { type: "SELECT_TRANSITION", transitionId: node.id };
								}
							},
						],
					},
					SELECT_TRANSITION: {
						target: "transitionSelected",
						actions: [
							assign({
								selectedTransition: ({ event }) => event.transitionId,
								transitionOptions: ({ context, event }) =>
									context.tokenGame?.getTransitionOptions(
										event.transitionId
									) ?? { requiresSelection: false },
							}),
						],
						guard: ({ context, event }) => {
							return context.enabledTransitions.includes(event.transitionId);
						},
					},
				},
			},
			transitionSelected: {
				always: {
					target: "gameRunning",
					actions: [
						"fireTransitionDirectly",
						assign({
							enabledTransitions: ({ context }) =>
								context.tokenGame?.getEnabledTransitions() ?? [],
							selectedTransition: null,
							transitionOptions: { requiresSelection: false },
						}),
						"highlightEnabledTransitions",
					],
					guard: ({ context }) => !context.transitionOptions.requiresSelection,
				},
				on: {
					SET_EXCALIDRAW_API: {
						actions: assign({
							excalidrawAPI: ({ event }) => event.api,
						}),
					},
					UPDATE_SELECTION: {
						actions: assign({
							selectedNodes: ({ event }) => event.nodes,
							selectedEdges: ({ event }) => event.edges,
						}),
					},
					FIRE_TRANSITION: {
						target: "gameRunning",
						actions: [
							"fireTransitionWithOutput",
							assign({
								enabledTransitions: ({ context }) =>
									context.tokenGame?.getEnabledTransitions() ?? [],
								selectedTransition: null,
								transitionOptions: { requiresSelection: false },
							}),
							"highlightEnabledTransitions",
						],
					},
					END_GAME: {
						target: "graphLoaded",
						actions: ["cleanupGame", "resetGameState"],
					},
					RESET_GAME: {
						target: "gameRunning",
						actions: [
							"resetGame",
							assign({
								enabledTransitions: ({ context }) =>
									context.tokenGame?.getEnabledTransitions() ?? [],
								selectedTransition: null,
								transitionOptions: { requiresSelection: false },
							}),
							"highlightEnabledTransitions",
						],
					},
					SELECT_TRANSITION: {
						target: "transitionSelected",
						actions: assign({
							selectedTransition: ({ event }) => event.transitionId,
							transitionOptions: ({ context, event }) =>
								context.tokenGame?.getTransitionOptions(event.transitionId) ?? {
									requiresSelection: false,
								},
						}),
						guard: ({ context, event }) =>
							context.enabledTransitions.includes(event.transitionId),
					},
				},
			},
		},
	},
	{
		actions: {
			initializeGraph: ({ context }) => {
				if (
					context.excalidrawAPI &&
					context.currentGraph &&
					context.tokenGame
				) {
					clearHighlights(context.excalidrawAPI);
					updateTokenDisplay(
						context.tokenGame.getCurrentMarking(),
						context.currentGraph,
						context.excalidrawAPI
					);
				}
			},
			updateLayout: async ({ context }) => {
				if (!context.currentGraph || !context.excalidrawAPI) return;

				toast.message("Updating the scene", {
					icon: "⏳",
				});

				try {
					const layoutedElements = await layoutGraph(
						context.currentGraph,
						context.layoutEngine
					);

					context.excalidrawAPI.updateScene({
						elements: layoutedElements,
					});

					context.excalidrawAPI.scrollToContent();

					toast.message("Scene updated", {
						icon: "✔️",
					});
				} catch (err) {
					toast.error("Something went wrong", { icon: "❌" });
					console.error(err);
				}
			},
			startGame: ({ context }) => {
				if (
					!context.excalidrawAPI ||
					!context.currentGraph ||
					!context.tokenGame
				)
					return;

				const marking = context.tokenGame.getCurrentMarking();
				updateTokenDisplay(
					marking,
					context.currentGraph,
					context.excalidrawAPI
				);

				toast.message("Game started", { icon: "⭐" });
				context.excalidrawAPI.toggleSidebar({
					name: "nodeinfo",
					force: true,
				});
			},
			endGame: assign(({ context }) => {
				if (
					!context.excalidrawAPI ||
					!context.currentGraph ||
					!context.tokenGame
				)
					return {}; // Return empty object to avoid changing context

				clearHighlights(context.excalidrawAPI);
				context.tokenGame.reset();
				updateTokenDisplay(
					context.tokenGame.getCurrentMarking(),
					context.currentGraph,
					context.excalidrawAPI
				);

				toast.message("Game ended", { icon: "🏁" });

				// Return the context updates
				return {
					enabledTransitions: [],
					selectedTransition: null,
					transitionOptions: { requiresSelection: false },
				};
			}),
			cleanupGame: ({ context }) => {
				if (
					!context.excalidrawAPI ||
					!context.currentGraph ||
					!context.tokenGame
				)
					return;

				clearHighlights(context.excalidrawAPI);
				context.tokenGame.reset();
				updateTokenDisplay(
					context.tokenGame.getCurrentMarking(),
					context.currentGraph,
					context.excalidrawAPI
				);

				toast.message("Game ended", { icon: "🏁" });
			},

			// Action to reset the state
			resetGameState: assign({
				enabledTransitions: [],
				selectedTransition: null,
				transitionOptions: { requiresSelection: false },
			}),
			resetGame: ({ context }) => {
				if (
					!context.tokenGame ||
					!context.currentGraph ||
					!context.excalidrawAPI
				)
					return;

				context.tokenGame.reset();
				const marking = context.tokenGame.getCurrentMarking();
				updateTokenDisplay(
					marking,
					context.currentGraph,
					context.excalidrawAPI
				);

				toast.message("Game reset", { icon: "🔄" });
			},
			highlightEnabledTransitions: ({ context }) => {
				if (
					!context.excalidrawAPI ||
					!context.currentGraph ||
					!context.tokenGame
				)
					return;

				highlightEnabledTransitions(
					context.tokenGame.getEnabledTransitions(),
					context.currentGraph,
					context.excalidrawAPI,
					context.selectedTransition
				);
			},
			fireTransitionDirectly: ({ context }) => {
				if (!context.tokenGame || !context.selectedTransition) return;
				if (!context.currentGraph || !context.excalidrawAPI) return;

				const newMarking = context.tokenGame.fireTransition(
					context.selectedTransition
				);

				if (newMarking) {
					updateTokenDisplay(
						newMarking,
						context.currentGraph,
						context.excalidrawAPI
					);
				}
			},
			fireTransitionWithOutput: ({ context, event }) => {
				if (!context.tokenGame || !context.selectedTransition) return;
				if (!context.currentGraph || !context.excalidrawAPI) return;
				if (event.type !== "FIRE_TRANSITION") return;

				const newMarking = context.tokenGame.fireTransition(
					context.selectedTransition,
					context.transitionOptions.requiresSelection
						? event.outputId
						: undefined
				);

				if (newMarking) {
					updateTokenDisplay(
						newMarking,
						context.currentGraph,
						context.excalidrawAPI
					);
				}
			},
		},
	}
);

export const petriNetActor = createActor(petriNetMachine);
petriNetActor.start();
