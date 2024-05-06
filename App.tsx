import React, { useEffect } from 'react';
import { NavigationContainer } from "@react-navigation/native";
import Router from './src/routers/Router';
import BootSplash from "react-native-bootsplash";

function App(): React.JSX.Element {
  useEffect(() => {
    const init = async () => {
      // …do multiple sync or async tasks
    };

    init().finally(async () => {
      await BootSplash.hide({ fade: true });
      console.log("BootSplash has been hidden successfully");
    });
  }, []);

  return (
    <NavigationContainer>
      <Router/>
    </NavigationContainer>
  );
}

export default App;
