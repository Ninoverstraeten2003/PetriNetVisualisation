import { SidebarLeft } from "@/components/sidebar-left";
import { SidebarRight } from "@/components/sidebar-right";
import {
	SidebarInset,
	SidebarProvider,
	SidebarTrigger,
} from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/sonner";
import PetriNetEditor from "./components/PetriNetEditor";

function App() {
	return (
		<>
			<Toaster position="bottom-right" />
			<SidebarProvider
				style={
					{
						"--sidebar-width": "19rem",
					} as React.CSSProperties
				}
			>
				<SidebarLeft />
				<SidebarInset>
					<header className="sticky top-0 flex h-14 shrink-0 items-center gap-2 bg-background z-10">
						<div className="flex flex-1 items-center gap-2 px-3">
							<SidebarTrigger />
						</div>
					</header>
					<div className="relative w-full h-[calc(100svh-3.5rem)] overflow-hidden">
						<div className="absolute inset-0">
							<PetriNetEditor />
						</div>
					</div>
				</SidebarInset>
				<SidebarRight />
			</SidebarProvider>
		</>
	);
}

export default App;
