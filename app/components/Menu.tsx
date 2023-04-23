import { FaInbox, FaPlus, FaSignOutAlt, FaTrashAlt } from "react-icons/fa";
import type { Conversation } from "../type";
import { Dispatch, SetStateAction, useCallback } from "react";
import { getAuth, signOut } from "firebase/auth";

const Menu = ({
  name,
  currentId,
  active,
  conversations,
  setActive,
  onDeleteMessage,
  onSelectMessage,
  onClearChats,
  onNewChat,
}: {
  name: string;
  currentId: string;
  active: boolean;
  conversations: Conversation[];
  setActive: Dispatch<SetStateAction<boolean>>;
  onDeleteMessage: (id: string) => void;
  onSelectMessage: (id: string) => void;
  onClearChats: () => void;
  onNewChat: () => void;
}) => {
  const logout = useCallback(() => {
    signOut(getAuth());
  }, []);

  const closePanel = useCallback(() => {
    setActive(false);

    const modal = document.querySelector("#modalmenu") as HTMLDivElement;

    setTimeout(() => {
      if (modal) {
        modal.style.display = "none";
      }
    }, 500);
  }, [setActive]);

  const handleNewChat = useCallback(() => {
    onNewChat();
  }, [onNewChat]);

  return (
    <div>
      <div
        id="modalmenu"
        className={`w-screen h-screen hidden flex fixed left-0 top-0 transition-all duration-100 ease-in z-30 ${
          active ? "bg-gray-900/70" : "bg-gray-500/0"
        }`}
        onClick={(e) => {
          e.stopPropagation();
          closePanel();
        }}
      >
        <div
          className={`bg-black h-screen w-5/6 lg:w-1/4 shadow-lg transform transition-all fixed duration-500 text-white flex flex-col pt-3 px-3 py-1 ${
            active ? "" : "-translate-x-full"
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex w-full flex-row justify-between items-center select-none px-1 my-3">
            <div>Welcome, {name}</div>
            <button
              className=" text-2xl px-1 pb-1 rounded hover:bg-gray-600"
              type="button"
              onClick={closePanel}
            >
              &#9776;
            </button>
          </div>

          <div
            onClick={handleNewChat}
            className="text-blue-300 flex justify-between items-center cursor-pointer gap-2 px-3 py-2 text-md border border-gray-500 rounded hover:bg-gray-700"
          >
            <FaPlus />
            <span className="truncate overflow-hidden grow text-ellipsis select-none">
              New chat
            </span>
          </div>
          <div className="h-5/6 mt-3 overflow-auto">
            {conversations.map((cv, i) => (
              <div
                key={cv.id}
                className={`text-blue-300 border-l-0 text-cyan-50 flex justify-between items-center cursor-pointer gap-2 mb-1 px-3 py-3 text-md rounded hover:bg-gray-600 ${
                  cv.id === currentId ? "bg-gray-700 text-cyan-200" : ""
                }`}
                onClick={() => {
                  onSelectMessage(cv.id);
                }}
              >
                <div>
                  <FaInbox />
                </div>
                <span className="truncate overflow-hidden grow text-ellipsis select-none">
                  {cv.name}
                </span>
                <button
                  type="button"
                  className="bg-magento-900 hover:text-pink-500"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteMessage(cv.id);
                  }}
                >
                  <FaTrashAlt />
                </button>
              </div>
            ))}
          </div>
          <div className="min-h-1/6 mb-12 border-t border-gray-600 py-2">
            <a
              href="#"
              onClick={onClearChats}
              className="text-blue-300 flex items-center px-3 py-3 text-md rounded hover:bg-gray-700"
            >
              <FaTrashAlt className="mr-2" />
              Clear chats
            </a>
            <a
              href="#"
              onClick={logout}
              className="text-blue-300 flex items-center px-3 py-3 text-md rounded hover:bg-gray-700"
            >
              <FaSignOutAlt className="mr-2" />
              Logout
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Menu;
