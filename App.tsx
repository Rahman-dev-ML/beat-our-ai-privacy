import { useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { useFonts, Bungee_400Regular } from '@expo-google-fonts/bungee';
import {
  DMSans_400Regular,
  DMSans_500Medium,
  DMSans_700Bold,
} from '@expo-google-fonts/dm-sans';

import { HomeScreen } from './src/screens/HomeScreen';
import { GameScreen } from './src/screens/GameScreen';
import { GameModeId } from './src/game/logic';
import { colors } from './src/theme/colors';

type Screen = 'home' | 'game';

export default function App() {
  const [fontsLoaded] = useFonts({
    Bungee_400Regular,
    DMSans_400Regular,
    DMSans_500Medium,
    DMSans_700Bold,
  });

  const [screen, setScreen] = useState<Screen>('home');
  const [mode, setMode] = useState<GameModeId>('classic');
  const [gamesPlayed, setGamesPlayed] = useState(0);
  const [youScore, setYouScore] = useState(0);
  const [aiScore, setAiScore] = useState(0);
  const [matchNumber, setMatchNumber] = useState(1);

  if (!fontsLoaded) {
    return (
      <View style={styles.boot}>
        <ActivityIndicator color={colors.accent} size="large" />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <SafeAreaView style={styles.safe}>
        {screen === 'home' ? (
          <HomeScreen
            mode={mode}
            gamesPlayed={gamesPlayed}
            onMode={setMode}
            onPlay={() => setScreen('game')}
          />
        ) : (
          <GameScreen
            mode={mode}
            gamesPlayed={gamesPlayed + 1}
            youScore={youScore}
            aiScore={aiScore}
            matchNumber={matchNumber}
            onExit={() => setScreen('home')}
            onGameEnd={(outcome) => {
              setGamesPlayed((g) => g + 1);
              if (outcome === 'you') setYouScore((s) => s + 1);
              else if (outcome === 'house') setAiScore((s) => s + 1);
            }}
            onRematch={() => setMatchNumber((m) => m + 1)}
          />
        )}
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  boot: {
    flex: 1,
    backgroundColor: colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
