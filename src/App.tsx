import { Toaster } from "@/components/ui/sonner";
import PetriNetEditor from "./components/PetriNetEditor";

function App() {
	return (
		<div className="h-svh bg-gray-100">
			<Toaster />
			<PetriNetEditor />
		</div>
	);
}

export default App;
