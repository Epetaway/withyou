import React from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Spacing, BorderRadius, Typography } from '../tokens';
import { useTheme } from '../theme/ThemeProvider';
import { ButtonNew } from './ButtonNew';

interface ModalNewProps {
  visible: boolean;
  title?: string;
  message?: string;
  onClose: () => void;
  primaryAction?: { label: string; onPress: () => void };
  secondaryAction?: { label: string; onPress: () => void };
}

export const ModalNew: React.FC<ModalNewProps> = ({
  visible,
  title,
  message,
  onClose,
  primaryAction,
  secondaryAction,
}) => {
  const { colors } = useTheme();
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={[styles.overlay, { backgroundColor: colors.overlay }]}>
        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          <View style={styles.header}>
            {title ? <Text style={[styles.title, { color: colors.text }]}>{title}</Text> : null}
            <TouchableOpacity onPress={onClose} accessibilityRole="button">
              <Text style={[styles.close, { color: colors.textMuted }]}>✕</Text>
            </TouchableOpacity>
          </View>
          {message ? <Text style={[styles.message, { color: colors.text }]}>{message}</Text> : null}
          <View style={styles.actions}>
            {secondaryAction ? (
              <ButtonNew label={secondaryAction.label} onPress={secondaryAction.onPress} variant="secondary" />
            ) : null}
            {primaryAction ? (
              <ButtonNew label={primaryAction.label} onPress={primaryAction.onPress} variant="primary" />
            ) : null}
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.lg,
  },
  card: {
    width: '100%',
    maxWidth: 420,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  title: {
    fontSize: Typography.size.xxl,
    fontWeight: Typography.weight.semibold,
  },
  close: {
    fontSize: Typography.size.xl,
  },
  message: {
    fontSize: Typography.size.base,
    marginBottom: Spacing.lg,
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.md,
    justifyContent: 'flex-end',
  },
});
