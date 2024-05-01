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
import Board from '../pages/Main/Board';
import Profile from '../pages/Main/Profile';

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

const BottomTab = ({navigation}) => {
  return (
    <Tab.Navigator
      screenOptions={({route}) => ({
        headerShown: false,
        tabBarIcon: ({focused}) => {
          let iconName;

          if (route.name === '홈') {
            iconName = focused ? homePageIcon : homePageIcon;
          } else if (route.name === '게시판') {
            iconName = focused ? boardPageIcon : boardPageIcon;
          } else if (route.name === '채팅') {
            iconName = focused ? chatPageIcon : chatPageIcon;
          } else if (route.name === '프로필') {
            iconName = focused ? profilePageIcon : profilePageIcon;
          }
          // 아이콘 반환
          return <Image source={iconName} style={style.icon} />;
        },
        tabBarActiveTintColor: '#07AC7D', // 포커스 될 때 타이틀 색상
        tabBarInactiveTintColor: '#A7A7A7', // 포커스 되지 않았을 때 타이틀 색상
      })}>
      <Tab.Screen name="홈" component={AboutMap} />
      <Tab.Screen name="게시판" component={Board} />
      <Tab.Screen name="채팅" component={AboutChat} />
      <Tab.Screen name="프로필" component={Profile} />
    </Tab.Navigator>
  );
};

const homePageIcon = require('../assets/icons/homePageIcon.png');
const boardPageIcon = require('../assets/icons/boardPageIcon.png');
const chatPageIcon = require('../assets/icons/chatPageIcon.png');
const profilePageIcon = require('../assets/icons/profilePageIcon.png');

export const style = StyleSheet.create({
  icon: {
    width: 30,
    height: 30,
  },
});

export default BottomTab;
