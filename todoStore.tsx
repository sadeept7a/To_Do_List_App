import AsyncStorage from "@react-native-async-storage/async-storage";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import React, { createContext, useContext, useEffect, useRef, useState } from "react";

export const USE_CONVEX = false; // Set true for online mode, false for offline demo.

export type TodoId = string | Id<"todos">;

export type TodoItem = {
  _id: TodoId;
  text: string;
  isCompleted: boolean;
  _creationTime: number;
};

type TodoContextValue = {
  todos: TodoItem[];
  isLoading: boolean;
  addTodo: (text: string) => Promise<void>;
  toggleTodo: (id: TodoId) => Promise<void>;
  deleteTodo: (id: TodoId) => Promise<void>;
  updateTodo: (id: TodoId, text: string) => Promise<void>;
  clearAllTodos: () => Promise<number>;
};

const TodoContext = createContext<TodoContextValue | undefined>(undefined);

const TODO_STORAGE_KEY = "todos_local_v1";

const generateId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const normalizeTodos = (value: unknown): TodoItem[] => {
  if (!Array.isArray(value)) return [];

  return value
    .filter((item) => item && typeof item.text === "string")
    .map((item) => ({
      _id: String(item._id ?? generateId()),
      text: String(item.text),
      isCompleted: Boolean(item.isCompleted),
      _creationTime: typeof item._creationTime === "number" ? item._creationTime : Date.now(),
    }))
    .sort((a, b) => b._creationTime - a._creationTime);
};

export const useTodos = () => {
  const context = useContext(TodoContext);
  if (!context) {
    throw new Error("useTodos must be used within TodoProvider");
  }
  return context;
};

const ConvexTodoProvider = ({ children }: { children: React.ReactNode }) => {
  const todos = useQuery(api.todo.getTodos);
  const addTodoMutation = useMutation(api.todo.addTodo);
  const toggleTodoMutation = useMutation(api.todo.toggleTodo);
  const deleteTodoMutation = useMutation(api.todo.deleteTodo);
  const updateTodoMutation = useMutation(api.todo.updateTodo);
  const clearAllTodosMutation = useMutation(api.todo.clearAllTodos);

  const addTodo = async (text: string) => {
    const clean = text.trim();
    if (!clean) return;
    await addTodoMutation({ text: clean });
  };

  const toggleTodo = async (id: TodoId) => {
    await toggleTodoMutation({ id: id as Id<"todos"> });
  };

  const deleteTodo = async (id: TodoId) => {
    await deleteTodoMutation({ id: id as Id<"todos"> });
  };

  const updateTodo = async (id: TodoId, text: string) => {
    const clean = text.trim();
    if (!clean) return;
    await updateTodoMutation({ id: id as Id<"todos">, text: clean });
  };

  const clearAllTodos = async () => {
    const result = await clearAllTodosMutation();
    return result.deletedCount;
  };

  const value: TodoContextValue = {
    todos: (todos ?? []) as TodoItem[],
    isLoading: todos === undefined,
    addTodo,
    toggleTodo,
    deleteTodo,
    updateTodo,
    clearAllTodos,
  };

  return <TodoContext.Provider value={value}>{children}</TodoContext.Provider>;
};

const LocalTodoProvider = ({ children }: { children: React.ReactNode }) => {
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const todosRef = useRef<TodoItem[]>([]);

  useEffect(() => {
    todosRef.current = todos;
  }, [todos]);

  useEffect(() => {
    let isMounted = true;

    const loadTodos = async () => {
      try {
        const raw = await AsyncStorage.getItem(TODO_STORAGE_KEY);
        const parsed = raw ? JSON.parse(raw) : [];
        const normalized = normalizeTodos(parsed);
        if (isMounted) {
          setTodos(normalized);
        }
      } catch (error) {
        console.log("Failed to load local todos", error);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadTodos();

    return () => {
      isMounted = false;
    };
  }, []);

  const persistTodos = async (nextTodos: TodoItem[]) => {
    setTodos(nextTodos);
    try {
      await AsyncStorage.setItem(TODO_STORAGE_KEY, JSON.stringify(nextTodos));
    } catch (error) {
      console.log("Failed to save local todos", error);
    }
  };

  const addTodo = async (text: string) => {
    const clean = text.trim();
    if (!clean) return;
    const newTodo: TodoItem = {
      _id: generateId(),
      text: clean,
      isCompleted: false,
      _creationTime: Date.now(),
    };
    const nextTodos = [newTodo, ...todosRef.current];
    await persistTodos(nextTodos);
  };

  const toggleTodo = async (id: TodoId) => {
    const nextTodos = todosRef.current.map((todo) =>
      todo._id === id ? { ...todo, isCompleted: !todo.isCompleted } : todo
    );
    await persistTodos(nextTodos);
  };

  const deleteTodo = async (id: TodoId) => {
    const nextTodos = todosRef.current.filter((todo) => todo._id !== id);
    await persistTodos(nextTodos);
  };

  const updateTodo = async (id: TodoId, text: string) => {
    const clean = text.trim();
    if (!clean) return;
    const nextTodos = todosRef.current.map((todo) =>
      todo._id === id ? { ...todo, text: clean } : todo
    );
    await persistTodos(nextTodos);
  };

  const clearAllTodos = async () => {
    const deletedCount = todosRef.current.length;
    await persistTodos([]);
    return deletedCount;
  };

  const value: TodoContextValue = {
    todos,
    isLoading,
    addTodo,
    toggleTodo,
    deleteTodo,
    updateTodo,
    clearAllTodos,
  };

  return <TodoContext.Provider value={value}>{children}</TodoContext.Provider>;
};

const TodoProvider = ({ children }: { children: React.ReactNode }) => {
  return USE_CONVEX ? (
    <ConvexTodoProvider>{children}</ConvexTodoProvider>
  ) : (
    <LocalTodoProvider>{children}</LocalTodoProvider>
  );
};

export default TodoProvider;
