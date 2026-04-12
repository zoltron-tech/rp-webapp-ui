import type { NavigateOptions } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect } from "react";
import { useGlobalStoreSet } from "@/context/store/stores";
import type { DataType, ErrorType } from "@/types/common";
import { API_MESSAGE } from "@/utils/constants";

interface PageLoadingOptions extends NavigateOptions {
  skipLoading?: true;
}

export const usePageRouter = () => {
  const { push } = useRouter();
  const pathname = usePathname();
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
    setGlobalState({ pageLoading: false });
  }, [setGlobalState]);

  const baseDataLoader = useCallback(
    async <T>(
      method: () => Promise<DataType<T>>,
      skipRedirect: Boolean = false,
    ) => {
      const data = await method();
      console.log("data from baseDataLoader", data);
      if (
        !data ||
        ("message" in (data as ErrorType) &&
          (data as ErrorType).message === API_MESSAGE.Error)
      ) {
        stopPageLoading();
        return null;
      }

      stopPageLoading();

      return data! as T;
    },
    [stopPageLoading],
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
