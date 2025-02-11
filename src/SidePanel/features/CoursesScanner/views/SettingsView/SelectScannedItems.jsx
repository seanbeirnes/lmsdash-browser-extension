import PrimaryCard from "../../../../components/shared/cards/PrimaryCard.jsx"
import * as Switch from '@radix-ui/react-switch'
import useScannedItemsPermissions from "../../hooks/useScannedItemsPermissions.js"
import { useContext, useEffect, useMemo } from "react"
import { AppStateContext } from "../../../../App.jsx"
import ProgressSpinner from "../../../../components/shared/progress/ProgressSpinner.jsx"
import CourseItem from "../../../../../shared/models/CourseItem.js"

function SelectScannedItems({ scannedItems, setScannedItems, scanType }) {
    const appState = useContext(AppStateContext);
    const { isPending, isError, data, error } = useScannedItemsPermissions(appState.activeTabCourseId)
    const isSingleCourseScan = scanType.includes("single-course")

    function calcUnauthorizedItems() {
        const unAuthorizedItems = []

        if (!data || !isSingleCourseScan) return unAuthorizedItems

        if (!data.hasAnnouncements) unAuthorizedItems.push(CourseItem.Type.ANNOUNCEMENT)
        if (!data.hasAssignments) unAuthorizedItems.push(CourseItem.Type.ASSIGNMENT)
        if (!data.hasTabs) unAuthorizedItems.push(CourseItem.Type.COURSE_NAV_LINK)
        if (!data.hasDiscussions) unAuthorizedItems.push(CourseItem.Type.DISCUSSION)
        if (!data.hasFiles) unAuthorizedItems.push(CourseItem.Type.FILE)
        if (!data.hasModules) unAuthorizedItems.push(CourseItem.Type.MODULE_LINK)
        if (!data.hasPages) unAuthorizedItems.push(CourseItem.Type.PAGE)
        if (!data.hasSyllabus) unAuthorizedItems.push(CourseItem.Type.SYLLABUS)

        return unAuthorizedItems
    }
    const unAuthorizedItems = useMemo(calcUnauthorizedItems, [data])

    function handleSwitchChange(value) {
        const index = scannedItems.indexOf(value)
        if (index >= 0) {
            setScannedItems(scannedItems.filter(item => item !== value))
        }
        else {
            setScannedItems([...scannedItems, value])
        }
    }

    // Handle select all functionality
    function allAreSelected() {
        const maxItems = 8
        if (!isSingleCourseScan) {
            return (scannedItems.length === maxItems)
        }
        return ((maxItems - unAuthorizedItems.length) === scannedItems.length)
    }

    function handleSelectAll() {
        // if all selected, deselect all
        if (allAreSelected()) {
            setScannedItems([]);
            return;
        }
        // if data && single course scan, select available
        if (data && isSingleCourseScan) {
            const newScannedItems = []
            if (data.hasAnnouncements) newScannedItems.push(CourseItem.Type.ANNOUNCEMENT)
            if (data.hasAssignments) newScannedItems.push(CourseItem.Type.ASSIGNMENT)
            if (data.hasTabs) newScannedItems.push(CourseItem.Type.COURSE_NAV_LINK)
            if (data.hasDiscussions) newScannedItems.push(CourseItem.Type.DISCUSSION)
            if (data.hasFiles) newScannedItems.push(CourseItem.Type.FILE)
            if (data.hasModules) newScannedItems.push(CourseItem.Type.MODULE_LINK)
            if (data.hasPages) newScannedItems.push(CourseItem.Type.PAGE)
            if (data.hasSyllabus) newScannedItems.push(CourseItem.Type.SYLLABUS)
            setScannedItems([...newScannedItems])
            return
        }
        // if not single course scan, select all
        setScannedItems([CourseItem.Type.ANNOUNCEMENT,
        CourseItem.Type.ASSIGNMENT,
        CourseItem.Type.COURSE_NAV_LINK,
        CourseItem.Type.DISCUSSION,
        CourseItem.Type.FILE,
        CourseItem.Type.MODULE_LINK,
        CourseItem.Type.PAGE,
        CourseItem.Type.SYLLABUS])
        return
    }

    useEffect(() => {
        // If scannedItems has an unauthorized item, remove it
        scannedItems.forEach(scannedItem => {
            if (unAuthorizedItems.includes(scannedItem)) handleSwitchChange(scannedItem)
        })
    }, [unAuthorizedItems])

    const switchRootClasses = "relative w-8 h-5 bg-gray-200 data-[state='checked']:bg-blue-500 transition shadow-inner rounded-full"
    const switchThumbClasses = "block w-4 h-4 bg-white shadow-xs transition-all translate-x-0.5 data-[state='checked']:translate-x-[0.85rem] rounded-full"
    const switchLabelClasses = "text-base text-gray-700"


    if (!appState.activeTabCourseId && isSingleCourseScan) {
        return (
            <PrimaryCard fixedWidth={true}>
                <div className="grid grid-cols-1 grid-flow-row start justify-start content-start gap-2">
                    <h3 className="text-gray-700 text-xl text-center">Searched Items</h3>
                    <p>No course selected.</p>
                </div>
            </PrimaryCard>
        )
    }

    if ((isPending || !data) && isSingleCourseScan) {
        return (
            <PrimaryCard fixedWidth={true}>
                <div className="grid grid-cols-1 grid-flow-row start justify-start content-start gap-2">
                    <h3 className="text-gray-700 text-xl text-center">Searched Items</h3>
                    <div className="w-full flex justify-center">
                        <ProgressSpinner />
                    </div>
                </div>
            </PrimaryCard>
        )
    }

    if (isError && isSingleCourseScan) {
        return (
            <PrimaryCard fixedWidth={true}>
                <div className="grid grid-cols-1 grid-flow-row start justify-start content-start gap-2">
                    <h3 className="text-gray-700 text-xl text-center">Searched Items</h3>
                    <p>An error occurred fetching course permissions...</p>
                </div>
            </PrimaryCard>
        )
    }

    return (
        <PrimaryCard fixedWidth={true}>
            <div className="grid grid-cols-1 grid-flow-row start justify-start content-start gap-2">
                <h3 className="text-gray-700 text-xl text-center">Searched Items</h3>

                {<div className="flex items-center gap-2">
                    <Switch.Root id={"Select All"}
                        className={switchRootClasses}
                        checked={allAreSelected()}
                        onCheckedChange={handleSelectAll}>
                        <Switch.Thumb className={switchThumbClasses} />
                    </Switch.Root>
                    <label className={switchLabelClasses} htmlFor={"Select All"}>
                        Select All
                    </label>
                </div>}

                {(data?.hasAnnouncements || !isSingleCourseScan) && (<div className="flex items-center gap-2">
                    <Switch.Root id={CourseItem.Type.ANNOUNCEMENT}
                        className={switchRootClasses}
                        checked={scannedItems.indexOf(CourseItem.Type.ANNOUNCEMENT) >= 0}
                        onCheckedChange={() => handleSwitchChange(CourseItem.Type.ANNOUNCEMENT)}>
                        <Switch.Thumb className={switchThumbClasses} />
                    </Switch.Root>
                    <label className={switchLabelClasses} htmlFor={CourseItem.Type.ANNOUNCEMENT}>
                        Announcements
                    </label>
                </div>)}

                {(data?.hasAssignments || !isSingleCourseScan) && (<div className="flex items-center gap-2">
                    <Switch.Root id={CourseItem.Type.ASSIGNMENT}
                        className={switchRootClasses}
                        checked={scannedItems.indexOf(CourseItem.Type.ASSIGNMENT) >= 0}
                        onCheckedChange={() => handleSwitchChange(CourseItem.Type.ASSIGNMENT)}>
                        <Switch.Thumb className={switchThumbClasses} />
                    </Switch.Root>
                    <label className={switchLabelClasses} htmlFor={CourseItem.Type.ASSIGNMENT}>
                        Assignments
                    </label>
                </div>)}

                {(data?.hasTabs || !isSingleCourseScan) && (<div className="flex items-center gap-2">
                    <Switch.Root id={CourseItem.Type.COURSE_NAV_LINK}
                        className={switchRootClasses}
                        checked={scannedItems.indexOf(CourseItem.Type.COURSE_NAV_LINK) >= 0}
                        onCheckedChange={() => handleSwitchChange(CourseItem.Type.COURSE_NAV_LINK)}>
                        <Switch.Thumb className={switchThumbClasses} />
                    </Switch.Root>
                    <label className={switchLabelClasses} htmlFor={CourseItem.Type.COURSE_NAV_LINK}>
                        Course Navigation Links
                    </label>
                </div>)}

                {(data?.hasDiscussions || !isSingleCourseScan) && (<div className="flex items-center gap-2">
                    <Switch.Root id={CourseItem.Type.DISCUSSION}
                        className={switchRootClasses}
                        checked={scannedItems.indexOf(CourseItem.Type.DISCUSSION) >= 0}
                        onCheckedChange={() => handleSwitchChange(CourseItem.Type.DISCUSSION)}>
                        <Switch.Thumb className={switchThumbClasses} />
                    </Switch.Root>
                    <label className={switchLabelClasses} htmlFor={CourseItem.Type.DISCUSSION}>
                        Discussions
                    </label>
                </div>)}

                {(data?.hasFiles || !isSingleCourseScan) && (<div className="flex items-center gap-2">
                    <Switch.Root id={CourseItem.Type.FILE}
                        className={switchRootClasses}
                        checked={scannedItems.indexOf(CourseItem.Type.FILE) >= 0}
                        onCheckedChange={() => handleSwitchChange(CourseItem.Type.FILE)}>
                        <Switch.Thumb className={switchThumbClasses} />
                    </Switch.Root>
                    <label className={switchLabelClasses} htmlFor={CourseItem.Type.FILE}>
                        File Names
                    </label>
                </div>)}

                {(data?.hasModules || !isSingleCourseScan) && (<div className="flex items-center gap-2">
                    <Switch.Root id={CourseItem.Type.MODULE_LINK}
                        className={switchRootClasses}
                        checked={scannedItems.indexOf(CourseItem.Type.MODULE_LINK) >= 0}
                        onCheckedChange={() => handleSwitchChange(CourseItem.Type.MODULE_LINK)}>
                        <Switch.Thumb className={switchThumbClasses} />
                    </Switch.Root>
                    <label className={switchLabelClasses} htmlFor={CourseItem.Type.MODULE_LINK}>
                        Module Links
                    </label>
                </div>)}

                {(data?.hasPages || !isSingleCourseScan) && (<div className="flex items-center gap-2">
                    <Switch.Root id={CourseItem.Type.PAGE}
                        className={switchRootClasses}
                        checked={scannedItems.indexOf(CourseItem.Type.PAGE) >= 0}
                        onCheckedChange={() => handleSwitchChange(CourseItem.Type.PAGE)}>
                        <Switch.Thumb className={switchThumbClasses} />
                    </Switch.Root>
                    <label className={switchLabelClasses} htmlFor={CourseItem.Type.PAGE}>
                        Pages
                    </label>
                </div>)}

                {(data?.hasSyllabus || !isSingleCourseScan) && (<div className="flex items-center gap-2">
                    <Switch.Root id={CourseItem.Type.SYLLABUS}
                        className={switchRootClasses}
                        checked={scannedItems.indexOf(CourseItem.Type.SYLLABUS) >= 0}
                        onCheckedChange={() => handleSwitchChange(CourseItem.Type.SYLLABUS)}>
                        <Switch.Thumb className={switchThumbClasses} />
                    </Switch.Root>
                    <label className={switchLabelClasses} htmlFor={CourseItem.Type.SYLLABUS}>
                        Syllabus
                    </label>
                </div>)}

            </div>
        </PrimaryCard>
    )
}

export default SelectScannedItems
