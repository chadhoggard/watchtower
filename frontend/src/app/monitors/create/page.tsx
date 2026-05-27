import CreateMonitorForm from "@/components/CreateMonitorForm";

export default function CreateMonitorPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Create Monitor</h1>
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <CreateMonitorForm />
      </div>
    </div>
  );
}
