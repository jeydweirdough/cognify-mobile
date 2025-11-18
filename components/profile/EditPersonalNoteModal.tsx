import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
} from "react-native";

interface Props {
  visible: boolean;
  value: string;
  onClose: () => void;
  onSave: (text: string) => void;
}

export default function EditPersonalNoteModal({
  visible,
  value,
  onClose,
  onSave,
}: Props) {
  const [text, setText] = useState(value);

  return (
    <Modal transparent visible={visible} animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.box}>
          <Text style={styles.title}>Edit Personal Note</Text>

          <TextInput
            value={text}
            onChangeText={setText}
            style={styles.input}
            multiline
          />

          <View style={styles.row}>
            <Pressable style={styles.btnCancel} onPress={onClose}>
              <Text style={styles.btnText}>Cancel</Text>
            </Pressable>

            <Pressable
              style={styles.btnSave}
              onPress={() => {
                onSave(text);
                onClose();
              }}
            >
              <Text style={[styles.btnText, { color: "#fff" }]}>Save</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  box: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 16,
    width: "80%",
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 14,
  },
  input: {
    backgroundColor: "#F1F1F1",
    padding: 10,
    borderRadius: 10,
    minHeight: 80,
    textAlignVertical: "top",
  },
  row: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 16,
  },
  btnCancel: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginRight: 8,
  },
  btnSave: {
    backgroundColor: "#333",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  btnText: {
    fontSize: 14,
  },
});
