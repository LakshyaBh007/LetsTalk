import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  container: {
    padding: 10,
    alignItems: "center",
    flex: 1,
    fontWeight: "bold",
    flexDirection: "column",
    backgroundColor: "#202123",
  },
  text: { fontSize: 20, fontWeight: "600", color: "darkgray" },
  textInput: {
    padding: 8,
    borderRadius: 4,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    fontSize: 16,
    borderBottomColor: "darkgray",
    borderBottomWidth: 1,
    marginVertical: 10,
    width: 300,
    color: "darkgray",
  },
  button: {
    width: 200,
    height: 55,
    padding: 15,
    marginTop: 30,
    marginLeft: "auto",
    marginRight: "auto",
    borderRadius: 6,
    backgroundColor: "#10A37F",
  },
  chatBox: {
    flex: 1,
    padding: 8,
    backgroundColor: "#343541", // Background color for the chat box
  },
  scrollView: {
    flex: 1,
  },
  messageBox: {
    padding: 16,
    borderRadius: 4,
    marginBottom: 8,
    maxWidth: "70%",
    wordWrap: "break-word",
    whiteSpace: "pre-wrap",
  },
  botMessage: {
    backgroundColor: "rgba(72, 80, 92, 0.9)", // Bot message background
  },
  userMessage: {
    backgroundColor: "rgba(255, 255, 255, 0.1)", // User message background
  },
  finalizedMessage: {
    backgroundColor: "rgba(50, 50, 50, 0.9)", // Finalized message background
  },
  messageText: {
    fontSize: 14,
    fontFamily: "sans-serif",
    color: "white",
    lineHeight: 21,
  },
  typingIndicator: {
    marginBottom: 8,
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
  },
  typingText: {
    marginLeft: 8,
    color: "white",
  },
  inputSection: {
    flexDirection: "column",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.2)",
    backgroundColor: "#202123", // Input section background
  },
  sendButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  sendButtonDisabled: {
    backgroundColor: "rgba(16, 163, 127, 0.7)", // Send button when disabled
  },
  chipContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginVertical: 8,
  },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 16,
    fontSize: 14,
    fontWeight: "normal",
    borderColor: "white",
  },
  chipActive: {
    backgroundColor: "#10A37F", // Active chip background
    color: "#fff", // Active chip text color
  },
  chipInactive: {
    backgroundColor: "#616161", // Inactive chip background
    color: "white",
  },
  chipDisabled: {
    opacity: 0.5,
  },
  scrollIndicator: {
    width: 8,
    backgroundColor: "#343541",
  },
  scrollThumb: {
    backgroundColor: "rgba(50, 50, 50, 0.7)",
  },
  scrollThumbHover: {
    backgroundColor: "rgba(50, 50, 50, 0.9)",
  },
});

export default styles;
