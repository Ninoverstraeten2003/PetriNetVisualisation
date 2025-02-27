interface Part {
  name: string;
  location: [number, number, number];
  rotation: [number, number, number];
}

interface PickingConfig {
  tag_location: [number, number, number];
  parts: Part[];
}