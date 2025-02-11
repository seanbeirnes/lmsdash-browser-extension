import * as Switch from "@radix-ui/react-switch";
import PrimaryCard from "../../../../components/shared/cards/PrimaryCard.jsx";
import ButtonPrimary from "../../../../components/shared/buttons/ButtonPrimary.jsx";
import {AppStateContext} from "../../../../App.jsx";
import {useContext} from "react";

function SelectScanSettings({settings, setSettings, runScanCallback})
{
  const appState = useContext(AppStateContext);

  function handleSwitchChange(value)
  {
    const index = settings.indexOf(value);
    if(index >= 0)
    {
      setSettings(settings.filter(item => item !== value))
    }
    else
    {
      setSettings([...settings, value]);
    }
  }

  const switchRootClasses = "relative w-8 h-5 bg-gray-200 data-[state='checked']:bg-blue-500 transition shadow-inner rounded-full";
  const switchThumbClasses = "block w-4 h-4 bg-white shadow-sm transition-all translate-x-0.5 data-[state='checked']:translate-x-[0.85rem] rounded-full";
  const switchLabelClasses = "text-base text-gray-700";

  return (
    <PrimaryCard fixedWidth={true}>
      <div className="grid grid-cols-1 grid-flow-row start justify-start content-start gap-2">
        <h3 className="text-gray-700 text-xl text-center">Search Settings</h3>
        <div className="flex items-center gap-2">
          <Switch.Root id="case-sensitive"
                       className={switchRootClasses}
                       checked={settings.indexOf("case-sensitive") >= 0}
                       onCheckedChange={() => handleSwitchChange("case-sensitive")}>
            <Switch.Thumb className={switchThumbClasses}/>
          </Switch.Root>
          <label className={switchLabelClasses} htmlFor="case-sensitive">
            Case Sensitive
          </label>
        </div>
        <div className="flex items-center gap-2">
          <Switch.Root id="include-html"
                       className={switchRootClasses}
                       checked={settings.indexOf("include-html") >= 0}
                       onCheckedChange={() => handleSwitchChange("include-html")}>
            <Switch.Thumb className={switchThumbClasses}/>
          </Switch.Root>
          <label className={switchLabelClasses} htmlFor="include-html">
            Include HTML
          </label>
        </div>
        {appState.isAdmin &&
          (<div className="flex items-center gap-2">
          <Switch.Root id="only-published-items"
                       className={switchRootClasses}
                       checked={settings.indexOf("only-published-items") >= 0}
                       onCheckedChange={() => handleSwitchChange("only-published-items")}>
            <Switch.Thumb className={switchThumbClasses}/>
          </Switch.Root>
          <label className={switchLabelClasses} htmlFor="only-published-items">
            Only Published Items
          </label>
        </div>)}
      </div>
      <div className="self-end">
        <ButtonPrimary onClick={runScanCallback}>
          <span>Start Search</span>
        </ButtonPrimary>
      </div>
    </PrimaryCard>
  )
}

export default SelectScanSettings;
