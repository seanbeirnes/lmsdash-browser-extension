import type { ReactNode } from "react";
import CourseItemScanResult, { type CourseItemDetails } from "./CourseItemScanResult";
import type { PreviewTuple } from "../../../../../shared/models/CourseItemScanResult";

interface ResultItem {
  id: number | string;
  name: string;
  matches: string[];
  previews: PreviewTuple[];
  url: string;
  published: boolean;
}

interface CourseItemResultsSectionProps {
  icon: ReactNode;
  title: string;
  items: ResultItem[];
  infoModalCallback: (details: CourseItemDetails) => void;
}

function CourseItemResultsSection({ icon, title, items, infoModalCallback }: CourseItemResultsSectionProps) {
  if (items.length < 1) return null;

  return (
    <>
      <hr className="my-2 border-gray-400" />
      <section className="w-full">
        <h4 className="flex justify-start items-center gap-1 text-gray-700 text-lg text-left font-bold">
          {icon}{title}
        </h4>
        <ul className="ml-2">
          {
            items.map((item, index) => {
              return <li key={`${title}-scan-results-${index}`}>
                <CourseItemScanResult id={item.id}
                                      name={item.name}
                                      matches={item.matches}
                                      previews={item.previews}
                                      url={item.url}
                                      published={item.published}
                                      infoModalCallback={infoModalCallback} />
              </li>;
            })
          }
        </ul>
      </section>
    </>
  );
}

export default CourseItemResultsSection;
