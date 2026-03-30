import PrimaryCard from "../../../../components/shared/cards/PrimaryCard";
import ScanModeDropdown from "./ScanModeDropdown";
import { useContext } from "react";
import { AppStateContext } from "../../../../App.jsx";
import SelectCourse from "./SelectCourse";
import SelectTerm from "./SelectTerm";

type AppState = {
  isAdmin?: boolean;
  activeTabCourseId?: number | string | null;
};

interface SelectScannedCoursesProps {
  scanType: string[];
  setScanType: (scanType: string[]) => void;
  setCourseIds: (courseIds: Array<number | string>) => void;
}

function SelectScannedCourses({ scanType, setScanType, setCourseIds }: SelectScannedCoursesProps) {
  const appState = useContext(AppStateContext) as AppState;

  function updateScanType(type: "single-course" | "term"): void {
    setScanType([type]);
    setCourseIds([]);
  }

  return (
    <PrimaryCard fixedWidth={true} className="" minHeight={true}>
      <div className="grid grid-cols-1 grid-flow-row start justify-start content-start gap-2">
        <h3 className="text-gray-700 text-xl text-center">{appState.isAdmin ? "Select Course(s)" : "Selected Course"}</h3>
        <div className="flex flex-col gap-2">
          {appState.isAdmin && (<ScanModeDropdown value={scanType[0] as "single-course" | "term"} onChange={updateScanType} />)}
          {scanType[0] === "single-course" && (
            <SelectCourse courseId={appState.activeTabCourseId ?? null} setCourseIds={setCourseIds} />
          )}
          {scanType[0] === "term" && (
            <SelectTerm setScanType={setScanType} />
          )}
        </div>
      </div>
    </PrimaryCard>
  );
}

export default SelectScannedCourses;
