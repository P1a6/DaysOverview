// import { useEffect } from 'react';
// import { View, Text, ActivityIndicator } from 'react-native';
// import { useRouter } from 'expo-router';

// export default function OAuthCallback() {
//   const router = useRouter();

//   useEffect(() => {
//     console.log("✅ OAuth callback received!");
    
//     // Short delay to ensure AuthSession processes the callback
//     const timer = setTimeout(() => {
//       console.log("🔄 Redirecting to tasks tab...");
//       // Use href for more reliable navigation
//       router.replace('/tasks');
//     }, 500);

//     return () => clearTimeout(timer);
//   }, []);

//   return (
//     <View className="flex-1 items-center justify-center bg-black">
//       <ActivityIndicator size="large" color="#4A90E2" />
//       <Text className="text-white text-lg mt-4 font-semibold">
//         Completing login...
//       </Text>
//     </View>
//   );
// }
import { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

export default function OAuthCallback() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const [copied, setCopied] = useState(false);

  const code = params.code as string;

  if (!code) {
    return (
      <View className="flex-1 items-center justify-center bg-black p-4">
        <Text className="text-red-500 text-lg">❌ No authorization code received</Text>
        <TouchableOpacity 
          onPress={() => router.replace('/tasks')}
          className="mt-4 bg-blue-500 px-6 py-3 rounded-lg"
        >
          <Text className="text-white font-semibold">Back to Tasks</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-black p-4">
      <Text className="text-white text-2xl font-bold mb-4">✅ OAuth Callback Received!</Text>
      
      <Text className="text-gray-400 text-sm mb-2">Authorization Code:</Text>
      <View className="bg-neutral-900 p-4 rounded-lg mb-4">
        <Text className="text-green-500 text-xs font-mono">{code}</Text>
      </View>

      <Text className="text-gray-400 text-sm mb-4">
        The OAuth flow is working! The browser successfully redirected with the authorization code.
      </Text>

      <TouchableOpacity 
        onPress={() => router.replace('/tasks')}
        className="bg-blue-500 p-4 rounded-lg"
      >
        <Text className="text-white text-center font-semibold">Continue to Tasks</Text>
      </TouchableOpacity>

      <Text className="text-gray-600 text-xs mt-6">
        Note: In development with localhost, the browser stays open. This is normal. 
        In production with proper deep links, it will close automatically.
      </Text>
    </ScrollView>
  );
}
