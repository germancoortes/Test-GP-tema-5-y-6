export function WaveDivider({
  flip = false,
  color = '#EAF6F6',
}: {
  flip?: boolean;
  color?: string;
}) {
  return (
    <svg
      viewBox="0 0 1440 100"
      className={`block w-full ${flip ? 'rotate-180' : ''}`}
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <path
        fill={color}
        d="M0,32 C240,90 480,0 720,32 C960,64 1200,96 1440,40 L1440,100 L0,100 Z"
      />
    </svg>
  );
}
