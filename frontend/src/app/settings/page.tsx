'use client';
import { SettingsForm } from '@/components/settings';

export default function SettingsPage() {
  return (
    <div className="flex flex-col flex-1 min-h-0 overflow-y-auto items-center pt-[32px] w-full">
      <SettingsForm />
    </div>
  );
}
