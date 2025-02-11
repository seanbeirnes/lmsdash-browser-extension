import {TrashIcon} from "@radix-ui/react-icons";
import IconButton from "../../../../components/shared/buttons/IconButton.jsx";

function SearchTermInput({index, value, updateSearchTerm, removeSearchTerm, placeholder = "Enter a search term", deleteDisabled = false}) {
  function handleDeleteClick()
  {
    if(!deleteDisabled) removeSearchTerm(index);
  }

  return (
    <div className="w-full flex flex-row justify-between items-center gap-2">
      <input className={`px-2 py-1 grow text-base text-gray-700 rounded-sm shadow-inner border-2 border-gray-200 outline-blue-500`}
             value={value}
             onChange={ (event) => updateSearchTerm(index, event.target.value) }
             aria-label={"Search term " + index}
             id={"search-term-" + index}
             type="text"
             placeholder={placeholder}/>
        <IconButton className={`p-1 ${deleteDisabled ? "text-gray-700 bg-gray-200 cursor-not-allowed" : "text-red-600 hover:text-red-500 active:text-red-400 hover:bg-red-50 active:bg-red-100 hover:shadow-sm active:shadow-inner"}`}
                    onClick={handleDeleteClick}
                    disabled={deleteDisabled}>
          <TrashIcon className="w-6 h-6" />
        </IconButton>
    </div>
  )
}

export default SearchTermInput;