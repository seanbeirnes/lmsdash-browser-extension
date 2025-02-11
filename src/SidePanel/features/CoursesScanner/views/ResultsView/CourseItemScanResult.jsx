import {EyeNoneIcon, EyeOpenIcon, InfoCircledIcon} from "@radix-ui/react-icons";
import * as Tooltip from "@radix-ui/react-tooltip";
import IconButton from "../../../../components/shared/buttons/IconButton.jsx";

function CourseItemScanResult({id, name, matches, previews, url, published, infoModalCallback})
{
  function handleInfoButtonClick()
  {
    infoModalCallback({
      id: id,
      name: name,
      matches: matches,
      previews: previews,
      url: url,
      published: published
    })
  }

  return (
    <div className="px-4 py-1 w-full flex justify-start items-center hover:bg-blue-100 rounded-full">
      <Tooltip.Root>
        <Tooltip.Trigger>
          {
            published ?
              <EyeOpenIcon className="w-6 h-6 p-1 text-green-600"/>
              :
              <EyeNoneIcon className="w-6 h-6 p-1 text-red-600"/>
          }
        </Tooltip.Trigger>
        <Tooltip.Content className="select-none p-2 bg-white rounded-sm shadow-xl animate__animated animate__fadeIn"
                         sideOffset={0}
                         side={"bottom"}>
          {published ? "Published" : "Unpublished"}
          <Tooltip.Arrow className="fill-white"/>
        </Tooltip.Content>
      </Tooltip.Root>
      <Tooltip.Root>
        <Tooltip.Trigger asChild>
          <a href={url} target="_blank"
             className="basis-full text-base text-blue-600 hover:text-blue-500 hover:underline active:text-blue-400">
            {name}
          </a>
        </Tooltip.Trigger>
        <Tooltip.Content className="select-none p-2 bg-white rounded-sm shadow-xl animate__animated animate__fadeIn"
                         sideOffset={0}
                         side={"bottom"}>
          <div className="flex flex-col justify-start gap-2">
            <span className="w-full text-center font-bold">Matches</span>
            {matches.map( (match, index) =>
            {
              return <p className="w-full sm:w-fit px-4 py-1 text-sm text-gray-400 bg-gray-100 text-center rounded-full" key={"match-"+index}>{match}</p>
            })}
          </div>
          <Tooltip.Arrow className="fill-white"/>
        </Tooltip.Content>
      </Tooltip.Root>
      <Tooltip.Root>
        <IconButton animated={false} onClick={handleInfoButtonClick} className="text-blue-600 hover:text-blue-500 hover:shadow-sm active:text-blue-400 active:shadow-inner">
          <Tooltip.Trigger asChild>
            <InfoCircledIcon className="w-6 h-6 p-1"/>
          </Tooltip.Trigger>
        </IconButton>
        <Tooltip.Content className="select-none p-2 bg-white rounded-sm shadow-xl animate__animated animate__fadeIn"
                         sideOffset={0}
                         side={"bottom"}>
          View details and preview matches found
          <Tooltip.Arrow className="fill-white"/>
        </Tooltip.Content>
      </Tooltip.Root>
    </div>
  )
}

export default CourseItemScanResult;