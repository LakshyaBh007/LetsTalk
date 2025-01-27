import { StyleSheet, Text, View ,ScrollView, Pressable} from "react-native";
import React, { useContext,useEffect,useState } from "react";
import { UserType } from "../UserContext";
import { useNavigation } from "@react-navigation/native";
import UserChat from "../components/UserChat";
import { SERVER_URL } from "../api/assets";
import styles from "../styles";


const ChatsScreen = () => {
  const [acceptedFriends, setAcceptedFriends] = useState([]);
  const { userId, setUserId } = useContext(UserType);
  const navigation = useNavigation();
  useEffect(() => {
    navigation.setOptions({
      title: "Chats",
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
    const acceptedFriendsList = async () => {
      try {
        const response = await fetch(
          `${SERVER_URL}/accepted-friends/${userId}`
        );
        const data = await response.json();

        if (response.ok) {
          setAcceptedFriends(data);
        }
      } catch (error) {
        console.log("error showing the accepted friends", error);
      }
    };

    acceptedFriendsList();
  }, []);
  console.log("friends",acceptedFriends)
  return (
    <View style={{flex:1, backgroundColor:"#3D3C3A"}}>
    <ScrollView showsVerticalScrollIndicator={false}>
      <Pressable>
          {acceptedFriends.map((item,index) => (
              <UserChat key={index} item={item}/>
          ))}
      </Pressable>
    </ScrollView>
    </View>
  );
};

export default ChatsScreen;