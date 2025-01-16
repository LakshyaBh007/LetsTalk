import { StyleSheet, Text, View } from "react-native";
import React, { useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { jwtDecode } from "jwt-decode";
import LoginScreen from "./screens/LoginScreen";
import RegisterScreen from "./screens/RegisterScreen";
import HomeScreen from "./screens/HomeScreen";
import FriendsScreen from "./screens/FriendsScreen";
import ChatsScreen from "./screens/ChatsScreen";
import ChatMessagesScreen from "./screens/ChatMessagesScreen";
import BiometricAuthScreen from "./screens/BiometricAuthScreen";
import { useDispatch, useSelector } from "react-redux";
import { setLoginState } from "./store"; // Import the action

const StackNavigator = () => {
  const Stack = createNativeStackNavigator();
  const dispatch = useDispatch();
  const isLoggedIn = useSelector((state) => state.auth.isLoggedIn);
  const userId = useSelector((state) => state.auth.userId);

  useEffect(() => {
    const checkLoginState = async () => {
      const token = await AsyncStorage.getItem("authToken");

      if (token) {
        const decodedToken = jwtDecode(token);
        dispatch(
          setLoginState({ isLoggedIn: true, userId: decodedToken.userId })
        );
      } else {
        dispatch(setLoginState({ isLoggedIn: false, userId: null }));
      }
    };

    checkLoginState();
  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator>
        {/* Auth Screens */}
        {!isLoggedIn ? (
          <>
            <Stack.Screen
              name="Login"
              component={LoginScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="Register"
              component={RegisterScreen}
              options={{ headerShown: false }}
            />
          </>
        ) : (
          // Logged In Screens
          <>
            <Stack.Screen
              name="BiometricAuth"
              component={BiometricAuthScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="Friends" component={FriendsScreen} />
            <Stack.Screen name="Chats" component={ChatsScreen} />
            <Stack.Screen name="Messages" component={ChatMessagesScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default StackNavigator;

const styles = StyleSheet.create({});
