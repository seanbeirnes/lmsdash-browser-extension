import {AppController} from "./AppController";

// Sets the panel to open when clicking the extension's icon in Chrome
chrome.sidePanel.setPanelBehavior({openPanelOnActionClick: true})

// Global vars
let counter: number = 0;
const appController = new AppController();

// Run the program loop
async function run()
{
  appController.updateTasks();

  await appController.update(counter);

  // Reset counter
  if (counter > (AppController.APP_LOOP_MS * AppController.APP_LOOP_MULTIPLIER))
  {
    counter = 0
  } else
  {
    counter++
  }

  // Set timeout to run loop again
  setTimeout(run, AppController.APP_LOOP_MS);
}

run();