import { createContext, useContext } from 'react';

/**
 * Creates a typed React store: a Context provider, a hook to read the store, and an HOC to wrap components with the provider.
 *
 * @param initialStateHook - Function that returns the initial store state used by the provider.
 * @returns An object with:
 *  - `useStore`: Hook that returns the current store value.
 *  - `StoreProvider`: Component that provides the store to its subtree and accepts an optional `CustomState` override.
 *  - `withStoreProvider`: HOC that wraps a component with `StoreProvider`.
 */
export function createStore<S>(initialStateHook: () => S) {
    // create context
    const StoreContext = createContext({} as S);

    /**
     * Provides the store context to descendants, initializing state from the supplied hook and allowing an optional override.
     *
     * @param children - Elements rendered inside the provider
     * @param CustomState - Optional state value to use instead of the hook-computed initial state
     */
    function StoreProvider({ children, CustomState }: { children: React.ReactNode; CustomState?: S }) {
        const initialState = initialStateHook();

        return <StoreContext.Provider value={CustomState || initialState}>{children}</StoreContext.Provider>;
    }

    /**
     * Accesses the current store value from the enclosing StoreProvider context.
     *
     * @returns The current store value from StoreContext.
     * @throws Error if called outside of a StoreProvider (message: 'useStore must be used within a StoreProvider').
     */
    function useStore() {
        const store = useContext(StoreContext);

        if (!store) {
            throw new Error('useStore must be used within a StoreProvider');
        }

        return store;
    }

    /**
     * Wraps a React component in the store provider so the wrapped component can access the store via context.
     *
     * @param Component - The component to wrap; its props are forwarded unchanged.
     * @returns A component that renders `Component` inside `StoreProvider`, preserving all props.
     */
    function withStoreProvider<T extends object>(Component: React.ComponentType<T>) {
        return function WithStoreProvider(props: T) {
            return (
                <StoreProvider>
                    <Component {...props} />
                </StoreProvider>
            );
        };
    }

    return {
        useStore,
        StoreProvider,
        withStoreProvider
    };
}