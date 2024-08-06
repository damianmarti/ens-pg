import { ITooltip, Tooltip } from "react-tooltip";

export const StyledTooltip = (props: ITooltip) => (
  <Tooltip className="!bg-white !text-[#212638] shadow-lg !text-base !opacity-100" classNameArrow="hidden" {...props}>
    {props.children}
  </Tooltip>
);
