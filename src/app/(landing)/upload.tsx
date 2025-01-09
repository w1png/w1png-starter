"use client";

import Image from "~/components/ui/image";
import { useState } from "react";
import { ConvertFiles } from "~/lib/client/file";
import { api } from "~/trpc/react";

export default function Upload() {
  const [file, setFile] = useState<File>();
  const [id, setId] = useState<string>();

  const uploadMutation = api.file.create.useMutation({
    onSuccess: (a) => setId(a.id),
  });

  return (
    <div className="flex flex-col">
      {id && (
        <Image
          src={id}
          alt="File"
          width={100}
          height={100}
          className="rounded-full"
        />
      )}

      <input
        type="file"
        onChange={(e) => {
          setFile(e.target.files?.[0]);
        }}
      />
      <button
        onClick={async () => {
          if (file) {
            const convertedFile = (await ConvertFiles([file] as const))[0]!;
            uploadMutation.mutate({
              ...convertedFile,
              isImage: true,
            });
          }
        }}
      >
        Загрузить
      </button>
    </div>
  );
}
