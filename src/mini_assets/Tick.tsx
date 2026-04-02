export default function Tick({ size = 100, color = "#ffffff" }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
    >
      <polyline
        points="20,55 40,75 80,30"
        stroke={color}
        stroke-width="8"
        stroke-linecap="round"
        stroke-linejoin="round"
        fill="none"
      />
    </svg>
  );
}
