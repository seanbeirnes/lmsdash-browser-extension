import { ReactNode, useContext } from "react";
import { AppStateContext } from "../App";
import MessageModal from "../components/modals/MessageModal";

type AppState = {
  isOnline?: boolean;
  hasTabs?: boolean;
};

type AppStateModalControllerProps = {
  children: ReactNode;
};

function AppStateModalController({ children }: AppStateModalControllerProps) {
  const appState = useContext(AppStateContext) as AppState;

  function getModalSettings(): { title: string; text: string } | null {
    if (!appState.isOnline) return { title: "No Internet Detected", text: "Please check your network connection." };
    if (!appState.hasTabs) return { title: "No Tabs Detected", text: "Please open or refresh a Canvas tab." };
    return null;
  }

  const modalSettings = getModalSettings();

  return (
    <>
      {modalSettings !== null && (<MessageModal title={modalSettings.title}>{modalSettings.text}</MessageModal>)}
      {children}
    </>
  );
}

export default AppStateModalController;
