import { useEffect, useState } from "react";
import { View, Text, ScrollView, ActivityIndicator, TouchableOpacity, RefreshControl } from "react-native";
import { getTodaysEvents, getTomorrowsEvents } from "../../services/calendarService";
import { loginToTickTick, getTodaysTasks } from "../../services/ticktickService";
import { Ionicons } from '@expo/vector-icons';

interface CalendarEvent {
  title: string;
  startTime: Date;
  endTime: Date;
  calendar: string;
}

interface Task {
  id: string;
  title: string;
  dueDate?: string;
  priority: number;
}

export default function HomeTab() {
  const [todayEvents, setTodayEvents] = useState<CalendarEvent[]>([]);
  const [tomorrowEvents, setTomorrowEvents] = useState<CalendarEvent[]>([]);
  const [todayTasks, setTodayTasks] = useState<Task[]>([]);
  const [ticktickToken, setTicktickToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [today, tomorrow] = await Promise.all([
        getTodaysEvents(),
        getTomorrowsEvents(),
      ]);
      setTodayEvents(today);
      setTomorrowEvents(tomorrow);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleRefresh() {
    setRefreshing(true);
    await loadData();
    if (ticktickToken) {
      try {
        const tasks = await getTodaysTasks(ticktickToken);
        setTodayTasks(tasks);
      } catch (error) {
        console.error("Error refreshing tasks:", error);
      }
    }
    setRefreshing(false);
  }

  async function handleTickTickLogin() {
    try {
      const tokens = await loginToTickTick();
      setTicktickToken(tokens.accessToken);
      const tasks = await getTodaysTasks(tokens.accessToken);
      setTodayTasks(tasks);
    } catch (error) {
      console.error("TickTick error:", error);
    }
  }

  const nextEvent = todayEvents.find(event => event.startTime > new Date());
  const now = new Date();
  const greeting = now.getHours() < 12 ? "Good Morning" : now.getHours() < 18 ? "Good Afternoon" : "Good Evening";

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-black">
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  return (
    <ScrollView 
      className="flex-1 bg-black"
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="#fff" />}
    >
      <View className="pt-[60px] px-4 pb-5">
        {/* Greeting */}
        <Text className="text-gray-500 text-base mb-1">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </Text>
        <Text className="text-white text-3xl font-bold mb-6">
          {greeting}
        </Text>

        {/* Summary Cards */}
        <View className="gap-3">
          {/* Today's Events Summary */}
          <View className="bg-neutral-900 rounded-2xl p-5 border-l-4 border-blue-500">
            <View className="flex-row items-center mb-2">
              <Ionicons name="calendar" size={24} color="#4A90E2" />
              <Text className="text-blue-500 text-sm font-semibold ml-2">
                TODAY'S SCHEDULE
              </Text>
            </View>
            <Text className="text-white text-3xl font-bold mb-1">
              {todayEvents.length}
            </Text>
            <Text className="text-gray-500 text-sm">
              {todayEvents.length === 1 ? "event" : "events"} today
            </Text>
            
            {nextEvent && (
              <View className="mt-3 pt-3 border-t border-neutral-800">
                <Text className="text-gray-500 text-xs mb-1">NEXT UP</Text>
                <Text className="text-white text-base font-medium">
                  {nextEvent.title}
                </Text>
                <Text className="text-blue-500 text-sm mt-0.5">
                  {nextEvent.startTime.toLocaleTimeString('en-US', { 
                    hour: 'numeric', 
                    minute: '2-digit',
                    hour12: true 
                  })}
                </Text>
              </View>
            )}
          </View>

          {/* Tasks Summary */}
          {!ticktickToken ? (
            <TouchableOpacity 
              onPress={handleTickTickLogin}
              className="bg-neutral-900 rounded-2xl p-5 border-l-4 border-green-500"
            >
              <View className="flex-row items-center mb-2">
                <Ionicons name="checkmark-circle" size={24} color="#10b981" />
                <Text className="text-green-500 text-sm font-semibold ml-2">
                  TASKS
                </Text>
              </View>
              <Text className="text-white text-base font-medium">
                Connect TickTick
              </Text>
              <Text className="text-gray-500 text-sm mt-1">
                Tap to login and see your tasks
              </Text>
            </TouchableOpacity>
          ) : (
            <View className="bg-neutral-900 rounded-2xl p-5 border-l-4 border-green-500">
              <View className="flex-row items-center mb-2">
                <Ionicons name="checkmark-circle" size={24} color="#10b981" />
                <Text className="text-green-500 text-sm font-semibold ml-2">
                  TODAY'S TASKS
                </Text>
              </View>
              <Text className="text-white text-3xl font-bold mb-1">
                {todayTasks.length}
              </Text>
              <Text className="text-gray-500 text-sm">
                {todayTasks.length === 1 ? "task" : "tasks"} to complete
              </Text>

              {todayTasks.length > 0 && (
                <View className="mt-3 pt-3 border-t border-neutral-800">
                  <Text className="text-gray-500 text-xs mb-2">TOP PRIORITY</Text>
                  {todayTasks.slice(0, 3).map((task) => (
                    <View key={task.id} className="flex-row items-center mb-2">
                      <Ionicons name="ellipse-outline" size={16} color="#888" />
                      <Text className="text-white text-sm ml-2 flex-1" numberOfLines={1}>
                        {task.title}
                      </Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          )}

          {/* Tomorrow Preview */}
          <View className="bg-neutral-900 rounded-2xl p-5 border-l-4 border-purple-500">
            <View className="flex-row items-center mb-2">
              <Ionicons name="calendar-outline" size={24} color="#a855f7" />
              <Text className="text-purple-500 text-sm font-semibold ml-2">
                TOMORROW
              </Text>
            </View>
            <Text className="text-white text-3xl font-bold mb-1">
              {tomorrowEvents.length}
            </Text>
            <Text className="text-gray-500 text-sm">
              {tomorrowEvents.length === 1 ? "event" : "events"} scheduled
            </Text>
          </View>
        </View>

        {/* Quick Stats */}
        <View className="mt-6">
          <Text className="text-gray-500 text-xs font-semibold mb-3">QUICK STATS</Text>
          <View className="flex-row gap-3">
            <View className="flex-1 bg-neutral-900 rounded-xl p-4">
              <Text className="text-gray-500 text-xs mb-1">Total Events</Text>
              <Text className="text-white text-2xl font-bold">
                {todayEvents.length + tomorrowEvents.length}
              </Text>
            </View>
            <View className="flex-1 bg-neutral-900 rounded-xl p-4">
              <Text className="text-gray-500 text-xs mb-1">Tasks</Text>
              <Text className="text-white text-2xl font-bold">
                {todayTasks.length}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
