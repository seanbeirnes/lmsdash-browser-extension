import { useContext } from "react";
import { PageRouterContext } from "../router/PageRouter";
import Header from "../components/layout/Header";
import IconButton from "../components/shared/buttons/IconButton";
import { ArrowLeftIcon, GitHubLogoIcon } from "@radix-ui/react-icons";
import Main from "../components/layout/Main";
import Footer from "../components/layout/Footer";
import PrimaryCard from "../components/shared/cards/PrimaryCard";
import PrimaryCardLayout from "../components/shared/cards/PrimaryCardLayout";
import { AppStateContext, UserInfoContext, type AppStateValue, type UserInfoValue } from "../App";
import { ROUTER_PAGES } from "../types";
import Config from "../../shared/config/Config";

function AboutPage() {
  const pageRouterState = useContext(PageRouterContext);
  const appState = useContext(AppStateContext) as AppStateValue;
  const userInfo = useContext(UserInfoContext) as UserInfoValue;

  return (
    <>
      <Header>
        <IconButton animated={true} onClick={() => pageRouterState.setPage(ROUTER_PAGES.MENU)}>
          <ArrowLeftIcon className="w-8 h-8" />
        </IconButton>
      </Header>
      <Main>
        <PrimaryCardLayout className="" fullWidth={false}>
          <PrimaryCard className="" fixedWidth={true} minHeight={true}>
            <div
              className="flex items-center justify-center animate__animated animate__fadeIn animate__faster">
              <img className="max-h-12" src="/img/icon-color.svg" alt="LMS Dash logo" />
              <h2 className="text-blue-600 font-bold text-2xl">LMS Dash</h2>
            </div>
            <div className="w-full flex flex-col gap-1 break-words">
              <h3 className="font-bold text-lg">Current User</h3>
              <p className="text-sm"><span className="font-bold">Name: </span>{userInfo.fullName}</p>
              <p className="text-sm"><span className="font-bold">Email: </span>{userInfo.email}</p>
              <p className="text-sm"><span className="font-bold">ID: </span>{userInfo.sis_user_id}</p>
              <p className="text-sm"><span className="font-bold">Canvas Instance: </span><a
                className="text-blue-600 hover:text-blue-500 active:text-blue-400" href={userInfo.lmsInstance}
                target="_blank">{userInfo.lmsInstance}</a></p>
            </div>
            <hr className="border-gray-400 my-4" />
            <div className="w-full flex flex-col gap-1 break-words">
              <h3 className="font-bold text-lg">LMS Dash</h3>
              <p className="text-sm"><span className="font-bold">Description: </span>{Config.APP_DESCRIPTION}</p>
              <p className="text-sm"><span className="font-bold">Version: </span>{Config.APP_VERSION}</p>
              <p className="text-sm inline-flex items-center gap-1"><span className="font-bold">Creator: </span><a
                className="inline-flex items-center text-blue-600 hover:text-blue-500 active:text-blue-400"
                href="https://github.com/seanbeirnes" target="_blank">Sean Beirnes&nbsp;<GitHubLogoIcon /></a></p>
            </div>
          </PrimaryCard>
        </PrimaryCardLayout>
      </Main>
      <Footer />
    </>
  );
}

export default AboutPage;
