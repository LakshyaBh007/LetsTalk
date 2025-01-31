import { StyleSheet, Text, View, Pressable, Image } from "react-native";
import React, { useContext, useEffect, useState } from "react";
import { useNavigation } from "@react-navigation/native";
import { UserType } from "../UserContext";
import { SERVER_URL } from "../api/assets";
import styles from "../styles";

const UserChat = ({ item }) => {
  const { userId, setUserId } = useContext(UserType);
  const [messages, setMessages] = useState([]);
  const navigation = useNavigation();
  const fetchMessages = async () => {
    try {
      const response = await fetch(
        `${SERVER_URL}/messages/${userId}/${item._id}`
      );
      const data = await response.json();

      if (response.ok) {
        setMessages(data);
      } else {
        console.log("error showing messags", response.status.message);
      }
    } catch (error) {
      console.log("error fetching messages", error);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);
  console.log(messages);

  const getLastMessage = () => {
    const userMessages = messages.filter(
      (message) => message.messageType === "text"
    );

    const n = userMessages.length;

    return userMessages[n - 1];
  };
  const lastMessage = getLastMessage();
  console.log(lastMessage);
  const formatTime = (time) => {
    const options = { hour: "numeric", minute: "numeric" };
    return new Date(time).toLocaleString("en-US", options);
  };
  return (
    <Pressable
      onPress={() =>
        navigation.navigate("Messages", {
          recepientId: item._id,
        })
      }
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        borderWidth: 1,
        borderColor: "#D0D0D0",
        borderTopWidth: 0,
        borderLeftWidth: 0,
        borderRightWidth: 0,
        padding: 10,
      }}
    >
      <Image
        style={{ width: 50, height: 50, borderRadius: 25, resizeMode: "cover" }}
        source={{ uri: item?.image }}
      />

      <View style={{ flex: 1 }}>
        <Text style={{ ...styles.text, fontSize: 16, color:"white" }}>{item?.name}</Text>
        {lastMessage && (
          <Text style={{ ...styles.text, fontSize: 14,marginTop: 3, fontWeight: "500" }}>
            {lastMessage?.message}
          </Text>
        )}
      </View>
 
      <View>
        <Text style={{ fontSize: 11, fontWeight: "400", color: "white" }}>
          {lastMessage && formatTime(lastMessage?.timeStamp)}
        </Text>
      </View>
    </Pressable>
  );
};

export default UserChat;