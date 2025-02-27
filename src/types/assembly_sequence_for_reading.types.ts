interface CADInfo {
	name: string;
	centre_box: string;
	subassemblyID: number;
	parentID: number;
	bounding_box: {
		minx: number;
		miny: number;
		minz: number;
		maxx: number;
		maxy: number;
		maxz: number;
	};
}

interface Step {
	name: string;
	description: string;
	removal_direction: string;
	preview_direction: string;
	isUserStep: string;
	isUserView: string;
	isStepFeasible: string;
	hierarchyID: number;
	removal_distance: number;
	preview_scale: number;
}

interface AssemblySequence {
	"CAD info": CADInfo[];
	"assembly composer": any[];
	steps: Step[];
}
