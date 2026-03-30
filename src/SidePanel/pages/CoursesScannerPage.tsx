import Header from "../components/layout/Header";
import Main from "../components/layout/Main";
import Footer from "../components/layout/Footer";
import { ArrowLeftIcon } from "@radix-ui/react-icons";
import IconButton from "../components/shared/buttons/IconButton";
import { useContext } from "react";
import { PageRouterContext } from "../router/PageRouter";
import CoursesScanController from "../features/CoursesScanner/controllers/CoursesScanController";
import { ROUTER_PAGES } from "../types";

function CoursesScannerPage() {
  const pageRouterState = useContext(PageRouterContext);

  return (
    <>
      <Header>
        <IconButton animated={true} onClick={() => pageRouterState.setPage(ROUTER_PAGES.MENU)}>
          <ArrowLeftIcon className="w-8 h-8" />
        </IconButton>
      </Header>
      <Main>
        <CoursesScanController />
      </Main>
      <Footer />
    </>
  );
}

export default CoursesScannerPage;
