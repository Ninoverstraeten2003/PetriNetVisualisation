interface AssemblyStep {
  step: string;
  name: string;
  description: string;
  removed_part_name: string;
  hierarchyID: number;
  move_distance: number;
  move_direction: number[];
  final_position_in_assembly: number[];
}

export interface AssemblySequence {
  steps: AssemblyStep[];
}