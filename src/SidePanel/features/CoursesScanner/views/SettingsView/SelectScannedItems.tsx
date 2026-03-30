import PrimaryCard from "../../../../components/shared/cards/PrimaryCard";
import * as Switch from "@radix-ui/react-switch";
import useScannedItemsPermissions from "../../hooks/useScannedItemsPermissions";
import { useContext, useEffect, useMemo } from "react";
import { AppStateContext } from "../../../../App";
import ProgressSpinner from "../../../../components/shared/progress/ProgressSpinner";
import { CourseItemTypes } from "../../../../../shared/models/CourseItem";

type CourseItemValue = typeof CourseItemTypes[keyof typeof CourseItemTypes];

type Permissions = {
  hasAnnouncements: boolean;
  hasAssignments: boolean;
  hasTabs: boolean;
  hasDiscussions: boolean;
  hasFiles: boolean;
  hasModules: boolean;
  hasPages: boolean;
  hasSyllabus: boolean;
};

type AppState = {
  activeTabCourseId?: number | string | null;
};

interface SelectScannedItemsProps {
  scannedItems: string[];
  setScannedItems: (items: string[]) => void;
  scanType: string[];
}

const allCourseItemTypes: CourseItemValue[] = [
  CourseItemTypes.ANNOUNCEMENT,
  CourseItemTypes.ASSIGNMENT,
  CourseItemTypes.COURSE_NAV_LINK,
  CourseItemTypes.DISCUSSION,
  CourseItemTypes.FILE,
  CourseItemTypes.MODULE_LINK,
  CourseItemTypes.PAGE,
  CourseItemTypes.SYLLABUS,
];

function SelectScannedItems({ scannedItems, setScannedItems, scanType }: SelectScannedItemsProps) {
  const appState = useContext(AppStateContext) as AppState;
  const { isPending, isError, data } = useScannedItemsPermissions(appState.activeTabCourseId ?? null);
  const isSingleCourseScan = scanType.includes("single-course");

  function calcUnauthorizedItems(): string[] {
    const unAuthorizedItems: string[] = [];

    if (!data || !isSingleCourseScan) return unAuthorizedItems;

    const permissions = data as Permissions;
    if (!permissions.hasAnnouncements) unAuthorizedItems.push(CourseItemTypes.ANNOUNCEMENT);
    if (!permissions.hasAssignments) unAuthorizedItems.push(CourseItemTypes.ASSIGNMENT);
    if (!permissions.hasTabs) unAuthorizedItems.push(CourseItemTypes.COURSE_NAV_LINK);
    if (!permissions.hasDiscussions) unAuthorizedItems.push(CourseItemTypes.DISCUSSION);
    if (!permissions.hasFiles) unAuthorizedItems.push(CourseItemTypes.FILE);
    if (!permissions.hasModules) unAuthorizedItems.push(CourseItemTypes.MODULE_LINK);
    if (!permissions.hasPages) unAuthorizedItems.push(CourseItemTypes.PAGE);
    if (!permissions.hasSyllabus) unAuthorizedItems.push(CourseItemTypes.SYLLABUS);

    return unAuthorizedItems;
  }

  const unAuthorizedItems = useMemo(calcUnauthorizedItems, [data, isSingleCourseScan]);

  function handleSwitchChange(value: string): void {
    const index = scannedItems.indexOf(value);
    if (index >= 0) {
      setScannedItems(scannedItems.filter((item) => item !== value));
    } else {
      setScannedItems([...scannedItems, value]);
    }
  }

  function allAreSelected(): boolean {
    const maxItems = 8;
    if (!isSingleCourseScan) {
      return scannedItems.length === maxItems;
    }
    return (maxItems - unAuthorizedItems.length) === scannedItems.length;
  }

  function handleSelectAll(): void {
    if (allAreSelected()) {
      setScannedItems([]);
      return;
    }

    if (data && isSingleCourseScan) {
      const permissions = data as Permissions;
      const newScannedItems: CourseItemValue[] = [];
      if (permissions.hasAnnouncements) newScannedItems.push(CourseItemTypes.ANNOUNCEMENT);
      if (permissions.hasAssignments) newScannedItems.push(CourseItemTypes.ASSIGNMENT);
      if (permissions.hasTabs) newScannedItems.push(CourseItemTypes.COURSE_NAV_LINK);
      if (permissions.hasDiscussions) newScannedItems.push(CourseItemTypes.DISCUSSION);
      if (permissions.hasFiles) newScannedItems.push(CourseItemTypes.FILE);
      if (permissions.hasModules) newScannedItems.push(CourseItemTypes.MODULE_LINK);
      if (permissions.hasPages) newScannedItems.push(CourseItemTypes.PAGE);
      if (permissions.hasSyllabus) newScannedItems.push(CourseItemTypes.SYLLABUS);
      setScannedItems([...newScannedItems]);
      return;
    }

    setScannedItems([...allCourseItemTypes]);
  }

  useEffect(() => {
    scannedItems.forEach((scannedItem) => {
      if (unAuthorizedItems.includes(scannedItem)) handleSwitchChange(scannedItem);
    });
  }, [unAuthorizedItems]);

  const switchRootClasses = "relative w-8 h-5 bg-gray-200 data-[state='checked']:bg-blue-500 transition shadow-inner rounded-full";
  const switchThumbClasses = "block w-4 h-4 bg-white shadow-xs transition-all translate-x-0.5 data-[state='checked']:translate-x-[0.85rem] rounded-full";
  const switchLabelClasses = "text-base text-gray-700";

  if (!appState.activeTabCourseId && isSingleCourseScan) {
    return (
      <PrimaryCard fixedWidth={true} className="" minHeight={true}>
        <div className="grid grid-cols-1 grid-flow-row start justify-start content-start gap-2">
          <h3 className="text-gray-700 text-xl text-center">Searched Items</h3>
          <p>No course selected.</p>
        </div>
      </PrimaryCard>
    );
  }

  if ((isPending || !data) && isSingleCourseScan) {
    return (
      <PrimaryCard fixedWidth={true} className="" minHeight={true}>
        <div className="grid grid-cols-1 grid-flow-row start justify-start content-start gap-2">
          <h3 className="text-gray-700 text-xl text-center">Searched Items</h3>
          <div className="w-full flex justify-center">
            <ProgressSpinner className="" />
          </div>
        </div>
      </PrimaryCard>
    );
  }

  if (isError && isSingleCourseScan) {
    return (
      <PrimaryCard fixedWidth={true} className="" minHeight={true}>
        <div className="grid grid-cols-1 grid-flow-row start justify-start content-start gap-2">
          <h3 className="text-gray-700 text-xl text-center">Searched Items</h3>
          <p>An error occurred fetching course permissions...</p>
        </div>
      </PrimaryCard>
    );
  }

  return (
    <PrimaryCard fixedWidth={true} className="" minHeight={true}>
      <div className="grid grid-cols-1 grid-flow-row start justify-start content-start gap-2">
        <h3 className="text-gray-700 text-xl text-center">Searched Items</h3>

        <div className="flex items-center gap-2">
          <Switch.Root id="Select All"
                       className={switchRootClasses}
                       checked={allAreSelected()}
                       onCheckedChange={handleSelectAll}>
            <Switch.Thumb className={switchThumbClasses} />
          </Switch.Root>
          <label className={switchLabelClasses} htmlFor="Select All">
            Select All
          </label>
        </div>

        {(data?.hasAnnouncements || !isSingleCourseScan) && (<div className="flex items-center gap-2">
          <Switch.Root id={CourseItemTypes.ANNOUNCEMENT}
                       className={switchRootClasses}
                       checked={scannedItems.indexOf(CourseItemTypes.ANNOUNCEMENT) >= 0}
                       onCheckedChange={() => handleSwitchChange(CourseItemTypes.ANNOUNCEMENT)}>
            <Switch.Thumb className={switchThumbClasses} />
          </Switch.Root>
          <label className={switchLabelClasses} htmlFor={CourseItemTypes.ANNOUNCEMENT}>
            Announcements
          </label>
        </div>)}

        {(data?.hasAssignments || !isSingleCourseScan) && (<div className="flex items-center gap-2">
          <Switch.Root id={CourseItemTypes.ASSIGNMENT}
                       className={switchRootClasses}
                       checked={scannedItems.indexOf(CourseItemTypes.ASSIGNMENT) >= 0}
                       onCheckedChange={() => handleSwitchChange(CourseItemTypes.ASSIGNMENT)}>
            <Switch.Thumb className={switchThumbClasses} />
          </Switch.Root>
          <label className={switchLabelClasses} htmlFor={CourseItemTypes.ASSIGNMENT}>
            Assignments
          </label>
        </div>)}

        {(data?.hasTabs || !isSingleCourseScan) && (<div className="flex items-center gap-2">
          <Switch.Root id={CourseItemTypes.COURSE_NAV_LINK}
                       className={switchRootClasses}
                       checked={scannedItems.indexOf(CourseItemTypes.COURSE_NAV_LINK) >= 0}
                       onCheckedChange={() => handleSwitchChange(CourseItemTypes.COURSE_NAV_LINK)}>
            <Switch.Thumb className={switchThumbClasses} />
          </Switch.Root>
          <label className={switchLabelClasses} htmlFor={CourseItemTypes.COURSE_NAV_LINK}>
            Course Navigation Links
          </label>
        </div>)}

        {(data?.hasDiscussions || !isSingleCourseScan) && (<div className="flex items-center gap-2">
          <Switch.Root id={CourseItemTypes.DISCUSSION}
                       className={switchRootClasses}
                       checked={scannedItems.indexOf(CourseItemTypes.DISCUSSION) >= 0}
                       onCheckedChange={() => handleSwitchChange(CourseItemTypes.DISCUSSION)}>
            <Switch.Thumb className={switchThumbClasses} />
          </Switch.Root>
          <label className={switchLabelClasses} htmlFor={CourseItemTypes.DISCUSSION}>
            Discussions
          </label>
        </div>)}

        {(data?.hasFiles || !isSingleCourseScan) && (<div className="flex items-center gap-2">
          <Switch.Root id={CourseItemTypes.FILE}
                       className={switchRootClasses}
                       checked={scannedItems.indexOf(CourseItemTypes.FILE) >= 0}
                       onCheckedChange={() => handleSwitchChange(CourseItemTypes.FILE)}>
            <Switch.Thumb className={switchThumbClasses} />
          </Switch.Root>
          <label className={switchLabelClasses} htmlFor={CourseItemTypes.FILE}>
            File Names
          </label>
        </div>)}

        {(data?.hasModules || !isSingleCourseScan) && (<div className="flex items-center gap-2">
          <Switch.Root id={CourseItemTypes.MODULE_LINK}
                       className={switchRootClasses}
                       checked={scannedItems.indexOf(CourseItemTypes.MODULE_LINK) >= 0}
                       onCheckedChange={() => handleSwitchChange(CourseItemTypes.MODULE_LINK)}>
            <Switch.Thumb className={switchThumbClasses} />
          </Switch.Root>
          <label className={switchLabelClasses} htmlFor={CourseItemTypes.MODULE_LINK}>
            Module Links
          </label>
        </div>)}

        {(data?.hasPages || !isSingleCourseScan) && (<div className="flex items-center gap-2">
          <Switch.Root id={CourseItemTypes.PAGE}
                       className={switchRootClasses}
                       checked={scannedItems.indexOf(CourseItemTypes.PAGE) >= 0}
                       onCheckedChange={() => handleSwitchChange(CourseItemTypes.PAGE)}>
            <Switch.Thumb className={switchThumbClasses} />
          </Switch.Root>
          <label className={switchLabelClasses} htmlFor={CourseItemTypes.PAGE}>
            Pages
          </label>
        </div>)}

        {(data?.hasSyllabus || !isSingleCourseScan) && (<div className="flex items-center gap-2">
          <Switch.Root id={CourseItemTypes.SYLLABUS}
                       className={switchRootClasses}
                       checked={scannedItems.indexOf(CourseItemTypes.SYLLABUS) >= 0}
                       onCheckedChange={() => handleSwitchChange(CourseItemTypes.SYLLABUS)}>
            <Switch.Thumb className={switchThumbClasses} />
          </Switch.Root>
          <label className={switchLabelClasses} htmlFor={CourseItemTypes.SYLLABUS}>
            Syllabus
          </label>
        </div>)}

      </div>
    </PrimaryCard>
  );
}

export default SelectScannedItems;
