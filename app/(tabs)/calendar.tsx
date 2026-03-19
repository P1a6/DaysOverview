import { useEffect, useState } from "react";
import { View, Text, SectionList, ActivityIndicator } from "react-native";
import { getTodaysEvents, getTomorrowsEvents } from "../../services/calendarService";
import EventCard from "../../components/EventCard";

interface CalendarEvent {
  title: string;
  startTime: Date;
  endTime: Date;
  calendar: string;
}

interface EventSection {
  title: string;
  data: CalendarEvent[];
}

export default function CalendarTab() {
  const [sections, setSections] = useState<EventSection[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("Fetching calendar events...");
    Promise.all([getTodaysEvents(), getTomorrowsEvents()])
      .then(([today, tomorrow]) => {
        console.log("Today's events:", today.length);
        console.log("Tomorrow's events:", tomorrow.length);
        setSections([
          { title: "Today", data: today },
          { title: "Tomorrow", data: tomorrow },
        ]);
      })
      .catch((error) => {
        console.error("Error fetching events:", error);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-black">
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-black">
      {/* Header */}
      <View className="pt-[60px] px-4 pb-4">
        <Text className="text-white text-3xl font-bold">
          📅 Calendar
        </Text>
      </View>

      {/* Calendar Events */}
      <SectionList
        sections={sections}
        keyExtractor={(item, index) => index.toString()}
        renderSectionHeader={({ section: { title, data } }) =>
          data.length > 0 ? (
            <Text className="text-gray-400 text-xl font-semibold px-4 py-2 mt-2 bg-black">
              {title}
            </Text>
          ) : null
        }
        renderItem={({ item }) => (
          <EventCard
            title={item.title}
            startTime={item.startTime}
            endTime={item.endTime}
            calendar={item.calendar}
          />
        )}
        ListEmptyComponent={
          <Text className="text-gray-500 text-base text-center mt-10">
            No events today or tomorrow 🎉
          </Text>
        }
        contentContainerStyle={{ paddingBottom: 100 }}
      />
    </View>
  );
}
