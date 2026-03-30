import { Message, MESSAGE_SENDER, MESSAGE_TARGET, MESSAGE_TYPE } from "../../../../shared/models/Message";
import { CanvasRequest } from "../../../../shared/models/CanvasRequest";
import { useQuery } from "@tanstack/react-query";

type SearchOption = {
  value: string | number;
  label: string;
};

type TermsResponse = {
  enrollment_terms?: Array<{
    id: string | number;
    name: string;
    sis_term_id?: string | null;
  }>;
};

export default function useTermsSearch(searchTerm: string) {
  async function fetchTerms({ queryKey }: { queryKey: [string, { searchTerm: string }] }): Promise<SearchOption[]> {
    const [_key, { searchTerm }] = queryKey;

    const msgRequest = new Message(
      MESSAGE_TARGET.SERVICE_WORKER,
      MESSAGE_SENDER.SIDE_PANEL,
      MESSAGE_TYPE.Canvas.REQUESTS,
      "Course request",
      [new CanvasRequest(CanvasRequest.Get.TermsBySearch, { searchTerm })]
    );

    const msgResponse = await chrome.runtime.sendMessage(msgRequest) as {
      data: Array<{ status: number; text: string }>;
    };

    if (msgResponse.data.length === 0) throw Error("Terms Not Found");
    if (msgResponse.data[0].status >= 400) throw Error("Error fetching terms");
    if (msgResponse.data[0].text.length < 1) throw Error("No term information received");

    let canvasResponse: TermsResponse | null = null;

    try {
      canvasResponse = JSON.parse(msgResponse.data[0].text) as TermsResponse;
    } catch {
      throw Error("Could not parse response");
    }

    const terms: SearchOption[] = [];

    canvasResponse.enrollment_terms?.forEach((termData) => {
      const itemLabel = termData.sis_term_id ? `${termData.name} (${termData.sis_term_id})` : termData.name;
      terms.push({ value: termData.id, label: itemLabel });
    });

    return terms;
  }

  return useQuery({
    queryKey: ["get-enrollment-terms", { searchTerm }],
    queryFn: fetchTerms,
  });
}
