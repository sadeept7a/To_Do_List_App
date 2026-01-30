import { api } from "@/convex/_generated/api";
import { ColorScheme, useTheme } from "@/hooks/useTheme";

import { useMutation, useQuery } from "convex/react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function Index() {
  const {toggleDarkMode, colors} = useTheme();
  const styles = createStyles(colors);

  const todos = useQuery(api.todo.getTodos);
  console.log(todos);

  const addTodo = useMutation(api.todo.addTodo);
  const clearAllTodos = useMutation(api.todo.clearAllTodos);

  return (
    <View style = {styles.container}>
      <Text style = {styles.content}>Edit app/index.tsx to edit this screen.123</Text>
      <Text>Hi</Text>
      <TouchableOpacity onPress={() => toggleDarkMode()}>
        <Text>Toggle Dark Mode</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => addTodo({text: "walk the dog"})}>
        <Text>Add a new todo</Text>
      </TouchableOpacity>      
      <TouchableOpacity onPress={() => clearAllTodos()}>
        <Text>Clear all todos</Text>
      </TouchableOpacity>
      
      
    </View>
  );
}

const createStyles = (colors: ColorScheme) => {
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.bg,
      alignItems: 'center',
      justifyContent: 'center',
      gap: 10,
      backgroundColor: colors.bg,
    },
    content: {
      fontSize: 22,
    },
  });
  return styles;
};