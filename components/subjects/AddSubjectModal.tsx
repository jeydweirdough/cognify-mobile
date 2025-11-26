import React, { useState } from "react";
import { View, Text, Modal, TextInput, Button, StyleSheet } from "react-native";
import { Fonts } from '@/constants/cognify-theme';

interface AddSubjectModalProps {
  visible: boolean;
  onClose: () => void;
  onAdd: (subjectName: string) => void;
}

export const AddSubjectModal = ({ visible, onClose, onAdd }: AddSubjectModalProps) => {
  const [subjectName, setSubjectName] = useState("");

  const handleAdd = () => {
    onAdd(subjectName);
    setSubjectName("");
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Create New Subject</Text>
          <TextInput
            placeholder="Subject Name"
            value={subjectName}
            onChangeText={setSubjectName}
            style={styles.input}
          />
          <View style={styles.modalButtons}>
            <Button title="Cancel" onPress={onClose} />
            <Button title="Add" onPress={handleAdd} />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "85%",
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 16,
  },
  modalTitle: {
    fontFamily: Fonts.lexendDecaMedium,
    fontSize: 16,
    marginBottom: 12,
    color: "#222",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 12,
    padding: 10,
    marginBottom: 12,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
});
