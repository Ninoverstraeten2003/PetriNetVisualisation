import React, { memo } from "react";
import { type Node, WOPED_OPERATOR_TYPES } from "@/types";
import { Badge } from "@/components/ui/badge";

export const NodeInfo: React.FC<{ node: Node }> = memo(({ node }) => (
	<div className="text-sm">
		<div className="font-medium">{node.text}</div>
		<div className="text-muted-foreground text-xs truncate">ID: {node.id}</div>
		{node.type === "place" && (
			<div className="flex items-center gap-1">
				<span className="text-muted-foreground text-xs">Tokens:</span>
				<Badge variant="outline" className="text-xs">
					{node.tokens || 0}
				</Badge>
			</div>
		)}
		{node.type === "transition" && node.gatewayType && (
			<div className="flex items-center flex-wrap">
				<span className="text-muted-foreground text-xs">Gateway:</span>
				<Badge variant="secondary" className="text-xs">
					{WOPED_OPERATOR_TYPES[node.gatewayType]}
				</Badge>
			</div>
		)}
	</div>
));
