"use client";

import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTranslations } from "next-intl";
import {
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { UserSchema, userSchema } from "@/lib/schemas/user.schema";
import { DbUser } from "@/db/schema/users";
import { createUser, updateUser } from "@/lib/actions/user.actions";
import { useState } from "react";
import { LoadingButton } from "@/components/app/loading-button";

type Props = {
  user?: DbUser;
  onSubmit: () => void;
};

export default function UserForm({ user, onSubmit }: Props) {
  const tGeneric = useTranslations("Generic");
  const t = useTranslations("User");
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<UserSchema>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      fullName: user?.fullName ?? "",
      email: user?.email ?? "",
      role: user?.role ?? "issuer",
    },
  });

  async function handleSubmit(values: UserSchema) {
    setIsLoading(true);

    const { success, error } = user
      ? await updateUser(user.id, values)
      : await createUser(values);

    if (success) {
      toast.success(success.message);
      onSubmit();
    } else {
      toast.error(error.message);
    }

    setIsLoading(false);
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>{t(user ? "editTitle" : "createTitle")}</DialogTitle>
        <DialogDescription>
          {t(user ? "editDescription" : "createDescription")}
        </DialogDescription>
      </DialogHeader>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(handleSubmit)}
          className="space-y-6"
          id={user ? `user-form-${user.id}` : "new"}
        >
          <FormField
            control={form.control}
            name="fullName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("fullName")}</FormLabel>
                <FormControl>
                  <Input
                    placeholder={t("fullNamePlaceholder")}
                    type="text"
                    required
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{tGeneric("email")}</FormLabel>
                <FormControl>
                  <Input
                    placeholder={tGeneric("emailPlaceholder")}
                    type="email"
                    required
                    {...field}
                  />
                </FormControl>

                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="role"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("role")}</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={t("rolePlaceholder")} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="org-admin">{t("roles.org-admin")}</SelectItem>
                    <SelectItem value="issuer">{t("roles.issuer")}</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <DialogFooter>
            <LoadingButton loading={isLoading} type="submit">
              {tGeneric("submit")}
            </LoadingButton>
          </DialogFooter>
        </form>
      </Form>
    </>
  );
}
