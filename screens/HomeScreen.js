import { Text, View, FlatList, ScrollView } from "react-native";
import React, { useLayoutEffect, useContext, useEffect, useState } from "react";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { MaterialIcons } from "@expo/vector-icons";
import { UserType } from "../UserContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import User from "../components/User";
import { SERVER_URL } from "../api/assets";
import styles from "../styles";

const HomeScreen = () => {
  const navigation = useNavigation();
  const { userId, setUserId } = useContext(UserType);
  const [users, setUsers] = useState([]);
  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: "",
      headerStyle: {
        backgroundColor: "#202123",
      },
      headerLeft: () => (
        <Text style={{ ...styles.text, color: "white" }}>LetsTalk</Text>
      ),
      headerRight: () => (
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <Ionicons
            onPress={() => navigation.navigate("Chats")}
            name="chatbox-ellipses-outline"
            size={24}
            color="white"
          />
          <MaterialIcons
            onPress={() => navigation.navigate("Friends")}
            name="people-outline"
            size={24}
            color="white"
          />
        </View>
      ),
    });
  }, []);

  useEffect(() => {
    const fetchUsers = async () => {
      const token = await AsyncStorage.getItem("authToken");
      const decodedToken = jwtDecode(token);
      const userId = decodedToken.userId;
      setUserId(userId);

      console.log(userId);

      axios
        .get(`${SERVER_URL}/users/${userId}`)
        .then((response) => {
          console.log(response);
          setUsers(response.data);
        })
        .catch((error) => {
          console.log("error retrieving users", error);
        });
    };

    fetchUsers();
  }, []);
  console.log("Number of users:", users.length);

  return (
    <View style={{ flex: 1, backgroundColor: "#3D3C3A" }}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={{ padding: 10 }}>
          {users.map((item, index) => (
            <User key={index} item={item} />
          ))}
        </View>
      </ScrollView>
    </View>
  );
};
//       <View style={{flex:1, backgroundColor:"#3D3C3A"}}>
//         <FlatList
//         data={users}
//         keyExtractor={(item, index) => item._id || index.toString()}
//         renderItem={({ item }) => <User item={item} />}
//         contentContainerStyle={{ padding: 10 }}
//         ListEmptyComponent={() => (
//           <Text style={{ color: "white", textAlign: "center", marginTop: 20 }}>
//             No users found.
//           </Text>
//         )}
//       />
//       </View>
//   );
// };

export default HomeScreen;
