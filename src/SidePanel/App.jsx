import {useState, useEffect, createContext} from 'react'
import { QueryClient, QueryClientProvider} from '@tanstack/react-query'
import {Message} from '../shared/models/Message.js'
import {MessageListener} from '../shared/observers/MessageListener.js'
import PageRouter from "./router/PageRouter.jsx";
import AppStateModalController from "./controllers/AppStateModalController.jsx";
import getActiveTabCourseId from "./hooks/getActiveTabCourseId.js";
import * as Tooltip from "@radix-ui/react-tooltip";
import Security from "../shared/utils/Security.js";
import * as Toast from "@radix-ui/react-toast";

const queryClient = new QueryClient({});

export const AppStateContext = createContext({});
export const UserInfoContext = createContext({});

function App()
{
  const [appState, setAppState] = useState({
    activeTab: null,
    activeTabCourseId: null,
    hasTabs: false,
    isAdmin: false,
    isOnline: false,
    timeChanged: 0,
    timeUpdated: 0,
  })

  const [userInfo, setUserInfo] = useState({
    timeChecked: 0,
    firstName: "",
    lastName: "",
    fullName: "",
    shortName: "",
    email: "",
    sis_user_id: "",
    lmsInstance: "",
  });

  useEffect(() =>
  {
    function handleMessage(msg)
    {
      if(msg.type !== Message.Type.Task.Response.App.STATE) return;
      setAppState(() =>
      {
        return {
          activeTab: msg.data.activeTab,
          activeTabCourseId: getActiveTabCourseId(msg.data.activeTab),
          hasTabs: msg.data.hasTabs,
          isAdmin: msg.data.isAdmin,
          isOnline: msg.data.isOnline,
          timeChanged: msg.data.timeChanged,
          timeUpdated: msg.data.timeUpdated,
        }
      });
    }

    const notifyIsOpened = async () =>
    {
      if(appState.timeUpdated !== 0) return;
      // Let serviceWorker know the panel has been opened
      const request = new Message(Message.Target.SERVICE_WORKER,
          Message.Sender.SIDE_PANEL,
          Message.Type.Task.Request.App.SET_PANEL_OPENED,
          "SidePanel was opened")
      await request.setSignature();
      const response = await chrome.runtime.sendMessage(request);
      Security.compare.messages(request, response);
      handleMessage(response);
    }

    const requestUserInfo = async () =>
    {
      if(userInfo.timeChecked !== 0 || !appState.hasTabs) return;

      // Request user info
      const request = new Message(Message.Target.SERVICE_WORKER,
        Message.Sender.SIDE_PANEL,
        Message.Type.Task.Request.Info.USER,
        "User info request");
      await request.setSignature();

      const response = await chrome.runtime.sendMessage(request);
      Security.compare.messages(request, response);

      if(response.data === null) return;

      const userData = await JSON.parse(response.data[0].text);

      setUserInfo(() =>
        {
         return {
           timeChecked: Date.now(),
           firstName: userData.first_name,
           lastName: userData.last_name,
           fullName: userData.name,
           shortName: userData.short_name,
           email: userData.email,
           sis_user_id: userData.sis_user_id,
           lmsInstance: new URL(appState.activeTab.url).origin,
         }
        });
    }

    notifyIsOpened();
    requestUserInfo();

    const messageListener = new MessageListener(
      Message.Target.SIDE_PANEL,
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
                  <PageRouter/>
                </AppStateModalController>
              </div>
            </Tooltip.Provider>
            <Toast.Viewport className="[--viewport-padding:_24px] fixed bottom-0 right-0 flex flex-col p-[var(--viewport-padding)] gap-[10px] w-[390px] max-w-[100vw] m-0 list-none z-2147483647"/>
          </Toast.Provider>
        </UserInfoContext.Provider>
      </AppStateContext.Provider>
    </QueryClientProvider>
  )
}

export default App
