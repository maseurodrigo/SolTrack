import React from "react";
import { Radio, cn } from "@nextui-org/react";

const PlatformRadio = (props) => {
  const { children, ...otherProps } = props;
  return (
    <Radio
      {...otherProps}
      classNames={{
        base: cn(
          "flex justify-center items-center",
          "rounded-lg bg-[#1F2029] border border-[#343641]",
          "px-4 py-2 max-w-[300px] transition-all duration-200 cursor-pointer",
          "data-[selected=true]:outline-none data-[selected=true]:ring-1 data-[selected=true]:ring-opacity-50 data-[selected=true]:ring-green-800 data-[selected=true]:shadow-lg"
        ),
      }}
    >
      {children}
    </Radio>
  );
};

// Default export the component
export default PlatformRadio;