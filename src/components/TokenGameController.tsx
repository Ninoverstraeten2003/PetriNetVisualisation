import { MainMenu } from "@excalidraw/excalidraw";
import React from "react";
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
	return (
		<>
			<MainMenu.ItemCustom>
				<div className="flex flex-col gap-1 w-full mt-1">
					<span className="font-bold">Enabled Transitions</span>
					<TransitionList
						enabledTransitions={enabledTransitions}
						currentGraph={currentGraph}
						selectedTransition={selectedTransition}
						onTransitionSelect={onTransitionSelect}
					/>
				</div>
			</MainMenu.ItemCustom>

			{selectedTransition && transitionOptions.requiresSelection && (
				<OutputSelector
					outputs={transitionOptions.availableOutputs || []}
					onSelect={onFireTransition}
				/>
			)}
		</>
	);
};

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
}) => (
	<>
		{enabledTransitions.map((transitionId) => {
			const node = currentGraph?.nodes.find((n) => n.id === transitionId);
			const isSelected = selectedTransition === transitionId;
			const gatewayTypeLabel: GatewayType =
				WOPED_OPERATOR_TYPES[node?.gatewayType || "0"] || "";

			return (
				<Button
					key={transitionId}
					variant={getGatewayColor(gatewayTypeLabel).variant}
					onClick={() => onTransitionSelect(transitionId)}
					className={`w-full ${isSelected && "brightness-95"}`}
				>
					{node?.text || transitionId}
					{node?.gatewayType && ` (${WOPED_OPERATOR_TYPES[node.gatewayType]})`}
				</Button>
			);
		})}
	</>
);

const OutputSelector: React.FC<{
	outputs: Array<{ id: string; text: string }>;
	onSelect: (id: string) => void;
}> = ({ outputs, onSelect }) => (
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
);
