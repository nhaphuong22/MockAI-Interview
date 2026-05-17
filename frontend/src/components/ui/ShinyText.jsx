import { cn } from "../../lib/utils";

export const ShinyText = ({
  text,
  disabled = false,
  speed = 1.3,
  className = "",
  textColor = "#060606",
  shineColor = "#33B9F5",
  spread = 20,
}) => {
  const animationDuration = `${speed}s`;

  return (
    <>
      <style>
        {`
          @keyframes shiny-text-animation {
            0% {
              background-position: 100% 50%;
            }
            100% {
              background-position: 0% 50%;
            }
          }
          .animate-shiny-text {
            animation: shiny-text-animation ${animationDuration} linear infinite;
          }
        `}
      </style>
      <span
        className={cn(
          "inline-block bg-clip-text text-transparent py-1 pb-2 overflow-visible",
          !disabled && "animate-shiny-text",
          className
        )}
        style={{
          backgroundImage: `linear-gradient(${spread}deg, ${textColor} 35%, ${shineColor} 50%, ${textColor} 65%)`,
          backgroundSize: "200% 100%",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
        }}
      >
        {text}
      </span>
    </>
  );
};
