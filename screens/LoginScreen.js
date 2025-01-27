import {
  KeyboardAvoidingView,
  Pressable,
  Text,
  TextInput,
  View,
  Alert
} from "react-native";
import React, { useState, useEffect } from "react";
import { useNavigation } from "@react-navigation/native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SERVER_URL } from "../api/assets";
import { useDispatch } from "react-redux";
import { jwtDecode } from "jwt-decode";
import { setLoginState } from "../store";
import styles from "../styles";

const LoginScreen = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigation = useNavigation();
  const dispatch = useDispatch();

  //   useEffect(() => {
  //     const checkLoginStatus = async () => {
  //       try {
  //         const token = await AsyncStorage.getItem("authToken");

  //         if (token) {
  //           console.log("Token found, checking login...");
  //           const decodedToken = jwtDecode(token);
  //           const userId = decodedToken.userId;

  //           // Dispatch login state
  //           dispatch(setLoginState({ isLoggedIn: true, userId }));

  //           // Navigate to Home screen
  //           //navigation.replace("Home");
  //         } else {
  //           console.log("No token found, stay on Login screen.");
  //         }
  //       } catch (error) {
  //         console.log("Error checking login status:", error);
  //       }
  //     };

  //     checkLoginStatus();
  //   }, []);

  const handleLogin = () => {
    const validateEmail = (email) => {
      const emailRegex = /^[\w-.]+@[\w-]+\.[a-z]{2,}$/i;
      return emailRegex.test(email);
    };

    if (!email.trim() || !validateEmail(email)) {
      Alert.alert("Error", "Please enter a valid email address!");
      return;
    }
    // if (!password.trim() || password.length < 8) {
    //   Alert.alert("Error", "Password must be at least 8 characters long!");
    //   return;
    // }
    const user = {
      email,
      password,
    };

    axios
      .post(`${SERVER_URL}/login`, user)
      .then((response) => {
        console.log(response);
        const token = response.data.token;
        const decodedToken = jwtDecode(token);
        const userId = decodedToken.userId;

        // Save the token to AsyncStorage
        AsyncStorage.setItem("authToken", token);

        // Dispatch the login state to Redux
        dispatch(setLoginState({ isLoggedIn: true, userId }));

        // Navigate to Home screen
        navigation.replace("Home");
      })
      .catch((error) => {
        Alert.alert("Login Error", "Invalid email or password");
        console.log("Login Error", error);
      });
  };
  return (
    <View style={styles.container}>
      <KeyboardAvoidingView>
        <View
          style={{
            marginTop: 100,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Text style={{ ...styles.text, fontSize: 25 }}>LetsTalk</Text>

          <Text style={{ ...styles.text, fontSize: 20, marginTop: 15 }}>
            Sign In to your Account
          </Text>
        </View>

        <View style={{ marginTop: 50 }}>
          <View>
            <Text style={styles.text}>Email</Text>

            <TextInput
              value={email}
              onChangeText={(text) => setEmail(text)}
              style={styles.textInput}
              placeholderTextColor={"gray"}
              placeholder="Enter your email"
            />
          </View>

          <View style={{ marginTop: 5 }}>
            <Text style={styles.text}>Password</Text>

            <TextInput
              value={password}
              onChangeText={(text) => setPassword(text)}
              secureTextEntry={true}
              style={styles.textInput}
              placeholderTextColor={"gray"}
              placeholder="Enter your password"
            />
          </View>

          <Pressable onPress={handleLogin} style={styles.button}>
            <Text
              style={{ ...styles.text, color: "white", textAlign: "center" }}
            >
              Login
            </Text>
          </Pressable>

          <Pressable
            onPress={() => navigation.navigate("Register")}
            style={{ marginTop: 15 }}
          >
            <Text style={{ ...styles.text, textAlign: "center", fontSize: 16 }}>
              Dont't have an account? Sign Up
            </Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

export default LoginScreen;
