import {
  Text,
  View,
  ScrollView,
  KeyboardAvoidingView,
  TextInput,
  Pressable,
  Image,
} from "react-native";
import React, {
  useState,
  useContext,
  useLayoutEffect,
  useEffect,
  useRef,
} from "react";
import { Feather } from "@expo/vector-icons";
import { Ionicons } from "@expo/vector-icons";
import { FontAwesome } from "@expo/vector-icons";
import { MaterialIcons } from "@expo/vector-icons";
import { Entypo } from "@expo/vector-icons";
import EmojiSelector from "react-native-emoji-selector";
import { UserType } from "../UserContext";
import { useNavigation, useRoute } from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker";
import * as Notifications from "expo-notifications";
import { SERVER_URL } from "../api/assets";
import io from "socket.io-client";
import styles from "../styles";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

const ChatMessagesScreen = () => {
  const [showEmojiSelector, setShowEmojiSelector] = useState(false);
  const [selectedMessages, setSelectedMessages] = useState([]);
  const [messages, setMessages] = useState([]);
  const [recepientData, setRecepientData] = useState();
  const navigation = useNavigation();
  const [selectedImage, setSelectedImage] = useState("");
  const route = useRoute();
  const { recepientId } = route.params;
  const [message, setMessage] = useState("");
  const { userId, setUserId } = useContext(UserType);

  const scrollViewRef = useRef(null);

  const socket = useRef(io(SERVER_URL)).current;

  useEffect(() => {
    const requestUserPermission = async () => {
      const { status } = await Notifications.requestPermissionsAsync();
      console.log("User authorization status:", status);
    };

    requestUserPermission();

    const notificationSubscription =
    //console.log("yeh chal rha hai kya")
      Notifications.addNotificationReceivedListener((notification) => {
        console.log("Notification received:", notification);
        const newMessage = notification.request.content.data.newMessage;
        if (newMessage) {
          setMessages((prevMessages) => [...prevMessages, newMessage]);
        }
      });

    return () => {
      //notificationSubscription.remove();
    };
  }, [message]);

  useEffect(() => {
    socket.on("newMessage", (newMessage) => {
      setMessages((prevMessages) => [...prevMessages, newMessage]);
      Notifications.scheduleNotificationAsync({
        content: {
          title: `New message from ${newMessage.senderName || "Unknown"}`,
          body: newMessage.messageText || "You received a new message.",
          data: { newMessage },
        },
        trigger: null, // Trigger immediately`
      });
      scrollToBottom(); // Scroll to bottom when new message arrives
    });

    //socket.emit("register", userId);

    return () => {
      socket.off("newMessage"); // Clean up listener on component unmount
    };
  }, [userId]);

  // Send a message
  // const sendMessage = () => {
  //   const messageData = {
  //     senderId: userId,
  //     recepientId,
  //     messageType: "text",
  //     messageText: message,
  //   };

  //   socket.emit("sendMessage", messageData); // Emit the message to the backend
  //   setMessage(""); // Clear the input field
  // };

  // useEffect(() => {
  //   scrollToBottom();
  // }, []);

  //   const scrollToBottom = () => {useEffect(() => {
  //     socket.on("newMessage", (newMessage) => {
  //       setMessages((prevMessages) => [...prevMessages, newMessage]);
  //       scrollToBottom(); // Scroll to bottom when new message arrives
  //     });

  //     socket.emit("joinRoom", { senderId: userId, recepientId });

  //     return () => {
  //       socket.off("newMessage"); // Clean up listener on component unmount
  //     };
  //   }, [userId, recepientId]);

  //     if (scrollViewRef.current) {
  //       scrollViewRef.current.scrollToEnd({ animated: false });
  //     }
  //   };
  const scrollToBottom = () => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollToEnd({ animated: true });
    }
  };

  const handleContentSizeChange = () => {
    scrollToBottom();
  };

  const handleEmojiPress = () => {
    setShowEmojiSelector(!showEmojiSelector);
  };

  const fetchMessages = async () => {
    try {
      const response = await fetch(
        `${SERVER_URL}/messages/${userId}/${recepientId}`
      );
      const data = await response.json();

      if (response.ok) {
        setMessages(data);
        // socket.emit("sendMessage", {
        //   senderId: userId,
        //   recepientId,
        //   messageType: "text",
        //   messageText: message,
        // });
      } else {
        console.log("error showing messags", response.status.message);
      }
    } catch (error) {
      console.log("error fetching messages", error);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, [messages]);

  useEffect(() => {
    const fetchRecepientData = async () => {
      try {
        const response = await fetch(`${SERVER_URL}/user/${recepientId}`);

        const data = await response.json();
        setRecepientData(data);
        console.log("fsnnnnnnnnnnnnnnnnnnnnnnnnnns", data);
      } catch (error) {
        console.log("error retrieving details", error);
      }
    };

    fetchRecepientData();
  }, []);
  const handleSend = async (messageType, imageUri) => {
    console.log(messageType, imageUri);
    
    if (!message.trim() && messageType === "text") return;
    try {
      const formData = new FormData();
      formData.append("senderId", userId);
      formData.append("recepientId", recepientId);

      //if the message type id image or a normal text
      if (messageType === "image") {
        formData.append("messageType", "image");
        formData.append("imageFile", {
          uri: imageUri,
          name: "image.jpg",
          type: "image/jpeg",
        });
      } else {
        formData.append("messageType", "text");
        formData.append("messageText", message);
      }
      console.log("yaha tak chala?")

      const response = await fetch(`${SERVER_URL}/messages`, {
        method: "POST",
        body: formData,
      });
      console.log(response,"gfdgfsg")

      if (response.ok) {
        setMessage("");
        setSelectedImage("");

        fetchMessages(); // commented
      }
      // socket.emit("sendMessage", {
      //   senderId: userId,
      //   recepientId,
      //   messageType: "text",
      //   messageText: message,
      // }); // Emit the message to the backend
    } catch (error) {
      console.log("error in sending the message", error);
    }
  };

  //console.log("messages", selectedMessages);
  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: "",
      headerStyle: {
        backgroundColor: "#202123",
      },
      headerLeft: () => (
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
          <Ionicons
            onPress={() => navigation.goBack()}
            name="arrow-back"
            size={24}
            color="white"
          />

          {selectedMessages.length > 0 ? (
            <View>
              <Text style={{ fontSize: 16, fontWeight: "500" }}>
                {selectedMessages.length}
              </Text>
            </View>
          ) : (
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Image
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: 15,
                  resizeMode: "cover",
                }}
                source={{ uri: recepientData?.image }}
              />

              <Text style={{ marginLeft: 5, color: "white", fontSize: 17, fontWeight: "bold" }}>
                {recepientData?.name}
              </Text>
            </View>
          )}
        </View>
      ),
      headerRight: () =>
        selectedMessages.length > 0 ? (
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            <Ionicons name="md-arrow-redo-sharp" size={24} color="white" />
            <Ionicons name="md-arrow-undo" size={24} color="white" />
            <FontAwesome name="star" size={24} color="white" />
            <MaterialIcons
              onPress={() => deleteMessages(selectedMessages)}
              name="delete"
              size={24}
              color="white"
            />
          </View>
        ) : null,
    });
  }, [recepientData, selectedMessages]);

  const deleteMessages = async (messageIds) => {
    try {
      const response = await fetch(`${SERVER_URL}/deleteMessages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ messages: messageIds }),
      });

      if (response.ok) {
        setSelectedMessages((prevSelectedMessages) =>
          prevSelectedMessages.filter((id) => !messageIds.includes(id))
        );

        fetchMessages();
      } else {
        console.log("error deleting messages", response.status);
      }
    } catch (error) {
      console.log("error deleting messages", error);
    }
  };
  const formatTime = (time) => {
    const options = { hour: "numeric", minute: "numeric" };
    return new Date(time).toLocaleString("en-US", options);
  };
  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: false,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      handleSend("image", result.assets[0].uri);
    }
  };
  const handleSelectMessage = (message) => {
    //check if the message is already selected
    const isSelected = selectedMessages.includes(message._id);

    if (isSelected) {
      setSelectedMessages((previousMessages) =>
        previousMessages.filter((id) => id !== message._id)
      );
    } else {
      setSelectedMessages((previousMessages) => [
        ...previousMessages,
        message._id,
      ]);
    }
  };
  return (
    <KeyboardAvoidingView style={{flex: 1, backgroundColor: "#3D3C3A" }}>
      <ScrollView
        ref={scrollViewRef}
        contentContainerStyle={{ flexGrow: 1 }}
        onContentSizeChange={handleContentSizeChange}
      >
        {messages.map((item, index) => {
          if (item.messageType === "text") {
            const isSelected = selectedMessages.includes(item._id);
            return (
              <Pressable
                onLongPress={() => handleSelectMessage(item)}
                key={index}
                style={[
                  item?.senderId?._id === userId
                    ? {
                        alignSelf: "flex-end",
                        backgroundColor: "#66CDAA",
                        padding: 8,
                        maxWidth: "60%",
                        borderRadius: 7,
                        margin: 10,
                      }
                    : {
                        alignSelf: "flex-start",
                        backgroundColor: "#99A3A3",
                        padding: 8,
                        margin: 10,
                        borderRadius: 7,
                        maxWidth: "60%",
                      },

                  isSelected && { width: "100%", backgroundColor: "#F0FFFF" },
                ]}
              >
                <Text
                  style={{
                    fontSize: 15,
                    fontWeight: "600",
                    color: "black",
                    textAlign: isSelected ? "right" : "left",
                  }}
                >
                  {item?.message}
                </Text>
                <Text
                  style={{
                    textAlign: "right",
                    fontSize: 10,
                    color: "black",
                    fontWeight: "600",
                    marginTop: 5,
                  }}
                >
                  {formatTime(item.timeStamp)}
                </Text>
              </Pressable>
            );
          }

          if (item.messageType === "image") {
            // const baseUrl =
            //   "/home/Lakshya/Desktop/LETSTALK/LetsTalk/api/files/";
            // const imageUrl = item.imageUrl;
            // const filename = imageUrl.split("/").pop();
            return (
              <Pressable
                key={index}
                style={[
                  item?.senderId?._id === userId
                    ? {
                        alignSelf: "flex-end",
                        backgroundColor: "#DCF8C6",
                        padding: 8,
                        maxWidth: "60%",
                        borderRadius: 7,
                        margin: 10,
                      }
                    : {
                        alignSelf: "flex-start",
                        backgroundColor: "white",
                        padding: 8,
                        margin: 10,
                        borderRadius: 7,
                        maxWidth: "60%",
                      },
                ]}
              >
                <View>
                  <Image
                    source={{uri: item.imageUrl}}
                    style={{ width: 200, height: 200, borderRadius: 7, marginBottom: 10 }}
                  />
                  <Text
                    style={{
                      textAlign: "right",
                      fontSize: 9,
                      position: "absolute",
                      right: 10,
                      bottom:-5,
                      fontWeight:500,
                      color: "black",
                      marginTop: 5,
                    }}
                  >
                    {formatTime(item?.timeStamp)}
                  </Text>
                </View>
              </Pressable>
            );
          }
        })}
      </ScrollView>

      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: 10,
          paddingVertical: 10,
          borderTopWidth: 1,
          borderTopColor: "#dddddd",
          marginBottom: 5,
        }}
      >
        <Entypo
          onPress={handleEmojiPress}
          style={{ marginRight: 5 }}
          name="emoji-happy"
          size={24}
          color="gray"
        />

        <TextInput
          value={message}
          onChangeText={(text) => setMessage(text)}
          style={{
            flex: 1,
            height: 40,
            borderWidth: 1,
            borderColor: "#dddddd",
            borderRadius: 20,
            paddingHorizontal: 10,
            color: "white"
          }}
          placeholder="Type Your message..."
          placeholderTextColor="white"
        />

        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 7,
            marginHorizontal: 8,
          }}
        >
          <Entypo onPress={pickImage} name="camera" size={24} color="gray" />

          <Feather name="mic" size={24} color="gray" />
        </View>

        <Pressable
          onPress={() => handleSend("text")}
          style={{
            backgroundColor: "#10A37F",
            paddingVertical: 8,
            paddingHorizontal: 12,
            borderRadius: 20,
          }}
        >
          <Text style={{ color: "white", fontWeight: "bold" }}>Send</Text>
        </Pressable>
      </View>

      {showEmojiSelector && (
        <EmojiSelector
          onEmojiSelected={(emoji) => {
            setMessage((prevMessage) => prevMessage + emoji);
          }}
          style={{ height: 250 }}
        />
      )}
    </KeyboardAvoidingView>
  );
};

export default ChatMessagesScreen;
