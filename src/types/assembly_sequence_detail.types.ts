interface BoundingBox {
	minx: number;
	miny: number;
	minz: number;
	maxx: number;
	maxy: number;
	maxz: number;
}

interface LocationInfo {
	move_distance: number;
	distance_to_previous_step?: number;
	difference_moving_direction_to_previous_step?: number;
	distance_to_next_step: number;
	difference_moving_direction_to_next_step: number;
	part_bounding_box: BoundingBox;
	assembly_bounding_box_without_part?: BoundingBox;
	assembly_bounding_box_with_part: BoundingBox;
	position_final_assembly: [number, number, number];
	move_direction: [number, number, number];
	finished_assembly_bounding_box?: BoundingBox;
}

interface CameraInfo {
	camera_scale: number;
	camera_rotation: [number, number, number];
}

interface AssemblyStep {
	step: string;
	name: string;
	description: string;
	moved_part_name: string;
	current_assembly_binary: string;
	isUserStep: string;
	isUserSubAssembly: string;
	isUserView: string;
	location_info: LocationInfo;
	camera_info: CameraInfo;
}

interface AssemblySequence {
	steps: AssemblyStep[];
}
