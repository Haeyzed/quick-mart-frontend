"use client"

import { useState } from "react"
import { SerializedEditorState } from "lexical"

import { Editor } from "@/components/blocks/editor-x/editor"

export const initialValue = {
  "root": {
                "children": [
                    {
                        "children": [
                            {
                                "detail": 0,
                                "format": 0,
                                "mode": "normal",
                                "style": "",
                                "text": "Experience effortless blending with the\u00a0",
                                "type": "text",
                                "version": 1
                            },
                            {
                                "detail": 0,
                                "format": 1,
                                "mode": "normal",
                                "style": "",
                                "text": "TropicWhirl Blende",
                                "type": "text",
                                "version": 1
                            },
                            {
                                "detail": 0,
                                "format": 0,
                                "mode": "normal",
                                "style": "",
                                "text": "r, engineered for performance, durability, and everyday convenience. With a",
                                "type": "text",
                                "version": 1
                            },
                            {
                                "detail": 0,
                                "format": 1,
                                "mode": "normal",
                                "style": "",
                                "text": "\u00a02-liter capacit",
                                "type": "text",
                                "version": 1
                            },
                            {
                                "detail": 0,
                                "format": 0,
                                "mode": "normal",
                                "style": "",
                                "text": "y, this fully automatic blender is perfect for smoothies, soups, sauces, and more.",
                                "type": "text",
                                "version": 1
                            }
                        ],
                        "direction": null,
                        "format": "start",
                        "indent": 0,
                        "type": "paragraph",
                        "version": 1,
                        "textFormat": 0,
                        "textStyle": ""
                    },
                    {
                        "children": [
                            {
                                "detail": 0,
                                "format": 0,
                                "mode": "normal",
                                "style": "",
                                "text": "Powered by a reliable 9525 motor delivering 650 watts, the TropicWhirl provides consistent performance for both soft and tough ingredients. The six-blade special stainless steel blade system ensures smooth and even blending every time.",
                                "type": "text",
                                "version": 1
                            }
                        ],
                        "direction": null,
                        "format": "start",
                        "indent": 0,
                        "type": "paragraph",
                        "version": 1,
                        "textFormat": 0,
                        "textStyle": ""
                    },
                    {
                        "children": [
                            {
                                "detail": 0,
                                "format": 1,
                                "mode": "normal",
                                "style": "",
                                "text": "Features:",
                                "type": "text",
                                "version": 1
                            }
                        ],
                        "direction": null,
                        "format": "start",
                        "indent": 0,
                        "type": "paragraph",
                        "version": 1,
                        "textFormat": 1,
                        "textStyle": ""
                    },
                    {
                        "children": [
                            {
                                "children": [
                                    {
                                        "detail": 0,
                                        "format": 0,
                                        "mode": "normal",
                                        "style": "",
                                        "text": "Voltage: 220V",
                                        "type": "text",
                                        "version": 1
                                    }
                                ],
                                "direction": null,
                                "format": "start",
                                "indent": 0,
                                "type": "listitem",
                                "version": 1,
                                "value": 1
                            }
                        ],
                        "direction": null,
                        "format": "",
                        "indent": 0,
                        "type": "list",
                        "version": 1,
                        "listType": "bullet",
                        "start": 1,
                        "tag": "ul"
                    }
                ],
                "direction": null,
                "format": "",
                "indent": 0,
                "type": "root",
                "version": 1
            },
} as unknown as SerializedEditorState

export default function EditorPage() {
  const [editorState, setEditorState] =
    useState<SerializedEditorState>(initialValue)
  return (
    <Editor
      editorSerializedState={editorState}
      onSerializedChange={(value) => setEditorState(value)}
    />
  )
}
