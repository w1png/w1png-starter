export function FileFromBuffer(buffer: Buffer, fileName: string): File {
  const blob = new Blob([buffer], { type: "application/octet-stream" });

  const file = new File([blob], fileName, { type: "application/octet-stream" });

  return file;
}
