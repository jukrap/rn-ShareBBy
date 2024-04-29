import React from 'react';
import { NavigationContainer } from "@react-navigation/native";
import Router from './src/routers/Router';


function App(): React.JSX.Element {
  
  
  return (
    <NavigationContainer>
      <Router/>
    </NavigationContainer>
  );
}

export default App;
