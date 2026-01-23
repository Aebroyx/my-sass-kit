'use client';

import { Fragment } from "react";
import { Dialog, Transition, DialogTitle } from "@headlessui/react";
import { XMarkIcon, SunIcon, MoonIcon, ArrowRightOnRectangleIcon } from "@heroicons/react/24/outline";
import { PrimaryButton, SecondaryButton } from "@/components/ui/buttons";
import { useTheme } from "@/components/ThemeProvider";

type SettingsModalType = {
  open: boolean;
  setOpen: (open: boolean) => void;
  onLogout: () => void;
};

export const SettingsModal = ({
  open,
  setOpen,
  onLogout,
}: SettingsModalType) => {
  const { theme, toggleTheme } = useTheme();

  const handleLogout = () => {
    setOpen(false);
    onLogout();
  };

  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={() => setOpen(false)}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/50 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white dark:bg-card-bg px-6 pb-6 pt-6 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-2xl">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <DialogTitle as="h3" className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    Settings
                  </DialogTitle>
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="rounded-lg p-1.5 text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-hover-bg dark:hover:text-gray-300 transition-colors"
                  >
                    <span className="sr-only">Close</span>
                    <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                  </button>
                </div>

                <div className="space-y-8">
                  {/* Appearance Section */}
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">
                        Appearance
                      </h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Customize the look and feel of your application
                      </p>
                    </div>
                    
                    <div className="rounded-lg border border-gray-200 dark:border-border-dark bg-gray-50 dark:bg-background p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-white dark:bg-card-bg border border-gray-200 dark:border-border-dark">
                            {theme === 'dark' ? (
                              <MoonIcon className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                            ) : (
                              <SunIcon className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                              {theme === 'dark' ? 'Dark Mode' : 'Light Mode'}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {theme === 'dark' 
                                ? 'Switch to light mode for a brighter experience' 
                                : 'Switch to dark mode for reduced eye strain'}
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={toggleTheme}
                          className="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent bg-primary transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-card-bg"
                          role="switch"
                          aria-checked={theme === 'dark'}
                        >
                          <span
                            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                              theme === 'dark' ? 'translate-x-5' : 'translate-x-0'
                            }`}
                          />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Account Section */}
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">
                        Account
                      </h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Manage your account settings and preferences
                      </p>
                    </div>
                    
                    <div className="rounded-lg border border-gray-200 dark:border-border-dark bg-gray-50 dark:bg-background p-4">
                      <SecondaryButton
                        type="button"
                        onClick={handleLogout}
                        fullWidth
                        variant="danger"
                        className="justify-center"
                      >
                        <ArrowRightOnRectangleIcon className="w-5 h-5" />
                        <span>Logout</span>
                      </SecondaryButton>
                      <p className="mt-2 text-xs text-gray-500 dark:text-gray-400 text-center">
                        Sign out of your account
                      </p>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="mt-8 pt-6 border-t border-gray-200 dark:border-border-dark">
                  <PrimaryButton
                    type="button"
                    onClick={() => setOpen(false)}
                    fullWidth
                  >
                    Close
                  </PrimaryButton>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
};
