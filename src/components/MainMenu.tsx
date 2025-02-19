import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { MainMenu } from "@excalidraw/excalidraw";
import React from "react";
import { Graph } from "../types";
import test from "../../src/test.pnml?raw";

interface MainMenuProps {
	layoutEngine: "dagre" | "elk" | "webcola";
	setLayoutEngine: (engine: "dagre" | "elk" | "webcola") => void;
	handleFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
	isGameActive: boolean;
	handleGameActiveToggle: () => void;
	handleResetGame: () => void;
	currentGraph: Graph | null;
	enabledTransitions: string[];
	selectedTransition: string | null;
	transitionOptions: {
		requiresSelection: boolean;
		availableOutputs?: Array<{ id: string; text: string }>;
	};
	onTransitionSelect: (transitionId: string) => void;
	onFireTransition: (outputId: string) => void;
	hasGraphData: boolean;
	children?: React.ReactNode;
}

export const MainMenuComponent: React.FC<MainMenuProps> = ({
	layoutEngine,
	setLayoutEngine,
	handleFileUpload,
	isGameActive,
	handleGameActiveToggle,
	handleResetGame,
	hasGraphData,
	children,
}) => {
	const handleButtonClick = () => {
		const file = new File([test], "test.pnml", { type: "application/xml" });
		handleFileUpload({
			target: {
				files: [file],
			},
		} as unknown as React.ChangeEvent<HTMLInputElement>);
	};
	return (
		<MainMenu onSelect={(event) => event.preventDefault()}>
			<MainMenu.ItemCustom className="mt-0!">
				<div
					onClick={(e) => e.stopPropagation()}
					onPointerDown={(e) => e.stopPropagation()}
					onMouseDown={(e) => e.stopPropagation()}
					className="w-full"
				>
					<Select
						defaultValue={layoutEngine}
						onValueChange={(value) => {
							setLayoutEngine(value as "dagre" | "elk" | "webcola");
						}}
						disabled={isGameActive}
					>
						<SelectTrigger>
							<SelectValue />
						</SelectTrigger>
						<SelectContent onClick={(e) => e.stopPropagation()}>
							<SelectItem value="dagre">Dagre</SelectItem>
							<SelectItem value="elk">Elk</SelectItem>
							<SelectItem value="webcola">WebCola</SelectItem>
						</SelectContent>
					</Select>
				</div>
			</MainMenu.ItemCustom>
			<MainMenu.ItemCustom>
				<div className="grid w-full items-center gap-1.5">
					<Input
						id="picture"
						type="file"
						accept=".pnml,.xml"
						onChange={handleFileUpload}
						className="w-full"
						disabled={isGameActive}
					/>
					<Button
						onClick={handleButtonClick}
						variant={"outline"}
						disabled={isGameActive}
					>
						Example file
					</Button>
				</div>
			</MainMenu.ItemCustom>
			<MainMenu.ItemCustom>
				<Button
					variant="outline"
					onClick={handleGameActiveToggle}
					className="w-full"
					disabled={!hasGraphData}
				>
					{isGameActive ? "Stop Token Game 🏁" : "Start Token Game ⭐"}
				</Button>
			</MainMenu.ItemCustom>
			{isGameActive && (
				<MainMenu.ItemCustom>
					<Button
						variant="outline"
						onClick={handleResetGame}
						className="w-full"
					>
						Reset
					</Button>
				</MainMenu.ItemCustom>
			)}
			{children}
		</MainMenu>
	);
};
