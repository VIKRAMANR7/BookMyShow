interface BlurCircleProps {
  top?: string;
  left?: string;
  right?: string;
  bottom?: string;
}

export default function BlurCircle({
  top = "auto",
  left = "auto",
  right = "auto",
  bottom = "auto",
}: BlurCircleProps) {
  return (
    <div
      className="absolute -z-50 size-58 aspect-square rounded-full bg-primary/30 blur-3xl"
      style={{ top, left, right, bottom }}
    />
  );
}
