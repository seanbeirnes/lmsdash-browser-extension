import * as AlertDialog from '@radix-ui/react-alert-dialog';
import ButtonPrimary from "../shared/buttons/ButtonPrimary.jsx";
import ButtonSecondary from "../shared/buttons/ButtonSecondary.jsx";

function AlertModal({
                      children,
                      title,
                      actionText = "OK",
                      actionCallback = () => {return true},
                      cancelText = "",
                      open = false,
                      defaultOpen = false
                    })
{
  return (
    <AlertDialog.Root open={open} defaultOpen={defaultOpen}>
      <AlertDialog.Trigger/>
      <AlertDialog.Portal>
        <AlertDialog.Overlay className="fixed inset-0 w-dvw h-dvh bg-gray-700 opacity-50"/>
        <AlertDialog.Content
          className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-dvw max-w-[85dvw] sm:max-w-lg max-h-[85dvh] min-h-32 p-8 text-2xl bg-white shadow-lg rounded-sm">
          <AlertDialog.Title className="text-gray-700 font-bold mb-2">
            {title}
          </AlertDialog.Title>
          <AlertDialog.Description className="text-base text-gray-700">
            {children}
          </AlertDialog.Description>
          <div className="pt-2 flex justify-end gap-6">
            {cancelText &&
              (<AlertDialog.Cancel asChild>
                {<ButtonSecondary>
                  {cancelText}
                </ButtonSecondary>}
              </AlertDialog.Cancel>)
            }
            <AlertDialog.Action asChild>
              <ButtonPrimary onClick={actionCallback}>
                {actionText}
              </ButtonPrimary>
            </AlertDialog.Action>
          </div>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}

export default AlertModal;