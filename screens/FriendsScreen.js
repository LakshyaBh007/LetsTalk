import { StyleSheet, Text, View } from "react-native";
import React, { useEffect, useContext, useState } from "react";
import axios from "axios";
import { UserType } from "../UserContext";
import FriendRequest from "../components/FriendRequest";
import { SERVER_URL } from "../api/assets";
import styles from "../styles";
import { useNavigation } from "@react-navigation/native";


const FriendsScreen = () => {
  const navigation = useNavigation();
  const { userId, setUserId } = useContext(UserType);
  const [friendRequests, setFriendRequests] = useState([]);
  useEffect(() => {
    fetchFriendRequests();
    navigation.setOptions({
      title: "Friends",
      headerStyle: {
        backgroundColor: "#202123",
      },
      headerTitleStyle: {
        fontWeight: "bold",
        fontSize: 20,
        color: "#fff",
      },
      headerTintColor: "#fff",
      headerTitleAlign: "center",
    });
  }, []);
  

  const fetchFriendRequests = async () => {
    try {
      const response = await axios.get(
        `${SERVER_URL}/friend-request/${userId}`
      );
      if (response.status === 200) {
        const friendRequestsData = response.data.map((friendRequest) => ({
          _id: friendRequest._id,
          name: friendRequest.name,
          email: friendRequest.email,
          image: friendRequest.image,
        }));

        setFriendRequests(friendRequestsData);
      }
    } catch (err) {
      console.log("error message", err);
    }
  };

  console.log(friendRequests);
  return (
    <View style={{flex:1, backgroundColor:"#3D3C3A"}}>
      {friendRequests.length > 0 && <Text style={{...styles.text, alignItems:"center", paddingBottom: 5, color:"white"}}>Your Friend Requests!</Text>}

      {friendRequests.map((item, index) => (
        <FriendRequest
          key={index}
          item={item}
          friendRequests={friendRequests}
          setFriendRequests={setFriendRequests}
        />
      ))}
    </View>
  );
};

export default FriendsScreen;