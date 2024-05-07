import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import BottomTab from "../routers/BottomTab";
import LoginTab from "../routers/LoginTab";
import Show from "../pages/Main/Show";

const Stack = createNativeStackNavigator();


const Router = ({ params }) => {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="LoginTab" component={LoginTab} initialParams={params} />
            <Stack.Screen name="BottomTab" component={BottomTab} initialParams={params} />
            <Stack.Screen name="Show" component={Show} />
        </Stack.Navigator>
    )
}

export default Router;