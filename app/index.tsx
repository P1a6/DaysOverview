import { useEffect, useState } from "react";
import { View, Text, SectionList, ActivityIndicator } from "react-native";
import { getTodaysEvents, getTomorrowsEvents } from "../services/calendarService";
import EventCard from "../components/EventCard";

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

export default function HomeScreen() {
  const [sections, setSections] = useState<EventSection[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("Fetching events...");
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
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#000" }}>
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#000", paddingTop: 60 }}>
      <Text style={{ color: "#fff", fontSize: 28, fontWeight: "bold", paddingHorizontal: 16, marginBottom: 16 }}>
        Day's Overview
      </Text>

      <SectionList
        sections={sections}
        keyExtractor={(item, index) => index.toString()}
        renderSectionHeader={({ section: { title, data } }) =>
          data.length > 0 ? (
            <Text style={{ color: "#ccc", fontSize: 20, fontWeight: "600", paddingHorizontal: 16, paddingVertical: 8, marginTop: 16 }}>
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
          <Text style={{ color: "#888", fontSize: 16, textAlign: "center", marginTop: 40 }}>
            No events today or tomorrow 🎉
          </Text>
        }
      />
    </View>
  );
}
