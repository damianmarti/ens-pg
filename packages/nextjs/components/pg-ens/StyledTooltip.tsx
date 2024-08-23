import { ITooltip, Tooltip } from "react-tooltip";

export const StyledTooltip = (props: ITooltip) => (
  <Tooltip
    className="!bg-white !text-[#212638] z-[90] shadow-lg !text-base !opacity-100 text-left max-w-96"
    classNameArrow="hidden"
    {...props}
  >
    {props.children}
  </Tooltip>
);
