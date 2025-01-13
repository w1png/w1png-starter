"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "~/components/ui/button";
import { Form, FormControl, FormField, FormItem } from "~/components/ui/form";
import { Input, PasswordInput } from "~/components/ui/input";
import { authClient, authErrorCodes } from "~/lib/client/auth-client";
import { OnError } from "~/lib/client/on_error";

export default function SignUpPage() {
  const [verify, setVerify] = useState(false);
  const [loading, setLoading] = useState(false);

  const formSchema = z
    .object({
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
        .min(6, {
          message: "Пароль должен содержать не менее 6 символов",
        }),
      passwordConfirm: z
        .string({
          message: "Пароль обязателен для ввода",
        })
        .min(6, {
          message: "Пароль должен содержать не менее 6 символов",
        }),
      name: z
        .string({
          message: "Имя обязателен для ввода",
        })
        .min(2, {
          message: "Имя должно содержать не менее 2 символа",
        }),
    })
    .superRefine(({ password, passwordConfirm }, ctx) => {
      if (password !== passwordConfirm) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Пароли не совпадают",
        });
      }
    });

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {} as z.infer<typeof formSchema>,
  });

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    await authClient.signUp.email(data, {
      onSuccess() {
        setVerify(true);
      },
      onError(_error) {
        setLoading(false);
        toast.error("Не удалось войти в аккаунт", {
          description: "Неизвестная ошибка",
          /*authErrorCodes[error.error.message]?.ru ??*/
        });
      },
      onRequest() {
        setLoading(true);
      },
    });
  };

  if (verify) {
    return (
      <div className="h-screen container flex items-center justify-center">
        <div className="rounded-xl shadow-xl border-2 border-input p-6 space-y-6 flex flex-col">
          <h1 className="text-2xl font-medium">Регистрация</h1>
          <p className="text-center text-gray-500">
            Вы успешно зарегистрировались!
          </p>
          <p className="text-center text-gray-500">
            Пожалуйста, проверьте вашу почту и нажмите на ссылку, чтобы
            подтвердить ваш адрес.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen container flex items-center justify-center">
      <div className="rounded-xl shadow-xl border-2 border-input p-6 space-y-6 flex flex-col">
        <h1 className="text-2xl font-medium">Регистрация</h1>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit, OnError)}
            className="space-y-2"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      placeholder="Имя"
                      {...field}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
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
            <FormField
              control={form.control}
              name="passwordConfirm"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <PasswordInput
                      placeholder="Подтвердите пароль"
                      {...field}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <Button
              type="submit"
              className=" w-full"
              loading={loading}
            >
              Зарегистрироваться
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}
