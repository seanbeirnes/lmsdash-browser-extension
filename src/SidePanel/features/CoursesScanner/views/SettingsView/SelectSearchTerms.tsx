import ButtonPrimary from "../../../../components/shared/buttons/ButtonPrimary";
import PrimaryCard from "../../../../components/shared/cards/PrimaryCard";
import SearchTermInput from "./SearchTermInput";
import { useRef } from "react";

interface SelectSearchTermsProps {
  searchTerms: string[];
  setSearchTerms: (searchTerms: string[]) => void;
}

function SelectSearchTerms({ searchTerms, setSearchTerms }: SelectSearchTermsProps) {
  // Stable per-row keys for the controlled inputs. Keying by term value would
  // remount the input on every keystroke; keying by index breaks on removal.
  // Ids are kept in sync with `searchTerms` in the add/remove handlers only,
  // never during render, so renders stay side-effect free.
  const termIds = useRef<string[]>(searchTerms.map(() => crypto.randomUUID()));

  function canAddTerm(): boolean {
    if (searchTerms[0].length < 2) return false;
    if (searchTerms.length > 9) return false;

    for (let index = 0; index < searchTerms.length; index++) {
      if (searchTerms[index].trim().length < 2) return false;
    }

    return true;
  }

  function updateSearchTerm(index: number, value: string): void {
    setSearchTerms(
      searchTerms.map((term, itemIndex) => {
        if (itemIndex === index) return value;
        return term;
      }),
    );
  }

  function removeSearchTerm(index: number): void {
    termIds.current = termIds.current.filter((_id, itemIndex) => itemIndex !== index);
    setSearchTerms(searchTerms.filter((_term, itemIndex) => itemIndex !== index));
  }

  function addSearchTerm(): void {
    if (!canAddTerm()) return;
    termIds.current = [...termIds.current, crypto.randomUUID()];
    setSearchTerms([...searchTerms, ""]);
  }

  return (
    <PrimaryCard fixedWidth={true} className="" minHeight={true}>
      <div className="grid grid-cols-1 grid-flow-row start justify-start content-start gap-2">
        <h3 className="text-gray-700 text-xl text-center">Search Terms</h3>
        <div className={`flex flex-col gap-2 max-h-56 ${searchTerms.length > 5 ? "overflow-y-scroll" : ""}`}>
          {searchTerms.map((term, index) => {
            return (
              <SearchTermInput
                index={index}
                value={term}
                updateSearchTerm={updateSearchTerm}
                removeSearchTerm={removeSearchTerm}
                key={termIds.current[index]}
                deleteDisabled={searchTerms.length < 2}
              />
            );
          })}
        </div>
      </div>
      <div className="self-end mt-2">
        <ButtonPrimary onClick={addSearchTerm} disabled={!canAddTerm()}>
          <span>+</span>
        </ButtonPrimary>
      </div>
    </PrimaryCard>
  );
}

export default SelectSearchTerms;
