import Header from "../components/layout/Header";
import Main from "../components/layout/Main";
import Footer from "../components/layout/Footer";
import IconButton from "../components/shared/buttons/IconButton";
import { ArrowLeftIcon } from "@radix-ui/react-icons";
import { useContext } from "react";
import { PageRouterContext } from "../router/PageRouter";
import { ROUTER_PAGES } from "../types";

function ExternalToolsPage() {
  const pageRouterState = useContext(PageRouterContext);

  return (
    <>
      <Header>
        <IconButton animated={true} onClick={() => pageRouterState.setPage(ROUTER_PAGES.MENU)}>
          <ArrowLeftIcon className="w-8 h-8" />
        </IconButton>
      </Header>
      <Main>
        <div>
          <p>External Tools... Coming Soon!</p>
        </div>
      </Main>
      <Footer />
    </>
  );
}

export default ExternalToolsPage;
