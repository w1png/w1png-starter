"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "~/components/ui/button";
import { Form, FormControl, FormField, FormItem } from "~/components/ui/form";
import { Input, PasswordInput } from "~/components/ui/input";
import { authClient } from "~/lib/client/auth-client";
import { OnError } from "~/lib/client/on_error";

export default function SignInPage() {
  const loginSchema = z.object({
    email: z
      .string({
        message: "Email обязателен для ввода",
      })
      .email({
        message: "Неверный формат Email",
      }),
    password: z
      .string({
        message: "Пароль обязателен для ввода",
      })
      .min(1, "Введите пароль"),
  });

  const router = useRouter();

  const form = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {} as z.infer<typeof loginSchema>,
  });

  async function onSubmit(data: z.infer<typeof loginSchema>) {
    await authClient.signIn.email(data, {
      onSuccess() {
        router.push("/");
      },
      onError(error) {
        console.error(error);
        toast.error("Не удалось войти в аккаунт");
      },
    });
  }

  return (
    <div className="h-screen container flex items-center justify-center">
      <div className="rounded-xl shadow-xl border-2 border-input p-6 space-y-6 flex flex-col">
        <h1 className="text-2xl font-medium">Вход</h1>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit, OnError)}
            className="space-y-2"
          >
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      placeholder="Email"
                      {...field}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <PasswordInput
                      placeholder="Пароль"
                      {...field}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <Button
              type="submit"
              className="w-full"
            >
              Войти
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}
