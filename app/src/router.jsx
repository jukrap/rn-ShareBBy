import React from "react";
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Login from "./pages/SignUpLogin/Login";
import SignUp from "./pages/SignUpLogin/SignUp";
import Main from "./pages/Main";
import SearchId from "./pages/SignUpLogin/SearchId";
import SearchPassword from "./pages/SignUpLogin/SearchPassword";

const Stack = createNativeStackNavigator();



const LoginTab = () => {
  return (
    <Stack.Navigator screenOptions={{
      headerShown: false
    }}>
      <Stack.Screen name="Login" component={Login}/>
      <Stack.Screen name="SignUp" component={SignUp}/>
      <Stack.Screen name="SearchId" component={SearchId}/>
      <Stack.Screen name="SearchPassword" component={SearchPassword}/>
    </Stack.Navigator>

  )
}

  
  const Router = () => {
    return (
      <Stack.Navigator screenOptions={{headerShown: false}}>
       
        <Stack.Screen name="LoginTab" component={LoginTab} />
        
        <Stack.Screen name="Main" component={Main} />
        
      </Stack.Navigator>
    );
  };
  export default Router;
