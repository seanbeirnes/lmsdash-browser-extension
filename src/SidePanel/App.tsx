import { useState, useEffect, createContext } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Message, MESSAGE_SENDER, MESSAGE_TARGET, MESSAGE_TYPE } from "../shared/models/Message";
import { MessageListener } from "../shared/observers/MessageListener";
import PageRouter from "./router/PageRouter";
import AppStateModalController from "./controllers/AppStateModalController";
import getActiveTabCourseId from "./hooks/getActiveTabCourseId";
import * as Tooltip from "@radix-ui/react-tooltip";
import * as Toast from "@radix-ui/react-toast";

const queryClient = new QueryClient({});

export interface AppStateValue {
  activeTab: chrome.tabs.Tab | null;
  activeTabCourseId: string | null;
  hasTabs: boolean;
  isAdmin: boolean;
  isOnline: boolean;
  timeChanged: number;
  timeUpdated: number;
}

export interface UserInfoValue {
  timeChecked: number;
  firstName: string;
  lastName: string;
  fullName: string;
  shortName: string;
  email: string;
  sis_user_id: string;
  lmsInstance: string;
}

interface MessageDataState {
  activeTab: chrome.tabs.Tab | null;
  hasTabs: boolean;
  isAdmin: boolean;
  isOnline: boolean;
  timeChanged: number;
  timeUpdated: number;
}

export const AppStateContext = createContext<AppStateValue>({
  activeTab: null,
  activeTabCourseId: null,
  hasTabs: false,
  isAdmin: false,
  isOnline: false,
  timeChanged: 0,
  timeUpdated: 0,
});

export const UserInfoContext = createContext<UserInfoValue>({
  timeChecked: 0,
  firstName: "",
  lastName: "",
  fullName: "",
  shortName: "",
  email: "",
  sis_user_id: "",
  lmsInstance: "",
});

function App() {
  const [appState, setAppState] = useState<AppStateValue>({
    activeTab: null,
    activeTabCourseId: null,
    hasTabs: false,
    isAdmin: false,
    isOnline: false,
    timeChanged: 0,
    timeUpdated: 0,
  });

  const [userInfo, setUserInfo] = useState<UserInfoValue>({
    timeChecked: 0,
    firstName: "",
    lastName: "",
    fullName: "",
    shortName: "",
    email: "",
    sis_user_id: "",
    lmsInstance: "",
  });

  useEffect(() => {
    function handleMessage(msg: Message): void {
      if (msg.type !== MESSAGE_TYPE.Task.Response.App.STATE) return;

      const messageState = msg.data as MessageDataState;

      setAppState(() => {
        return {
          activeTab: messageState.activeTab,
          activeTabCourseId: getActiveTabCourseId(messageState.activeTab as chrome.tabs.Tab),
          hasTabs: messageState.hasTabs,
          isAdmin: messageState.isAdmin,
          isOnline: messageState.isOnline,
          timeChanged: messageState.timeChanged,
          timeUpdated: messageState.timeUpdated,
        };
      });
    }

    const notifyIsOpened = async () => {
      if (appState.timeUpdated !== 0) return;

      const request = new Message(
        MESSAGE_TARGET.SERVICE_WORKER,
        MESSAGE_SENDER.SIDE_PANEL,
        MESSAGE_TYPE.Task.Request.App.SET_PANEL_OPENED,
        "SidePanel was opened"
      );

      const response = await chrome.runtime.sendMessage(request) as Message;
      handleMessage(response);
    };

    const requestUserInfo = async () => {
      if (userInfo.timeChecked !== 0 || !appState.hasTabs) return;

      const request = new Message(
        MESSAGE_TARGET.SERVICE_WORKER,
        MESSAGE_SENDER.SIDE_PANEL,
        MESSAGE_TYPE.Task.Request.Info.USER,
        "User info request"
      );

      const response = await chrome.runtime.sendMessage(request) as { data: Array<{ text: string }> | null };

      if (response.data === null) return;

      const userData = JSON.parse(response.data[0].text) as {
        first_name: string;
        last_name: string;
        name: string;
        short_name: string;
        email: string;
        sis_user_id: string;
      };

      setUserInfo(() => {
        return {
          timeChecked: Date.now(),
          firstName: userData.first_name,
          lastName: userData.last_name,
          fullName: userData.name,
          shortName: userData.short_name,
          email: userData.email,
          sis_user_id: userData.sis_user_id,
          lmsInstance: appState.activeTab?.url ? new URL(appState.activeTab.url).origin : "",
        };
      });
    };

    notifyIsOpened();
    requestUserInfo();

    const messageListener = new MessageListener(
      MESSAGE_TARGET.SIDE_PANEL,
      handleMessage
    );

    messageListener.listen();

    return () => messageListener.remove();
  }, [appState, userInfo]);

  return (
    <QueryClientProvider client={queryClient}>
      <AppStateContext.Provider value={appState}>
        <UserInfoContext.Provider value={userInfo}>
          <Toast.Provider swipeDirection="right">
            <Tooltip.Provider>
              <div className="bg-gray-300">
                <AppStateModalController>
                  <PageRouter />
                </AppStateModalController>
              </div>
            </Tooltip.Provider>
            <Toast.Viewport className="[--viewport-padding:_24px] fixed bottom-0 right-0 flex flex-col p-[var(--viewport-padding)] gap-[10px] w-[390px] max-w-[100vw] m-0 list-none z-2147483647" />
          </Toast.Provider>
        </UserInfoContext.Provider>
      </AppStateContext.Provider>
    </QueryClientProvider>
  );
}

export default App;
