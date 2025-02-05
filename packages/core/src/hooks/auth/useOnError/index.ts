import { useMutation, UseMutationResult } from "@tanstack/react-query";

import { useAuthBindingsContext, useLegacyAuthContext } from "@contexts/auth";
import { OnErrorResponse } from "../../../interfaces";
import { useGo, useLogout, useNavigation, useRouterType } from "@hooks";
import { useKeys } from "@hooks/useKeys";

export type UseOnErrorLegacyProps = {
    v3LegacyAuthProviderCompatible: true;
};

export type UseOnErrorProps = {
    v3LegacyAuthProviderCompatible?: false;
};

export type UseOnErrorCombinedProps = {
    v3LegacyAuthProviderCompatible: boolean;
};

export type UseOnErrorLegacyReturnType = UseMutationResult<
    void,
    string | undefined,
    any,
    unknown
>;

export type UseOnErrorReturnType = UseMutationResult<
    OnErrorResponse,
    unknown,
    unknown,
    unknown
>;
export type UseOnErrorCombinedReturnType = UseMutationResult<
    OnErrorResponse | void,
    unknown,
    unknown,
    unknown
>;

export function useOnError(
    props: UseOnErrorLegacyProps,
): UseOnErrorLegacyReturnType;

export function useOnError(props?: UseOnErrorProps): UseOnErrorReturnType;

export function useOnError(
    props?: UseOnErrorCombinedProps,
): UseOnErrorCombinedReturnType;

/**
 * `useOnError` calls the `checkError` method from the {@link https://refine.dev/docs/core/providers/auth-provider `authProvider`} under the hood.
 *
 * @see {@link https://refine.dev/docs/api-reference/core/hooks/auth/useCheckError} for more details.
 *
 */
export function useOnError({
    v3LegacyAuthProviderCompatible = false,
}: UseOnErrorProps | UseOnErrorLegacyProps = {}):
    | UseOnErrorReturnType
    | UseOnErrorLegacyReturnType {
    const routerType = useRouterType();
    const go = useGo();
    const { replace } = useNavigation();

    const { checkError: legacyCheckErrorFromContext } = useLegacyAuthContext();
    const { onError: onErrorFromContext } = useAuthBindingsContext();

    const { keys, preferLegacyKeys } = useKeys();

    const { mutate: legacyLogout } = useLogout({
        v3LegacyAuthProviderCompatible: Boolean(v3LegacyAuthProviderCompatible),
    });
    const { mutate: logout } = useLogout({
        v3LegacyAuthProviderCompatible: Boolean(v3LegacyAuthProviderCompatible),
    });

    const mutation = useMutation(
        keys().auth().action("onError").get(preferLegacyKeys),
        onErrorFromContext,
        {
            onSuccess: ({ logout: shouldLogout, redirectTo }) => {
                if (shouldLogout) {
                    logout({ redirectPath: redirectTo });
                    return;
                }

                if (redirectTo) {
                    if (routerType === "legacy") {
                        replace(redirectTo);
                    } else {
                        go({ to: redirectTo, type: "replace" });
                    }
                    return;
                }
            },
        },
    );

    const v3LegacyAuthProviderCompatibleMutation = useMutation(
        [
            ...keys().auth().action("onError").get(preferLegacyKeys),
            "v3LegacyAuthProviderCompatible",
        ],
        legacyCheckErrorFromContext,
        {
            onError: (redirectPath?: string) => {
                legacyLogout({ redirectPath });
            },
        },
    );

    return v3LegacyAuthProviderCompatible
        ? v3LegacyAuthProviderCompatibleMutation
        : mutation;
}

/**
 * @deprecated `useCheckError` is deprecated with refine@4, use `useOnError` instead, however, we still support `useCheckError` for backward compatibility.
 */
export const useCheckError = useOnError;
