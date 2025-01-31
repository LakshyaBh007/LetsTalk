import { StyleSheet, Text, View, Pressable, Image } from "react-native";
import React, { useContext } from "react";
import { UserType } from "../UserContext";
import { useNavigation } from "@react-navigation/native";
import { SERVER_URL } from "../api/assets";
import styles from "../styles";

const FriendRequest = ({ item, friendRequests, setFriendRequests }) => {
  const { userId, setUserId } = useContext(UserType);
  const navigation = useNavigation();
  const acceptRequest = async (friendRequestId) => {
    try {
      const response = await fetch(`${SERVER_URL}/friend-request/accept`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          senderId: friendRequestId,
          recepientId: userId,
        }),
      });

      if (response.ok) {
        setFriendRequests(
          friendRequests.filter((request) => request._id !== friendRequestId)
        );
        navigation.navigate("Chats");
      }
    } catch (err) {
      console.log("error acceptin the friend request", err);
    }
  };
  return (
    <View
      style={{
        borderWidth: 1.2,
        //borderColor: "#D0D0D0",
        borderTopWidth: 0,
        borderLeftWidth: 0,
        borderRightWidth: 0,
        borderColor: "darkgrey",
        //borderRadius: 10,
        padding: 2,
      }}
    >
      <Pressable
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          marginVertical: 10,
        }}
      >
        <Image
          style={{ width: 50, height: 50, borderRadius: 25 }}
          source={{ uri: item.image }}
        />

        <Text
          style={{
            ...styles.text,
            fontSize: 16,
            fontWeight: "bold",
            marginLeft: 10,
            flex: 1,
            color: "white",
          }}
        >
          {item?.name} sent you a friend request!!
        </Text>

        <Pressable
          onPress={() => acceptRequest(item._id)}
          style={{ ...styles.button, width:120, height: 40, padding: 10,
            marginTop: 15, }}
        >
          <Text style={{ ...styles.text, fontSize: 16, textAlign: "center", color: "white" }}>Accept</Text>
        </Pressable>
      </Pressable>
    </View>
  );
};

export default FriendRequest;
