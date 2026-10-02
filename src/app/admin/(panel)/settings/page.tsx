import { getSettings } from "@/lib/data";
import { SettingsForm } from "@/components/admin/settings-form";

export default async function AdminSettings() {
  const s = await getSettings();
  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold">Store Settings</h1><p className="text-sm text-neutral-500">Global storefront configuration</p></div>
      <SettingsForm initial={s} />
    </div>
  );
}
