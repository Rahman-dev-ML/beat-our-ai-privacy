import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Board } from '../game/logic';
import { Cell } from './Cell';

type Props = {
  board: Board;
  size: number;
  disabled: boolean;
  winningLine: number[] | null;
  suspectIndex?: number | null;
  onPress: (index: number) => void;
};

export function BoardView({
  board,
  size,
  disabled,
  winningLine,
  suspectIndex,
  onPress,
}: Props) {
  const fontSize = size >= 5 ? 22 : size === 4 ? 28 : 36;
  const rows = Array.from({ length: size }, (_, r) => r);

  return (
    <View style={styles.board}>
      {rows.map((row) => (
        <View key={row} style={styles.row}>
          {Array.from({ length: size }, (_, col) => {
            const index = row * size + col;
            return (
              <Cell
                key={index}
                index={index}
                value={board[index]}
                disabled={disabled}
                highlight={!!winningLine?.includes(index)}
                suspect={suspectIndex === index}
                fontSize={fontSize}
                onPress={onPress}
              />
            );
          })}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  board: {
    width: '100%',
    maxWidth: 380,
    alignSelf: 'center',
  },
  row: {
    flexDirection: 'row',
  },
});
