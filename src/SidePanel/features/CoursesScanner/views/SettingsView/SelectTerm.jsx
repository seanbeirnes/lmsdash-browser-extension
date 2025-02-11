import Select, {components} from "react-select"
import {useCallback, useState} from "react";
import useTermsSearch from "../../hooks/useTermsSearch.js";
import ProgressSpinner from "../../../../components/shared/progress/ProgressSpinner.jsx";
import {ChevronDownIcon} from "@radix-ui/react-icons";
import {Utils} from "../../../../../shared/utils/Utils.js";

const LoadingIndicator = () =>
{
  return (
    <ProgressSpinner className="w-6 h-6"/>
  );
};

const DropdownIndicator = (props) =>
{
  return (
    <components.DropdownIndicator {...props}>
      <ChevronDownIcon className="w-6 h-6 text-blue-600 group-hover:text-blue-500 group-active:text-blue-400"/>
    </components.DropdownIndicator>
  );
};

function SelectTerm({setScanType})
{
  const [selectedTerm, setSelectedTerm] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [inputText, setInputText] = useState("");
  const setSearchTermDebounced = useCallback(
    Utils.debounce(inputText => setSearchTerm(inputText), 500),
    []
  )

  const {isPending, isError, data, error} = useTermsSearch(searchTerm);

  function handleInputChange(inputText, event)
  {
    if(event.action !== "input-blur" && event.action !== "menu-close")
    {
      setInputText(inputText);
      setSearchTermDebounced(inputText);
    }
  }

  function handleValueChange(selectedTerm, event)
  {
    setSelectedTerm(selectedTerm);
    setScanType(["term", selectedTerm.value]);
  }

  return (
    <>
      <Select
        components={{LoadingIndicator, DropdownIndicator}}
        unstyled={true}
        classNames={{
          control: () => "group px-4 py-1 h-9 bg-white text-base text-gray-700 border-2 border-gray-200 shadow-inner rounded-sm outline-blue-500",
          menu: () => "p-1 bg-white rounded-sm shadow-md overflow-hidden",
          option: (state) => `my-1 px-3 text-base rounded-sm ${state.isSelected ? "bg-blue-500 text-white" : "text-blue-600"} hover:bg-blue-500 hover:text-white`,
          placeholder: () => "text-base text-gray-400",
          loadingMessage: () => "text-base text-gray-400",
          noOptionsMessage: () => "text-base text-gray-400"
        }}
        noOptionsMessage={() => "No terms found"}
        placeholder={"Search for a term"}
        isClearable={false}
        isLoading={isPending}
        inputValue={inputText}
        onInputChange={handleInputChange}
        value={selectedTerm}
        onChange={handleValueChange}
        options={data}/>

      {selectedTerm ? (
        <>
          <p><span className={"font-bold"}>Selected Term: </span>{selectedTerm.label}</p>
          <p><span className={"font-bold"}>Term ID: </span>{selectedTerm.value}</p>
        </>
      ) :
        (
          <p>No term selected.</p>
        )}
    </>
  )
}

export default SelectTerm