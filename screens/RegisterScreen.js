import {
  Text,
  View,
  TextInput,
  KeyboardAvoidingView,
  Pressable,
  Alert,
  TouchableOpacity,
} from "react-native";
import React, { useState } from "react";
import { useNavigation } from "@react-navigation/native";
import axios from "axios";
import { SERVER_URL } from "../api/assets";
import { connectSocket } from "../socket";
import styles from "../styles";
import * as ImagePicker from "expo-image-picker";

const RegisterScreen = () => {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [image, setImage] = useState(null);
  const navigation = useNavigation();
  const validateEmail = (email) => {
    const emailRegex = /^[\w-.]+@[\w-]+\.[a-z]{2,}$/i;
    return emailRegex.test(email);
  };
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
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
    if (!image) {
      Alert.alert("Error", "Please upload a profile picture!");
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

      setName("");
      setEmail("");
      setPassword("");
      setImage(null);

      const socket = connectSocket(registeredUser.id);
      socket.emit("register_user", {
        userID: registeredUser.id,
      });

      navigation.navigate("Login");
    } catch (error) {
      console.error("Registration failed:", error);
      Alert.alert("Registration Error", "An error occurred while registering");
    }
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
            Register to your Account
          </Text>
        </View>

        <View
          style={{
            alignItems: "center",
            marginTop: 40,
          }}
        >
          <TouchableOpacity onPress={pickImage}>
            <View
              style={{
                height: 120,
                width: 120,
                borderRadius: 60,
                backgroundColor: "darkgray",
                justifyContent: "center",
                alignItems: "center",
                overflow: "hidden",
              }}
            >
              {image ? (
                <Image
                  source={{ uri: image }}
                  style={{ height: 120, width: 120 }}
                />
              ) : (
                <Text style={{ ...styles.text, fontSize: 15, color: "#555" }}>
                  Upload Photo
                </Text>
              )}
            </View>
          </TouchableOpacity>
        </View>

        <View style={{ marginTop: 10 }}>
          <View style={{ marginTop: 5 }}>
            <Text style={styles.text}>Name</Text>

            <TextInput
              value={name}
              onChangeText={(text) => setName(text)}
              style={styles.textInput}
              placeholderTextColor={"gray"}
              placeholder="Enter your name"
            />
          </View>

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

          <Pressable onPress={handleRegister} style={styles.button}>
            <Text
              style={{ ...styles.text, color: "white", textAlign: "center" }}
            >
              Register
            </Text>
          </Pressable>

          <Pressable
            onPress={() => navigation.goBack()}
            style={{ marginTop: 15 }}
          >
            <Text style={{ ...styles.text, textAlign: "center", fontSize: 16 }}>
              Already Have an account? Sign in
            </Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

export default RegisterScreen;
