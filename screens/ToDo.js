import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Button,
  StyleSheet,
  ScrollView,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { useTheme } from '../hooks/ThemeContext';
import { COLORS, FONTWEIGHT, SIZES, BORDER } from '../constants/theme';
import NavModal from '../components/NavModal/NavModal';
import BottomNav from '../components/BottomNav/BottomNav';
import ToDoModal from '../components/ToDoModal/ToDoModal';
import TaskTop from '../components/TaskTop/TaskTop';
import ToDoBar from '../components/ToDoBar/ToDoBar';
import useFirestore from '../hooks/useFirestore';
import { COLLECTION } from '../constants/collections';
import {
  auth,
  collection,
  firestore,
  onSnapshot,
  query,
  where,
} from '../firebase/config';

const ToDo = ({ navigation }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [todoModalVisible, setToDoModalVisible] = useState(false);
  const [habitModalVisible, setHabitModalVisible] = useState(false);
  const [data, setData] = useState([]);
  const { theme } = useTheme();

  const dynamicStyles = getDynamicStyles(theme);
  const { loading, error, } = useFirestore();

  useEffect(() => {
    const user = auth.currentUser;
    const todoQuery = query(
      collection(firestore, COLLECTION.TODOS),
      where('userId', '==', user.uid)
    );
    const unsubscribe = onSnapshot(todoQuery, (querySnapshot) => {
      const tempTodos = [];

      querySnapshot.forEach((doc) => {
        const todoObject = {
          id: doc.id,
          ...doc.data()
        }
        tempTodos.push(todoObject)
      });
      setData(tempTodos)
    });
    return unsubscribe;
  }, []);

  return (
    <View style={dynamicStyles.container}>
      <TaskTop />
      {error && <Text>{error}</Text>}
      {loading ? (
        <ActivityIndicator size={'large'} color={COLORS[theme].primary} />
      ) : data.length > 0 ? (
        <FlatList
          data={data}
          renderItem={(todo) => <ToDoBar data={todo.item} />}
          keyExtractor={(todo) => todo.id}
        />
      ) : (
        <Text style={dynamicStyles.emptyText}>No ToDo's yet</Text>
      )}
      <NavModal
        navigation={navigation}
        modalVisible={modalVisible}
        setModalVisible={setModalVisible}
      />
      <BottomNav
        navigation={navigation}
        setToDoModalVisible={setToDoModalVisible}
        setHabitModalVisible={setHabitModalVisible}
      />
      <ToDoModal
        todoModalVisible={todoModalVisible}
        setToDoModalVisible={setToDoModalVisible}
      />
    </View>
  );
};

const getDynamicStyles = (theme) => {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: COLORS[theme].background,
      alignItems: 'center',
      paddingBottom: 40,
    },
    text: {
      fontSize: SIZES.medium,
      fontWeight: FONTWEIGHT.bold,
      color: COLORS[theme].text,
    },
    emptyText: {
      fontSize: SIZES.medium,
      fontWeight: FONTWEIGHT.bold,
      color: COLORS[theme].text,
      paddingTop: 20,
    },
  });
};

export default ToDo;
