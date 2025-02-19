import { GatewayType, LayoutNode } from "../types";

export const calculateDotPositions = (
	count: number
): Array<{ x: number; y: number }> => {
	const positions: Array<{ x: number; y: number }> = [];

	if (count === 1) {
		positions.push({ x: 0, y: 0 });
	} else if (count <= 6) {
		// Arrange dots in a circle
		const angleStep = (2 * Math.PI) / count;
		for (let i = 0; i < count; i++) {
			positions.push({
				x: 15 * Math.cos(i * angleStep),
				y: 15 * Math.sin(i * angleStep),
			});
		}
	} else {
		// For more than 6 tokens, create concentric circles
		const outer = 6;
		const inner = count - 6;

		// Outer circle
		const outerAngleStep = (2 * Math.PI) / outer;
		for (let i = 0; i < outer; i++) {
			positions.push({
				x: 15 * Math.cos(i * outerAngleStep),
				y: 15 * Math.sin(i * outerAngleStep),
			});
		}

		// Inner circle/dot
		if (inner === 1) {
			positions.push({ x: 0, y: 0 });
		} else {
			const innerAngleStep = (2 * Math.PI) / inner;
			for (let i = 0; i < inner; i++) {
				positions.push({
					x: 8 * Math.cos(i * innerAngleStep),
					y: 8 * Math.sin(i * innerAngleStep),
				});
			}
		}
	}

	return positions;
};

export const calculateEdgePoints = (
	fromNode: LayoutNode,
	toNode: LayoutNode,
	fromNodeType?: "place" | "transition",
	toNodeType?: "place" | "transition",
	fromGatewayType?: string,
	toGatewayType?: string
): { startX: number; startY: number; endX: number; endY: number } => {
	let startX = fromNode.x;
	let startY = fromNode.y;
	let endX = toNode.x;
	let endY = toNode.y;

	// Calculate angle and distance between centers
	const angle = Math.atan2(endY - startY, endX - startX);
	const distance = Math.sqrt(
		Math.pow(endX - startX, 2) + Math.pow(endY - startY, 2)
	);

	// Determine intersection point with the boundary of the source node
	if (fromNodeType === "place") {
		startX += 30 * Math.cos(angle);
		startY += 30 * Math.sin(angle);
	} else if (fromNodeType === "transition") {
		if (fromGatewayType) {
			const intersection = getDiamondBoundaryIntersection(
				fromNode.x,
				fromNode.y,
				50,
				angle
			);
			// Only use intersection if it doesn't extend beyond the target
			if (
				distance >
				Math.sqrt(
					Math.pow(intersection.x - endX, 2) +
						Math.pow(intersection.y - endY, 2)
				)
			) {
				startX = intersection.x;
				startY = intersection.y;
			}
		} else {
			const halfWidth = 50;
			const halfHeight = 20;
			const intersection = getRectangleBoundaryIntersection(
				fromNode.x,
				fromNode.y,
				halfWidth,
				halfHeight,
				angle
			);
			startX = intersection.x;
			startY = intersection.y;
		}
	}

	// Determine intersection point with the boundary of the target node
	if (toNodeType === "place") {
		endX = toNode.x - 30 * Math.cos(angle);
		endY = toNode.y - 30 * Math.sin(angle);
	} else if (toNodeType === "transition") {
		if (toGatewayType) {
			const intersection = getDiamondBoundaryIntersection(
				toNode.x,
				toNode.y,
				50,
				angle + Math.PI
			);
			// Only use intersection if it doesn't extend beyond the source
			if (
				distance >
				Math.sqrt(
					Math.pow(intersection.x - startX, 2) +
						Math.pow(intersection.y - startY, 2)
				)
			) {
				endX = intersection.x;
				endY = intersection.y;
			}
		} else {
			const halfWidth = 50;
			const halfHeight = 20;
			const intersection = getRectangleBoundaryIntersection(
				toNode.x,
				toNode.y,
				halfWidth,
				halfHeight,
				angle + Math.PI
			);
			endX = intersection.x;
			endY = intersection.y;
		}
	}

	// Ensure minimum distance between points
	const minDistance = 1;
	const actualDistance = Math.sqrt(
		Math.pow(endX - startX, 2) + Math.pow(endY - startY, 2)
	);

	if (actualDistance < minDistance) {
		// Adjust end point to maintain minimum distance
		endX = startX + minDistance * Math.cos(angle);
		endY = startY + minDistance * Math.sin(angle);
	}

	return { startX, startY, endX, endY };
};

const getDiamondBoundaryIntersection = (
	centerX: number,
	centerY: number,
	halfSize: number,
	angle: number
) => {
	// Normalize angle to [-π, π]
	const normalizedAngle = Math.atan2(Math.sin(angle), Math.cos(angle));

	// Diamond corners relative to center (clockwise from right)
	const corners = [
		{ x: halfSize, y: 0 }, // right
		{ x: 0, y: halfSize }, // bottom
		{ x: -halfSize, y: 0 }, // left
		{ x: 0, y: -halfSize }, // top
	];

	// Find which edge of the diamond we intersect with
	let intersection = { x: 0, y: 0 };
	let minDistance = Infinity;

	// Check each edge of the diamond
	for (let i = 0; i < corners.length; i++) {
		const start = corners[i];
		const end = corners[(i + 1) % corners.length];

		// Calculate intersection with this edge
		const dx = end.x - start.x;
		const dy = end.y - start.y;

		// Ray direction
		const rayDx = Math.cos(normalizedAngle);
		const rayDy = Math.sin(normalizedAngle);

		// Calculate intersection using parametric equations
		const denom = dx * rayDy - dy * rayDx;

		if (Math.abs(denom) > 0.0001) {
			// Avoid division by zero
			const t = (rayDx * start.y - rayDy * start.x) / denom;

			if (t >= 0 && t <= 1) {
				// Check if intersection is on the edge segment
				const ix = start.x + t * dx;
				const iy = start.y + t * dy;

				// Check if this intersection is in the direction of our angle
				const dotProduct = ix * rayDx + iy * rayDy;

				if (dotProduct > 0) {
					const distance = Math.sqrt(ix * ix + iy * iy);
					if (distance < minDistance) {
						minDistance = distance;
						intersection = {
							x: centerX + ix,
							y: centerY + iy,
						};
					}
				}
			}
		}
	}

	return intersection;
};

const getRectangleBoundaryIntersection = (
	centerX: number,
	centerY: number,
	halfWidth: number,
	halfHeight: number,
	angle: number
) => {
	const tanAngle = Math.tan(angle);
	const rectSlope = halfHeight / halfWidth;

	let xIntersect, yIntersect;

	if (Math.abs(tanAngle) < rectSlope) {
		// Intersect with left or right side
		xIntersect = halfWidth * Math.sign(Math.cos(angle));
		yIntersect = xIntersect * tanAngle;
	} else {
		// Intersect with top or bottom side
		yIntersect = halfHeight * Math.sign(Math.sin(angle));
		xIntersect = yIntersect / tanAngle;
	}

	return { x: centerX + xIntersect, y: centerY + yIntersect };
};
type GatewayVariant =
	| "gateway-and"
	| "gateway-xor"
	| "gateway-mixed"
	| "gateway-default";


interface GatewayStyle {
	backgroundColorHex: string;
	variant: GatewayVariant;
}

export const getGatewayColor = (
	gatewayType: GatewayType
): GatewayStyle => {
	const gatewayStyles: Record<GatewayType, GatewayStyle> = {
		"AND-split": {
			backgroundColorHex: "#98FB98",
			variant: "gateway-and",
		},
		"AND-join": {
			backgroundColorHex: "#98FB98",
			variant: "gateway-and",
		},
		"AND-join-split": {
			backgroundColorHex: "#98FB98",
			variant: "gateway-and",
		},
		"XOR-split": {
			backgroundColorHex: "#87CEEB",
			variant: "gateway-xor",
		},
		"XOR-join": {
			backgroundColorHex: "#87CEEB",
			variant: "gateway-xor",
		},
		"XOR-join-split": {
			backgroundColorHex: "#87CEEB",
			variant: "gateway-xor",
		},
		"AND-join-XOR-split": {
			backgroundColorHex: "#FFB6C1",
			variant: "gateway-mixed",
		},
		"XOR-join-AND-split": {
			backgroundColorHex: "#FFB6C1",
			variant: "gateway-mixed",
		},
		UNKNOWN: {
			backgroundColorHex: "#DDDDDD",
			variant: "gateway-default",
		},
	};

	const defaultStyle: GatewayStyle = {
		backgroundColorHex: "#DDDDDD",
		variant: "gateway-default",
	};

	const style = gatewayStyles[gatewayType] ?? defaultStyle;

	return {
		backgroundColorHex: style.backgroundColorHex,
		variant: style.variant,
	};
};
