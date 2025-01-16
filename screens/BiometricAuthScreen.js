import React, { useEffect } from "react";
import { View, Text, ActivityIndicator, Alert } from "react-native";
import * as LocalAuthentication from "expo-local-authentication";
import { useNavigation } from "@react-navigation/native";

const BiometricAuthScreen = () => {
  const navigation = useNavigation();

  useEffect(() => {
    const authenticate = async () => {
      try {
        // Check if the device supports biometric authentication
        const compatible = await LocalAuthentication.hasHardwareAsync();
        if (!compatible) {
          Alert.alert("Biometric Not Available", "This device does not support biometrics.");
          navigation.replace("Home"); // Fallback if biometrics are unavailable
          return;
        }

        // Check available biometrics (fingerprint, face recognition, etc.)
        const { success } = await LocalAuthentication.authenticateAsync({
          promptMessage: "Authenticate to continue",
          fallbackLabel: "Use Passcode",
        });

        //console.log(success)

        if (success) {
          navigation.replace("Home"); // Navigate to the Home screen
        } else {
          navigation.replace("Home"); // Navigate to the Home screen
          Alert.alert("Authentication Failed", "Please try again.");
        }
      } catch (error) {
        console.error("Biometric Error:", error);
        Alert.alert("Error", "Biometric authentication failed.");
      }
    };

    authenticate();
  }, [navigation]);

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <ActivityIndicator size="large" />
      <Text>Authenticating...</Text>
    </View>
  );
};

export default BiometricAuthScreen;
