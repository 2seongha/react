export const ValueHelp = ({ size = 24, color = "currentColor", ...props }) => {
  return (
    <svg
      width={size}
      height={size * (58 / 55)} // 원본 비율 유지
      viewBox="0 0 55 58"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <rect
        x="1.5"
        y="21.5"
        width="35"
        height="35"
        rx="7.5"
        stroke={color}
        strokeWidth="3"
      />
      <path
        d="M46 0C50.9706 0 55 4.02944 55 9V29C55 33.9706 50.9706 38 46 38H41V35H46C49.3137 35 52 32.3137 52 29V9C52 5.68629 49.3137 3 46 3H26C22.6863 3 20 5.68629 20 9V17H17V9C17 4.02944 21.0294 0 26 0H46Z"
        fill={color}
      />
    </svg>
  );
};