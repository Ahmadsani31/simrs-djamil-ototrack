import { View, ViewProps } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface SafeAreaViewProps extends ViewProps {
  children: React.ReactNode;
  noTop?: boolean;
  noBottom?: boolean;
}

export default function SafeAreaView({ 
  children, 
  noTop = false, 
  noBottom = false,
  style,
  ...props 
}: SafeAreaViewProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        {
          paddingTop: noTop ? 0 : insets.top,
          paddingBottom: noBottom ? 0 : insets.bottom,
          flex: 1,
        },
        style,
      ]}
      {...props}
    >
      {children}
    </View>
  );
}