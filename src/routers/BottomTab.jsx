import React from 'react';
import {Image, StyleSheet} from 'react-native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';

import Main from '../pages/Main/Main';
import Recruit from '../pages/Main/Recruit';
import Join from '../pages/Main/Join';
import Detail from '../pages/Main/Detail';
import Show from '../pages/Main/Show';
import Chat from '../pages/Main/Chat';
import ChatRoom from '../pages/Main/ChatRoom';
import CommunityBoard from '../pages/Main/CommunityBoard';
import CommunityAddPost from '../pages/Main/CommunityAddPost';
import Profile from '../pages/Main/Profile';
import EditProfile from '../pages/Main/EditProfile';
import SynthesisAgree from '../components/SignUp/AgreeList/SynthesisAgree';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const AboutMap = ({params}) => {
  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      <Stack.Screen name="Main" component={Main} initialParams={params} />
      <Stack.Screen name="Recruit" component={Recruit} initialParams={params} />
      <Stack.Screen name="Join" component={Join} initialParams={params} />
      <Stack.Screen name="Detail" component={Detail} initialParams={params} />
      <Stack.Screen name="Show" component={Show} initialParams={params} />
    </Stack.Navigator>
  );
};

const AboutChat = () => {
  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      <Stack.Screen name="Chat" component={Chat} />
      <Stack.Screen name="ChatRoom" component={ChatRoom} />
    </Stack.Navigator>
  );
};

const AboutProfile = () => {
  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      <Stack.Screen name="Profile" component={Profile} />
      <Stack.Screen name="SynthesisAgree" component={SynthesisAgree} />
      <Stack.Screen name="EditProfile" component={EditProfile} />
      
    </Stack.Navigator>
  );
};

const AboutCommunity = () => {
  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      <Stack.Screen name="CommunityBoard" component={CommunityBoard} />
      <Stack.Screen name="CommunityAddPost" component={CommunityAddPost} />
    </Stack.Navigator>
  );
};

const BottomTab = ({navigation}) => {
  return (
    <Tab.Navigator
      screenOptions={({route}) => ({
        headerShown: false,
        tabBarIcon: ({focused}) => {
          let iconName;

          if (route.name === '홈') {
            iconName = focused ? homeOnIcon : homeOffIcon;
          } else if (route.name === '게시판') {
            iconName = focused ? boardOnIcon : boardOffIcon;
          } else if (route.name === '채팅') {
            iconName = focused ? chatOnIcon : chatOffIcon;
          } else if (route.name === '프로필') {
            iconName = focused ? profileOnIcon : profileOffIcon;
          }
          // 아이콘 반환
          return <Image source={iconName} style={style.icon} />;
        },
        tabBarActiveTintColor: '#07AC7D', // 포커스 될 때 타이틀 색상
        tabBarInactiveTintColor: '#A7A7A7', // 포커스 되지 않았을 때 타이틀 색상
      })}>
      <Tab.Screen name="홈" component={AboutMap} />
      <Tab.Screen name="게시판" component={AboutCommunity} />
      <Tab.Screen name="채팅" component={AboutChat} />
      <Tab.Screen name="프로필" component={AboutProfile} />
    </Tab.Navigator>
  );
};

const homeOnIcon = require('../assets/icons/homeOnIcon.png');
const homeOffIcon = require('../assets/icons/homeOffIcon.png');
const boardOnIcon = require('../assets/icons/boardOnIcon.png');
const boardOffIcon = require('../assets/icons/boardOffIcon.png');
const chatOnIcon = require('../assets/icons/chatOnIcon.png');
const chatOffIcon = require('../assets/icons/chatOffIcon.png');
const profileOnIcon = require('../assets/icons/profileOnIcon.png');
const profileOffIcon = require('../assets/icons/profileOffIcon.png');

export const style = StyleSheet.create({
  icon: {
    width: 30,
    height: 30,
  },
});

export default BottomTab;
