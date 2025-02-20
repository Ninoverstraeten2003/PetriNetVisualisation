import type { ExcalidrawImperativeAPI } from "@excalidraw/excalidraw/types/types";
import { toast } from "sonner";
import { layoutGraph } from "../layoutService";
import { Graph } from "../types";
import { parsePNML } from "../utils/pnmlParser";

export const useFileUpload = (
	layoutEngine: "dagre" | "elk" | "webcola",
	excalidrawAPI: ExcalidrawImperativeAPI | null,
	setCurrentGraph: (graph: Graph) => void
) => {
	const handleFileUpload = async (
		event: React.ChangeEvent<HTMLInputElement>
	) => {
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
					setCurrentGraph(parsedNet);
					const layoutedElements = await layoutGraph(parsedNet, layoutEngine);
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
	};

	return { handleFileUpload };
};
