import { View, Text, FlatList, TouchableOpacity, Alert, RefreshControl } from 'react-native';
import { useAuthStore } from '@/stores/authStore';
import { useEffect, useState } from 'react';
import { todoService } from '@/services/api';

interface Todo {
  id: string;
  title: string;
  completed: boolean;
}

type VehicleData = {
  id: string;
  vehicleName: string;
  userName: string;
  departureTime: string;
  returnTime: string;
  date: string;
};

const sampleData: VehicleData[] = [
  {
    id: '1',
    vehicleName: 'Toyota Avanza',
    userName: 'Ahmad Sani',
    departureTime: '08:00',
    returnTime: '17:00',
    date: '2025-04-28',
  },
  {
    id: '2',
    vehicleName: 'Honda Brio',
    userName: 'Budi Santoso',
    departureTime: '09:00',
    returnTime: '16:30',
    date: '2025-04-28',
  },
  {
    id: '3',
    vehicleName: 'Suzuki Ertiga',
    userName: 'Citra Lestari',
    departureTime: '07:30',
    returnTime: '18:00',
    date: '2025-04-28',
  },
  {
    id: '4',
    vehicleName: 'Daihatsu Xenia',
    userName: 'Dewi Anggraini',
    departureTime: '10:00',
    returnTime: '15:30',
    date: '2025-04-28',
  },
  {
    id: '5',
    vehicleName: 'Mitsubishi Xpander',
    userName: 'Eko Prasetyo',
    departureTime: '06:45',
    returnTime: '17:15',
    date: '2025-04-28',
  },
  {
    id: '6',
    vehicleName: 'Nissan Livina',
    userName: 'Fitriani',
    departureTime: '08:30',
    returnTime: '17:45',
    date: '2025-04-28',
  },
  {
    id: '7',
    vehicleName: 'Kia Seltos',
    userName: 'Gilang Mahardika',
    departureTime: '09:15',
    returnTime: '18:00',
    date: '2025-04-28',
  },
  {
    id: '8',
    vehicleName: 'Hyundai Stargazer',
    userName: 'Hana Putri',
    departureTime: '07:00',
    returnTime: '16:00',
    date: '2025-04-28',
  },
  {
    id: '9',
    vehicleName: 'Wuling Almaz',
    userName: 'Irwan Saputra',
    departureTime: '08:15',
    returnTime: '17:30',
    date: '2025-04-28',
  },
  {
    id: '10',
    vehicleName: 'Mazda CX-5',
    userName: 'Joko Widodo',
    departureTime: '09:45',
    returnTime: '19:00',
    date: '2025-04-28',
  },
];



export default function Home() {
  const { logout } = useAuthStore();
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchTodos = async () => {
      try {
        const data = await todoService.getTodos();
        setTodos(data);
      } catch (error) {
        Alert.alert('Error', 'Failed to fetch todos');
      } finally {
        setLoading(false);
      }
    };

    // fetchTodos();
  }, []);

  const ItemLoad = (data: VehicleData) => (
    sampleData.push({
      id: '1',
      vehicleName: 'Toyota Avanza',
      userName: 'Ahmad Sani',
      departureTime: '08:00',
      returnTime: '17:00',
      date: '2025-04-28',
    },)
  );

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text>Loading todos...</Text>
      </View>
    );
  }

  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = () => {
    setRefreshing(true);
    sampleData.push({
      id: '12',
      vehicleName: 'Toyota Avanza',
      userName: 'Ahmad Sani',
      departureTime: '08:00',
      returnTime: '17:00',
      date: '2025-04-28',
    },)
    setInterval(() => {
    setRefreshing(false);
      
    }, 1000);
  };

  return (
    <View className="flex-1 bg-slate-300">
      <View className='absolute w-full bg-[#60B5FF] h-44 rounded-br-[50]  rounded-bl-[50]' />
      <View className="flex-row justify-between items-center p-4">
        <Text className="text-xl font-bold">Todo List</Text>
        <TouchableOpacity
          onPress={logout}
          className="bg-red-500 px-3 py-1 rounded"
        >
          <Text className="text-white">Logout</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={sampleData}
        style={{ flexGrow: 0, padding: 15 }}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        renderItem={({ item }) => (
          <View className="bg-white p-4 rounded-lg shadow mb-2">
            <View className='flex-row items-center justify-between'>
              <Text className={`text-2xl font-bold text-black`}>
                {item.vehicleName}
              </Text>
              <Text className='text-secondary text-sm'>
                {item.date}
              </Text>
            </View>
            <Text className='font-medium text-lg'>
              {item.userName}
            </Text>
            <View className='flex-row items-center justify-around mt-4'>
              <Text className="text-black bg-blue-300 p-2 rounded-lg">Jam Berangkat: {item.departureTime}</Text>
              <Text className="text-black bg-amber-300 p-2 rounded-lg">Jam Pulang: {item.returnTime}</Text>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <View className="flex-1 justify-center items-center bg-white p-5 mt-8">
            <Text>No todos found</Text>
          </View>
        }
      />
      <View className='h-16' />
    </View>
  );
}