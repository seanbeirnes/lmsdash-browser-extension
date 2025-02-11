import Header from "../components/layout/Header.jsx";
import Footer from "../components/layout/Footer.jsx";
import {AppStateContext, UserInfoContext} from "../App.jsx";
import {useContext, useState} from "react";
import {MagnifyingGlassIcon, RocketIcon, BackpackIcon, InfoCircledIcon} from "@radix-ui/react-icons";
import Main from "../components/layout/Main.jsx";
import {PageRouterContext} from "../router/PageRouter.jsx";
import MenuButton from "../components/shared/buttons/MenuButton.jsx";
import Pages from "../models/Pages.js";

function MenuPage()
{

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

  const [saying, useSaying] = useState(() =>
  {
    const randomNumer = Math.floor(Math.random() * motivatingSayings.length);
    return motivatingSayings[randomNumer];
  });

  const pageRouterState = useContext(PageRouterContext);
  const appState = useContext(AppStateContext);
  const userInfo = useContext(UserInfoContext);

  return (
    <>
      <Header></Header>
      <Main>
        <div className="justify-self-center self-start p-4 w-full grid grid-cols-1 grid-flow-row justify-items-center">
          <div className="grid grid-cols-1 grid-flow-row gap-2 justify-items-start w-full max-w-lg">
            <div className="my-2">
              <h2 className="text-lg font-bold">Welcome, {userInfo.fullName} . . .</h2>
              <p className="text-sm">{saying}</p>
            </div>
            <MenuButton onClick={() => pageRouterState.setPage(Pages.page.COURSES_SCANNER)}>
              <MagnifyingGlassIcon/>
              Search Courses
            </MenuButton>
            {/*Admin only buttons go below this line*/}
            {/*{appState.isAdmin && <MenuButton onClick={() => pageRouterState.setPage(Pages.page.EXTERNAL_TOOLS)}>*/}
            {/*  <RocketIcon/>Manage LTIs*/}
            {/*</MenuButton>}*/}
            {/*{appState.isAdmin && <MenuButton onClick={() => pageRouterState.setPage(Pages.page.ADMIN_TOOLS)}>*/}
            {/*  <BackpackIcon/>Admin Tools*/}
            {/*</MenuButton>}*/}
            {/*Admin only buttons go above this line*/}

            <MenuButton onClick={() => pageRouterState.setPage(Pages.page.ABOUT)}>
              <InfoCircledIcon/>
              About
            </MenuButton>
          </div>
        </div>
      </Main>
      <Footer></Footer>
    </>
  )
}

export default MenuPage;
