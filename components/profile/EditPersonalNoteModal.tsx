import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

interface Props {
  visible: boolean;
  value: string;
  onClose: () => void;
  onSave: (text: string) => void;
}

const Colors = {
  primary: "#48316D",
  white: "#FFFFFF",
  bgOverlay: "rgba(45, 31, 44, 0.5)",
  inputBg: "#F9F9F9",
};

export default function EditPersonalNoteModal({
  visible,
  value,
  onClose,
  onSave,
}: Props) {
  const [text, setText] = useState(value);

  return (
    <Modal transparent visible={visible} animationType="fade">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.overlay}
      >
        <View style={styles.box}>
          <Text style={styles.title}>Update Daily Goal</Text>
          <Text style={styles.subtitle}>
            What do you want to achieve today?
          </Text>

          <TextInput
            value={text}
            onChangeText={setText}
            style={styles.input}
            multiline
            placeholder="E.g., Read 2 chapters of Abnormal Psychology..."
            placeholderTextColor="#999"
            autoFocus={true}
          />

          <View style={styles.row}>
            <Pressable style={styles.btnCancel} onPress={onClose}>
              <Text style={styles.btnCancelText}>Cancel</Text>
            </Pressable>

            <Pressable
              style={styles.btnSave}
              onPress={() => {
                onSave(text);
                onClose();
              }}
            >
              <Text style={styles.btnSaveText}>Save Goal</Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: Colors.bgOverlay,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  box: {
    backgroundColor: Colors.white,
    padding: 24,
    borderRadius: 24,
    width: "100%",
    maxWidth: 340,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#2D1F2C",
    marginBottom: 6,
    fontFamily: "LexendDeca-Regular",
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: 16,
    fontFamily: "LexendDeca-Regular",
  },
  input: {
    backgroundColor: Colors.inputBg,
    padding: 16,
    borderRadius: 16,
    minHeight: 100,
    textAlignVertical: "top",
    fontSize: 16,
    color: "#333",
    fontFamily: "LexendDeca-Regular",
    borderWidth: 1,
    borderColor: "#EEE",
  },
  row: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 20,
    alignItems: "center",
    gap: 12,
  },
  btnCancel: {
    paddingVertical: 10,
    paddingHorizontal: 10,
  },
  btnCancelText: {
    fontSize: 15,
    color: "#888",
    fontWeight: "600",
    fontFamily: "LexendDeca-Regular",
  },
  btnSave: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
  btnSaveText: {
    fontSize: 15,
    color: "#fff",
    fontWeight: "600",
    fontFamily: "LexendDeca-Regular",
  },
});
