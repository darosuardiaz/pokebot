import { configureStore } from "@reduxjs/toolkit"
import chatReducer from "./features/chat/chatSlice"
import pokemonReducer from "./features/pokemon/pokemonSlice"
import battleReducer from "./features/battle/battleSlice"

/**
 * Global Redux store configuration for the app.
 *
 * - Registers feature reducers under their respective slice keys (`chat`, `pokemon`).
 * - Keeps Redux Toolkit's default middleware but tunes serializable checks to
 *   ignore the `chat/addMessage` action. Chat messages may temporarily contain
 *   non-serializable fields (e.g., streaming flags or rich objects) while
 *   content is being assembled from the SSE stream.
 */

export const store = configureStore({
  reducer: {
    chat: chatReducer,
    pokemon: pokemonReducer,
    battle: battleReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ["chat/addMessage"],
      },
    }),
})

/**
 * Root state inferred from the store's reducer map. Use this in selectors and
 * `useSelector` to get strong typing across the app.
 */
export type RootState = ReturnType<typeof store.getState>

/**
 * Typed dispatch extracted from the store instance. Use this with `useAppDispatch`
 * to get typed dispatch in React components and hooks.
 */
export type AppDispatch = typeof store.dispatch
