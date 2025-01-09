import { Link } from "@react-email/components";
import EmailTemplate from "./template";

export default function VerificationEmail({ url }: { url: string }) {
  return (
    <EmailTemplate>
      <h1 className="text-3xl">Подтвердите ваш адрес электронной почты</h1>
      <Link href={url}>Подтвердить</Link>
    </EmailTemplate>
  );
}
