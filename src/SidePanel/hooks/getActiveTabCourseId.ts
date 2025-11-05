export default function getActiveTabCourseId(activeTab: chrome.tabs.Tab) {
    if (!activeTab) return null
    const pattern = /courses\/(\d+)/
    const matches = activeTab?.url?.match(pattern);
    if(matches && matches.length >= 2) return matches[1];
    return null;
}