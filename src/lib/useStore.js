// useStore.js
import {create} from 'zustand';

const useStore = create(set => ({
  userToken: null,
  setUserToken: token => set({userToken: token}),
  clearUserToken: () => set({userToken: null}),
}));

export default useStore;
