import type { NavigateOptions } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect } from "react";
import { useGlobalState, useGlobalStoreSet } from "@/context/store/stores";
import type { DataType, ErrorType } from "@/types/common";
import { API_MESSAGE } from "@/utils/constants";

interface PageLoadingOptions extends NavigateOptions {
  skipLoading?: true;
}

export const usePageRouter = () => {
  const { push } = useRouter();
  const pathname = usePathname();
  const pageLoading = useGlobalState("pageLoading");
  const setGlobalState = useGlobalStoreSet();

  const routeToPage = useCallback(
    async (route: string, options: PageLoadingOptions = {}) => {
      if (!options.skipLoading && route !== pathname) {
        setGlobalState({
          pageLoading: true,
        });
      }

      push(route, options);
    },
    [push, setGlobalState, pathname],
  );

  const stopPageLoading = useCallback(() => {
    if (pageLoading) setGlobalState({ pageLoading: false });
  }, [pageLoading, setGlobalState]);

  const baseDataLoader = useCallback(
    async <T>(
      method: () => Promise<DataType<T>>,
      skipRedirect: Boolean = false,
    ) => {
      const data = await method();

      if (
        !data ||
        ("message" in (data as ErrorType) &&
          (data as ErrorType).message === API_MESSAGE.Error)
      ) {
        // handle error
        stopPageLoading();
        if (!skipRedirect) {
          routeToPage("/404", {
            skipLoading: true,
          });
        }
        return null;
      }

      stopPageLoading();

      return data! as T;
    },
    [stopPageLoading, routeToPage],
  );

  return {
    baseDataLoader,
    routeToPage,
    stopPageLoading,
  };
};

export const useBindPageLoader = (loading: boolean) => {
  const setGlobalState = useGlobalStoreSet();
  useEffect(() => {
    setGlobalState({
      pageLoading: loading,
    });
  }, [loading]);
};
