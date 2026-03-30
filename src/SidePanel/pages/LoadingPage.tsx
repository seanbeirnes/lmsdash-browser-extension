import Header from "../components/layout/Header";
import RadialProgress from "../components/shared/progress/RadialProgress";
import { AppStateContext, UserInfoContext, type AppStateValue, type UserInfoValue } from "../App";
import { useContext, useEffect } from "react";
import Footer from "../components/layout/Footer";
import { PageRouterContext } from "../router/PageRouter";
import Main from "../components/layout/Main";
import { ROUTER_PAGES } from "../types";

function LoadingPage() {
  const pageRouterState = useContext(PageRouterContext);
  const appState = useContext(AppStateContext) as AppStateValue;
  const userInfo = useContext(UserInfoContext) as UserInfoValue;

  function isLoading(): boolean {
    if (appState.timeUpdated === 0) return true;
    if (!appState.isOnline) return true;
    if (!appState.hasTabs) return true;
    if (!userInfo.fullName) return true;

    return false;
  }

  useEffect(() => {
    if (!isLoading()) pageRouterState.setPage(ROUTER_PAGES.MENU);
  }, [appState, userInfo]);

  return (
    <>
      <Header animated={true} />
      <Main animated={false}>
        <div className="w-full flex flex-col items-center">
          <img src="/img/icon-color.svg" className="w-48 md:w-64 max-w-lg" alt="LMS Dash logo" />
          <div className="animate__animated animate__fadeIn animate__delay-4s">
            <RadialProgress text="Getting things ready..." />
          </div>
        </div>
      </Main>
      <Footer />
    </>
  );
}

export default LoadingPage;
