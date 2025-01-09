import { Link } from "@react-email/components";
import EmailTemplate from "./template";

export default function ResetPasswordEmail({
  url,
}: {
  url: string;
}) {
  return (
    <EmailTemplate>
      <h1 className="text-3xl">Восстановление пароля</h1>
      <Link href={url}>Восстановить пароль</Link>
    </EmailTemplate>
  );
}
