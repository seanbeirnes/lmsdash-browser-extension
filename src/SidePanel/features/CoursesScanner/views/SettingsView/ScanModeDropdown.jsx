import * as Select from "@radix-ui/react-select";
import {CheckIcon, ChevronDownIcon, ChevronUpIcon} from "@radix-ui/react-icons";
import {forwardRef} from "react";

function ScanModeDropdown({value, onChange}) {
 return (
   <Select.Root value={value} onValueChange={(value) => onChange(value)}>
     <Select.Trigger className={"inline-flex items-center justify-between rounded-sm px-4 text-base leading-none h-9 gap-1 bg-white text-blue-600 hover:text-blue-500 active:text-blue-400 data-placeholder:text-gray-200 outline-hidden border-2 border-gray-200 shadow-inner"}>
       <Select.Value/>
       <Select.Icon>
         <ChevronDownIcon className="w-6 h-6"/>
       </ Select.Icon>
     </Select.Trigger>

     <Select.Portal>
       <Select.Content className={"w-(--radix-select-trigger-width) overflow-hidden bg-white rounded-sm shadow-md"} position={"popper"}>
         <Select.ScrollUpButton className={"flex items-center justify-center h-6 bg-white text-blue-600 cursor-default"}>
         <ChevronUpIcon />
         </Select.ScrollUpButton>
         <Select.Viewport className={"p-1"}>
             <SelectItem value={"single-course"}>This Course</SelectItem>
             <SelectItem value={"term"}>Term</SelectItem>
             {/*<SelectItem value={"csv-import"} disabled>CSV Import</SelectItem>*/}
         </Select.Viewport>
         <Select.ScrollDownButton  className={"flex items-center justify-center h-6 bg-white text-blue-600 cursor-default"}>
          <ChevronDownIcon />
         </Select.ScrollDownButton>
         <Select.Arrow  className="fill-gray-200"/>
       </Select.Content>
     </Select.Portal>
   </Select.Root>
 )
}

const SelectItem = forwardRef(({ children, className, ...props }, forwardedRef) => {
  return (
    <Select.Item
      className={
        "text-base leading-none text-blue-600 rounded-sm flex items-center h-9 pr-9 pl-9 relative select-none data-disabled:text-gray-200 data-disabled:pointer-events-none data-highlighted:outline-hidden data-highlighted:bg-blue-500 data-highlighted:text-white"
      }
      {...props}
      ref={forwardedRef}
    >
      <Select.ItemText>{children}</Select.ItemText>
      <Select.ItemIndicator className="absolute left-0 w-9 h-9 p-2 inline-flex items-center justify-center">
        <CheckIcon className={"w-9 h-9"} />
      </Select.ItemIndicator>
    </Select.Item>
  );
});

export default ScanModeDropdown;