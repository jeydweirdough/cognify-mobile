// file: AddSubjectModal.tsx

import React, { useState } from "react";
import {
  View,
  Text,
  Modal,
  TextInput,
  Button,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Fonts } from "@/constants/cognify-theme";
import { createSubject } from "@/lib/api";

interface AddSubjectModalProps {
  visible: boolean;
  onClose: () => void;
  onAdd: (subjectName: string) => void;
}

export const AddSubjectModal = ({
  visible,
  onClose,
  onAdd,
}: AddSubjectModalProps) => {
  const [subjectName, setSubjectName] = useState("");
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleAdd = async () => {
    if (!subjectName.trim()) {
      Alert.alert("Input Required", "Please enter a subject name.");
      return;
    }

    setIsLoading(true);
    try {
      // Prepare payload matching SubjectCreateRequest schema
      const payload = {
        title: subjectName.trim(),
        description: description.trim() || undefined,
      };

      // Call the API to create the subject
      const result = await createSubject(payload);
      // Notify parent component
      onAdd(subjectName.trim());

      // Reset state and close modal
      setSubjectName("");
      setDescription("");
      onClose();

      Alert.alert(
        "Success",
        result.message || "Personal subject successfully created!"
      );
    } catch (error: any) {
      console.error(
        "Failed to create subject:",
        error.response?.data || error.message
      );
      Alert.alert(
        "Error",
        error.response?.data?.detail ||
          "Failed to create subject. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
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
          <Text style={styles.modalTitle}>Create New Personal Subject</Text>

          {/* Subject Name Input */}
          <TextInput
            placeholder="Subject Name"
            value={subjectName}
            onChangeText={setSubjectName}
            style={styles.input}
            editable={!isLoading}
          />

          {/* Subject Description Input */}
          <TextInput
            placeholder="Description (Optional)"
            multiline
            numberOfLines={4}
            value={description}
            onChangeText={setDescription}
            style={[styles.input, styles.descriptionInput]}
            editable={!isLoading}
          />

          <View style={styles.modalButtons}>
            <Button title="Cancel" onPress={onClose} disabled={isLoading} />
            {isLoading ? (
              <ActivityIndicator size="small" color="#007AFF" />
            ) : (
              <Button
                title="Add"
                onPress={handleAdd}
                disabled={!subjectName.trim() || isLoading}
              />
            )}
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
    minHeight: 45,
    textAlignVertical: "top",
  },
  descriptionInput: {
    minHeight: 80,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
});
