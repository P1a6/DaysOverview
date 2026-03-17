import { View, Text } from "react-native";

interface EventCardProps {
  title: string;
  startTime: Date;
  endTime: Date;
  calendar: string;
}

export default function EventCard({ title, startTime, endTime, calendar }: EventCardProps) {
  const formatTime = (date: Date) =>
    date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  return (
    <View className="mx-4 my-1.5 rounded-xl bg-neutral-900 p-4">
      <Text className="text-sm text-neutral-400">
        {formatTime(startTime)} - {formatTime(endTime)}
      </Text>
      <Text className="mt-1 text-lg font-semibold text-white">
        {title}
      </Text>
      <Text className="mt-1 text-xs text-neutral-600">
        {calendar}
      </Text>
    </View>
  );
}
