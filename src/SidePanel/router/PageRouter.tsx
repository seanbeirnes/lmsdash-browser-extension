import { createContext, useState } from "react";
import LoadingPage from "../pages/LoadingPage";
import MenuPage from "../pages/MenuPage";
import ErrorPage from "../pages/ErrorPage";
import CoursesScannerPage from "../pages/CoursesScannerPage";
import ExternalToolsPage from "../pages/ExternalToolsPage";
import AdminToolsPage from "../pages/AdminToolsPage";
import AboutPage from "../pages/AboutPage";
import { ROUTER_PAGES, type RouterPage } from "../types";

export interface PageRouterState {
  page: RouterPage;
  setPage: (page: RouterPage) => void;
}

export const PageRouterContext = createContext<PageRouterState>({
  page: ROUTER_PAGES.LOADING,
  setPage: () => undefined,
});

function PageRouter() {
  const [page, setPage] = useState<RouterPage>(ROUTER_PAGES.LOADING);

  function renderPage(currentPage: RouterPage) {
    switch (currentPage) {
      case ROUTER_PAGES.ABOUT:
        return <AboutPage />;

      case ROUTER_PAGES.ADMIN_TOOLS:
        return <AdminToolsPage />;

      case ROUTER_PAGES.COURSES_SCANNER:
        return <CoursesScannerPage />;

      case ROUTER_PAGES.EXTERNAL_TOOLS:
        return <ExternalToolsPage />;

      case ROUTER_PAGES.LOADING:
        return <LoadingPage />;

      case ROUTER_PAGES.MENU:
        return <MenuPage />;

      default:
        return <ErrorPage />;
    }
  }

  return (
    <PageRouterContext.Provider value={{ page, setPage }}>
      {renderPage(page)}
    </PageRouterContext.Provider>
  );
}

export default PageRouter;
