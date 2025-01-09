import EmailTemplate from "./template";

export default function SignUpEmail() {
  return (
    <EmailTemplate>
      <h1 className="text-3xl">Спасибо за регистрацию!</h1>
    </EmailTemplate>
  );
}
