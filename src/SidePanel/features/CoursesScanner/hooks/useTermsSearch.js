import {Message} from "../../../../shared/models/Message.js";
import {CanvasRequest} from "../../../../shared/models/CanvasRequest.js";
import {useQuery} from "@tanstack/react-query";

export default function useTermsSearch(searchTerm)
{
  async function fetchTerms({queryKey})
  {
    const [_key, {searchTerm}] = queryKey;
    const msgRequest =
      new Message(Message.Target.SERVICE_WORKER,
        Message.Sender.SIDE_PANEL,
        Message.Type.Canvas.REQUESTS,
        "Course request",
        [new CanvasRequest(CanvasRequest.Get.TermsBySearch, {searchTerm: searchTerm})])

    const msgResponse = await chrome.runtime.sendMessage(msgRequest);

    if(msgResponse.data.length === 0) throw Error("Terms Not Found");
    if(msgResponse.data[0].status >= 400) throw Error("Error fetching terms");
    if(msgResponse.data[0].text.length < 1) throw Error("No term information received");

    let canvasResponse = null;

    try
    {
      canvasResponse = JSON.parse(msgResponse.data[0].text);
    } catch(error)
    {
      throw Error("Could not parse response");
    }

    const terms = []
    canvasResponse["enrollment_terms"].forEach( termData =>
      {
        const itemLabel = termData["sis_term_id"] ? `${termData["name"]} (${termData["sis_term_id"]})` : termData["name"];
        const newItem = {value: termData["id"], label: itemLabel};
        terms.push(newItem);
      }
    )

    return terms;
  }

  return useQuery({
    queryKey: ["get-enrollment-terms", {searchTerm}],
    queryFn: fetchTerms
  })
}