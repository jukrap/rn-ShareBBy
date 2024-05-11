// useStore.js
import {create} from 'zustand';

const userStore = create(set => ({
  userToken: null,
  setUserToken: token => {
    console.log('Setting userToken:', token); // 로그 출력
    set({userToken: token});
  },
  clearUserToken: () => set({userToken: null}),
  user: null,
  setUser: userInfo => {
    console.log('Setting user:', userInfo); // 로그 출력
    set({user: userInfo});
  },
}));

export default userStore;
