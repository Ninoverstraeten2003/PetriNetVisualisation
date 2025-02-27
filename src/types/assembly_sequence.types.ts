interface AssemblyStep {
  step: string;
  name: string;
  description: string;
  removed_part_name: string;
  hierarchyID: number;
  move_distance: number;
  move_direction: [number, number, number];
  final_position_in_assembly: [number, number, number];
}

interface AssemblySequence {
  steps: AssemblyStep[];
}