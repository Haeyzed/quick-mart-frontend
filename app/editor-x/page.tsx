"use client"

import { useState } from "react"
import { SerializedEditorState } from "lexical"

import { Editor } from "@/components/blocks/editor-x/editor"

export const initialValue = {
    "root": {
        "type": "root",
        "format": "",
        "indent": 0,
        "version": 1,
        "children": [
            {
                "type": "paragraph",
                "format": "start",
                "indent": 0,
                "version": 1,
                "children": [
                    {
                        "mode": "normal",
                        "text": "The best iPhone ever, version 2022,",
                        "type": "text",
                        "style": "",
                        "detail": 0,
                        "format": 1,
                        "version": 1
                    },
                    {
                        "mode": "normal",
                        "text": "\u00a0size XL - we have the\u00a0",
                        "type": "text",
                        "style": "",
                        "detail": 0,
                        "format": 0,
                        "version": 1
                    },
                    {
                        "mode": "normal",
                        "text": "iPhone 14 Pro Max",
                        "type": "text",
                        "style": "",
                        "detail": 0,
                        "format": 1,
                        "version": 1
                    },
                    {
                        "mode": "normal",
                        "text": ". The list of novelties this year includes the notch morphing into a pill, the introduction of an Always-On display, and an all-new primary camera - and while you can get all of that on the 14 Pro, the extra screen estate and longevity coupled with the Max's 'ultimate' status mean it has a market niche of its own.",
                        "type": "text",
                        "style": "",
                        "detail": 0,
                        "format": 0,
                        "version": 1
                    }
                ],
                "direction": null,
                "textStyle": "",
                "textFormat": 1
            },
            {
                "type": "paragraph",
                "format": "start",
                "indent": 0,
                "version": 1,
                "children": [
                    {
                        "mode": "normal",
                        "text": "The Face ID notch that's been with us since the iPhone X was nobody's favorite, and perhaps its reincarnatio",
                        "type": "text",
                        "style": "",
                        "detail": 0,
                        "format": 0,
                        "version": 1
                    }
                ],
                "direction": null,
                "textStyle": "",
                "textFormat": 0
            }
        ],
        "direction": null
    }
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
