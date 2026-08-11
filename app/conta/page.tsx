import { auth } from "@/auth";
import ChangePasswordForm from "./ChangePasswordForm";

export default async function ContaPage() {
  const session = await auth();

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Minha Conta</h1>
        <p className="text-sm text-gray-500 mt-1">
          Logado como <span className="font-medium">{session?.user?.name}</span>
        </p>
      </div>

      <ChangePasswordForm />
    </div>
  );
}
