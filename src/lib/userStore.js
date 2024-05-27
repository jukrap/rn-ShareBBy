// useStore.js
import {create} from 'zustand';

const userStore = create(set => ({
  userToken: null,
  setUserToken: token => {
    console.log('Setting userToken:', token); // 로그 출력
    set({userToken: token});
  },
  clearUserToken: () => set({userToken: null}),
  userData: null,
  setUserData: userInfo => {
    console.log('Setting user:', userInfo); // 로그 출력
    set({userData: userInfo});
  },
}));

export default userStore;
