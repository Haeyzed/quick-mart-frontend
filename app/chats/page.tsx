"use client"

import { AuthenticatedLayout } from "@/components/layout/authenticated-layout";
import { Chats } from "@/features/chats";

export default function ChatsPage() {
  return (
    <AuthenticatedLayout>
      <Chats />
    </AuthenticatedLayout>
  );
}

