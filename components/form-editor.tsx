// components/form-editor.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { SerializedEditorState } from 'lexical';
// Adjust the import path to where the shadcn CLI placed the component
import { Editor } from '@/components/blocks/editor-x/editor'; 

interface FormEditorProps {
  value: string; // Expect the value from RHF as a JSON string
  onChange: (value: string) => void; // Return a JSON string to RHF
}

export function FormEditor({ value, onChange }: FormEditorProps) {
  // Local state to manage the editor's object value
  const [editorState, setEditorState] = useState<SerializedEditorState | undefined>(undefined);

  // When RHF value changes (e.g., setting default values), update local state
  useEffect(() => {
    if (value && typeof value === 'string') {
        try {
            const parsedState: SerializedEditorState = JSON.parse(value);
            setEditorState(parsedState);
        } catch (error) {
            console.error("Error parsing editor value:", error);
        }
    }
  }, [value]);

  // Handle changes from the editor and pass a JSON string back to RHF
  const handleEditorChange = (serializedState: SerializedEditorState) => {
    setEditorState(serializedState);
    // Convert the object state to a JSON string for the form value
    onChange(JSON.stringify(serializedState)); 
  };

  return (
    <Editor 
      editorSerializedState={editorState} 
      onSerializedChange={handleEditorChange} 
    />
  );
}
