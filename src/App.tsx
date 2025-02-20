import { Toaster } from "@/components/ui/sonner";
import PetriNetEditor from "./components/PetriNetEditor";

function App() {
	return (
		<div className="h-dvh">
			<Toaster position="bottom-right" />
			<PetriNetEditor />
		</div>
	);
}

export default App;
