import { useState, useEffect } from "react";
import { View, Text, ActivityIndicator, ScrollView, RefreshControl } from "react-native";
import { getTodaysTasks } from "../../services/ticktickService";
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
  const [todayTasks, setTodayTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadTasks() {
    try {
      setError(null);
      const tasks = await getTodaysTasks();
      setTodayTasks(tasks);
    } catch (err: any) {
      console.error("Failed to load tasks:", err);
      setError(err.message || "Failed to load tasks");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    loadTasks();
  }, []);

  async function onRefresh() {
    setRefreshing(true);
    await loadTasks();
  }

  if (loading) {
    return (
      <View className="flex-1 bg-black items-center justify-center">
        <ActivityIndicator size="large" color="#4A90E2" />
        <Text className="text-gray-400 mt-4">Loading tasks...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 bg-black items-center justify-center px-6">
        <Ionicons name="alert-circle-outline" size={64} color="#ef4444" />
        <Text className="text-red-500 text-lg mt-4 text-center">{error}</Text>
        <Text className="text-gray-500 text-sm mt-2 text-center">
          Make sure TICKTICK_ACCESS_TOKEN is set in .env
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-black">
      {/* Header */}
      <View className="pt-[60px] px-4 pb-4">
        <Text className="text-white text-3xl font-bold mb-3">
          ✅ Tasks
        </Text>
        <View className="bg-green-900/30 p-3 rounded-lg border-l-4 border-green-500">
          <Text className="text-green-500 text-sm font-semibold">
            ✓ {todayTasks.length} tasks for today
          </Text>
        </View>
      </View>

      {/* Tasks List */}
      <ScrollView 
        className="flex-1 px-4" 
        contentContainerStyle={{ paddingBottom: 100 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#4A90E2" />
        }
      >
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
                  <Ionicons name="ellipse-outline" size={20} color="#888" style={{ marginTop: 2 }} />
                  <View className="flex-1 ml-3">
                    <Text className="text-white text-base font-medium mb-1">
                      {task.title}
                    </Text>
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
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}
