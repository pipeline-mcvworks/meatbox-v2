import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { HomeScreen } from '../screens/HomeScreen';
import { RecordScreen } from '../screens/RecordScreen';
import { AnalyzeScreen } from '../screens/AnalyzeScreen';
import { TimelineScreen } from '../screens/TimelineScreen';
import { PadsScreen } from '../screens/PadsScreen';
import { VisualizerScreen } from '../screens/VisualizerScreen';
import { KitScreen } from '../screens/KitScreen';
import { ExportScreen } from '../screens/ExportScreen';
import { ProjectListScreen } from '../screens/ProjectListScreen';
import { colors } from '../theme';

export type RootStackParamList = {
  Home: undefined;
  Record: undefined;
  Analyze: undefined;
  Timeline: undefined;
  Pads: undefined;
  Visualizer: undefined;
  Kit: undefined;
  Export: undefined;
  ProjectList: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export function AppNavigator(): React.JSX.Element {
  return (
    <Stack.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerStyle: { backgroundColor: colors.surface },
        headerTintColor: colors.neonGreen,
        headerTitleStyle: { fontWeight: 'bold', color: colors.textPrimary },
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'MouthBeat Machine' }} />
      <Stack.Screen name="Record" component={RecordScreen} options={{ title: 'Record' }} />
      <Stack.Screen name="Analyze" component={AnalyzeScreen} options={{ title: 'Analyze' }} />
      <Stack.Screen name="Timeline" component={TimelineScreen} options={{ title: 'Timeline' }} />
      <Stack.Screen name="Pads" component={PadsScreen} options={{ title: 'Pads' }} />
      <Stack.Screen name="Visualizer" component={VisualizerScreen} options={{ title: 'Visualizer' }} />
      <Stack.Screen name="Kit" component={KitScreen} options={{ title: 'Kit' }} />
      <Stack.Screen name="Export" component={ExportScreen} options={{ title: 'Export' }} />
      <Stack.Screen name="ProjectList" component={ProjectListScreen} options={{ title: 'Projects' }} />
    </Stack.Navigator>
  );
}
