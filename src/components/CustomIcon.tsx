export const ValueHelp = ({ size = 24, color = "currentColor", ...props }) => {
  return (
    // <svg
    //   width={size}
    //   height={size * (58 / 55)} // 원본 비율 유지
    //   viewBox="0 0 55 58"
    //   fill="none"
    //   xmlns="http://www.w3.org/2000/svg"
    //   {...props}
    // >
    //   <rect
    //     x="1.5"
    //     y="21.5"
    //     width="35"
    //     height="35"
    //     rx="7.5"
    //     stroke={color}
    //     strokeWidth="6"
    //   />
    //   <path
    //     d="M46 0C50.9706 0 55 4.02944 55 9V29C55 33.9706 50.9706 38 46 38H41V35H46C49.3137 35 52 32.3137 52 29V9C52 5.68629 49.3137 3 46 3H26C22.6863 3 20 5.68629 20 9V17H17V9C17 4.02944 21.0294 0 26 0H46Z"
    //     fill={color}
    //   />
    // </svg>
    <svg width={size} height={size * (58 / 55)} viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path d="M48 0C54.6274 0 60 5.37258 60 12V32C60 38.6274 54.6274 44 48 44H44V38H48C51.3137 38 54 35.3137 54 32V12C54 8.68629 51.3137 6 48 6H28C24.6863 6 22 8.68629 22 12V17H16V12C16 5.37258 21.3726 0 28 0H48Z" fill={color} />
      <rect x="3" y="19" width="38" height="38" rx="9" stroke={color} strokeWidth="6" />
    </svg>
  );
};