import React, { useState } from "react";
import {
  Modal,
  View,
  Text
} from "react-native";

const CustomAlert = () => {
  const [visible, setVisible] = useState(false);

  const showAlert = () => setVisible(true);
  const hideAlert = () => setVisible(false);

  return (
    <View style={styles.container}>
      <Pressable onPress={showAlert} style={styles.showButton}>
        <Text style={styles.buttonText}>Show Custom Alert</Text>
      </Pressable>

      <Modal
        visible={visible}
        transparent={true}
        animationType="slide"
        onRequestClose={hideAlert}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.alertBox}>
            <Text style={styles.alertTitle}>Custom Alert</Text>
            <Text style={styles.alertMessage}>
              This is a custom-styled alert!
            </Text>
            <Pressable onPress={hideAlert} style={styles.closeButton}>
              <Text style={styles.buttonText}>ok</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
  },
  showButton: {
    backgroundColor: "#4A55A2",
    padding: 15,
    borderRadius: 8,
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  alertBox: {
    width: 300,
    padding: 20,
    backgroundColor: "white",
    borderRadius: 10,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  alertTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  alertMessage: {
    fontSize: 16,
    color: "gray",
    textAlign: "center",
    marginBottom: 20,
  },
  closeButton: {
    backgroundColor: "#4A55A2",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
});

export default CustomAlert;
