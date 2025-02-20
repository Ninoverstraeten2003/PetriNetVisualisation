import { MainMenu } from "@excalidraw/excalidraw";
import React, { useCallback, useMemo } from "react";
import { GatewayType, Graph, WOPED_OPERATOR_TYPES } from "../types";
import { Button } from "./ui/button";
import { getGatewayColor } from "@/utils/utils";

interface TokenGameControllerProps {
	currentGraph: Graph | null;
	enabledTransitions: string[];
	selectedTransition: string | null;
	transitionOptions: {
		requiresSelection: boolean;
		availableOutputs?: Array<{ id: string; text: string }>;
	};
	onTransitionSelect: (transitionId: string) => void;
	onFireTransition: (outputId: string) => void;
}

export const TokenGameController: React.FC<TokenGameControllerProps> = ({
	currentGraph,
	enabledTransitions,
	selectedTransition,
	transitionOptions,
	onTransitionSelect,
	onFireTransition,
}) => {
	const memoizedEnabledTransitions = useMemo(
		() => enabledTransitions,
		[enabledTransitions]
	);
	const memoizedCurrentGraph = useMemo(() => currentGraph, [currentGraph]);
	const memoizedSelectedTransition = useMemo(
		() => selectedTransition,
		[selectedTransition]
	);
	const memoizedAvailableOutputs = useMemo(
		() => transitionOptions.availableOutputs || [],
		[transitionOptions.availableOutputs]
	);

	const handleTransitionSelect = useCallback(
		(id: string) => {
			onTransitionSelect(id);
		},
		[onTransitionSelect]
	);

	const handleFireTransition = useCallback(
		(id: string) => {
			onFireTransition(id);
		},
		[onFireTransition]
	);

	return (
		<>
			<MainMenu.ItemCustom>
				<div className="flex flex-col gap-1 w-full mt-1">
					<span className="font-bold">Enabled Transitions</span>
					<TransitionList
						enabledTransitions={memoizedEnabledTransitions}
						currentGraph={memoizedCurrentGraph}
						selectedTransition={memoizedSelectedTransition}
						onTransitionSelect={handleTransitionSelect}
					/>
				</div>
			</MainMenu.ItemCustom>

			{selectedTransition && transitionOptions.requiresSelection && (
				<OutputSelector
					outputs={memoizedAvailableOutputs}
					onSelect={handleFireTransition}
				/>
			)}
		</>
	);
};
const TransitionButton: React.FC<{
	transitionId: string;
	node: Graph["nodes"][0] | undefined;
	isSelected: boolean;
	onTransitionSelect: (id: string) => void;
}> = React.memo(({ transitionId, node, isSelected, onTransitionSelect }) => {
	const gatewayTypeLabel: GatewayType =
		WOPED_OPERATOR_TYPES[node?.gatewayType || "0"] || "";
	const variant = getGatewayColor(gatewayTypeLabel).variant;

	const handleClick = useCallback(() => {
		onTransitionSelect(transitionId);
	}, [onTransitionSelect, transitionId]);

	const buttonClassName = `w-full ${isSelected ? "brightness-95" : ""}`;

	return (
		<Button variant={variant} onClick={handleClick} className={buttonClassName}>
			{node?.text || transitionId}
			{node?.gatewayType && ` (${WOPED_OPERATOR_TYPES[node.gatewayType]})`}
		</Button>
	);
});

const TransitionList: React.FC<{
	enabledTransitions: string[];
	currentGraph: Graph | null;
	selectedTransition: string | null;
	onTransitionSelect: (id: string) => void;
}> = ({
	enabledTransitions,
	currentGraph,
	selectedTransition,
	onTransitionSelect,
}) => {
	const renderedTransitions = useMemo(
		() =>
			enabledTransitions.map((transitionId) => {
				const node = currentGraph?.nodes.find((n) => n.id === transitionId);
				const isSelected = selectedTransition === transitionId;

				return (
					<TransitionButton
						key={transitionId}
						transitionId={transitionId}
						node={node}
						isSelected={isSelected}
						onTransitionSelect={onTransitionSelect}
					/>
				);
			}),
		[enabledTransitions, currentGraph, selectedTransition, onTransitionSelect]
	);

	return <>{renderedTransitions}</>;
};

const OutputSelector: React.FC<{
	outputs: Array<{ id: string; text: string }>;
	onSelect: (id: string) => void;
}> = React.memo(({ outputs, onSelect }) => (
	<MainMenu.ItemCustom>
		<div className="flex flex-col gap-1 w-full mt-1">
			<span className="font-bold">Select Output</span>
			{outputs.map((output) => (
				<Button
					key={output.id}
					onClick={() => onSelect(output.id)}
					variant={"outline"}
					className="w-full"
				>
					{output.text}
				</Button>
			))}
		</div>
	</MainMenu.ItemCustom>
));
