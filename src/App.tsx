import { Toaster } from "@/components/ui/sonner";
import PetriNetEditor from "./components/PetriNetEditor";

function App() {
	return (
		<div className="h-dvh">
			<Toaster position="top-center" />
			<PetriNetEditor />
		</div>
	);
}

export default App;
