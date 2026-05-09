import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import { AppStateContext, UserInfoContext, type AppStateValue, type UserInfoValue } from "../App";
import { useContext, useState } from "react";
import { MagnifyingGlassIcon, CalendarIcon, InfoCircledIcon } from "@radix-ui/react-icons";
import Main from "../components/layout/Main";
import { PageRouterContext } from "../router/PageRouter";
import MenuButton from "../components/shared/buttons/MenuButton";
import { ROUTER_PAGES } from "../types";

function MenuPage() {
  const motivatingSayings = [
    "Let's do this!",
    "Keep looking up!",
    "You've got this!",
    "Keep pushing forward!",
    "Let's make it happen!",
    "One step at a time!",
    "You are unstoppable!",
    "Keep up the great work!",
    "Dream big, act bigger!",
    "Today is your day!",
    "Keep moving, keep growing!",
    "Great things are coming!",
    "Stay focused and determined!",
    "Every effort counts!",
  ];

  const [saying] = useState(() => {
    const randomNumber = Math.floor(Math.random() * motivatingSayings.length);
    return motivatingSayings[randomNumber];
  });

  const pageRouterState = useContext(PageRouterContext);
  const appState = useContext(AppStateContext) as AppStateValue;
  const userInfo = useContext(UserInfoContext) as UserInfoValue;

  return (
    <>
      <Header />
      <Main>
        <div className="justify-self-center self-start p-4 w-full grid grid-cols-1 grid-flow-row justify-items-center">
          <div className="grid grid-cols-1 grid-flow-row gap-2 justify-items-start w-full max-w-lg">
            <div className="my-2">
              <h2 className="text-lg font-bold">Welcome, {userInfo.fullName} . . .</h2>
              <p className="text-sm">{saying}</p>
            </div>
            <MenuButton onClick={() => pageRouterState.setPage(ROUTER_PAGES.COURSES_SCANNER)}>
              <MagnifyingGlassIcon />
              Search Courses
            </MenuButton>

            <MenuButton onClick={() => pageRouterState.setPage(ROUTER_PAGES.ADJUST_DATES)}>
              <CalendarIcon />
              Adjust Dates
            </MenuButton>
            {/*Admin only buttons go below this line*/}
            {/*{appState.isAdmin && <MenuButton onClick={() => pageRouterState.setPage(ROUTER_PAGES.EXTERNAL_TOOLS)}>*/}
            {/*  <RocketIcon/>Manage LTIs*/}
            {/*</MenuButton>}*/}
            {/*{appState.isAdmin && <MenuButton onClick={() => pageRouterState.setPage(ROUTER_PAGES.ADMIN_TOOLS)}>*/}
            {/*  <BackpackIcon/>Admin Tools*/}
            {/*</MenuButton>}*/}
            {/*Admin only buttons go above this line*/}

            <MenuButton onClick={() => pageRouterState.setPage(ROUTER_PAGES.ABOUT)}>
              <InfoCircledIcon />
              About
            </MenuButton>
          </div>
        </div>
      </Main>
      <Footer />
    </>
  );
}

export default MenuPage;
