import { View, TouchableOpacity, StyleSheet } from "react-native";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import Feather from "@expo/vector-icons/Feather";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import AntDesign from "@expo/vector-icons/AntDesign";
import Ionicons from "@expo/vector-icons/Ionicons";
import Animated, {
  FadeIn,
  FadeOut,
  LinearTransition,
} from "react-native-reanimated";
import { useAuthStore } from "@/stores/authStore";
import { useEffect, useState } from "react";

const AnimatedTouchableOpacity =
  Animated.createAnimatedComponent(TouchableOpacity);

const PRIMARY_COLOR = "#205781";
const SECONDARY_COLOR = "#fff";


const CustomNavBar: React.FC<BottomTabBarProps> = ({
  state,
  descriptors,
  navigation,
}) => {

  return (
    <View style={styles.container}>
      {state.routes
        // .filter(route => !role.includes(route.name))
        .map((route, index) => {

          if (["_sitemap", "+not-found"].includes(route.name)) return null;

          const { options } = descriptors[route.key];

          const label =
            options.tabBarLabel !== undefined
              ? options.tabBarLabel
              : options.title !== undefined
                ? options.title
                : route.name;

          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: "tabPress",
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name, route.params);
            }
          };

          return (
            <AnimatedTouchableOpacity
              layout={LinearTransition.springify().mass(0.5)}
              key={route.key}
              onPress={onPress}
              style={[
                styles.tabItem,
                { backgroundColor: isFocused ? SECONDARY_COLOR : "transparent" },
              ]}
            >
              {getIconByRouteName(
                route.name,
                isFocused ? 'black' : SECONDARY_COLOR
              )}
              {isFocused && (
                <Animated.Text
                  entering={FadeIn.duration(200)}
                  exiting={FadeOut.duration(200)}
                  style={styles.text}
                >
                  {label as string}
                </Animated.Text>
              )}
            </AnimatedTouchableOpacity>
          );
        })}
    </View>
  );

  function getIconByRouteName(routeName: string, color: string) {
    switch (routeName) {
      case '(stack)':
        return <Ionicons name='home-sharp' size={20} color={color} />
      case 'pemakaian':
        return <Ionicons name='speedometer-sharp' size={20} color={color} />
      case 'kendaraan':
        return <Ionicons name='car-sharp' size={20} color={color} />
      case 'profile':
        return <Ionicons name='person-sharp' size={20} color={color} />
      default:
        return null
    }
  }
}
const styles = StyleSheet.create({
  container: {
    position: "absolute",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: PRIMARY_COLOR,
    width: "80%",
    alignSelf: "center",
    bottom: 20,
    borderRadius: 25,
    paddingHorizontal: 12,
    paddingVertical: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  tabItem: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    height: 40,
    paddingHorizontal: 10,
    marginHorizontal: 8,
    borderRadius: 20,
  },
  text: {
    color: 'black',
    marginLeft: 8,
    fontWeight: "500",
  },
});

export default CustomNavBar;