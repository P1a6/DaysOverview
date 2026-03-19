import { useState } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator, Alert, ScrollView } from "react-native";
import { loginToTickTick, getTodaysTasks } from "../../services/ticktickService";
import { Ionicons } from '@expo/vector-icons';

interface Task {
  id: string;
  title: string;
  startDate?: string;
  dueDate?: string;
  priority: number;
  status: number;
  projectId: string;
}

export default function TasksTab() {
  const [ticktickToken, setTicktickToken] = useState<string | null>(null);
  const [todayTasks, setTodayTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);

  async function handleTickTickLogin() {
    setLoading(true);
    try {
      console.log("Starting TickTick login...");
      const tokens = await loginToTickTick();
      console.log("Got tokens, fetching tasks...");
      
      setTicktickToken(tokens.accessToken);
      
      const tasks = await getTodaysTasks(tokens.accessToken);
      setTodayTasks(tasks);
      
      console.log(`Found ${tasks.length} tasks for today`);
      Alert.alert('Success', `Logged in! Found ${tasks.length} tasks for today.`);
    } catch (error) {
      console.error("TickTick error:", error);
      Alert.alert('Error', 'Failed to login to TickTick. Check console for details.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <View className="flex-1 bg-black">
      {/* Header */}
      <View className="pt-[60px] px-4 pb-4">
        <Text className="text-white text-3xl font-bold mb-3">
          ✅ Tasks
        </Text>

        {/* Login/Status */}
        {!ticktickToken ? (
          <TouchableOpacity 
            onPress={handleTickTickLogin}
            disabled={loading}
            className="bg-blue-500 p-4 rounded-xl items-center"
            style={{ opacity: loading ? 0.6 : 1 }}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-white text-base font-semibold">
                🎯 Login to TickTick
              </Text>
            )}
          </TouchableOpacity>
        ) : (
          <View className="bg-green-900/30 p-3 rounded-lg border-l-4 border-green-500">
            <Text className="text-green-500 text-sm font-semibold">
              ✓ TickTick Connected • {todayTasks.length} tasks today
            </Text>
          </View>
        )}
      </View>

      {/* Tasks List */}
      {ticktickToken && (
        <ScrollView className="flex-1 px-4" contentContainerStyle={{ paddingBottom: 100 }}>
          {todayTasks.length === 0 ? (
            <View className="items-center justify-center mt-20">
              <Ionicons name="checkmark-done-circle-outline" size={64} color="#888" />
              <Text className="text-gray-500 text-lg mt-4">
                No tasks for today 🎉
              </Text>
              <Text className="text-gray-600 text-sm mt-2">
                You're all caught up!
              </Text>
            </View>
          ) : (
            <View className="gap-2">
              {todayTasks.map((task) => (
                <View 
                  key={task.id} 
                  className="bg-neutral-900 p-4 rounded-xl border-l-4"
                  style={{ 
                    borderLeftColor: task.priority >= 3 ? "#ef4444" : task.priority >= 1 ? "#f59e0b" : "#6b7280" 
                  }}
                >
                  <View className="flex-row items-start">
                    <Ionicons 
                      name="ellipse-outline" 
                      size={20} 
                      color="#888" 
                      style={{ marginTop: 2 }}
                    />
                    <View className="flex-1 ml-3">
                      <Text className="text-white text-base font-medium mb-1">
                        {task.title}
                      </Text>
                      
                      <View className="flex-row items-center gap-3">
                        {task.dueDate && (
                          <View className="flex-row items-center">
                            <Ionicons name="time-outline" size={14} color="#888" />
                            <Text className="text-gray-500 text-sm ml-1">
                              {new Date(task.dueDate).toLocaleTimeString('en-US', { 
                                hour: 'numeric', 
                                minute: '2-digit',
                                hour12: true 
                              })}
                            </Text>
                          </View>
                        )}
                        
                        {task.priority > 0 && (
                          <View className="flex-row items-center">
                            <Ionicons 
                              name="flag" 
                              size={14} 
                              color={task.priority >= 3 ? "#ef4444" : "#f59e0b"} 
                            />
                            <Text className="text-orange-500 text-xs ml-1 font-medium">
                              {task.priority === 5 ? "Urgent" : task.priority >= 3 ? "High" : "Medium"}
                            </Text>
                          </View>
                        )}
                      </View>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          )}
        </ScrollView>
      )}
    </View>
  );
}
