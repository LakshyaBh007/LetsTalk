import React, { useState } from "react";
import {
  Text,
  View,
  TextInput,
  KeyboardAvoidingView,
  Pressable,
  Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import axios from "axios";
import { SERVER_URL } from "../api/assets";
import { connectSocket } from "../socket";
import styles from "../styles";

const RegisterScreen = () => {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [image, setImage] = useState("");
  const navigation = useNavigation();

  const validateEmail = (email) => {
    const emailRegex = /^[\w-.]+@[\w-]+\.[a-z]{2,}$/i;
    return emailRegex.test(email);
  };

  const handleRegister = async () => {
    if (!name.trim()) {
      Alert.alert("Error", "Name is required!");
      return;
    }
    if (!email.trim() || !validateEmail(email)) {
      Alert.alert("Error", "Please enter a valid email address!");
      return;
    }
    if (!password.trim() || password.length < 8) {
      Alert.alert("Error", "Password must be at least 8 characters long!");
      return;
    }

    const user = {
      name,
      email,
      password,
      image,
    };

    try {
      const response = await axios.post(`${SERVER_URL}/register`, user);
      const registeredUser = response.data.user;

      Alert.alert(
        "Registration successful",
        "You have been registered successfully"
      );

      // Clear the form
      setName("");
      setEmail("");
      setPassword("");
      setImage("");

      // Connect to the socket and emit registration event
      const socket = connectSocket(registeredUser.id);
      socket.emit("register_user", {
        userID: registeredUser.id,
      });

      // Navigate to the Login screen
      navigation.navigate("Login");
    } catch (error) {
      console.error("Registration failed:", error);
      Alert.alert("Registration Error", "An error occurred while registering");
    }
  };

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView>
        <View style={{ marginTop: 100, alignItems: "center" }}>
          <Text style={{ color: "#4A55A2", fontSize: 17, fontWeight: "600" }}>
            Register
          </Text>
          <Text style={{ fontSize: 17, fontWeight: "600", marginTop: 15 }}>
            Register To your Account
          </Text>
        </View>

        <View style={{ marginTop: 50 }}>
          {[
            {
              label: "Name",
              value: name,
              setter: setName,
              placeholder: "Enter your name",
            },
            {
              label: "Email",
              value: email,
              setter: setEmail,
              placeholder: "Enter your email",
            },
            {
              label: "Password",
              value: password,
              setter: setPassword,
              placeholder: "Enter your password",
              secure: true,
            },
            {
              label: "Image",
              value: image,
              setter: setImage,
              placeholder: "Enter image URL",
            },
          ].map((field, index) => (
            <View key={index} style={{ marginTop: 10 }}>
              <Text style={{ fontSize: 18, fontWeight: "600", color: "gray" }}>
                {field.label}
              </Text>
              <TextInput
                value={field.value}
                onChangeText={(text) => field.setter(text)}
                secureTextEntry={field.secure || false}
                style={styles.textInput}
                placeholder={field.placeholder}
                placeholderTextColor={"#aaa"}
              />
            </View>
          ))}

          <Pressable onPress={handleRegister} style={styles.sendButton}>
            <Text style={styles.sendButtonText}>Register</Text>
          </Pressable>

          <Pressable
            onPress={() => navigation.goBack()}
            style={{ marginTop: 15 }}
          >
            <Text style={{ textAlign: "center", color: "gray", fontSize: 16 }}>
              Already Have an account? Sign in
            </Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

export default RegisterScreen;
