// useStore.js
import {create} from 'zustand';

const userStore = create(set => ({
  clearUserToken: () => set({userToken: null}),
  userData: null,
  setUserData: userInfo => {
    console.log('Setting user:', userInfo); // 로그 출력
    set({userData: userInfo});
  },
}));

export default userStore;
