import type React from "react";
import { Badge } from "@/components/ui/badge";
import { ArrowRight } from "lucide-react";
import { Edge } from "@/types";

export const EdgeInfo: React.FC<{ edge: Edge }> = ({ edge }) => (
	<div className="text-sm">
		<div className="font-medium flex items-center gap-1">
			{edge.from} <ArrowRight className="w-3 h-3" /> {edge.to}
		</div>
		<div className="text-muted-foreground text-xs">ID: {edge.id}</div>
		<div className="flex items-center gap-1">
			<span className="text-muted-foreground text-xs">Weight:</span>
			<Badge variant="outline" className="text-xs">
				{edge.weight}
			</Badge>
		</div>
	</div>
);
